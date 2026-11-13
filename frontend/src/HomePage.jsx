
import { useEffect, useMemo, useState } from 'react';
import './index.css';
import { useLocation, useNavigate } from 'react-router-dom';
import SustainabilitySection from './components/SustainabilitySection';
import ListingForm from './components/ListingForm';
import Navbar from './components/Navbar';
import api, { getStoredUser } from './api';

const demoListings = [
  {
    _id: 'demo-1',
    title: 'Mountain Bicycle',
    category: 'Cycles',
    description: 'Well-maintained cycle, perfect for campus rides.',
    price: 2800,
    pickupPoint: 'Main Gate',
    emoji: '\u{1F6B2}',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    _id: 'demo-2',
    title: 'Engineering Mathematics',
    category: 'Books',
    description: 'Useful textbook in good condition.',
    price: 250,
    pickupPoint: 'Library Entrance',
    emoji: '\u{1F4DA}',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    _id: 'demo-3',
    title: 'Wireless Headphones',
    category: 'Electronics',
    description: 'Comfortable headphones for studying and music.',
    price: 650,
    pickupPoint: 'Student Centre',
    emoji: '\u{1F3A7}',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    _id: 'demo-4',
    title: 'Study Table Lamp',
    category: 'Accessories',
    description: 'Compact lamp for study sessions.',
    price: 350,
    pickupPoint: 'Hostel Block A',
    emoji: '\u{1F4A1}',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    _id: 'demo-5',
    title: 'College Backpack',
    category: 'Accessories',
    description: 'Spacious everyday bag with multiple pockets.',
    price: 400,
    pickupPoint: 'Academic Block',
    emoji: '\u{1F392}',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    _id: 'demo-6',
    title: 'Data Structures Notes',
    category: 'Books',
    description: 'Semester notes ready for their next owner.',
    price: 120,
    pickupPoint: 'Library Entrance',
    emoji: '\u{1F4DA}',
    images: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    ],
  },
];

const categories = [
  'All Items',
  'Cycles',
  'Books',
  'Electronics',
  'Accessories',
];

function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
const isAdmin = getStoredUser()?.role === 'admin';

  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Items');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const [status, setStatus] = useState('Loading listings...');
  const [usingDemo, setUsingDemo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [scrollToForm, setScrollToForm] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .get(isAdmin ? '/listings/admin/all' : '/listings')
      .then((response) => {
        if (!active) return;

        const serverListings = Array.isArray(response.data.items)
          ? response.data.items
          : [];

        setListings(serverListings);
        setStatus('');
      })
      .catch(() => {
        if (!active) return;

        setListings(demoListings);
        setUsingDemo(true);
        setStatus('');
      });

    return () => {
      active = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!location.state?.openListingForm) return;

    setShowForm(true);
    setScrollToForm(true);
  }, [location.state]);

  useEffect(() => {
    const targetId = location.hash.slice(1);
    if (!targetId) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.hash]);

  useEffect(() => {
    if (!showForm || !scrollToForm) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById('form-title')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setScrollToForm(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [scrollToForm, showForm]);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = listings.filter((item) => {
      const listingStatus = (item.status || 'Approved').toLowerCase();

if (!isAdmin && listingStatus !== 'approved') {
  return false;
}
      const searchableText = [
        item.title || '',
        item.description || '',
        item.category || '',
        item.pickupPoint || '',
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);

      const matchesCategory =
        category === 'All Items' ||
        (item.category || '').toLowerCase() === category.toLowerCase();

      const hasPrice =
        item.price !== null &&
        item.price !== undefined &&
        item.price !== '' &&
        Number.isFinite(Number(item.price));

      const price = Number(item.price);

      const matchesMinPrice =
        minPrice === '' ||
        (hasPrice && price >= Number(minPrice));

      const matchesMaxPrice =
        maxPrice === '' ||
        (hasPrice && price <= Number(maxPrice));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => {
        const priceA =
          a.price === null ||
          a.price === undefined ||
          a.price === '' ||
          !Number.isFinite(Number(a.price))
            ? Infinity
            : Number(a.price);

        const priceB =
          b.price === null ||
          b.price === undefined ||
          b.price === '' ||
          !Number.isFinite(Number(b.price))
            ? Infinity
            : Number(b.price);

        return priceA - priceB;
      });
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => {
        const priceA =
          a.price === null ||
          a.price === undefined ||
          a.price === '' ||
          !Number.isFinite(Number(a.price))
            ? -Infinity
            : Number(a.price);

        const priceB =
          b.price === null ||
          b.price === undefined ||
          b.price === '' ||
          !Number.isFinite(Number(b.price))
            ? -Infinity
            : Number(b.price);

        return priceB - priceA;
      });
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => {
        const dateA = Date.parse(a.createdAt || '') || 0;
        const dateB = Date.parse(b.createdAt || '') || 0;

        return dateB - dateA;
      });
    }

    return filtered;
  }, [listings, search, category, minPrice, maxPrice, sortBy, isAdmin]);

  function clearFilters() {
    setSearch('');
    setCategory('All Items');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
  }

