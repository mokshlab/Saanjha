
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './HomePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ListingDetails from './pages/ListingDetails';
import ReservationConfirmation from './pages/ReservationConfirmation';
import MyReservations from './pages/MyReservations';
import MyListings from './pages/MyListings';
import AdminModeration from './pages/AdminModeration';
import ProfilePage from './pages/ProfilePage';
import { isAuthenticated } from './api';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const isLoggedIn = isAuthenticated();

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/verify-otp" element={<AuthPage mode="otp" />} />

      <Route path="/listing/:id" element={<ListingDetails />} />

      <Route
        path="/reservation-confirmation/:id"
        element={
          <ProtectedRoute>
            <ReservationConfirmation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-reservations"
        element={
          <ProtectedRoute>
            <MyReservations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-listings"
        element={
          <ProtectedRoute>
            <MyListings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route path="/admin-moderation" element={<AdminModeration />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
