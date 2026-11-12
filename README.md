# Saanjha

### Give useful things a second life on campus.

Saanjha is a campus-only reuse platform where students can pass on books, cycles, electronics, furniture, and sports equipment to other students who need them.

It replaces scattered chat-group posts with a clearer journey:

```text
Register with a campus email
	-> list an item
	-> admin approval
	-> discover and reserve
	-> meet on campus
	-> confirm the handover
```

## Why It Matters

Campus resale is often difficult to search, difficult to trust, and easy to lose in a busy chat group. Saanjha brings the useful parts into one focused flow:

- Searchable campus listings
- Campus email and OTP identity checks
- Admin approval before public discovery
- Seller ownership and listing history
- One active reservation per buyer
- Expiry, cancellation, and handover records
- In-person pickup with no online payment or delivery dependency

## Evaluator Build

The current build includes:

- React/Vite frontend with responsive Saanjha design
- Express/Mongoose backend with MongoDB Atlas or local memory fallback
- Student and admin authentication with JWT, bcrypt, and OTP
- Backend-connected listing submission with at least two images and free-item support
- Seller-owned My Listings retrieval and editing
- Listing approval rules for sensitive edits
- API-connected admin moderation for pending listings and approve/reject actions
- Admin listing management, including viewing all listings and deleting listings
- Protected seller listing deletion for reserved or sold items
- Contact page and backend contact-message route
- Atomic reservation and one-active-reservation enforcement
- Reservation duration presets, expiry, cancellation, notifications, and handover confirmation
- Item journey history, focused backend tests, and a concurrency experiment runner
- Optional Cloudinary media storage with local development fallback

The frontend reservation and handover views still need complete end-to-end verification. Do not describe the full evaluator journey as complete until expiry, notification, and handover are tested through the real application.

## Final Evaluation Guide

### Current verified results

The owner has manually verified:

1. Registration with the configured campus email domain.
2. OTP reading from the backend terminal fallback.
3. OTP verification, login, and logout.
4. Listing submission with two images and price `0`.
5. Listing visibility under **My Listings**.
6. Sensitive listing edits returning to pending approval.
7. Admin approval.
8. Desktop and mobile layouts.
9. Reservation and cancellation.

### Still pending before final evaluation

Verify these in the real application:

- Reservation expiry releases the listing.
- The buyer receives or can see the expiry/cancellation notification.
- The handover code works for the seller.
- Successful handover changes the listing to sold and records the item journey.
- The complete reservation and handover screens work through the frontend, not only through API tests.

### Simple final test workflow

1. Start the backend with `cd backend` and `npm run dev`.
2. Start the frontend in a second terminal with `cd frontend` and `npm run dev`.
3. Register with an allowed campus email and read the OTP from the backend terminal.
4. Log in, submit a listing with two images and price `0`, and confirm it appears in **My Listings**.
5. Edit a sensitive field and confirm the listing becomes pending again.
6. Log in as admin and approve the listing.
7. Use a second student account to reserve the listing.
8. Confirm the reservation duration, contact/pickup visibility, and cancellation behavior.
9. Run a short expiry test and confirm the listing becomes available again with a notification.
10. Reserve again, complete the handover using the code, and confirm the listing becomes sold.
11. Run backend checks with `cd backend` and `npm test`.
12. Run the frontend production check with `cd frontend` and `npm run build`.

Record each result as **PASS**, **FAIL**, or **BLOCKED**. Only the complete path through step 10 should be presented as fully complete.

## Scope

Saanjha is intentionally resale-only. It does not include food ordering, vendors, shopping carts, online payments, refunds, or delivery workflows.

## Run Locally

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create `.local/.env` with the campus configuration, a unique `JWT_SECRET`, database settings, and optional SMTP or Cloudinary values. Keep real credentials in `.local/.env`; never commit them.

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5174`. The frontend proxies API requests to `http://127.0.0.1:3101`.

## Documentation

- [TASK_BOARD.md](TASK_BOARD.md) - public-safe work status and evaluator scope.
- [PROJECT_MASTER_CONTEXT_v2.txt](PROJECT_MASTER_CONTEXT_v2.txt) - complete product, academic, architecture, and risk context.
- [frontend/README.md](frontend/README.md) - frontend implementation notes.

The project is being developed in small, verifiable phases. The evaluator path currently demonstrates the backend foundation, authentication, seller listing flow, and reservation lifecycle APIs.