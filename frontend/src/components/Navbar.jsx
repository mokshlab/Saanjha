import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getStoredUser } from '../api';

export default function Navbar({
  onListItem,
  showListItem = true,
  variant = 'user',
}) {
  const navigate = useNavigate();
  const [loggedInName, setLoggedInName] = useState(() => (
    localStorage.getItem('saanjhaLoggedIn') === 'true'
      ? localStorage.getItem('saanjhaName') || ''
      : ''
  ));
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = getStoredUser()?.role === 'admin';
  const userInitial = loggedInName.trim().charAt(0).toUpperCase() || 'S';

  useEffect(() => {
    if (!menuOpen) return undefined;

    function handleMenuKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleMenuKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleMenuKeyDown);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleListItem() {
    closeMenu();

    if (onListItem) {
      onListItem();
      return;
    }

    navigate('/', { state: { openListingForm: true } });
  }

  function handleLogout() {
    clearSession();
    setLoggedInName('');
    closeMenu();
    navigate('/');
  }

  return (
    <header className={`site-header ${variant === 'admin' ? 'admin-site-header' : ''}`}>
      <Link className="brand" to="/" aria-label="Saanjha home">
        <span className="brand-mark">S</span>
        <span className="brand-name">saanjha</span>
      </Link>

      <button
        type="button"
        className="nav-menu-toggle"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setMenuOpen((previous) => !previous)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="primary-navigation"
        className={`main-nav${menuOpen ? ' is-open' : ''}`}
        aria-label={variant === 'admin' ? 'Admin navigation' : 'Main navigation'}
      >
        <div className="nav-links">
          {variant === 'admin' ? (
            <>
              <Link to="/admin-moderation#admin-overview" onClick={closeMenu}>
                Overview
              </Link>
              <Link to="/admin-moderation#admin-review-queue" onClick={closeMenu}>
                Review queue
              </Link>
            </>
          ) : (
            <>
              <Link to="/#browse" onClick={closeMenu}>Browse listings</Link>
              <Link to="/#how-it-works" onClick={closeMenu}>How it works</Link>
              <Link to="/#about-saanjha" onClick={closeMenu}>About</Link>
              <Link to="/contact" onClick={closeMenu}>Contact</Link>
            </>
          )}
        </div>

        <div className="nav-actions">
          {showListItem && variant !== 'admin' && (
            <button type="button" className="nav-cta" onClick={handleListItem}>
              + List an item
            </button>
          )}

          {loggedInName ? (
            <details className="account-menu">
              <summary className="account-trigger">
                <span className="account-avatar">{userInitial}</span>
                <span className="account-label">Hi, {loggedInName}</span>
                <span className="account-chevron" aria-hidden="true">⌄</span>
              </summary>
              <div className="account-dropdown">
                {variant === 'admin' ? (
                  <>
                    <Link to="/admin-moderation#admin-overview" onClick={closeMenu}>
                      Admin dashboard
                    </Link>
                    <Link to="/profile" onClick={closeMenu}>Admin profile</Link>
                  </>
                ) : (
                  <>
                    <Link to="/my-reservations" onClick={closeMenu}>My reservations</Link>
                    <Link to="/my-listings" onClick={closeMenu}>My listings</Link>
                    <Link to="/profile" onClick={closeMenu}>My profile</Link>
                    {isAdmin && (
                      <Link to="/admin-moderation" onClick={closeMenu}>
                        Admin moderation
                      </Link>
                    )}
                  </>
                )}
                <button type="button" onClick={handleLogout}>Log out</button>
              </div>
            </details>
          ) : (
            <>
              <Link className="nav-login" to="/login" onClick={closeMenu}>Log in</Link>
              <Link className="nav-signup" to="/register" onClick={closeMenu}>Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
