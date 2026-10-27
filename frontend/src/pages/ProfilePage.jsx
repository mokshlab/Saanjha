
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession } from '../api';

export default function ProfilePage() {
  const navigate = useNavigate();

  const [name, setName] = useState(
    localStorage.getItem('saanjhaName') || ''
  );

  const [email, setEmail] = useState(
    localStorage.getItem('saanjhaEmail') || ''
  );

  const [saved, setSaved] = useState(false);

  function handleSave(event) {
    event.preventDefault();

    localStorage.setItem('saanjhaName', name);
    localStorage.setItem('saanjhaEmail', email);

    setSaved(true);
  }

  function handleLogout() {
    const confirmed = window.confirm(
      'Are you sure you want to log out?'
    );

    if (confirmed) {
      clearSession();
      navigate('/login');
    }
  }

  return (
    <main className="profile-page">
      <Link to="/" className="details-back-link">
        ← Back to Saanjha
      </Link>

      <section className="profile-card">
        <div className="profile-avatar">
          {name.trim() ? name.trim().charAt(0).toUpperCase() : 'S'}
        </div>

        <p className="profile-eyebrow">YOUR CAMPUS COMMUNITY</p>

        <h1>My Profile</h1>

        <p className="profile-description">
          Keep your student details up to date.
        </p>

        <form onSubmit={handleSave}>
          <label className="profile-label">
            Full name
            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
              placeholder="Enter your full name"
              required
            />
          </label>

          <label className="profile-label">
            College email
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSaved(false);
              }}
              placeholder="you@chitkara.edu.in"
              required
            />
          </label>

          <button type="submit" className="primary-button">
            Save Changes
          </button>

          {saved && (
            <p className="profile-success" role="status">
              ✓ Profile saved successfully!
            </p>
          )}
        </form>

        <div className="profile-links">
          <Link to="/my-reservations">
            View My Reservations →
          </Link>
        </div>

        <button
          type="button"
          className="profile-logout"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </section>
    </main>
  );
}
