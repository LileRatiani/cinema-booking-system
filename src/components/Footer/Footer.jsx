import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <Link to="/" className="logo">
          <strong>KINO</strong> <span className="logo-accent">XII</span>
        </Link>
      </div>
      <div className="footer-right">
        <p>© 2026 Kino XII. All rights reserved.</p>
      </div>
    </footer>
  );
}