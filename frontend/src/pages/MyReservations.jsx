import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';

function getStatusLabel(status) {
  return {
    active: 'Active',
    expired: 'Expired',
    cancelled: 'Cancelled',
    completed: 'Completed',
  }[status] || status;
}

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadReservations(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      const [reservationResponse, notificationResponse] = await Promise.all([
        api.get('/reservations/mine'),
        api.get('/reservations/notifications'),
      ]);
      setReservations(reservationResponse.data.reservations || []);
      setNotifications(notificationResponse.data.notifications || []);
      setMessage('');
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not load your reservations.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
    const refreshTimer = window.setInterval(() => {
      loadReservations(false);
    }, 60 * 1000);

    return () => window.clearInterval(refreshTimer);
  }, []);

  async function cancelReservation(reservationId) {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await api.post(`/reservations/${reservationId}/cancel`);
      setMessage('Reservation cancelled.');
      await loadReservations();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not cancel this reservation.'
      );
    }
  }

  return (
    <>
      <Navbar showListItem={false} />
      <main className="my-reservations-page">
        <header className="my-reservations-header">
          <h1>My Reservations</h1>
          <p>Track reservations, expiry, notifications, and handovers.</p>
        </header>

        {message && (
          <p role="alert" aria-live="polite">
            {message}
          </p>
        )}

        {notifications.length > 0 && (
          <section aria-label="Reservation notifications">
            <h2>Notifications</h2>
            {notifications.slice(0, 5).map((notification) => (
              <p key={notification._id} role="status">
                {notification.message}
              </p>
            ))}
          </section>
        )}

        {loading ? (
          <p role="status">Loading reservations...</p>
        ) : reservations.length === 0 ? (
          <section className="no-reservations">
            <div className="reservation-success-icon">📦</div>
            <h2>No reservations yet</h2>
            <p>Your reserved items will appear here.</p>
            <Link to="/" className="reservation-home-button">
              Explore listings
            </Link>
          </section>
        ) : (
          <section className="my-reservations-list">
            {reservations.map((reservation) => {
              const listing = reservation.listing || {};
              const active = reservation.status === 'active';

              return (
                <article className="my-reservation-card" key={reservation._id}>
                  <div className="my-reservation-main">
                    <div className="my-reservation-icon">📦</div>
                    <div className="my-reservation-info">
                      <h2>{listing.title || 'Reserved item'}</h2>
                      <p>
                        {listing.price != null
                          ? `₹${listing.price}`
                          : 'Price on request'}
                      </p>
                      <span>
                        Pickup: {listing.pickupPoint || 'Campus pickup'}
                      </span>
                    </div>
                  </div>

                  <div className="my-reservation-meta">
                    <p>
                      <strong>Reservation ID:</strong> {reservation._id}
                    </p>
                    <p>
                      <strong>Date:</strong>{' '}
                      {new Date(reservation.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span
                        className={
                          reservation.status === 'cancelled'
                            ? 'my-reservation-cancelled'
                            : 'my-reservation-status'
                        }
                      >
                        {getStatusLabel(reservation.status)}
                      </span>
                    </p>
                    {active && (
                      <p>
                        <strong>Expires:</strong>{' '}
                        {new Date(reservation.expiresAt).toLocaleString()}
                      </p>
                    )}
                    {active && (
                      <button
                        type="button"
                        className="cancel-reservation-button"
                        onClick={() => cancelReservation(reservation._id)}
                      >
                        Cancel reservation
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
}
