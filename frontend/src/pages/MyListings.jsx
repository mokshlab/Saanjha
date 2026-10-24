
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'saanjhaUserListings';

const categories = [
  'Cycles',
  'Books',
  'Electronics',
  'Accessories',
];

function getSavedListings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function MyListings() {
  const [listings, setListings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Books',
    price: '',
    pickupPoint: '',
    description: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    setListings(getSavedListings());
  }, []);

  function saveListings(updatedListings) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedListings)
      );

      setListings(updatedListings);
      return true;
    } catch {
      setMessage(
        'Could not save changes. Browser storage may be full.'
      );
      return false;
    }
  }

  function startEditing(item) {
    setEditingId(item._id);

    setForm({
      title: item.title || '',
      category: categories.includes(item.category)
        ? item.category
        : 'Books',
      price: item.price ?? '',
      pickupPoint: item.pickupPoint || '',
      description: item.description || '',
    });

    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm({
      title: '',
      category: 'Books',
      price: '',
      pickupPoint: '',
      description: '',
    });
    setMessage('');
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleUpdate(event) {
    event.preventDefault();

    const title = form.title.trim();
    const pickupPoint = form.pickupPoint.trim();
    const description = form.description.trim();
    const price = Number(form.price);

    if (
      !title ||
      !pickupPoint ||
      !description ||
      form.price === '' ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 1000000
    ) {
      setMessage('Please enter valid details for every field.');
      return;
    }

    const currentListings = getSavedListings();

    const exists = currentListings.some(
      (item) => item._id === editingId
    );

    if (!exists) {
      setMessage(
        'This listing could not be found in saved listings. Refresh the page and try again.'
      );
      setListings(currentListings);
      return;
    }

    const updatedListings = currentListings.map((item) =>
      item._id === editingId
        ? {
            ...item,
            title,
            category: form.category,
            price,
            pickupPoint,
            description,
          }
        : item
    );

    if (saveListings(updatedListings)) {
      setEditingId(null);
      setMessage('✓ Listing updated successfully!');

      setForm({
        title: '',
        category: 'Books',
        price: '',
        pickupPoint: '',
        description: '',
      });
    }
  }

  function handleDelete(item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title || 'this listing'}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const currentListings = getSavedListings();

    const updatedListings = currentListings.filter(
      (savedItem) => savedItem._id !== item._id
    );

    if (updatedListings.length === currentListings.length) {
      setMessage('Listing not found in saved listings.');
      setListings(currentListings);
      return;
    }

    if (saveListings(updatedListings)) {
      if (editingId === item._id) {
        cancelEditing();
      }

      setMessage('Listing deleted successfully.');
    }
  }

  return (
    <main
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '32px 20px 60px',
        color: '#304c39',
      }}
    >
      <h1>My Listings</h1>
      <p>Manage the items you have shared on Saanjha.</p>

      <p>
        <Link to="/">← Back to Browse Listings</Link>
      </p>

      {message && (
        <p role="status" aria-live="polite">
          {message}
        </p>
      )}

      {editingId !== null && (
        <section
          style={{
            background: '#f3f7f0',
            border: '1px solid #c8d8c7',
            borderRadius: '14px',
            padding: '22px',
            margin: '24px 0',
          }}
        >
          <h2>Edit Listing</h2>

          <form
            onSubmit={handleUpdate}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <label>
              Item name
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={100}
                required
                style={inputStyle}
              />
            </label>

            <label>
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                style={inputStyle}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Price (₹)
              <input
                name="price"
                type="number"
                min="0"
                max="1000000"
                step="1"
                value={form.price}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </label>

            <label>
              Pickup point
              <input
                name="pickupPoint"
                value={form.pickupPoint}
                onChange={handleChange}
                maxLength={100}
                required
                style={inputStyle}
              />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={1000}
                rows={4}
                required
                style={inputStyle}
              />
            </label>

            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <button type="submit" style={buttonStyle}>
                Save Changes
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>
            </div>
          </form>

          <p>
            Your existing product photo will be kept when you edit
            the text details.
          </p>
        </section>
      )}

      {listings.length === 0 ? (
        <section style={{ padding: '32px 0' }}>
          <h2>No listings yet</h2>
          <p>
            Items you publish from the home page will appear here.
          </p>
          <Link to="/">List an item</Link>
        </section>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '22px',
            marginTop: '28px',
          }}
        >
          {listings.map((item, index) => {
            const itemId = item._id;
            const image = item.images?.[0] || item.image || '';

            return (
              <article
                key={itemId ?? index}
                style={{
                  border: '1px solid #d8e2d5',
                  borderRadius: '14px',
                  padding: '16px',
                  background: '#fff',
                  minWidth: 0,
                }}
              >
                {image ? (
                  <img
                    src={image}
                    alt={item.title || 'Listed item'}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '130px',
                      display: 'grid',
                      placeItems: 'center',
                      background: '#f3f7f0',
                      borderRadius: '10px',
                      fontSize: '44px',
                    }}
                    aria-label="No product photo"
                  >
                    {item.emoji || '📦'}
                  </div>
                )}

                <h2>{item.title || 'Untitled item'}</h2>

                <p>
                  {item.description || 'No description available.'}
                </p>

                <p>
                  <strong>Category:</strong>{' '}
                  {item.category || 'Not specified'}
                </p>

                <p>
                  <strong>Price:</strong> ₹
                  {item.price ?? 'Not specified'}
                </p>

                <p>
                  <strong>Pickup:</strong>{' '}
                  {item.pickupPoint || 'Not specified'}
                </p>
<p>
  <strong>Status:</strong>{' '}
  {item.status || 'Approved'}
</p>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginTop: '16px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => startEditing(item)}
                    disabled={!itemId}
                    style={buttonStyle}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={!itemId}
                    style={deleteButtonStyle}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

const inputStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: '7px',
  padding: '11px',
  border: '1px solid #c8d8c7',
  borderRadius: '8px',
  font: 'inherit',
  background: '#fff',
  color: '#304c39',
};

const buttonStyle = {
  padding: '10px 16px',
  border: 'none',
  borderRadius: '8px',
  background: '#42694b',
  color: '#fff',
  cursor: 'pointer',
  font: 'inherit',
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: '#e6eee3',
  color: '#304c39',
};

const deleteButtonStyle = {
  ...buttonStyle,
  background: '#a43e3e',
};

export default MyListings;
