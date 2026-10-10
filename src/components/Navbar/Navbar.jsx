import { Link } from 'react-router-dom';
import { useState } from 'react';
import AuthModal from '../AuthModal/AuthModal';
import './Navbar.css';

// Mock data to match the Figma search results
const MOCK_MOVIES = [
  { id: 1, title: 'The Odyssey', type: 'Film', age: '12+', duration: '134 min', price: 'from ₾16', status: 'available', poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=100&auto=format&fit=crop' },
  { id: 2, title: 'The Father', type: 'Film', age: '12+', duration: '134 min', price: 'from ₾12', status: 'available', poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=100&auto=format&fit=crop' },
  { id: 3, title: 'The Batman', type: 'Film', age: '12+', duration: '134 min', price: 'Coming Soon', status: 'coming_soon', poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=100&auto=format&fit=crop' },
  { id: 4, title: 'The Brutalist', type: 'Film', age: '12+', duration: '134 min', price: 'from ₾16', status: 'available', poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=100&auto=format&fit=crop' }
];

export default function Navbar() {
  const [isAuthorized, setIsAuthorized] = useState(true); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true); 

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login'); 

  // --- NEW: Search Overlay States ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openLogin = () => {
    setAuthView('login');
    setIsAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthView('signup');
    setIsAuthModalOpen(true);
  };

  // Filter movies based on search query
  const filteredResults = MOCK_MOVIES.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
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
          
          {/* --- UPDATED: Search Container --- */}
          <div className="search-container">
            <div className={`search-bar ${isSearchOpen ? 'active' : ''}`}>
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search films and live events" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            {/* Search Overlay Dropdown */}
            {isSearchOpen && (
              <>
                <div className="search-backdrop" onClick={() => setIsSearchOpen(false)}></div>
                <div className="search-dropdown">
                  
                  {searchQuery === '' ? (
                    // 1. Initial Prompt State
                    <div className="search-prompt">
                      <div className="prompt-icon">🍿</div>
                      <h4>What do you want to watch?</h4>
                      <p>Search by title, director or cast</p>
                      <button className="btn-browse" onClick={() => setIsSearchOpen(false)}>Browse all sessions</button>
                    </div>
                  ) : filteredResults.length > 0 ? (
                    // 2. Results State
                    <div className="search-results">
                      <div className="results-header">
                        <span>FILMS & EVENTS</span>
                        <span>{filteredResults.length} results</span>
                      </div>
                      <div className="results-list">
                        {filteredResults.map(movie => (
                          <div key={movie.id} className="result-item">
                            <img src={movie.poster} alt={movie.title} className="result-poster" />
                            <div className="result-info">
                              {/* Simple highlighting simulation */}
                              <h4>
                                {movie.title.toLowerCase().startsWith(searchQuery.toLowerCase()) ? (
                                  <><strong>{movie.title.slice(0, searchQuery.length)}</strong>{movie.title.slice(searchQuery.length)}</>
                                ) : (
                                  movie.title
                                )}
                              </h4>
                              <p>{movie.type} · {movie.age} · {movie.duration}</p>
                            </div>
                            <div className={`result-price ${movie.status === 'coming_soon' ? 'coming-soon' : ''}`}>
                              {movie.price}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // 3. No Results State
                    <div className="search-prompt">
                      <div className="prompt-icon">🔍</div>
                      <h4>No results for "{searchQuery}"</h4>
                      <p>Check the spelling or try another film or live event.</p>
                      <button className="btn-browse" onClick={() => setIsSearchOpen(false)}>Browse all sessions</button>
                    </div>
                  )}
                  
                </div>
              </>
            )}
          </div>

          {!isAuthorized ? (
            <div className="auth-buttons">
              <button className="btn-signup" onClick={openSignup}>Sign up</button>
              <button className="btn-login" onClick={openLogin}>Log in</button>
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

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authView} 
      />
    </>
  );
}