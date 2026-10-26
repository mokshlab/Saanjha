# Saanjha

Saanjha is a campus-only peer-to-peer reuse platform. Students can list useful items they no longer need, discover approved listings, and arrange an in-person handover at a campus pickup point.

## Current Status

The current evaluator build includes:

- Saanjha-specific React/Vite frontend.
- Express/Mongoose backend.
- Student/admin user roles and password hashing.
- JWT authentication foundation.
- OTP email service with development fallback and campus-email configuration.
- Listing model with category, condition, photos, pickup point, book details, and a minimum of two uploaded images.
- Listing discovery and student listing submission routes.
- Admin listing approval/rejection and user activation controls.
- MongoDB Atlas/local connection with development in-memory fallback.
- Student registration, login, OTP verification, JWT sessions, and logout through the backend.
- Authenticated listing submission with at least two images, zero-price support, seller-owned My Listings, and listing edits.
- Listing edit approval rules for title, category, condition, and image replacement.
- Reservation models and atomic first-come-first-served reservation with one active reservation per buyer.
- Reservation duration presets, expiry release, cancellation, notifications, four-digit handover confirmation, and item journey history.
- Backend reservation workflow tests and a reservation concurrency experiment runner.
- Optional Cloudinary image storage with a local fallback when credentials are not configured.

The remaining evaluator gaps are the connected frontend reservation/handover screens, API-connected admin moderation screen, reports, Wanted Board, search experiments, video upload, deployment hardening, and owner confirmation of the real connected workflows.

## Scope Boundary

Saanjha intentionally excludes food ordering, vendors, carts, online payments, refunds, and delivery workflows.

## Run Locally

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create `.local/.env` from the local template, provide a unique `JWT_SECRET`, and set the campus email domain for the target campus. Backend and frontend environment values are loaded from this file only. Add Cloudinary credentials when remote media storage is required. MongoDB Atlas is the target database; the in-memory fallback is available for local development.

The first administrator is created automatically when no admin exists. Set private local values in `.local/.env`:

```env
ADMIN_EMAIL=your_admin@university.edu.in
ADMIN_PASSWORD=replace_with_a_private_password
```

Never commit the real values.

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

- [PROJECT_MASTER_CONTEXT_v2.txt](PROJECT_MASTER_CONTEXT_v2.txt) - locked product and academic specification.
- [TASK_BOARD.md](TASK_BOARD.md) - public-safe shared work tracking.
- [frontend/README.md](frontend/README.md) - frontend shell notes.

The project is intentionally being developed in phases. The current build is ready for evaluator review of authentication, listing submission, moderation APIs, reservation correctness, expiry, cancellation, notifications, and handover APIs. Connected frontend reservation and moderation workflows remain the next integration focus.