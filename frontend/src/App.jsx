
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './HomePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ListingDetails from './pages/ListingDetails';
import ReservationConfirmation from './pages/ReservationConfirmation';
import MyReservations from './pages/MyReservations';
import MyListings from './pages/MyListings';
import AdminModeration from './pages/AdminModeration';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import { getStoredUser, isAuthenticated } from './api';

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

function AdminRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (getStoredUser()?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />`r`n      <Route path="/contact" element={<ContactPage />} />

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

      <Route
        path="/admin-moderation"
        element={
          <AdminRoute>
            <AdminModeration />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
