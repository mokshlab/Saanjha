
import { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';
import { useNavigate } from 'react-router-dom';
import SustainabilitySection from './components/SustainabilitySection';
import api, { clearSession, isAuthenticated } from './api';

const demoListings = [
  {
    _id: 'demo-1',
    title: 'Mountain Bicycle',
    category: 'Cycles',
    description: 'Well-maintained cycle, perfect for campus rides.',
    price: 2800,
    pickupPoint: 'Main Gate',
    emoji: '🚲',
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
    emoji: '📚',
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
    emoji: '🎧',
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
    emoji: '💡',
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
    emoji: '🎒',
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
    emoji: '📝',
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
  const [loggedInName, setLoggedInName] = useState(() => {
  return localStorage.getItem('saanjhaLoggedIn') === 'true'
    ? localStorage.getItem('saanjhaName') || ''
    : '';
});
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Items');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const [status, setStatus] = useState('Loading listings...');
  const [usingDemo, setUsingDemo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageError, setImageError] = useState('');
  const imageInputRef = useRef(null);

  useEffect(() => {
    let active = true;

    api
      .get('/listings')
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
  }, []);

  useEffect(() => {
    if (!selectedImages.length) {
      setImagePreviews([]);
      return undefined;
    }

    const previewUrls = selectedImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewUrls);

    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedImages]);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = listings.filter((item) => {
      const listingStatus = (item.status || 'Approved').toLowerCase();

if (listingStatus !== 'approved') {
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
  }, [listings, search, category, minPrice, maxPrice, sortBy]);

  function clearFilters() {
    setSearch('');
    setCategory('All Items');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files || []);

    setImageError('');
    setFormMessage('');

    if (!files.length) return;

    if (files.some((file) => !file.type.startsWith('image/'))) {
      setSelectedImages([]);
      setImageError('Please choose a valid image file.');
      event.target.value = '';
      return;
    }

    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setSelectedImages([]);
      setImageError(
        'Each image must be 5 MB or smaller.'
      );
      event.target.value = '';
      return;
    }

    if (files.length < 2) {
      setSelectedImages(files);
      setImageError('Choose at least two images for a listing.');
      return;
    }

    setSelectedImages(files);
  }

  function removeSelectedImage() {
    setSelectedImages([]);
    setImageError('');

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }

  async function handleListingSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setFormMessage('');
    setImageError('');

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const title = String(formData.get('title') || '').trim();
      const itemCategory = String(formData.get('category') || 'books').toLowerCase();
      const condition = String(formData.get('condition') || 'good').toLowerCase();
      const price = Number(formData.get('price'));
      const pickupPoint = String(
        formData.get('pickupPoint') || ''
      ).trim();
      const description = String(
        formData.get('description') || ''
      ).trim();

      if (
        !title ||
        !pickupPoint ||
        !description ||
        !Number.isFinite(price) ||
        price < 0 ||
        !isAuthenticated()
      ) {
        setFormMessage(
          isAuthenticated()
            ? 'Please enter all required details and a valid price.'
            : 'Please log in before publishing a listing.'
        );
        return;
      }

      if (selectedImages.length < 2) {
        setImageError('Choose at least two images for a listing.');
        return;
      }

      formData.set('category', itemCategory);
      formData.set('condition', condition);
      await api.post('/listings', formData);

      // Reset search, price filters and sorting so the new item is visible.
      clearFilters();

      form.reset();
      setSelectedImages([]);

      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }

      setFormMessage('Your listing has been submitted for admin review.');

      document.getElementById('browse')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } catch (error) {
      setFormMessage(error.response?.data?.message || 'Could not submit the listing.');
    } finally {
      setSubmitting(false);
    }
  }

  function openListingForm() {
    setShowForm(true);

    window.setTimeout(() => {
      document.getElementById('sell')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 0);
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Saanjha home">
          <span className="brand-mark">S</span>
          <span>
            Saanjha
            <small>FROM STUDENT TO STUDENT</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#browse">Explore</a>
          <a href="#how-it-works">How it works</a>
<a href="#about-saanjha">About Us</a>
          <button
            type="button"
            className="nav-cta"
            onClick={openListingForm}
          >
            + List an item
          </button>

         

<a href="/my-reservations">My Reservations</a>
<a href="/my-listings">My Listings</a>
<a href="/profile">My Profile</a>
<a href="/admin-moderation">Admin Moderation</a>

{loggedInName ? (
  <>
    <a className="nav-login" href="/profile">
      Hi, {loggedInName}
    </a>
    <button
      type="button"
      className="nav-cta"
      onClick={() => {
        clearSession();
        setLoggedInName('');
        navigate('/');
      }}
    >
      Log out
    </button>
  </>
) : (
  <>
    <a className="nav-login" href="/login">Login</a>
    <a className="nav-signup" href="/register">Sign Up</a>
  </>
)}



        </nav>
      </header>

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
            Explore listings <span>↗</span>
          </a>

          <div className="hero-note">
            <span>✓</span> Student community&nbsp; · &nbsp;Campus pickup
            &nbsp; · &nbsp;Reuse more
          </div>
        </div>

        <div
          className="hero-art"
          aria-label="Illustration of reusable student essentials"
        >
          <div className="art-circle circle-one" />
          <div className="art-circle circle-two" />
          <div className="floating-note note-top">♻️ Give it another go</div>
          <div className="hero-emoji">🎒</div>
          <div className="hero-emoji emoji-book">📚</div>
          <div className="hero-emoji emoji-cycle">🚲</div>
          <div className="floating-note note-bottom">
            Made for campus life ✨
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Community benefits">
        <div>
          <span>♻</span>
          <p>
            <strong>Reuse, don't waste</strong>
            <small>Give useful things a new home</small>
          </p>
        </div>

        <div>
          <span>🎓</span>
          <p>
            <strong>Made for students</strong>
            <small>A community that gets you</small>
          </p>
        </div>

        <div>
          <span>📍</span>
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
          <span aria-hidden="true">⌕</span>
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
              ×
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
            <label htmlFor="min-price">Min price (₹)</label>
            <input
              id="min-price"
              type="number"
              min="0"
              placeholder="₹0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
          </div>

          <div className="price-filter">
            <label htmlFor="max-price">Max price (₹)</label>
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
            <span>🔎</span>
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
                    {item.emoji || '📦'}
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
                      ? `₹${item.price}`
                      : 'Price on request'}
                  </strong>

                  <span className="pickup">
                    📍 {item.pickupPoint || 'Campus pickup'}
                  </span>
                </div>
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
            setFormMessage('');
            setImageError('');
          }}
        >
          {showForm ? 'Close form' : '＋ List your item'}
        </button>
      </section>

      {showForm && (
        <section
          className="listing-form-section"
          aria-labelledby="form-title"
        >
          <h2 id="form-title">Give your item a new home</h2>

          <p className="form-note">
            Add your item below. Listings are submitted for admin review.
          </p>

          <form className="listing-form" onSubmit={handleListingSubmit}>
            <label>
              Item name
              <input
                required
                name="title"
                maxLength={100}
                placeholder="e.g. Engineering textbook"
              />
            </label>

            <label>
              Category
              <select name="category" defaultValue="Books">
                {categories
                  .filter((item) => item !== 'All Items')
                  .map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Condition
              <select name="condition" defaultValue="good">
                <option value="new">New</option>
                <option value="like-new">Like new</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </label>

            <label>
              Price (₹)
              <input
                required
                name="price"
                type="number"
                min="0"
                max="1000000"
                step="1"
                placeholder="e.g. 250"
              />
            </label>

            <label>
              Pickup point
              <input
                required
                name="pickupPoint"
                maxLength={100}
                placeholder="e.g. Library entrance"
              />
            </label>

            <label className="form-wide">
              Description
              <textarea
                required
                name="description"
                rows="3"
                maxLength={1000}
                placeholder="Describe the condition and details..."
              />
            </label>

            <div className="form-wide image-upload-field">
              <label htmlFor="item-image" className="upload-heading">
                Product photos <span>(at least 2 required)</span>
              </label>

              <label htmlFor="item-image" className="image-upload-box">
                <span className="upload-icon">📸</span>
                <strong>
                  {selectedImages.length
                    ? `${selectedImages.length} photos selected`
                    : 'Click to upload photos'}
                </strong>
                <span>JPG, PNG, WEBP · Maximum 5 MB each</span>

                <input
                  ref={imageInputRef}
                  id="item-image"
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="image-file-input"
                />
              </label>

              {imageError && (
                <p className="image-error" role="alert">
                  {imageError}
                </p>
              )}

              {imagePreviews.length > 0 && (
                <div className="image-preview">
                  {imagePreviews.map((preview, index) => (
                    <img
                      key={preview}
                      src={preview}
                      alt={`Selected product photo ${index + 1}`}
                    />
                  ))}

                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={removeSelectedImage}
                  >
                    ✕ Remove photos
                  </button>
                </div>
              )}
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Saving item...' : '＋ Publish listing'}
            </button>
          </form>

          {formMessage && (
            <p className="form-message" role="status">
              {formMessage}
            </p>
          )}
        </section>
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
          <span>
            Saanjha
            <small>FROM STUDENT TO STUDENT</small>
          </span>
        </a>

        <p>Made with care for a campus that shares.</p>
        <span>© Saanjha · Campus reuse community</span>
      </footer>
    </main>
  );
}

export default HomePage;
