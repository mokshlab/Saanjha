
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useState } from 'react';
import api, { isAuthenticated } from '../api';
import Navbar from '../components/Navbar';

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

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  // Get the listing passed during navigation, or load it from localStorage.
  const passedItem =
    state?.item && String(state.item._id) === String(id)
      ? state.item
      : null;

  const item = passedItem || getLocalListing(id);

  // Current logged-in user's email.
  const currentUserEmail =
    localStorage.getItem('saanjhaLoggedIn') === 'true'
      ? (localStorage.getItem('saanjhaLoggedInEmail') || '')
          .trim()
          .toLowerCase()
      : '';

  // Listing owner's email.
  const ownerEmail = (item?.ownerEmail || '')
    .trim()
    .toLowerCase();

  // Prevent the listing owner from reserving their own item.
  const isOwner =
    Boolean(currentUserEmail) &&
    Boolean(ownerEmail) &&
    currentUserEmail === ownerEmail;

  const [durationHours, setDurationHours] = useState(54);
  const [alreadyReserved, setAlreadyReserved] = useState(false);
  const [reservationMessage, setReservationMessage] = useState('');
  const [reserving, setReserving] = useState(false);

  if (!item) {
    return (
      <>
        <Navbar />
        <main className="listing-details-page">
          <h2>Listing not available</h2>
          <p>
            This item may have been removed, or its details are not
            available in this browser.
          </p>
          <Link to="/">← Back to listings</Link>
        </main>
      </>
    );
  }

  async function handleReservation() {
    // Extra check in the click handler as well.
    if (isOwner) {
      window.alert("You can't reserve your own listing.");
      return;
    }

    // Require the user to log in before reserving.
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    setReserving(true);
    setReservationMessage('');
    try {
      const response = await api.post(`/reservations/${item._id}`, {
        durationHours,
      });
      const reservation = response.data.reservation;
      setAlreadyReserved(true);
      navigate(`/reservation-confirmation/${item._id}`, {
        state: {
          item,
          reservation,
          handoverCode: response.data.handoverCode,
        },
      });
    } catch (error) {
      setReservationMessage(
        error.response?.data?.message || 'Could not reserve this listing.'
      );
    } finally {
      setReserving(false);
    }
  }

  return (
    <>
      <Navbar />
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

          {isOwner ? (
            <p className="owner-notice" role="status">
              Your listing — you can't reserve your own item.
            </p>
          ) : (
            <>
              <button
                type="button"
                className="primary-button"
                onClick={handleReservation}
                disabled={alreadyReserved || reserving}
              >
                {reserving
                  ? 'Reserving...'
                  : alreadyReserved
                  ? 'Already Reserved ✓'
                  : 'Reserve Item'}
              </button>

              {!alreadyReserved && (
                <label>
                  Reservation duration
                  <select
                    value={durationHours}
                    onChange={(event) =>
                      setDurationHours(Number(event.target.value))
                    }
                    disabled={reserving}
                  >
                    {[3, 6, 12, 24, 36, 54, 72, 96].map((hours) => (
                      <option key={hours} value={hours}>
                        {hours} hours
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {reservationMessage && (
                <p role="alert">{reservationMessage}</p>
              )}

              {alreadyReserved && (
                <p role="status">
                  You have already reserved this item. Visit{' '}
                  <Link to="/my-reservations">
                    My Reservations
                  </Link>{' '}
                  to check its status.
                </p>
              )}
            </>
          )}
        </div>
      </div>
      </main>
    </>
  );
}
