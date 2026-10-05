import './HorizontalMovieCard.css';

export default function HorizontalMovieCard({ movie, isComingSoon }) {
  return (
    <div className={`horizontal-card ${isComingSoon ? 'card-coming-soon' : 'card-recently-viewed'}`}>
      <img src={movie.posterUrl} alt={movie.title} className={`horizontal-poster ${isComingSoon ? 'poster-large' : 'poster-small'}`} />
      
      <div className="horizontal-info">
        <div>
          {isComingSoon && <p className="release-date-text">{movie.releaseDate}</p>}
          <h4 className="horizontal-title">{movie.title}</h4>
          <p className="horizontal-subtitle">
            {movie.genre} • {movie.duration}
          </p>
        </div>
        
        <div className="horizontal-footer">
          <span className="tag age-tag">{movie.age}</span>
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