import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchSessions } from '../../api';
import './Sessions.css';

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

// Make sure { filterOptions } is properly destructured right here!
export default function Sessions({ filterOptions }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dates = useMemo(() => generateDates(), []);

  // State for real API data
  const [sessionsData, setSessionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extract current filters from URL
  const selectedDate = searchParams.get('date') || dates[0].full;
  const selectedVenues = searchParams.get('venue_id') ? searchParams.get('venue_id').split(',') : [];
  const selectedFormats = searchParams.get('format_id') ? searchParams.get('format_id').split(',') : [];
  const selectedLangs = searchParams.get('language_id') ? searchParams.get('language_id').split(',') : [];
  const selectedTimes = searchParams.get('time') ? searchParams.get('time').split(',') : [];
  const sortOrder = searchParams.get('sort') || 'time_asc';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Fetch real sessions from backend whenever URL search parameters change
  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      
      const apiParams = new URLSearchParams();
      
      if (selectedDate) apiParams.append('date', selectedDate);
      if (sortOrder) apiParams.append('sort', sortOrder);
      
      selectedVenues.forEach(id => apiParams.append('venue_id[]', id));
      selectedFormats.forEach(id => apiParams.append('format_id[]', id));
      selectedLangs.forEach(id => apiParams.append('language_id[]', id));
      selectedTimes.forEach(time => apiParams.append('time[]', time));

      const response = await fetchSessions(apiParams.toString());
      const items = response?.data || response || [];
      
      setSessionsData(items);
      setIsLoading(false);
    };

    loadSessions();
  }, [searchParams]);

  // Enforce strict frontend pagination (4 items per page)
  const totalPages = Math.ceil(sessionsData.length / 4) || 1;
  const currentSlicedData = sessionsData.slice((currentPage - 1) * 4, currentPage * 4);

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
    const stringVal = String(val);
    const newValues = currentValues.includes(stringVal)
      ? currentValues.filter(v => v !== stringVal)
      : [...currentValues, stringVal];
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
            {/* Safely map over the dynamic global venues */}
            {filterOptions?.venues?.map(v => (
              <label key={v.id} className="sess-custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedVenues.includes(String(v.id))}
                  onChange={() => toggleArrayParam('venue_id', selectedVenues, v.id)}
                />
                <span className="sess-checkmark"></span>
                {v.name}
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
            {filterOptions?.formats?.map(f => (
              <label key={f.id} className="sess-custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedFormats.includes(String(f.id))}
                  onChange={() => toggleArrayParam('format_id', selectedFormats, f.id)}
                />
                <span className="sess-checkmark"></span>
                {f.name}
              </label>
            ))}
          </div>

          <div className="sess-filter-section">
            <h3 className="sess-filter-label">LANGUAGE</h3>
            {filterOptions?.languages?.map(l => (
              <label key={l.id} className="sess-custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedLangs.includes(String(l.id))}
                  onChange={() => toggleArrayParam('language_id', selectedLangs, l.id)}
                />
                <span className="sess-checkmark"></span>
                {l.name}
              </label>
            ))}
          </div>

          <div className="sess-filter-section">
            <h3 className="sess-filter-label">TIME OF DAY</h3>
            {/* Swapped out the hardcoded array for the dynamic backend array */}
            {filterOptions?.timeBands?.map(t => (
              <label key={t.id} className="sess-custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedTimes.includes(t.id)}
                  onChange={() => toggleArrayParam('time', selectedTimes, t.id)}
                />
                <span className="sess-checkmark"></span>
                {t.label} <span className="sess-checkbox-desc">· {t.description}</span>
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
            <p className="sess-results-count">Showing {currentSlicedData.length} movies on this page</p>
            <div className="sess-sort-control">
              <span>Sort:</span>
              <select value={sortOrder} onChange={(e) => updateParams('sort', e.target.value)}>
                {/* Optional: You could also dynamically map filterOptions?.sorts here if you wanted! */}
                <option value="time_asc">Showtime: earliest first</option>
                <option value="time_desc">Showtime: latest first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="title_asc">Title: A–Z</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <p style={{ color: 'white', padding: '40px' }}>Loading live sessions...</p>
          ) : currentSlicedData.length === 0 ? (
            <p style={{ color: 'white', padding: '40px' }}>No sessions match your selected filters.</p>
          ) : (
            <div className="sess-movies-list">
              {currentSlicedData.map((movieGroup, index) => {
                const movie = movieGroup.movie;
                const sessionsList = movieGroup.sessions;

                return (
                  <div key={movie?.id || index} className="sess-movie-group">
                    <div className="sess-movie-info">
                      <img src={movie?.posterUrl} alt={movie?.title} className="sess-movie-poster" />
                      <div>
                        <h3 className="sess-movie-title">
                          {movie?.title} <span className="sess-age-tag">{movie?.ageRating?.code}</span>
                        </h3>
                        <p className="sess-movie-duration">{movie?.runtimeMinutes} min</p>
                      </div>
                    </div>
                    
                    <div className="sess-grid">
                      {sessionsList?.map(session => {
                        const isSoldOut = session.isSoldOut || session.seatsLeft === 0;
                        return (
                          <div 
                            key={session.id} 
                            className={`sess-card ${isSoldOut ? 'sold-out' : ''}`}
                            onClick={() => !isSoldOut && navigate(`/movie/${movie?.slug || movie?.id}?openBooking=true`, { state: { openBooking: true, sessionId: session.id } })}
                          >
                            <div className="sess-card-header">
                              <span className="sess-time">{session.time}</span>
                              <span className="sess-format">{session.format?.name}</span>
                            </div>
                            <p className="sess-lang">{session.language?.name}</p>
                            <p className="sess-venue">{session.venue?.name} · Hall {session.hall?.name}</p>
                            
                            <div className="sess-card-footer">
                              {isSoldOut ? (
                                <span className="sess-seats-status sold-out-text">Sold out</span>
                              ) : (
                                <span className="sess-seats-status available-text">
                                  <span className="sess-ticket-icon">🎟</span> {session.seatsLeft} left
                                </span>
                              )}
                              <span className="sess-price">₾{session.price}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="sess-pagination">
            <button 
              disabled={currentPage === 1} 
              onClick={() => updateParams('page', currentPage - 1)}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button 
                key={pageNum}
                className={currentPage === pageNum ? 'active' : ''}
                onClick={() => updateParams('page', pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button 
              disabled={currentPage >= totalPages} 
              onClick={() => updateParams('page', currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}