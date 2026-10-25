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
- Registration and login pages.
- Demo OTP verification flow.
- Login validation.
- Logged-in user name in the navigation bar.
- Logout functionality.

### Listings and Reservations
- Create and browse item listings.
- View listing details and moderation status.
- Reservation flow and confirmation page.
- My Listings and My Reservations pages.
- My Profile page.

### Admin Moderation
- View submitted listings.
- Approve or reject listings.
- Reflect moderation status in listing visibility.

### Route Protection
- Frontend route checks for selected pages, including profile, listings, reservations, and reservation confirmation.

## Technology Stack

- React
- Vite
- JavaScript
- CSS
- React Router
- Browser localStorage for demo state and data

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

- Authentication and OTP verification currently include demo behavior using localStorage and a fixed demo OTP.
- Frontend route checks alone do not provide secure authorization.
- Real authentication, OTP delivery, and admin permissions require appropriate backend enforcement.
- API connectivity and persistent database behavior should be verified against the current backend before deployment.

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

- Complete and verify frontend-backend API integration.
- Implement secure server-side authentication and authorization.
- Add robust loading, empty, and error states.
- Add automated frontend tests.
- Perform end-to-end testing with the integrated backend.

---

**Project:** Saanjha  
**Repository:** https://github.com/mokshlab/Saanjha  
**Contribution Area:** Frontend Development