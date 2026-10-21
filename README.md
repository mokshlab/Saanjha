# Saanjha

Saanjha is a campus-only peer-to-peer reuse platform. Students can list useful items they no longer need, discover approved listings, and arrange an in-person handover at a campus pickup point.

## Current Status

This is the initial independent application shell. The current code includes:

- Saanjha-specific React/Vite frontend.
- Express/Mongoose backend.
- Student/admin user roles and password hashing.
- JWT authentication foundation.
- OTP email service with development fallback and campus-email configuration.
- Listing model with category, condition, photos, pickup point, book details, and a minimum of two uploaded images.
- Listing discovery and student listing submission routes.
- Admin listing approval/rejection and user activation controls.
- MongoDB Atlas/local connection with development in-memory fallback.

Reservation, seller-selected expiry presets of 3, 6, 12, 24, 36, 54, 72, or 96 hours with a 54-hour default, four-digit handover confirmation, item journey history, reports, wanted-board matching, search experiments, Cloudinary media integration, and automated tests are planned next. They are not yet complete features.

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

Create `backend/.env` from `backend/.env.example`, provide a unique `JWT_SECRET`, and set the campus email domain to `university.edu.in`. Add Cloudinary credentials when media upload implementation begins. MongoDB Atlas is the target database; the in-memory fallback is only for the initial local shell.

The first administrator is created automatically when no admin exists. Set private local values in `backend/.env`:

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

The project is intentionally being developed in phases. The current shell is ready for the next implementation phase: reservation correctness, expiry, handover confirmation, item history, and the evaluator demo flow.