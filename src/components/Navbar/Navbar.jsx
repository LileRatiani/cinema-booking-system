import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Toggle this to false to see the orange "Profile incomplete" box again
  const [isProfileComplete, setIsProfileComplete] = useState(true); 

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
            <div 
              className="profile-trigger" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="avatar">
                <img src="https://ui-avatars.com/api/?name=Mari&background=8b5cf6&color=fff" alt="Mari" />
              </div>
              <span className="profile-name">Mari</span>
              <span className="dropdown-icon">
                <svg 
                  width="12" 
                  height="8" 
                  viewBox="0 0 14 8" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ 
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.3s ease' 
                  }}
                >
                  <path d="M1 1L7 7L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>

            {isDropdownOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="avatar avatar-large">
                    <img src="https://ui-avatars.com/api/?name=Mari&background=8b5cf6&color=fff" alt="Mari" />
                  </div>
                  <div className="user-details">
                    <p className="user-fullname">Mari Sanikidze</p>
                    <p className="user-email">marisanikidze@gmail.com</p>
                  </div>
                </div>

                {/* --- Conditional Profile Status Box --- */}
                {isProfileComplete ? (
                  <div className="profile-status status-complete">
                    <p className="status-title">Profile Complete <span className="check-icon">✓</span></p>
                  </div>
                ) : (
                  <div className="profile-status status-incomplete">
                    <p className="status-title">Profile incomplete</p>
                    <p className="status-desc">Please complete your profile to enable booking.</p>
                  </div>
                )}

                <div className="dropdown-links">
                  <Link to="/profile" className="dropdown-item">
                    <span className="dropdown-item-icon">👤</span> My Profile
                  </Link>
                  <Link to="/tickets" className="dropdown-item">
                    <span className="dropdown-item-icon">🎟</span> My Tickets
                  </Link>
                </div>
                
                <button className="dropdown-item logout-btn">
                  <span className="dropdown-item-icon">🚪</span> Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}