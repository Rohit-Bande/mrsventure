# MRS Ventures — complete React + Node.js / Express website

The complete storefront and admin source are included and integrated with the Express backend. The `frontend/dist` folder contains the tested production frontend build. SQLite replaces the database service requirement; Python is no longer required.

## Run on your computer

Install Node.js 24 LTS. Extract this ZIP, open a terminal inside `mrs-ventures-complete`, and run:

```sh
npm run setup
```

Copy `backend/.env.example` to `backend/.env`. Generate your administrator password hash:

```sh
npm --prefix backend run admin:password
```

Paste the generated `ADMIN_PASSWORD_HASH=...` line into `backend/.env`, replacing the empty line. The password prompt displays input, so use a private terminal.

```sh
npm start
```

Open **http://localhost:8000** for the website and **http://localhost:8000/admin** for the admin panel. The backend serves the included built frontend. Cash on delivery works without payment credentials. Configure Razorpay test keys to test online payments; there are no fake-payment success paths.

For development with hot reload:

```sh
npm run dev
```

The frontend runs at **http://localhost:3000** and proxies API calls to Express on port 8000.

After changing frontend source:

```sh
npm run build
npm start
```

Run API tests using `npm test` from the root. Package lockfiles are included for both applications. Dependency directories, secrets and local test databases are excluded.

## Included website

- Original branded homepage, product catalogue, product detail/variants and related products.
- Cart, wishlist, search, guest checkout, cash on delivery and Razorpay integration.
- Order confirmation and protected order tracking within the placing browser session.
- About, Our Story, Why Madhulogy, contact, FAQ, shipping, returns, privacy and terms pages.
- Admin login/logout, dashboard, product management, category management and order status updates.
- Responsive layouts, mobile navigation, WhatsApp contact links, SEO metadata and product structured data.
- Server-side price calculation, stock reservations, request validation, payment verification and expiring admin sessions.

Category filters in the shop load from the API. The account page retains the original “Accounts Coming Soon” message; customer registration, login and saved addresses were not implemented in the original project. Contact submissions and newsletter subscriptions are stored in SQLite and accessible through authenticated admin API routes; there is no email or WhatsApp automation. WhatsApp links open a chat.

## Deploy on your server

Upload this folder, install Node.js 24, run `npm run setup`, configure `backend/.env`, run `npm run build` if you changed the frontend, and start `npm start` using your service manager. Put HTTPS and a reverse proxy in front of port 8000. The backend serves both `/api` and the SPA, including direct page URLs.

Set `FRONTEND_ORIGINS` to your final origin. For same-origin production, leave frontend `VITE_BACKEND_URL` empty. If using a separate API domain, set it and rebuild; adapt the backend Content Security Policy's `connect-src` for that API origin. Configure Express's trusted proxy addresses appropriately for your server before relying on per-client rate limiting.

Data is created in `backend/data/mrs_ventures.db`. Persist this directory across deployments and back it up safely. No previous customer data was imported. Do not connect the old SQLite database directly; its JSON record formats require a separate migration.

The original image URLs and Google Fonts are retained and require internet access. Confirm long-term access/licensing to those image hosts, replace any sample ratings/reviews with genuine data, and confirm business contact and policy details before publishing.

## Validation and remaining work

The frontend production build passes. Eight backend integration tests pass. HTTP smoke checks verify website routes, the production JavaScript bundle, health/catalogue endpoints and API 404 handling. Chromium download failed in the review environment, so a real-browser checkout/admin interaction and visual/mobile review were not completed.

Before accepting live online payments, implement payment webhook reconciliation, refunds and payment-aware abandoned reservation cleanup. A customer closing the browser after paying can leave a captured payment pending locally. Unpaid abandoned orders hold stock until staff cancel them. Paid-order cancellation is blocked until refund handling is implemented. Test live gateway behaviour using Razorpay test mode first.

Order lookup uses tokens kept in browser sessionStorage; cross-device recovery is not implemented. Admin tokens expire and can be revoked, but the current frontend uses localStorage; harden this with HTTP-only secure cookies before production. These limits are detailed in `BACKEND-NOTES.md`.
