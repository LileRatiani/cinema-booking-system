import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './Sessions.css';

const VENUES = ['Galleria Tbilisi', 'Rustaveli Palace', 'Vake Park', 'Batumi Boulevard'];
const ALL_FORMATS = ['Standard', 'MAX', 'ATMOS', 'PANORAMA', 'MOTION'];
const LANGUAGES = ['Georgian Dub', 'Georgian Sub', 'Original + Subtitles', 'English Dub'];
const TIMES_OF_DAY = [
  { id: 'morning', label: 'Morning', desc: 'before 12:00' },
  { id: 'afternoon', label: 'Afternoon', desc: '12:00–18:00' },
  { id: 'evening', label: 'Evening', desc: 'after 18:00' }
];

const mockMovies = [
  {
    id: 1, title: 'The Odyssey', age: '12+', duration: '134 min',
    poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&auto=format&fit=crop',
    sessions: [
      { id: 101, time: '10:15', format: 'Standard', lang: 'Original + Subtitles', venue: 'Galleria Tbilisi', hall: 'Hall D', price: 22, seats: 21 },
      { id: 102, time: '14:00', format: 'MAX', lang: 'Original + Subtitles', venue: 'Galleria Tbilisi', hall: 'Hall D', price: 22, seats: 1 },
      { id: 103, time: '16:30', format: 'PANORAMA', lang: 'Original + Subtitles', venue: 'Galleria Tbilisi', hall: 'Hall D', price: 22, seats: 45 },
    ]
  },
  {
    id: 2, title: 'Avengers: Doomsday', age: '12+', duration: '134 min',
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=400&auto=format&fit=crop',
    sessions: [
      { id: 201, time: '10:15', format: 'PANORAMA', lang: 'Original + Subtitles', venue: 'Galleria Tbilisi', hall: 'Hall D', price: 22, seats: 3 },
      { id: 202, time: '16:30', format: 'Standard', lang: 'Original + Subtitles', venue: 'Galleria Tbilisi', hall: 'Hall D', price: 22, seats: 0 }, 
    ]
  }
];

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