async function handleAdminDelete(item) {
  const confirmed = window.confirm(
    `Are you sure you want to permanently delete "${item.title}"?`
  );

  if (!confirmed) return;

  try {
    const response = await api.delete(`/listings/admin/${item._id}`);

    setListings((currentListings) =>
      currentListings.filter((listing) => listing._id !== item._id)
    );

    setStatus(response.data.message || 'Listing deleted successfully.');
  } catch (error) {
    setStatus(
      error.response?.data?.message || 'Could not delete listing.'
    );
  }
}
  function openListingForm() {
    setShowForm(true);
    setScrollToForm(true);
  }

  return (
    <main className="app-shell">
      <Navbar onListItem={openListingForm} />

      <section className="hero" id="home">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" />
            YOUR CAMPUS, YOUR COMMUNITY
          </span>

          <h1>
            Good things deserve
            <br />
            a <span>second life.</span>
          </h1>

          <p>
            Pass on what you no longer need. Find what you do.
            Make campus life a little more affordable, together.
          </p>

          <a className="primary-button" href="#browse">
            Explore listings <span>{'\u2197'}</span>
          </a>

          <div className="hero-note">
            <span>{'\u2713'}</span> Student community&nbsp; {'\u00B7'} &nbsp;Campus pickup
            &nbsp; {'\u00B7'} &nbsp;Reuse more
          </div>
        </div>

        <div
          className="hero-art"
          aria-label="Illustration of reusable student essentials"
        >
          <div className="art-circle circle-one" />
          <div className="art-circle circle-two" />
          <div className="floating-note note-top">{'\u267B\uFE0F'} Give it another go</div>
          <div className="hero-emoji">{'\u{1F393}'}</div>
          <div className="hero-emoji emoji-book">{'\u{1F4DA}'}</div>
          <div className="hero-emoji emoji-cycle">{'\u{1F6B2}'}</div>
          <div className="floating-note note-bottom">
            Made for campus life {'\u2728'}
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Community benefits">
        <div>
          <span>{'\u267B'}</span>
          <p>
            <strong>Reuse, don't waste</strong>
            <small>Give useful things a new home</small>
          </p>
        </div>

        <div>
          <span>{'\u{1F393}'}</span>
          <p>
            <strong>Made for students</strong>
            <small>A community that gets you</small>
          </p>
        </div>

        <div>
          <span>{'\u{1F4CD}'}</span>
          <p>
            <strong>Meet on campus</strong>
            <small>Arrange pickup in person</small>
          </p>
        </div>
      </section>

      <section className="listing-section" id="browse">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE CAMPUS FINDS</span>
            <h2>Find your next favourite.</h2>
            <p>
              Pre-loved essentials, waiting for their next chapter.
            </p>
          </div>

          <span className="item-count">
            {filteredListings.length}{' '}
            {filteredListings.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <label className="search-box">
          <span aria-hidden="true">{'\u2715'}</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search cycles, textbooks, headphones..."
            aria-label="Search listings"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              {'\u00D7'}
            </button>
          )}
        </label>

        <div className="category-row" aria-label="Filter by category">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`category-chip ${
                category === item ? 'active' : ''
              }`}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="listing-filters">
          <div className="price-filter">
            <label htmlFor="min-price">Min price ({'\u20B9'})</label>
            <input
              id="min-price"
              type="number"
              min="0"
              placeholder={`\u20B90`}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
          </div>

          <div className="price-filter">
            <label htmlFor="max-price">Max price ({'\u20B9'})</label>
            <input
              id="max-price"
              type="number"
              min="0"
              placeholder="No limit"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </div>

          <div className="sort-filter">
            <label htmlFor="sort-listings">Sort by</label>
            <select
              id="sort-listings"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="default">Default order</option>
              <option value="newest">Newest first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={clearFilters}
          >
            Clear all
          </button>
        </div>

        {usingDemo && (
          <p className="demo-notice">
            Preview mode: sample listings are shown alongside items you add
            in this browser. Connect the API for shared live listings.
          </p>
        )}

        {status && <p className="status-message">{status}</p>}

        {!status && filteredListings.length === 0 && (
          <div className="empty-state">
            <span>{'\u{1F50D}'}</span>
            <h3>No items found just yet</h3>
            <p>Try another search or choose a different category.</p>

            <button
              type="button"
              className="secondary-button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="listing-grid">
          {filteredListings.map((item) => (
            <article
              className="listing-card"
              key={item._id}
              onClick={() =>
                navigate(`/listing/${item._id}`, { state: { item } })
              }
              style={{ cursor: 'pointer' }}
            >
              <div className="listing-image">
                {item.images?.length ? (
                  <img
                    src={item.images[0]}
                    alt={item.title || 'Listed item'}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="item-emoji">
                    {item.emoji || '\u{1F4E6}'}
                  </span>
                )}

                <span className="image-label">PRE-LOVED</span>
              </div>

              <div className="listing-content">
                <span className="category">
                  {item.category || 'Other'}
                </span>

                <h3>{item.title || 'Untitled item'}</h3>

                <p className="item-description">
                  {item.description ||
                    'A useful item looking for a new home.'}
                </p>

                <div className="card-footer">
                  <strong>
                    {item.price != null
                      ? `\u20B9${item.price}`
                      : 'Price on request'}
                  </strong>

                  <span className="pickup">
                    {'\u{1F4CD}'} {item.pickupPoint || 'Campus pickup'}
                  </span>
                </div>
                {isAdmin && !usingDemo && (
                  <button
                    type="button"
                    className="nav-cta"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleAdminDelete(item);
                    }}
                  >
                    Delete listing
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sell-banner" id="sell">
        <div>
          <span className="eyebrow">SOMEONE ELSE MIGHT NEED IT</span>

          <h2>
            Your shelf could be
            <br />
            someone's treasure.
          </h2>

          <p>
            Books you've finished. Things you no longer use. Pass them on
            to a fellow student.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setShowForm((previous) => !previous);
          }}
        >
          {showForm ? 'Close form' : '\u002B List your item'}
        </button>
      </section>

      {showForm && (
        <ListingForm onSubmitted={clearFilters} />
      )}

      <section className="how-section" id="how-it-works">
        <span className="eyebrow">SIMPLE BY DESIGN</span>
        <h2>Pass it on in three steps.</h2>

        <div className="steps-grid">
          <article>
            <span>01</span>
            <h3>Find your thing</h3>
            <p>Browse student listings and search for what you need.</p>
          </article>

          <article>
            <span>02</span>
            <h3>Connect on campus</h3>
            <p>
              Check the listing and agree on a convenient pickup point.
            </p>
          </article>

          <article>
            <span>03</span>
            <h3>Give it a new life</h3>
            <p>
              Meet in person and help useful things stay in use.
            </p>
          </article>
        </div>
      </section>
  <SustainabilitySection />
      <footer className="site-footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">S</span>
          <span className="brand-name">saanjha</span>
        </a>

        <p>Made with care for a campus that shares.</p>
        <span>{'\u00A9'} Saanjha {'\u00B7'} Campus reuse community</span>
      </footer>
    </main>
  );
}

export default HomePage;




