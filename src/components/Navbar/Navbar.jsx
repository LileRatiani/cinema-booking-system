import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthModal from '../AuthModal/AuthModal';
import { logoutUser, searchMovies } from '../../api'; // Added searchMovies
import './Navbar.css';

export default function Navbar({ currentUser, onLogout }) {
  // NOTE: If you are still using local state for currentUser and handleLogout 
  // inside the Navbar instead of passing them as props from App.jsx, 
  // you can keep your local states. This example assumes you are using props.

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login'); 
  const navigate = useNavigate();

  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const openLogin = () => {
    setAuthView('login');
    setIsAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthView('signup');
    setIsAuthModalOpen(true);
  };

  // Debounce and Fetch Search Results
  useEffect(() => {
    // If the search is empty, clear results and don't fetch
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Wait 300ms after the user stops typing before making the API call
    const delayDebounceFn = setTimeout(async () => {
      const { status, data } = await searchMovies(searchQuery);
      if (status === 200 && data?.data) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);

    // Cleanup function clears the timeout if the user types again before 300ms is up
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleResultClick = (slug) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/movie/${slug}`);
  };

  const displayName = currentUser?.username || currentUser?.fullName || 'User';
  const displayEmail = currentUser?.email || '';
  const avatarUrl = currentUser?.avatar || `https://ui-avatars.com/api/?name=${displayName}&background=8b5cf6&color=fff`;

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

            {isSearchOpen && (
              <>
                <div className="search-backdrop" onClick={() => setIsSearchOpen(false)}></div>
                <div className="search-dropdown">
                  
                  {searchQuery === '' ? (
                    <div className="search-prompt">
                      <div className="prompt-icon">🍿</div>
                      <h4>What do you want to watch?</h4>
                      <p>Search by title, director or cast</p>
                      <button className="btn-browse" onClick={() => { setIsSearchOpen(false); navigate('/sessions'); }}>
                        Browse all sessions
                      </button>
                    </div>
                  ) : isSearching ? (
                    <div className="search-prompt">
                      <p>Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="search-results">
                      <div className="results-header">
                        <span>FILMS & EVENTS</span>
                        <span>{searchResults.length} results</span>
                      </div>
                      <div className="results-list">
                        {searchResults.map(movie => (
                          <div 
                            key={movie.id} 
                            className="result-item" 
                            onClick={() => handleResultClick(movie.slug)}
                            style={{ cursor: 'pointer' }}
                          >
                            <img src={movie.posterUrl} alt={movie.title} className="result-poster" />
                            <div className="result-info">
                              <h4>
                                {movie.title.toLowerCase().startsWith(searchQuery.toLowerCase()) ? (
                                  <><strong>{movie.title.slice(0, searchQuery.length)}</strong>{movie.title.slice(searchQuery.length)}</>
                                ) : (
                                  movie.title
                                )}
                              </h4>
                              <p style={{ textTransform: 'capitalize' }}>
                                {movie.kind} · {movie.ageRating?.code} · {movie.runtimeMinutes} min
                              </p>
                            </div>
                            <div className={`result-price ${movie.isComingSoon ? 'coming-soon' : ''}`}>
                              {movie.isComingSoon ? 'Coming Soon' : `from ₾${movie.fromPrice}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="search-prompt">
                      <div className="prompt-icon">🔍</div>
                      <h4>No results for "{searchQuery}"</h4>
                      <p>Check the spelling or try another film or live event.</p>
                      <button className="btn-browse" onClick={() => { setIsSearchOpen(false); navigate('/sessions'); }}>
                        Browse all sessions
                      </button>
                    </div>
                  )}
                  
                </div>
              </>
            )}
          </div>

          {!currentUser ? (
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
                  <img src={avatarUrl} alt={displayName} />
                </div>
                <span className="profile-name">{displayName}</span>
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
                      <img src={avatarUrl} alt={displayName} />
                    </div>
                    <div className="user-details">
                      <p className="user-fullname">{displayName}</p>
                      <p className="user-email">{displayEmail}</p>
                    </div>
                  </div>

                  {currentUser.profileComplete ? (
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
                    <Link 
                      to="/profile" 
                      state={{ activeTab: 'personal' }} 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="dropdown-item-icon">👤</span> My Profile
                    </Link>
                    
                    <Link 
                      to="/profile" 
                      state={{ activeTab: 'tickets' }} 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="dropdown-item-icon">🎟</span> My Tickets
                    </Link>
                  </div>
                  
                  <button className="dropdown-item logout-btn" onClick={onLogout}>
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