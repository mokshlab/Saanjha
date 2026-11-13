import { Link } from 'react-router-dom';

export default function Brand({ className = '' }) {
  return (
    <Link
      className={`page-brand ${className}`.trim()}
      to="/"
      aria-label="Saanjha home"
    >
      <span className="brand-mark">S</span>
      <span className="brand-name">saanjha</span>
    </Link>
  );
}
