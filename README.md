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
- Admin moderation APIs
- Atomic reservation and one-active-reservation enforcement
- Reservation duration presets, expiry, cancellation, notifications, and handover confirmation
- Item journey history, focused backend tests, and a concurrency experiment runner
- Optional Cloudinary media storage with local development fallback

The main remaining integration work is connecting the frontend reservation, handover, and admin moderation views fully to the backend. Those workflows remain under review until the owning teammate verifies them end to end.

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