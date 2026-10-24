
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function readReservations() {
  try {
    const saved = JSON.parse(
      localStorage.getItem('saanjhaReservations') || '[]'
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [codes, setCodes] = useState({});
  const [messages, setMessages] = useState({});

  useEffect(() => {
    setReservations(readReservations());
  }, []);

  function saveReservations(updated) {
    try {
      localStorage.setItem(
        'saanjhaReservations',
        JSON.stringify(updated)
      );
      setReservations(updated);
      return true;
    } catch {
      window.alert(
        'Could not save the update. Please try again.'
      );
      return false;
    }
  }

  function verifyHandover(reservation) {
    const enteredCode = (codes[reservation.reservationId] || '').trim();

    if (!/^\d{4}$/.test(enteredCode)) {
      setMessages((previous) => ({
        ...previous,
        [reservation.reservationId]:
          'Please enter a valid 4-digit code.',
      }));
      return;
    }

    if (
      reservation.status === 'Cancelled' ||
      reservation.handoverStatus === 'Completed' ||
      reservation.status === 'Completed'
    ) {
      setMessages((previous) => ({
        ...previous,
        [reservation.reservationId]:
          'This reservation cannot be verified again.',
      }));
      return;
    }

    if (!reservation.handoverCode) {
      setMessages((previous) => ({
        ...previous,
        [reservation.reservationId]:
          'No handover code is saved for this reservation. Create a new reservation to test this feature.',
      }));
      return;
    }

    if (enteredCode !== String(reservation.handoverCode)) {
      setMessages((previous) => ({
        ...previous,
        [reservation.reservationId]:
          'Incorrect code. Please check and try again.',
      }));
      return;
    }

    const updated = readReservations().map((saved) =>
      saved.reservationId === reservation.reservationId
        ? {
            ...saved,
            status: 'Completed',
            handoverStatus: 'Completed',
            completedAt: new Date().toISOString(),
          }
        : saved
    );

    if (saveReservations(updated)) {
      setCodes((previous) => ({
        ...previous,
        [reservation.reservationId]: '',
      }));

      setMessages((previous) => ({
        ...previous,
        [reservation.reservationId]:
          'Handover verified successfully! Reservation completed.',
      }));
    }
  }

  function cancelReservation(reservationId) {
    const target = reservations.find(
      (reservation) => reservation.reservationId === reservationId
    );

    if (
      !target ||
      target.status === 'Completed' ||
      target.handoverStatus === 'Completed' ||
      target.status === 'Cancelled'
    ) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to cancel this reservation?'
    );

    if (!confirmed) return;

    const updated = readReservations().map((reservation) =>
      reservation.reservationId === reservationId
        ? { ...reservation, status: 'Cancelled' }
        : reservation
    );

    if (saveReservations(updated)) {
      setMessages((previous) => ({
        ...previous,
        [reservationId]: 'Reservation cancelled.',
      }));
    }
  }

  return (
    <main className="my-reservations-page">
      <Link to="/" className="details-back-link">
        ← Back to listings
      </Link>

      <header className="my-reservations-header">
        <p className="reservation-eyebrow">
          SAANJHA · CAMPUS REUSE
        </p>
        <h1>My Reservations</h1>
        <p>Track reservations and verify item handovers.</p>
      </header>

      {reservations.length === 0 ? (
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
            const completed =
              reservation.status === 'Completed' ||
              reservation.handoverStatus === 'Completed';

            const cancelled = reservation.status === 'Cancelled';

            const codeUnavailable = !reservation.handoverCode;

            return (
              <article
                className="my-reservation-card"
                key={reservation.reservationId}
              >
                <div className="my-reservation-main">
                  <div className="my-reservation-icon">📦</div>

                  <div className="my-reservation-info">
                    <h2>{reservation.itemTitle || 'Reserved item'}</h2>

                    <p>
                      {reservation.price != null
                        ? `₹${reservation.price}`
                        : 'Price on request'}
                    </p>

                    <span>
                      Pickup: {reservation.pickupPoint || 'Campus pickup'}
                    </span>
                  </div>
                </div>

                <div className="my-reservation-meta">
                  <p>
                    <strong>Reservation ID:</strong>{' '}
                    {reservation.reservationId}
                  </p>

                  <p>
                    <strong>Date:</strong>{' '}
                    {reservation.createdAt
                      ? new Date(reservation.createdAt).toLocaleString()
                      : 'Not available'}
                  </p>

                  <p>
                    <strong>Status:</strong>{' '}
                    <span
                      className={
                        cancelled
                          ? 'my-reservation-cancelled'
                          : 'my-reservation-status'
                      }
                    >
                      {completed
                        ? 'Completed'
                        : reservation.status || 'Reserved'}
                    </span>
                  </p>

                  <p>
                    <strong>Handover:</strong>{' '}
                    {completed
                      ? 'Completed ✓'
                      : cancelled
                        ? 'Cancelled'
                        : reservation.handoverStatus || 'Pending'}
                  </p>

                  {!cancelled && !completed && (
                    <div className="handover-verify-form">
                      <label
                        htmlFor={`handover-${reservation.reservationId}`}
                      >
                        Enter 4-digit handover code
                      </label>

                      <input
                        id={`handover-${reservation.reservationId}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        placeholder="••••"
                        value={codes[reservation.reservationId] || ''}
                        disabled={codeUnavailable}
                        onChange={(event) => {
                          const value = event.target.value
                            .replace(/\D/g, '')
                            .slice(0, 4);

                          setCodes((previous) => ({
                            ...previous,
                            [reservation.reservationId]: value,
                          }));

                          setMessages((previous) => ({
                            ...previous,
                            [reservation.reservationId]: '',
                          }));
                        }}
                      />

                      <button
                        type="button"
                        className="primary-button"
                        disabled={codeUnavailable}
                        onClick={() => verifyHandover(reservation)}
                      >
                        Verify Handover
                      </button>

                      {codeUnavailable && (
                        <p role="status">
                          This older reservation has no saved code.
                        </p>
                      )}
                    </div>
                  )}

                  {messages[reservation.reservationId] && (
                    <p
                      className="handover-feedback"
                      role="status"
                    >
                      {messages[reservation.reservationId]}
                    </p>
                  )}

                  {!cancelled && !completed && (
                    <button
                      type="button"
                      className="cancel-reservation-button"
                      onClick={() =>
                        cancelReservation(reservation.reservationId)
                      }
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
  );
}
