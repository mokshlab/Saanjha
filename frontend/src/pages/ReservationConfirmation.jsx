
import { Link, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';

export default function ReservationConfirmation() {
  const { id } = useParams();
  const { state } = useLocation();

  const [savedReservation, setSavedReservation] = useState(null);

  const passedReservation = state?.reservation;
  const passedItem = state?.item;

  useEffect(() => {
    if (passedReservation) {
      setSavedReservation(passedReservation);
      return undefined;
    }

    let active = true;
    api.get('/reservations/mine')
      .then((response) => {
        if (!active) return;
        const current = (response.data.reservations || []).find(
          (entry) => String(entry.listing?._id) === String(id)
        );
        setSavedReservation(current || null);
      })
      .catch(() => {
        if (active) setSavedReservation(null);
      });

    return () => {
      active = false;
    };
  }, [id, passedReservation]);

  const reservation = savedReservation || passedReservation;

  const item =
    passedItem ||
    (reservation
      ? {
          _id: reservation.listing?._id || id,
          title: reservation.listing?.title || passedItem?.title,
          price: reservation.listing?.price ?? passedItem?.price,
          pickupPoint: reservation.listing?.pickupPoint || passedItem?.pickupPoint,
          category: reservation.listing?.category || passedItem?.category || 'Other',
          description: reservation.listing?.description || passedItem?.description || '',
          images: reservation.listing?.images || passedItem?.images || [],
        }
      : null);

  if (!item || String(item._id) !== String(id)) {
    return (
      <>
        <Navbar />
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
      </>
    );
  }

  return (
    <>
      <Navbar />
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
            <strong>{reservation?._id || `RES-${id}`}</strong>
          </div>

          <div>
            <span>Pickup point</span>
            <strong>{item.pickupPoint || 'Campus pickup'}</strong>
          </div>

          <div>
            <span>Reservation status</span>
            <strong className="reservation-status">
              {reservation?.status || 'active'}
            </strong>
          </div>
          {reservation?.expiresAt && (
            <div>
              <span>Expires</span>
              <strong>{new Date(reservation.expiresAt).toLocaleString()}</strong>
            </div>
          )}
        </div>

        {reservation?.status === 'active' &&
          (state?.handoverCode || reservation?.handoverCode) && (
            <div className="handover-code-panel">
              <p className="reservation-eyebrow">HANDOVER VERIFICATION</p>
              <h2>Your 4-digit handover code</h2>
              <p className="handover-code">
                {state?.handoverCode || reservation.handoverCode}
              </p>
              <p>
                Keep this code private and share it with the item owner
                only when you meet to collect the item.
              </p>
              <p>
                Handover status:{' '}
                <strong>Pending</strong>
              </p>
            </div>
          )}

        <p className="reservation-note">
          Keep the handover code private and share it with the item owner
          when you meet to collect the item.
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
    </>
  );
}
