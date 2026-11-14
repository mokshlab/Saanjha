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
- Registration password guidance with an 8-character minimum, a letter, and a number.
- Four-digit OTP input with numeric-only validation and development terminal fallback.
- JWT session storage and protected route checks.
- Logged-in user name in the navigation bar.
- Logout functionality.

### Listings and Reservations
- Browse approved listings from the backend with search, filtering, and sorting.
- Authenticated listing submission with at least two images, condition, categories, and zero price support.
- Backend-backed My Listings retrieval and seller edits.
- Seller listing deletion with protection for reserved and sold items.
- Contact page connected to the backend contact-message route.
- Listing detail, reservation, confirmation, My Reservations, and My Listings handover views are connected to the reservation APIs.
- Reservation cancellation, expiry refresh, notifications, seller handover controls, seller-side buyer contact display, and structured buyer meet-up details are implemented and manually verified.
- Report and video-upload backend endpoints exist; the connected report screens and video controls are still pending.

### Admin Moderation
- Admin moderation UI loads pending listings from the backend.
- Admin approve/reject actions use the moderation API.
- Admin listing management and user-status controls are available through the protected admin routes.
- Approval and rejection behavior has been manually verified.

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
- OTP delivery uses SMTP when configured and prints a four-digit development fallback when delivery is unavailable.
- Reservation, expiry, notification, privacy, and handover screens use the backend APIs and have passed the connected evaluator workflow.
- Admin moderation is API-connected and the owner has verified approval and rejection behavior.
- Reports and video upload currently have backend support only; their frontend workflows are not complete.
- Frontend route checks do not replace backend authorization.
- API connectivity and persistent database behavior require owner verification before deployment.

## Integration Contribution

M's final integration work connected the frontend to the backend for:

- Reservation creation and cancellation.
- Reservation status, expiry refresh, and notification loading.
- Seller active-reservation lookup and handover confirmation.
- Authentication and listing API integration already present in the shared frontend.

## Future Improvements

- The complete reservation, cancellation, expiry, notification, and handover journey passed manual verification.
- Participant-only pickup/contact visibility passed manual verification on 14 November 2026.
- The temporary five-minute reservation option passed expiry and notification verification.
- Build and verify report submission/review screens and video upload/playback controls.
- Verify real Cloudinary uploads and fallback behavior.
- Run and record the reservation concurrency experiment with live test credentials.
- Add robust loading, empty, and error states.
- Add automated frontend tests and end-to-end testing with the integrated backend.

---

**Project:** Saanjha  
**Repository:** https://github.com/mokshlab/Saanjha  
**Contribution Area:** Frontend Development