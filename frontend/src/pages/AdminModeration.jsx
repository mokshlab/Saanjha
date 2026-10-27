
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function displayStatus(status) {
  const value = String(status || 'pending');
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function AdminModeration() {
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    api.get('/listings/moderation/pending')
      .then((response) => {
        if (active) setListings(response.data.listings || []);
      })
      .catch((error) => {
        if (active) setMessage(error.response?.data?.message || 'Could not load pending listings.');
      });

    return () => {
      active = false;
    };
  }, []);

  async function updateStatus(item, status) {
    try {
      const endpoint = status === 'Approved' ? 'approve' : 'reject';
      const response = await api.put(`/listings/${item._id}/${endpoint}`, status === 'Rejected'
        ? { reason: 'Rejected by administrator' }
        : {});
      const updatedListing = response.data.listing;
      setListings((current) => current.map((entry) => (
        entry._id === item._id ? updatedListing : entry
      )));
      setMessage(`"${item.title || 'Listing'}" marked ${status.toLowerCase()}.`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update this listing.');
    }
  }

  const counts = useMemo(() => {
    const result = { Pending: 0, Approved: 0, Rejected: 0 };

    listings.forEach((item) => {
      const status = displayStatus(item.status);
      if (result[status] !== undefined) result[status]++;
    });

    return result;
  }, [listings]);

  const visibleListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return listings.filter((item) => {
      const status = displayStatus(item.status);
      const matchesStatus = filter === 'All' || status === filter;
      const matchesSearch = [
        item.title,
        item.description,
        item.category,
        item.pickupPoint,
      ].some((value) => String(value || '').toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [listings, filter, search]);

  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">SAANJHA • ADMIN WORKSPACE</p>
          <h1>Listing Moderation</h1>
          <p className="admin-subtitle">
            Review student listings and help keep your campus marketplace trustworthy.
          </p>
        </div>
        <Link to="/" className="admin-back-link">
          ← Back to marketplace
        </Link>
      </header>

      <section className="admin-welcome">
        <div>
          <span className="admin-welcome-label">MODERATION CENTRE</span>
          <h2>A little review makes Saanjha safer.</h2>
          <p>Check item details before approving them for students.</p>
        </div>
        <div className="admin-welcome-icon" aria-hidden="true">🌿</div>
      </section>

      <section className="admin-stats" aria-label="Listing statistics">
        <article className="admin-stat-card">
          <span className="admin-stat-icon">📋</span>
          <p>Total listings</p>
          <strong>{listings.length}</strong>
          <span className="admin-stat-note">All submitted items</span>
        </article>
        <article className="admin-stat-card pending-stat">
          <span className="admin-stat-icon">🕒</span>
          <p>Pending review</p>
          <strong>{counts.Pending}</strong>
          <span className="admin-stat-note">Awaiting a decision</span>
        </article>
        <article className="admin-stat-card approved-stat">
          <span className="admin-stat-icon">✓</span>
          <p>Approved</p>
          <strong>{counts.Approved}</strong>
          <span className="admin-stat-note">Ready for students</span>
        </article>
        <article className="admin-stat-card rejected-stat">
          <span className="admin-stat-icon">↗</span>
          <p>Rejected</p>
          <strong>{counts.Rejected}</strong>
          <span className="admin-stat-note">Not approved for browsing</span>
        </article>
      </section>

      <section className="admin-listings-section">
        <div className="admin-section-heading">
          <div>
            <h2>Submitted listings</h2>
            <p>Search items or filter by their current status.</p>
          </div>
          <span className="admin-result-count">
            {visibleListings.length} {visibleListings.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="admin-toolbar">
          <label className="admin-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search title, category, pickup..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search listings"
            />
          </label>

          <div className="admin-tabs" aria-label="Filter by status">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`admin-tab ${filter === tab ? 'active' : ''}`}
                aria-pressed={filter === tab}
                onClick={() => setFilter(tab)}
              >
                {tab}
                {tab === 'Pending' && counts.Pending > 0 && (
                  <span className="admin-tab-count">{counts.Pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <p className="admin-message" role="status" aria-live="polite">
            {message}
          </p>
        )}

        {visibleListings.length === 0 ? (
          <div className="admin-empty">
            <span aria-hidden="true">🌱</span>
            <h3>No listings found</h3>
            <p>
              {search
                ? 'Try another search term or change the selected filter.'
                : `There are no ${filter.toLowerCase()} listings right now.`}
            </p>
            {(search || filter !== 'Pending') && (
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => {
                  setSearch('');
                  setFilter('Pending');
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="admin-listing-grid">
            {visibleListings.map((item, index) => {
              const status = displayStatus(item.status);
              const photo = item.images?.[0] || item.image;

              return (
                <article className="admin-listing-card" key={item._id || index}>
                  <div className="admin-card-image">
                    {photo ? (
                      <img src={photo} alt={item.title || 'Listing photo'} />
                    ) : (
                      <div className="admin-image-placeholder" aria-hidden="true">
                        {item.emoji || '📦'}
                      </div>
                    )}
                    <span className={`admin-status status-${status.toLowerCase()}`}>
                      <span aria-hidden="true">●</span> {status}
                    </span>
                  </div>

                  <div className="admin-card-body">
                    <div className="admin-card-category">
                      {item.category || 'Other'}
                    </div>
                    <h3>{item.title || 'Untitled item'}</h3>
                    <p className="admin-card-description">
                      {item.description || 'No description provided.'}
                    </p>

                    <div className="admin-card-details">
                      <span>₹ {item.price ?? 'Not specified'}</span>
                      <span>📍 {item.pickupPoint || 'Pickup not specified'}</span>
                    </div>

                    <div className="admin-card-actions">
                      <button
                        type="button"
                        className="admin-approve-button"
                        disabled={!item._id || status === 'Approved'}
                        onClick={() => updateStatus(item, 'Approved')}
                      >
                        ✓ Approve
                      </button>
                      <button
                        type="button"
                        className="admin-reject-button"
                        disabled={!item._id || status === 'Rejected'}
                        onClick={() => updateStatus(item, 'Rejected')}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="admin-footer">
        <span aria-hidden="true">🌿</span>
        Saanjha — reuse more, waste less.
      </footer>
    </main>
  );
}

export default AdminModeration;
