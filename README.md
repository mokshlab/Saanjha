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
- Student and admin authentication with JWT, bcrypt, and four-digit OTP
- New registrations require passwords with at least 8 characters, one letter, and one number
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

## M Contribution Summary

The merged implementation includes substantial work completed by **M** across the backend, data layer, and connected user workflows:

- Campus authentication, password validation, four-digit OTP verification, JWT sessions, OTP fallback logging, duplicate validation, OTP attempt limits, rate limiting, and production secret checks.
- Listing creation/edit validation, two-image enforcement, free-item support, Multer uploads, optional Cloudinary storage with local fallback, edit approval rules, admin listing transitions, and protected deletion.
- Reservation and ItemJourney models, one-active-reservation enforcement, MongoDB transactions, cancellation, expiry, notifications, hashed handover codes, seller confirmation, and sold-state transitions.
- Frontend-connected reservation creation, cancellation, reservation history, lifecycle activity, expiry notifications, seller handover controls, and participant-only pickup/contact visibility.
- HTTP integration tests, rollback tests, privacy/activity tests, backend validation, frontend lint/build validation, and final-phase project documentation.

The current branch contains the authentication, listing, reservation, transaction, notification, handover, reports, and video-upload backend work. The connected reservation and handover workflow has been manually verified, including expiry notification visibility.

## Final Evaluation Guide

### Current verified results

The owner manually verified the following on 14 November 2026:

1. Public pickup privacy - **PASS**.
2. Reservation creation - **PASS**.
3. Buyer access after reservation - **PASS**.
4. Seller access after reservation - **PASS**.
5. Seller activity history - **PASS**.
6. Cancellation privacy - **PASS**.
7. Five-minute expiry and listing release - **PASS**.
8. Buyer expiry notification visibility - **PASS**.
9. Handover completion - **PASS**.
10. Unauthorized access protection - **PASS**.
11. Admin approval makes a listing publicly discoverable - **PASS**.
12. Admin rejection keeps a listing unavailable publicly - **PASS**.

Earlier manual checks also passed for registration, terminal OTP fallback, OTP login/logout, two-image listing submission with price `0`, My Listings visibility, sensitive edit approval, and responsive desktop/mobile layouts.

### Remaining before final delivery

- Connect and verify the student report UI, admin report review UI, and video upload/playback UI.
- Real Cloudinary upload and local fallback verification.
- Reservation concurrency evidence.
- Deployment, environment, database, media, and demo evidence.

## Final-Phase Development Priorities

The mid-term phase is complete. The remaining work is focused on final evaluator features, in this order:

1. Connect and verify the reports and video user interfaces.
2. Verify the real Cloudinary upload and local fallback behavior.
3. Run and record the reservation concurrency experiment.
4. Prepare deployment, environment, database, media, and demo evidence.

Wanted Board, advanced search experiments, visual redesign, and bundle optimization are not current final-phase priorities.

### Simple final test workflow

1. Start the backend with `cd backend` and `npm run dev`.
2. Start the frontend in a second terminal with `cd frontend` and `npm run dev`.
3. Register with an allowed campus email, use an 8+ character password with a letter and number, and read the four-digit OTP from the backend terminal.
4. Log in, submit a listing with two images and price `0`, and confirm it appears in **My Listings**.
5. Edit a sensitive field and confirm the listing becomes pending again.
6. Log in as admin and approve the listing.
7. Use a second student account to reserve the listing.
8. Confirm the reservation duration, cancellation behavior, lifecycle activity, and participant-only pickup/contact visibility.
9. Select the temporary **5 minutes** option, wait for expiry, and confirm the listing becomes available again with a notification. **PASS**.
10. Reserve again, complete the handover using the code, and confirm the listing becomes sold.
11. Run backend checks with `cd backend` and `npm test`.
12. Run the frontend production check with `cd frontend` and `npm run build`.

Record each result as **PASS**, **FAIL**, or **BLOCKED**. The complete path through step 10 has been manually recorded as **PASS**.

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

Copy `.env.example` to `.local/.env`, then set the campus configuration, a unique `JWT_SECRET`, database settings, and optional SMTP or Cloudinary values. Keep real credentials in `.local/.env`; never commit them.

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

When SMTP is unavailable in development, the backend prints the four-digit OTP in the backend terminal. Do not rely on terminal OTP logging in production.

## Documentation

- [TASK_BOARD.md](TASK_BOARD.md) - public-safe work status and evaluator scope.
- [PROJECT_MASTER_CONTEXT_v2.txt](PROJECT_MASTER_CONTEXT_v2.txt) - complete product, academic, architecture, and risk context.
- [frontend/README.md](frontend/README.md) - frontend implementation notes.

The project is being developed in small, verifiable phases. The verified evaluator path currently covers authentication, listing approval, reservation lifecycle, privacy, expiry notifications, handover, and moderation. Reports and video upload have backend support; their connected frontend workflows remain pending.