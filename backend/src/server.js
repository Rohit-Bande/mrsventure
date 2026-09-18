import { createStore } from "./store.js";
import { createApp } from "./app.js";
import { seed } from "./seed.js";
import { fileURLToPath } from "node:url";

if (!process.env.ADMIN_PASSWORD_HASH) {
  throw Error(
    "Set ADMIN_PASSWORD_HASH in .env. Run npm run admin:password."
  );
}

const configuredExpiryMinutes = Number(
  process.env.PAYMENT_EXPIRY_MINUTES || 30
);

const paymentExpiryMinutes =
  Number.isFinite(configuredExpiryMinutes) &&
  configuredExpiryMinutes >= 5
    ? configuredExpiryMinutes
    : 30;

const store = createStore(
  process.env.DB_PATH || "./data/mrs_ventures.db"
);

seed(store);

const app = createApp({
  store,
  config: {
    frontendDir: fileURLToPath(
      new URL("../../frontend/dist", import.meta.url)
    ),
    origins: process.env.FRONTEND_ORIGINS,
    adminHash: process.env.ADMIN_PASSWORD_HASH,
    razorpayKey: process.env.RAZORPAY_KEY_ID,
    razorpaySecret: process.env.RAZORPAY_KEY_SECRET,
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    paymentExpiryMs: paymentExpiryMinutes * 60 * 1000,
  },
});

const port = Number(process.env.PORT || 8000);

const runPendingOrderExpiry = async () => {
  try {
    const expiredCount =
      await app.locals.expirePendingOrders();

    if (expiredCount > 0) {
      console.log(
        `Expired ${expiredCount} unpaid Razorpay order(s) and restored stock`
      );
    }
  } catch (error) {
    console.error(
      "Pending-order expiry check failed:",
      error.message
    );
  }
};

const server = app.listen(port, "0.0.0.0", () => {
  console.log("MRS Ventures Express API is running");

  // Check existing pending orders once after startup.
  runPendingOrderExpiry();
});

// Check for abandoned orders every minute.
const expiryTimer = setInterval(
  runPendingOrderExpiry,
  60 * 1000
);

// Do not keep Node running solely because of this timer.
expiryTimer.unref();

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    clearInterval(expiryTimer);

    server.close(() => {
      store.close();
      process.exit(0);
    });
  });
}