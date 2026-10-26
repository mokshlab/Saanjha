# Saanjha Frontend

**A Campus-Only Platform for Reusing Student Belongings**

Saanjha is a college project designed to help students discover, list, and reserve reusable belongings such as textbooks, cycles, and accessories within their campus community.

The frontend provides the user interface for browsing listings, managing items, making reservations, and navigating user-specific pages.

## Features Implemented

### User Interface
- Responsive layout for desktop and mobile screens.
- Navigation across the main application pages.
- Listing browsing, search, filtering, and sorting.
- Individual listing details.

### Authentication UI
- Registration and login pages connected to `/api/auth`.
- Campus email validation and backend OTP verification.
- JWT session storage and protected route checks.
- Logged-in user name in the navigation bar.
- Logout functionality.

### Listings and Reservations
- Browse approved listings from the backend with search, filtering, and sorting.
- Authenticated listing submission with at least two images, condition, categories, and zero price support.
- Backend-backed My Listings retrieval and seller edits.
- Listing detail, reservation, and confirmation views remain available, but reservation screens are not yet fully connected to the reservation API.
- My Profile and My Reservations pages remain evaluator UI work in progress.

### Admin Moderation
- Admin moderation UI exists as a design/evaluator view.
- Backend moderation endpoints are implemented.
- The UI is not yet fully connected to the moderation API.

### Route Protection
- Frontend route checks for selected pages, including profile, listings, reservations, and reservation confirmation.

## Technology Stack

- React
- Vite
- JavaScript
- CSS
- React Router
- Browser localStorage for remaining demo-only views
- Axios for connected auth and listing API calls

## Project Structure

```text
frontend/
├── src/
│   ├── pages/
│   │   ├── AuthPage.jsx
│   │   ├── AdminModeration.jsx
│   │   ├── ListingDetails.jsx
│   │   ├── MyListings.jsx
│   │   ├── MyReservations.jsx
│   │   ├── ProfilePage.jsx
│   │   └── ReservationConfirmation.jsx
│   ├── App.jsx
│   ├── HomePage.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Getting Started

### Prerequisites
- Node.js
- npm

### Installation

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

### Environment Configuration

The repository's existing setup documentation specifies that the Vite development server and API proxy read configuration from the root `.local/.env` file.

If this configuration is still used by the current frontend, configure the following variables there before starting the development server:

- `VITE_FRONTEND_PORT`
- `VITE_BACKEND_URL`
- `VITE_API_BASE_URL`

Use the values supplied by the project team. Do not commit secrets or private credentials.

## Current Implementation Notes

- Auth and seller listing flows use the backend API and JWT sessions.
- OTP delivery uses SMTP when configured and a development fallback when delivery is unavailable.
- Reservation, handover, and admin moderation screens still need connected workflow verification.
- Frontend route checks do not replace backend authorization.
- API connectivity and persistent database behavior require owner verification before deployment.

## Frontend Contribution : Contributor: Namita Gupta

My contribution to Saanjha focused on frontend development, including:

- Building the main UI and navigation.
- Implementing registration, login, demo OTP verification, and logout flows.
- Developing listing creation and browsing, search, filters, and sorting.
- Implementing reservation and confirmation pages.
- Developing My Profile, My Listings, and My Reservations pages.
- Adding listing moderation UI and selected protected routes.
- Testing key user flows and responsive layouts.
- Committing and submitting frontend changes through a GitHub Pull Request.

## Future Improvements

- Connect reservation, expiry, cancellation, notification, and handover screens to the backend.
- Connect the admin moderation screen to the moderation API.
- Add robust loading, empty, and error states.
- Add automated frontend tests and end-to-end testing with the integrated backend.

---

**Project:** Saanjha  
**Repository:** https://github.com/mokshlab/Saanjha  
**Contribution Area:** Frontend Development