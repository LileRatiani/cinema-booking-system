import './HorizontalMovieCard.css';

export default function HorizontalMovieCard({ movie, isComingSoon }) {
  // 1. Safely extract genres from the array[cite: 12]
  const genreNames = movie.genres?.map(g => g.name).join(', ') || 'Unknown Genre';
  
  // 2. Format the date to match the design (e.g., "14 AUGUST")[cite: 12]
  const formattedDate = movie.releaseDate 
    ? new Date(movie.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }).toUpperCase()
    : '';

  return (
    <div className={`horizontal-card ${isComingSoon ? 'card-coming-soon' : 'card-recently-viewed'}`}>
      <img src={movie.posterUrl} alt={movie.title} className={`horizontal-poster ${isComingSoon ? 'poster-large' : 'poster-small'}`} />
      
      <div className="horizontal-info">
        <div>
          {/* NEW: Using the formatted date */}
          {isComingSoon && <p className="release-date-text">{formattedDate}</p>}
          <h4 className="horizontal-title">{movie.title}</h4>
          
          {/* NEW: Using genreNames and runtimeMinutes[cite: 12] */}
          <p className="horizontal-subtitle">
            {genreNames} · {movie.runtimeMinutes} Min
          </p>
        </div>
        
        <div className="horizontal-footer">
          {/* NEW: Using ageRating.code[cite: 12] */}
          <span className="tag age-tag">{movie.ageRating?.code}</span>
          {isComingSoon && (
            <button className="btn-notify-small">
              <span className="bell-icon">🔔</span> Notify Me
            </button>
          )}
        </div>
      </div>
    </div>
  );
}