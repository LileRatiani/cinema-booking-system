import './MovieCard.css';
import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie, isComingSoon }) {
  console.log("REAL MOVIE DATA:", movie);
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Using the slug is better for the URL (e.g., /movie/vishwanath-sons-1408162), fallback to ID[cite: 12]
    navigate(`/movie/${movie.slug || movie.id}`);
  };

  // 1. Safely extract genres from the array[cite: 12]
  const genreNames = movie.genres?.map(g => g.name).join(', ') || 'Unknown Genre';
  
  // 2. Format the "2026-08-14" date to look like "14 AUGUST"[cite: 12]
  const formattedDate = movie.releaseDate 
    ? new Date(movie.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }).toUpperCase()
    : '';

  return (
    <div className="movie-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="poster-container">
        <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
      </div>
      
      <div className="movie-info">
        <h3 className="card-title">{movie.title}</h3>
        
        {/* NEW: Using genreNames and runtimeMinutes[cite: 12] */}
        <p className="card-subtitle">
          {genreNames} · {movie.runtimeMinutes} Min
        </p>
        
        <div className="card-tags">
          {/* NEW: Using ageRating.code[cite: 12] */}
          <span className="tag age-tag">{movie.ageRating?.code}</span>
        </div>
        
        {!isComingSoon ? (
          <div className="card-footer">
            {/* NEW: Using fromPrice[cite: 12] */}
            <span className="price">From ₾{movie.fromPrice}</span>
            <button 
              className="btn-buy-card"
              onClick={(e) => {
                e.stopPropagation(); 
                handleCardClick();
              }}
            >
              Buy Ticket
            </button>
          </div>
        ) : (
          <div className="card-footer">
            {/* NEW: Using the formatted date */}
            <span className="release-date">{formattedDate}</span>
            <button 
              className="btn-notify"
              onClick={(e) => {
                e.stopPropagation(); 
                handleCardClick(); 
              }}
            >
              Notify Me
            </button>
          </div>
        )}
      </div>
    </div>
  );
}