export default function Sessions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dates = useMemo(() => generateDates(), []);

  const selectedDate = searchParams.get('date') || dates[0].full;
  const selectedVenues = searchParams.get('venue') ? searchParams.get('venue').split(',') : [];
  const selectedFormats = searchParams.get('format') ? searchParams.get('format').split(',') : [];
  const selectedLangs = searchParams.get('language') ? searchParams.get('language').split(',') : [];
  const selectedTimes = searchParams.get('time') ? searchParams.get('time').split(',') : [];
  const sortOrder = searchParams.get('sort') || 'time_asc';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const availableFormats = useMemo(() => {
    if (selectedVenues.length === 0) return ALL_FORMATS;
    const formatsInVenues = new Set();
    mockMovies.forEach(movie => {
      movie.sessions.forEach(session => {
        if (selectedVenues.includes(session.venue)) {
          formatsInVenues.add(session.format);
        }
      });
    });
    return ALL_FORMATS.filter(f => formatsInVenues.has(f));
  }, [selectedVenues]);

  const updateParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value.length === 0) {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.set(key, value.join(','));
    } else {
      newParams.set(key, value);
    }
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const toggleArrayParam = (key, currentValues, val) => {
    const newValues = currentValues.includes(val)
      ? currentValues.filter(v => v !== val)
      : [...currentValues, val];
    updateParams(key, newValues);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams({ date: selectedDate, page: '1' }));
  };

  const activeFilterCount = selectedVenues.length + selectedFormats.length + selectedLangs.length + selectedTimes.length;

  return (
    <div className="sessions-page">
      <div className="sess-header">
        <h1 className="sess-page-title">Sessions</h1>
        <p className="sess-page-subtitle">Browse showtimes across all venues</p>
      </div>

      <div className="sess-layout">
        <aside className="sess-filters-sidebar">
          <h2 className="sess-filters-title">Filters</h2>
          
          <div className="sess-filter-section">
            <h3 className="sess-filter-label">VENUE</h3>
            {VENUES.map(v => (
              <label key={v} className="sess-custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedVenues.includes(v)}
                  onChange={() => toggleArrayParam('venue', selectedVenues, v)}
                />
                <span className="sess-checkmark"></span>
                {v}
              </label>
            ))}
          </div>

          <div className="sess-filter-section">
            <h3 className="sess-filter-label">DATE</h3>
            <div className="sess-date-selector">
              {dates.map(d => (
                <button 
                  key={d.full}
                  className={`sess-date-btn ${selectedDate === d.full ? 'active' : ''}`}
                  onClick={() => updateParams('date', d.full)}
                >
                  <span className="sess-day-name">{d.dayName}</span>
                  <span className="sess-day-num">{d.dayNum}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sess-filter-section">
            <h3 className="sess-filter-label">FORMAT</h3>
            {availableFormats.map(f => (
              <label key={f} className="sess-custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedFormats.includes(f)}
                  onChange={() => toggleArrayParam('format', selectedFormats, f)}
                />
                <span className="sess-checkmark"></span>
                {f}
              </label>
            ))}
          </div>

          <div className="sess-filter-section">
            <h3 className="sess-filter-label">LANGUAGE</h3>
            {LANGUAGES.map(l => (
              <label key={l} className="sess-custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedLangs.includes(l)}
                  onChange={() => toggleArrayParam('language', selectedLangs, l)}
                />
                <span className="sess-checkmark"></span>
                {l}
              </label>
            ))}
          </div>

          <div className="sess-filter-section">
            <h3 className="sess-filter-label">TIME OF DAY</h3>
            {TIMES_OF_DAY.map(t => (
              <label key={t.id} className="sess-custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedTimes.includes(t.id)}
                  onChange={() => toggleArrayParam('time', selectedTimes, t.id)}
                />
                <span className="sess-checkmark"></span>
                {t.label} <span className="sess-checkbox-desc">· {t.desc}</span>
              </label>
            ))}
          </div>

          <div className="sess-filters-footer">
            <button className="sess-btn-clear" onClick={clearAllFilters}>Clear all filters</button>
            <p className="sess-active-count">{activeFilterCount} filters active</p>
          </div>
        </aside>

        <main className="sess-content">
          <div className="sess-content-header">
            <p className="sess-results-count">Showing {mockMovies.length} sessions</p>
            <div className="sess-sort-control">
              <span>Sort:</span>
              <select value={sortOrder} onChange={(e) => updateParams('sort', e.target.value)}>
                <option value="time_asc">Showtime: earliest first</option>
                <option value="time_desc">Showtime: latest first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="title_asc">Title: A–Z</option>
              </select>
            </div>
          </div>

          <div className="sess-movies-list">
            {mockMovies.map(movie => (
              <div key={movie.id} className="sess-movie-group">
                <div className="sess-movie-info">
                  <img src={movie.poster} alt={movie.title} className="sess-movie-poster" />
                  <div>
                    <h3 className="sess-movie-title">{movie.title} <span className="sess-age-tag">{movie.age}</span></h3>
                    <p className="sess-movie-duration">{movie.duration}</p>
                  </div>
                </div>
                
                <div className="sess-grid">
                  {movie.sessions.map(session => {
                    const isSoldOut = session.seats === 0;
                    return (
                      <div 
                        key={session.id} 
                        className={`sess-card ${isSoldOut ? 'sold-out' : ''}`}
                        onClick={() => !isSoldOut && navigate(`/session/${session.id}/seats`)}
                      >
                        <div className="sess-card-header">
                          <span className="sess-time">{session.time}</span>
                          <span className="sess-format">{session.format}</span>
                        </div>
                        <p className="sess-lang">{session.lang}</p>
                        <p className="sess-venue">{session.venue} · {session.hall}</p>
                        
                        <div className="sess-card-footer">
                          {isSoldOut ? (
                            <span className="sess-seats-status sold-out-text">Sold out</span>
                          ) : (
                            <span className="sess-seats-status available-text">
                              <span className="sess-ticket-icon">🎟</span> {session.seats} left
                            </span>
                          )}
                          <span className="sess-price">₾{session.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="sess-pagination">
            <button 
              disabled={currentPage === 1} 
              onClick={() => updateParams('page', currentPage - 1)}
            >
              &lt;
            </button>
            <button className="active">{currentPage}</button>
            <button onClick={() => updateParams('page', currentPage + 1)}>&gt;</button>
          </div>
        </main>
      </div>
    </div>
  );
}