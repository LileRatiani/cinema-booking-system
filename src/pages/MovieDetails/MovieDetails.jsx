import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails, notifyMovie } from '../../api'; // Import notifyMovie here
import BookingModal from '../../components/BookingModal/BookingModal';
import './MovieDetails.css';

const generateDates = () => {
  const dates = [];
  const today = new Date(); // Dynamically gets the current local date
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    
    // Safely format as YYYY-MM-DD using local time to prevent UTC timezone drift
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    dates.push({
      full: `${yyyy}-${mm}-${dd}`,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate()
    });
  }
  return dates;
};

const groupSessionsByHall = (sessionsArray) => {
  const halls = {};
  sessionsArray.forEach(session => {
    const hallName = session.hall?.name || 'Main';
    if (!halls[hallName]) halls[hallName] = [];
    halls[hallName].push(session);
  });
  return halls;
};

export default function MovieDetails({ filterOptions, currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dates = useMemo(() => generateDates(), []);

  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotifying, setIsNotifying] = useState(false); // New state for API call
  const [selectedDate, setSelectedDate] = useState(dates[0].full);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const loadMovieDetails = async () => {
      setIsLoading(true);
      const data = await fetchMovieDetails(id, { date: selectedDate });
      
      // Handle standard API response wrappers (e.g. data.data vs data)
      const movieData = data?.data || data;
      setMovie(movieData);
      setIsLoading(false);
    };

    if (id) {
      loadMovieDetails();
    }
  }, [id, selectedDate]);

  // Handle the Coming Soon subscription
  const handleNotifyClick = async () => {
    setIsNotifying(true);
    const { status } = await notifyMovie(id);

    if (status === 201) {
      // Update local state to show the success checkmark
      setMovie(prev => ({ ...prev, isNotified: true }));
    } else if (status === 401) {
      alert("Please log in to receive notifications.");
    }
    
    setIsNotifying(false);
  };

  const ageLimit = movie?.ageRating?.minAge || 0;
  const rawAgeRating = movie?.ageRating?.code || '';
  
  const isAuthorized = true; 
  const userAge = 21; 
  const isAgeRestricted = ageLimit > 0 && userAge < ageLimit;

  const handleSessionClick = (session, venueName, hallName) => {
    if (session.isSoldOut || session.seatsLeft === 0) return;
    if (isAuthorized && isAgeRestricted) return; 
    
    setSelectedSession({ 
      ...session, 
      venue: venueName, 
      hall: hallName, 
      movieTitle: movie.title, 
      ageRating: rawAgeRating
    });
  };

  if (isLoading) {
    return <div style={{ color: 'white', padding: '40px' }}>Loading movie details...</div>;
  }

  if (!movie || !movie.title) {
    return (
      <div style={{ color: 'white', padding: '40px' }}>
        <h2>Movie not found.</h2>
        <p>Ensure your backend API is running and the movie ID ({id}) is correct.</p>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 16px', marginTop: '20px', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="movie-page">
      
      <div className="movie-hero" style={{ backgroundImage: `linear-gradient(to right, #0b0e14 20%, transparent 60%), linear-gradient(to top, #0b0e14 0%, transparent 40%), url(${movie.backdropUrl})` }}>
        <div className="hero-content">
          <img src={movie.posterUrl} alt={movie.title} className="hero-poster" />
          <div className="hero-info">
            <h1 className="hero-title">{movie.title}</h1>
            <p className="hero-desc">{movie.synopsis || "No synopsis available."}</p>
            <div className="hero-tags">
              <span className="age-tag" title={movie.ageRating?.description}>{rawAgeRating}</span>
              <span className="tag-pill">⏱ {movie.runtimeMinutes} min</span>
            </div>
          </div>
        </div>
      </div>

      <div className="movie-body">
        <div className="sessions-container">
          
          {movie.isComingSoon ? (
            <div className="coming-soon-block" style={{ padding: '40px 0' }}>
              <h2 className="section-title" style={{ marginBottom: '16px' }}>Coming Soon</h2>
              <p style={{ color: '#888', marginBottom: '24px', fontSize: '18px' }}>
                This movie is not yet in cinemas. Get an email when tickets go on sale.
              </p>
              
              <button 
                onClick={handleNotifyClick}
                disabled={movie.isNotified || isNotifying}
                style={{
                  padding: '12px 32px',
                  backgroundColor: movie.isNotified ? '#10b981' : '#8b5cf6', // Green if subscribed, purple if not
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: movie.isNotified ? 'default' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {movie.isNotified ? '✓ Subscribed' : (isNotifying ? 'Subscribing...' : 'Notify Me')}
              </button>
            </div>
          ) : (
            <>
              <h2 className="section-title">Sessions</h2>
              <div className="date-selector">
                {dates.map(d => {
                  const isAvailable = movie.availableDates?.includes(d.full);
                  return (
                    <button 
                      key={d.full}
                      className={`date-btn ${selectedDate === d.full ? 'active' : ''}`}
                      onClick={() => setSelectedDate(d.full)}
                      disabled={!isAvailable}
                      style={{ opacity: isAvailable ? 1 : 0.3, cursor: isAvailable ? 'pointer' : 'not-allowed' }}
                    >
                      <span className="day-name">{d.dayName}</span>
                      <span className="day-num">{d.dayNum}</span>
                    </button>
                  );
                })}
              </div>

              <div className="venues-list">
                {!movie.venuesData || movie.venuesData.length === 0 ? (
                  <p style={{ color: '#888', marginTop: '20px' }}>No sessions available for this date.</p>
                ) : (
                  movie.venuesData.map((venueGroup) => {
                    const venueName = venueGroup.venue.name;
                    const groupedHalls = groupSessionsByHall(venueGroup.sessions);

                    return (
                      <div key={venueGroup.venue.id} className="venue-group">
                        <h3 className="venue-name">{venueName}</h3>
                        <div className="halls-flex-grid">
                          {Object.entries(groupedHalls).map(([hallName, sessions]) => (
                            <div key={hallName} className="hall-card">
                              <h4 className="hall-title">Hall {hallName}</h4>
                              <div className="sessions-list">
                                {sessions.map(session => {
                                  const isSoldOut = session.isSoldOut || session.seatsLeft === 0;

                                  return (
                                    <button 
                                      key={session.id}
                                      className={`session-ticket ${isSoldOut ? 'sold-out' : ''} ${isAuthorized && isAgeRestricted ? 'restricted' : ''}`}
                                      onClick={() => handleSessionClick(session, venueName, hallName)}
                                      disabled={isSoldOut || (isAuthorized && isAgeRestricted)}
                                    >
                                      <div className="ticket-left">
                                        <span className="sess-time">{session.time}</span>
                                        <div className="sess-tags">
                                          <span className="sess-tag">{session.language?.code}</span>
                                          <span className="sess-tag">{session.format?.name}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="ticket-divider"></div>
                                      
                                      <div className="ticket-right">
                                        <span className="sess-price">₾{session.price}</span>
                                        <span className="sess-seats">
                                          🎟 {!isSoldOut ? `${session.seatsLeft} left` : 'Sold out'}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        <aside className="details-sidebar">
          <h2 className="section-title">Details</h2>
          
          <div className="detail-item">
            <p className="detail-label">DIRECTOR</p>
            <p className="detail-value">{movie.director}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">MAIN CAST</p>
            <p className="detail-value">{movie.cast}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">DURATION</p>
            <p className="detail-value">{movie.runtimeMinutes} minutes</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">RELEASE DATE</p>
            <p className="detail-value">{movie.releaseDate}</p>
          </div>
          
          {/* Formats shouldn't crash if empty/undefined */}
          {movie.formats && movie.formats.length > 0 && (
            <div className="detail-item">
              <p className="detail-label">FORMATS</p>
              <p className="detail-value">{movie.formats.map(f => f.name).join(', ')}</p>
            </div>
          )}
          
          <div className="detail-item from-price-item">
            <p className="detail-label">FROM</p>
            <p className="from-price">₾{movie.fromPrice}</p>
          </div>
          
          <div className="rating-note">
            <p className="rating-label">RATING NOTE</p>
            <p className="rating-desc">
              {movie.ageRating?.description || `Not recommended for under-${ageLimit}s.`}
            </p>
          </div>
        </aside>
      </div>

      {selectedSession && (
        <BookingModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
        />
      )}

      {selectedSession && (
  <BookingModal 
    session={selectedSession} 
    onClose={() => setSelectedSession(null)} 
    filterOptions={filterOptions} // <-- Pass this through!
  />
)}
    </div>
  );
}