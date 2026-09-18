# MRS Ventures payment-hardening patch

This patch updates the existing Express/React Razorpay flow. It does **not** configure keys, deploy the site, or authorize real charges. Apply only the included changed source files to a backup of your current project; preserve your database, `.env`, uploaded media, and existing configuration. Do not replace your project wholesale with this source-only archive.

## What changed

- Captured-payment webhooks verify `X-Razorpay-Signature` against the **raw request body**, using a separate webhook secret.
- Duplicate delivery of the same captured payment is harmless. A second different captured payment or a captured payment after cancellation is flagged for manual review and must not be fulfilled.
- Browser callback verification still checks the gateway's captured payment ID, amount, currency and order ID. If the callback fails, the backend can reconcile payments against Razorpay's Orders API.
- Before an admin cancels a pending online order with a gateway order, the backend reconciles it and refuses to cancel a captured or authorized payment.
- Admin orders show a payment-review warning and a Reconcile payment button. Checkout and order-status copy avoid calling an unconfirmed payment successful.
- Live online checkout is disabled until a webhook secret is configured as well as a Key ID and Key Secret.

## Your production setup (do not put secrets in the source or in chats)

1. Back up the production database and deployment, merge these files, and run `npm test` in `backend` and `npm run build` in `frontend` with installed project dependencies. Review every failure before deployment.
2. In your own activated Razorpay merchant account, create **Live Mode** Key ID and Key Secret. In the production backend environment only, set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` (a distinct secret of your choosing). Keep all three out of the frontend and your repository.
3. In the Razorpay Dashboard, configure an HTTPS webhook URL `https://YOUR_DOMAIN/api/payments/razorpay/webhook` and subscribe to `payment.captured`. Enter the same webhook secret there. Verify deliveries in the Dashboard; localhost cannot receive Razorpay's public webhooks directly.
4. Ensure HTTPS, correct production origin and domain settings, genuine saleable products, accurate price/stock/shipping, approved policies, and the Razorpay merchant activation/settlement account are ready.
5. Test authorized, captured, failed, browser-closed, duplicate-delivery, and cancelled-order scenarios before allowing customers to pay. Monitor webhook failures and orders with `needs_payment_review` daily. Never fulfill an order whose payment is pending or flagged for review.

## Remaining blockers before calling this production-ready

- These tests must run in your environment; they were not run when the source-only ZIP was prepared because dependencies were unavailable here.
- Refund handling and automatic settlement/reconciliation reporting are not implemented. Paid orders cannot be cancelled in this app; process refunds through an authorized Razorpay workflow and reconcile the result manually before changing order status.
- Pending orders still reserve inventory until manually resolved. Define and test an expiry/reconciliation policy before launching at scale.
- Test catalogue items and unapproved pack prices/photos must be removed or disabled before taking real payments.

Do **not** paste Live keys or webhook secrets into ChatGPT or send your `.env` in a ZIP.
