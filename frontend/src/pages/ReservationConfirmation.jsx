
import { Link, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ReservationConfirmation() {
  const { id } = useParams();
  const { state } = useLocation();

  const [savedReservation, setSavedReservation] = useState(null);

  const passedReservation = state?.reservation;
  const passedItem = state?.item;

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('saanjhaReservations') || '[]'
      );

      const reservations = Array.isArray(saved) ? saved : [];

      let current =
        passedReservation ||
        reservations.find(
          (entry) =>
            String(entry.itemId) === String(id) &&
            entry.status !== 'Cancelled'
        ) ||
        reservations.find(
          (entry) => String(entry.itemId) === String(id)
        );

      if (!current) {
        setSavedReservation(null);
        return;
      }

      // Preserve the existing code; generate one only when missing.
      const updatedReservation = {
        ...current,
        itemId: String(current.itemId || id),
        itemTitle: current.itemTitle || passedItem?.title || 'Reserved item',
        price: current.price ?? passedItem?.price,
        pickupPoint:
          current.pickupPoint || passedItem?.pickupPoint || 'Campus pickup',
        category: current.category || passedItem?.category || 'Other',
        description: current.description || passedItem?.description || '',
        emoji: current.emoji || passedItem?.emoji || '📦',
        images: current.images || passedItem?.images || [],
        handoverCode:
          current.status === 'Cancelled'
            ? current.handoverCode || ''
            : current.handoverCode ||
              String(Math.floor(1000 + Math.random() * 9000)),
        handoverStatus: current.handoverStatus || 'Pending',
      };

      const alreadyExists = reservations.some(
        (entry) =>
          entry.reservationId === updatedReservation.reservationId
      );

      const updatedReservations = alreadyExists
        ? reservations.map((entry) =>
            entry.reservationId === updatedReservation.reservationId
              ? updatedReservation
              : entry
          )
        : [...reservations, updatedReservation];

      localStorage.setItem(
        'saanjhaReservations',
        JSON.stringify(updatedReservations)
      );

      setSavedReservation(updatedReservation);
    } catch {
      setSavedReservation(null);
    }
  }, [id, passedReservation, passedItem]);

  const reservation = savedReservation || passedReservation;

  const item =
    passedItem ||
    (reservation
      ? {
          _id: reservation.itemId,
          title: reservation.itemTitle,
          price: reservation.price,
          pickupPoint: reservation.pickupPoint,
          category: reservation.category || 'Other',
          description: reservation.description || '',
          emoji: reservation.emoji || '📦',
          images: reservation.images || [],
        }
      : null);

  if (!item || String(item._id) !== String(id)) {
    return (
      <main className="reservation-page">
        <div className="reservation-card">
          <h1>Reservation not found</h1>
          <p>
            We couldn't find a saved reservation for this item.
            Please return to the listings and reserve it again.
          </p>
          <Link to="/" className="reservation-back-link">
            ← Back to listings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="reservation-page">
      <section className="reservation-card">
        <div className="reservation-success-icon">✓</div>

        <p className="reservation-eyebrow">SAANJHA · CAMPUS REUSE</p>
        <h1>Reservation Request Created!</h1>

        <p className="reservation-subtitle">
          Your reservation details are available below.
        </p>

        <div className="reservation-item">
          <div className="reservation-item-image">
            {item.images?.length ? (
              <img src={item.images[0]} alt={item.title || 'Listed item'} />
            ) : (
              <span>{item.emoji || '📦'}</span>
            )}
          </div>

          <div className="reservation-item-info">
            <span className="reservation-category">
              {item.category || 'Other'}
            </span>
            <h2>{item.title || 'Untitled item'}</h2>
            <p className="reservation-price">
              {item.price != null ? `₹${item.price}` : 'Price on request'}
            </p>
          </div>
        </div>

        <div className="reservation-details">
          <div>
            <span>Reservation ID</span>
            <strong>{reservation?.reservationId || `RES-${id}`}</strong>
          </div>

          <div>
            <span>Pickup point</span>
            <strong>{item.pickupPoint || 'Campus pickup'}</strong>
          </div>

          <div>
            <span>Reservation status</span>
            <strong className="reservation-status">
              {reservation?.status || 'Reserved'} · Demo
            </strong>
          </div>
        </div>

        {reservation?.status !== 'Cancelled' &&
          reservation?.handoverCode && (
            <div className="handover-code-panel">
              <p className="reservation-eyebrow">HANDOVER VERIFICATION</p>
              <h2>Your 4-digit handover code</h2>
              <p className="handover-code">
                {reservation.handoverCode}
              </p>
              <p>
                Keep this code private and share it with the item owner
                only when you meet to collect the item.
              </p>
              <p>
                Handover status:{' '}
                <strong>{reservation.handoverStatus || 'Pending'}</strong>
              </p>
            </div>
          )}

        <p className="reservation-note">
          This is a frontend demo. Reservation details and the handover
          code are stored in this browser only; no seller notification
          or secure server-side verification has occurred.
        </p>

        <Link to="/my-reservations" className="reservation-home-button">
          View My Reservations
        </Link>

        <p>
          <Link to="/" className="reservation-back-link">
            Back to listings
          </Link>
        </p>
      </section>
    </main>
  );
}
