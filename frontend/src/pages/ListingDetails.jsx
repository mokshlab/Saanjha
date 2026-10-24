
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useState } from 'react';

function getLocalListing(id) {
  try {
    const savedListings = JSON.parse(
      localStorage.getItem('saanjhaUserListings') || '[]'
    );

    if (!Array.isArray(savedListings)) return null;

    return (
      savedListings.find(
        (listing) => String(listing._id) === String(id)
      ) || null
    );
  } catch {
    return null;
  }
}

function getReservations() {
  try {
    const saved = JSON.parse(
      localStorage.getItem('saanjhaReservations') || '[]'
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function hasActiveReservation(id) {
  return getReservations().some(
    (reservation) =>
      String(reservation.itemId) === String(id) &&
      reservation.status !== 'Cancelled'
  );
}

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  // Listing state works during navigation; localStorage supports refresh.
  const passedItem =
    state?.item && String(state.item._id) === String(id)
      ? state.item
      : null;

  const item = passedItem || getLocalListing(id);

  const [alreadyReserved, setAlreadyReserved] = useState(
    () => hasActiveReservation(id)
  );

  if (!item) {
    return (
      <main className="listing-details-page">
        <h2>Listing not available</h2>
        <p>
          This item may have been removed, or its details are not
          available in this browser.
        </p>
        <Link to="/">← Back to listings</Link>
      </main>
    );
  }

  function handleReservation() {
    try {
      const reservations = getReservations();

      const existingReservation = reservations.find(
        (reservation) =>
          String(reservation.itemId) === String(item._id) &&
          reservation.status !== 'Cancelled'
      );

      // Reuse an existing reservation and its original code.
      if (existingReservation) {
        setAlreadyReserved(true);

        navigate(`/reservation-confirmation/${item._id}`, {
          state: {
            item,
            reservation: existingReservation,
          },
        });

        return;
      }

      // Generate a code once for this new reservation.
      const handoverCode = String(
        Math.floor(1000 + Math.random() * 9000)
      );

      const reservation = {
        reservationId: `RES-${Date.now()}`,
        itemId: String(item._id),
        itemTitle: item.title || 'Reserved item',
        price: item.price ?? null,
        pickupPoint: item.pickupPoint || 'Campus pickup',
        category: item.category || 'Other',
        description: item.description || '',
        emoji: item.emoji || '📦',
        images: item.images || [],
        status: 'Reserved',
        handoverCode,
        handoverStatus: 'Pending',
        createdAt: new Date().toISOString(),
      };

      // Save before navigating so My Reservations can read it.
      const updatedReservations = [
        ...reservations,
        reservation,
      ];

      localStorage.setItem(
        'saanjhaReservations',
        JSON.stringify(updatedReservations)
      );

      setAlreadyReserved(true);

      navigate(`/reservation-confirmation/${item._id}`, {
        state: {
          item,
          reservation,
        },
      });
    } catch {
      window.alert(
        'Could not save your reservation. Please try again.'
      );
    }
  }

  return (
    <main className="listing-details-page">
      <Link to="/" className="details-back-link">
        ← Back to listings
      </Link>

      <div className="listing-details-card">
        <div className="details-image">
          {item.images?.length ? (
            <img
              src={item.images[0]}
              alt={item.title || 'Listed item'}
            />
          ) : (
            <span>{item.emoji || '📦'}</span>
          )}
        </div>

        <div className="details-content">
          <span className="category">
            {item.category || 'Other'}
          </span>

          <h1>{item.title || 'Untitled item'}</h1>

          <p className="details-price">
            {item.price != null
              ? `₹${item.price}`
              : 'Price on request'}
          </p>

          <p className="details-description">
            {item.description || 'No description available.'}
          </p>

          <div className="details-info">
            <p>
              <strong>Pickup point:</strong>{' '}
              {item.pickupPoint || 'Campus pickup'}
            </p>

            <p>
              <strong>Category:</strong>{' '}
              {item.category || 'Other'}
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={handleReservation}
            disabled={alreadyReserved}
          >
            {alreadyReserved
              ? 'Already Reserved ✓'
              : 'Reserve Item'}
          </button>

          {alreadyReserved && (
            <p role="status">
              You have already reserved this item. Visit{' '}
              <Link to="/my-reservations">
                My Reservations
              </Link>{' '}
              to check its status.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
