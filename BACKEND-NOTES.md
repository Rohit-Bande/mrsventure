# MRS Ventures — Node.js / Express backend migration

This complete website contains the reconstructed React frontend, Express API, original six seed products, and production frontend build. The Node backend replaces the original FastAPI implementation.

## Requirements and setup

Use Node.js 24 LTS and npm. No Python or separately installed database service is required. The database uses Node's built-in SQLite module.

From the `backend` directory:

```sh
npm ci
```

Copy `.env.example` to `.env` (Windows: `copy .env.example .env`; Linux/macOS: `cp .env.example .env`). Run:

```sh
npm run admin:password
```

Paste the generated hash into `.env` as `ADMIN_PASSWORD_HASH`. The private-terminal password prompt displays input. Never commit `.env`. The password verifier also supports the PBKDF2 hash format used by the reviewed Python backend.

```sh
npm start
npm test
```

The default API URL is `http://localhost:8000/api`, with health check at `/api/health`. SQLite data is created under `backend/data`. Stop the server before copying the database for a backup, or use SQLite's online backup tooling. Never copy only the database file during active WAL writes.

Set `FRONTEND_ORIGINS` to your frontend origin; multiple origins may be comma separated. Use HTTPS in production and place the API behind a reverse proxy. If deploying behind a proxy, configure Express trust-proxy to match the actual trusted proxy topology before relying on IP rate limits; it is deliberately disabled by default.

## Frontend integration

The API client and checkout/admin integrations are already applied. The frontend uses Vite. For same-origin hosting, leave `VITE_BACKEND_URL` empty. Development requests to `/api` are proxied to port 8000.

The API client creates a cryptographically random order access token and UUID request key. The server stores only the token hash. Request retries reuse the same key. Tokens live in browser sessionStorage: order lookup works in the same browser session; cross-device tracking, browser-session recovery, and notification links need a separate authenticated recovery flow. There is no anonymous lookup of customer details using only an order number.

The checkout uses server-generated Razorpay amounts. Client prices and totals are ignored. The old demo-payment auto-success path is removed. A single standard variant stays synchronized with the existing admin price editor; multi-variant products should be updated using explicit `variants` payloads.

## Payments

Configure your Razorpay key ID and secret in the backend `.env`; use test keys during validation. Enable automatic capture in your Razorpay settings. The server checks the signature against its stored gateway order ID, fetches the payment from Razorpay, and requires captured status, the exact amount, INR currency, and a matching order ID. No local mock payments are enabled, including in development. Tests inject a fake gateway and never contact Razorpay.

Without Razorpay keys, online order creation is rejected; cash on delivery remains available. After a payment verification error, contact support before paying again.

Payment webhook reconciliation and refunds are not implemented in this migration. A customer closing the browser after payment can leave a captured payment pending locally. Before accepting live payments, add authenticated Razorpay webhooks with event deduplication, refund handling, and reconciliation. Paid-order cancellation is blocked pending that workflow. A cancelled order paid through an already-open gateway checkout requires manual support/refund reconciliation.

Inventory is reserved transactionally when an order is created. Cancelling an unpaid/COD order restores it once. Abandoned online orders retain their reservations until staff cancel them; there is no reservation expiry worker. Do not accept live online orders until you define and implement a payment-aware expiration/reconciliation policy.

## API compatibility

The original storefront routes are retained: config, categories, products, reviews, newsletter, contact, orders and Razorpay create/verify. Admin routes cover login/logout, products, categories, orders, status, statistics, contact submissions and newsletter subscribers.

Categories use `name`, `slug`, `description`, `is_active` in admin routes. Public categories additionally expose `label`, `desc`, `active` aliases. Category deletion is blocked while products use it. Product search supports case-insensitive text and price bounds. Order transitions are validated. COD becomes paid when marked delivered; COD pending orders are excluded from revenue.

Admin tokens expire after eight hours, are stored as hashes in SQLite, and are revoked by the logout endpoint. The patched frontend still uses localStorage for admin token compatibility; an HTTP-only secure cookie implementation is recommended before production. Rate limits use an in-process store; shared storage is needed for multiple API instances. Catalogue listing scans JSON records: suitable for a small catalogue, not a large-scale indexed commerce database.

## Existing database

A fresh database is seeded by default. Existing customer orders, edited products, reviews, and category data were not available as a correctly structured application database in the supplied ZIP and have not been imported. Do not point this backend at the old database directly: its JSON categories/orders differ. Back up the old database and implement a one-time schema/data migration before switching a live installation. Legacy customer orders will need a secure access recovery policy.

## Validation

Six HTTP integration tests cover catalogue filtering, admin authorization/session/category CRUD, server totals/protected order lookup/idempotency, invalid carts/stock rejection, payment bypass/amount validation/captured payment verification, and cancellation/logout. Additional checks cover disabled gateway configuration and session expiry. Tests use an in-memory SQLite database and fake gateway; they do not prove live gateway behaviour or a full frontend build. The full frontend production build passed. HTTP smoke checks verified Express serves the frontend, JavaScript bundle and API routes. Browser-based interaction checks were unavailable because the Chromium download failed.

## Official references

- Express 5: https://expressjs.com/en/guide/migrating-5/
- Node SQLite: https://nodejs.org/docs/latest-v24.x/api/sqlite.html
- Razorpay integration: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
