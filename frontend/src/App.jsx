import { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' });

function App() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Loading listings...');

  useEffect(() => {
    api.get('/listings')
      .then((response) => {
        setListings(response.data.items || []);
        setStatus('');
      })
      .catch(() => setStatus('Listings will appear when the Saanjha API is running.'));
  }, []);

  const filteredListings = listings.filter((listing) => {
    const query = search.trim().toLowerCase();
    return !query || `${listing.title} ${listing.description} ${listing.category}`.toLowerCase().includes(query);
  });

  return (
    <main className="app-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">Campus reuse network</p>
          <h1>Saanjha</h1>
          <p className="tagline">What if your campus never let anything go to waste?</p>
        </div>
        <nav aria-label="Primary navigation">
          <a href="#browse">Browse</a>
          <a href="#sell">Sell an item</a>
          <a href="#status">My activity</a>
        </nav>
      </header>

      <section className="intro" id="browse">
        <div>
          <p className="eyebrow">Find useful things nearby</p>
          <h2>Give an item a second campus life.</h2>
          <p>Search student listings, check the pickup point, and arrange a safe in-person handover.</p>
        </div>
        <label className="search-box">
          <span>Search listings</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="cycle, textbook, headset..." />
        </label>
      </section>

      <section className="listing-section" aria-live="polite">
        {status && <p className="status-message">{status}</p>}
        {!status && filteredListings.length === 0 && <p className="status-message">No approved listings match your search.</p>}
        <div className="listing-grid">
          {filteredListings.map((listing) => (
            <article className="listing-card" key={listing._id}>
              <div className="listing-image">{listing.images?.length ? <img src={listing.images[0]} alt="" /> : <span>No image</span>}</div>
              <div className="listing-content">
                <p className="category">{listing.category}</p>
                <h3>{listing.title}</h3>
                <p>{listing.description}</p>
                <strong>₹{listing.price}</strong>
                <span className="pickup">Pickup: {listing.pickupPoint}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="next-step" id="sell">
        <p className="eyebrow">Next core workflow</p>
        <h2>List, reserve, meet, hand over.</h2>
        <p>Authentication, listing approval, reservations, expiry, and the four-digit handover code are being built as separate Saanjha modules.</p>
      </section>

      <footer id="status">Saanjha is an exploratory campus reuse project. No online payment is used.</footer>
    </main>
  );
}

export default App;