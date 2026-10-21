# Saanjha Frontend

This is the initial Saanjha frontend shell. It currently displays approved listings from the Saanjha API and intentionally does not include carts, vendors, food ordering, or online payments.

Run from this directory:

```bash
npm install
npm run dev
```

The Vite development server and API proxy read their values from the root `.local/.env` file. Set `VITE_FRONTEND_PORT`, `VITE_BACKEND_URL`, and `VITE_API_BASE_URL` there before starting the frontend.