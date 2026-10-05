import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  
  const [isAuthorized, setIsAuthorized] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">
          <strong>KINO</strong> <span className="logo-accent">XII</span>
        </Link>
        <Link to="/sessions" className="nav-link">
          SESSIONS
        </Link>
      </div>

      <div className="nav-right">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search films and live events" />
        </div>

        {!isAuthorized ? (
          <div className="auth-buttons">
            <button className="btn-signup">Sign up</button>
            <button className="btn-login">Log in</button>
          </div>
        ) : (
          <div className="profile-menu">
            <div className="profile-trigger">
              <div className="avatar">M</div>
              <span className="profile-name">Mari</span>
              <span className="dropdown-icon">⌄</span>
            </div>
            
          </div>
        )}
      </div>
    </nav>
  );
}