import { useState, useMemo } from 'react';
import BookingModal from '../../components/BookingModal/BookingModal';
import './MovieDetails.css';

// Mock Data for the page
const MOVIE_DATA = {
  id: 1,
  title: 'THE ODYSSEY',
  description: 'While her husband maps a coast he will never sail, she keeps a second atlas of the places he leaves out, and it becomes the more accurate of the two.',
  duration: '109 minutes',
  format: 'PANORAMA',
  ageRating: '16+',
  releaseDate: '4 September 2026',
  director: 'Elene Kapanadze',
  cast: 'David Merabishvili, Ana Lomidze, Giorgi Tskhadadze, Mariam Beridze',
  formats: 'MAX, MOTION, ATMOS',
  fromPrice: '16',
  backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop',
  poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&auto=format&fit=crop'
};

const MOCK_SESSIONS = {
  'Galleria Tbilisi': {
    'Hall A': [
      { id: 's1', time: '12:00', price: 16, format: 'MAX', lang: 'ENG', availableSeats: 45 },
      { id: 's2', time: '12:00', price: 16, format: 'MAX', lang: 'ENG', availableSeats: 45 } 
    ],
    'Hall B': [
      { id: 's3', time: '12:00', price: 16, format: 'MAX', lang: 'ENG', availableSeats: 45 },
      { id: 's4', time: '12:00', price: 16, format: 'MAX', lang: 'ENG', availableSeats: 45 }
    ]
  },
  'Vake Park': {
    'Hall A': [
      { id: 's5', time: '12:00', price: 16, format: 'MAX', lang: 'ENG', availableSeats: 45 },
      { id: 's6', time: '12:00', price: 16, format: 'MAX', lang: 'ENG', availableSeats: 45 }
    ]
  }
};

const generateDates = () => {
  const dates = [];
  const today = new Date("2026-10-08T00:00:00+04:00");
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      full: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate()
    });
  }
  return dates;
};

export default function MovieDetails() {
  const dates = useMemo(() => generateDates(), []);
  const [selectedDate, setSelectedDate] = useState(dates[0].full);
  const [selectedSession, setSelectedSession] = useState(null);
  
  const isAuthorized = true; 
  const userAge = 21; 
  const isAgeRestricted = MOVIE_DATA.ageRating === '16+' && userAge < 16;

  const handleSessionClick = (session, venue, hall) => {
    if (session.availableSeats === 0) return;
    if (isAuthorized && isAgeRestricted) return; 
    
    setSelectedSession({ ...session, venue, hall, movieTitle: MOVIE_DATA.title, ageRating: MOVIE_DATA.ageRating });
  };

  return (
    <div className="movie-page">
      <div className="movie-hero" style={{ backgroundImage: `linear-gradient(to right, #0b0e14 20%, transparent 60%), linear-gradient(to top, #0b0e14 0%, transparent 40%), url(${MOVIE_DATA.backdrop})` }}>
        <div className="hero-content">
          <img src={MOVIE_DATA.poster} alt={MOVIE_DATA.title} className="hero-poster" />
          <div className="hero-info">
            <h1 className="hero-title">{MOVIE_DATA.title}</h1>
            <p className="hero-desc">{MOVIE_DATA.description}</p>
            <div className="hero-tags">
              <span className="age-tag">{MOVIE_DATA.ageRating}</span>
              <span className="tag-pill">⏱ {MOVIE_DATA.duration}</span>
              <span className="tag-pill">{MOVIE_DATA.format}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="movie-body">
        <div className="sessions-container">
          <h2 className="section-title">Sessions</h2>
          
          <div className="date-selector">
            {dates.map(d => (
              <button 
                key={d.full}
                className={`date-btn ${selectedDate === d.full ? 'active' : ''}`}
                onClick={() => setSelectedDate(d.full)}
              >
                <span className="day-name">{d.dayName}</span>
                <span className="day-num">{d.dayNum}</span>
              </button>
            ))}
          </div>

          <div className="venues-list">
            {Object.entries(MOCK_SESSIONS).map(([venue, halls]) => (
              <div key={venue} className="venue-group">
                <h3 className="venue-name">{venue}</h3>
                {/* This is the container that puts the Hall cards side-by-side */}
                <div className="halls-flex-grid">
                  {Object.entries(halls).map(([hall, sessions]) => (
                    <div key={hall} className="hall-card">
                      <h4 className="hall-title">{hall}</h4>
                      <div className="sessions-list">
                        {sessions.map(session => (
                          <button 
                            key={session.id}
                            className={`session-ticket ${session.availableSeats === 0 ? 'sold-out' : ''} ${isAuthorized && isAgeRestricted ? 'restricted' : ''}`}
                            onClick={() => handleSessionClick(session, venue, hall)}
                            disabled={session.availableSeats === 0 || (isAuthorized && isAgeRestricted)}
                          >
                            {/* Left side of the ticket */}
                            <div className="ticket-left">
                              <span className="sess-time">{session.time}</span>
                              <div className="sess-tags">
                                <span className="sess-tag">{session.lang}</span>
                                <span className="sess-tag">{session.format}</span>
                              </div>
                            </div>
                            
                            <div className="ticket-divider"></div>
                            
                            {/* Right side of the ticket */}
                            <div className="ticket-right">
                              <span className="sess-price">₾{session.price}</span>
                              <span className="sess-seats">
                                🎟 {session.availableSeats > 0 ? `${session.availableSeats} left` : 'Sold out'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="details-sidebar">
          <h2 className="section-title">Details</h2>
          
          <div className="detail-item">
            <p className="detail-label">DIRECTOR</p>
            <p className="detail-value">{MOVIE_DATA.director}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">MAIN CAST</p>
            <p className="detail-value">{MOVIE_DATA.cast}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">DURATION</p>
            <p className="detail-value">{MOVIE_DATA.duration}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">RELEASE DATE</p>
            <p className="detail-value">{MOVIE_DATA.releaseDate}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">FORMATS</p>
            <p className="detail-value">{MOVIE_DATA.formats}</p>
          </div>
          
          <div className="detail-item from-price-item">
            <p className="detail-label">FROM</p>
            <p className="from-price">₾{MOVIE_DATA.fromPrice}</p>
          </div>
          
          <div className="rating-note">
            <p className="rating-label">RATING NOTE</p>
            <p className="rating-desc">{MOVIE_DATA.ageRating} - Not recommended for under-{MOVIE_DATA.ageRating.replace('+', '')}s. Tickets require an account aged {MOVIE_DATA.ageRating.replace('+', '')} or over.</p>
          </div>
        </aside>
      </div>

      {selectedSession && (
        <BookingModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
        />
      )}
    </div>
  );
}