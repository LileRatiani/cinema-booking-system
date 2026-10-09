import './MovieCard.css';
import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie, isComingSoon }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigates to /movie/1, /movie/2, etc. (defaults to 1 if missing)
    navigate(`/movie/${movie.id || 1}`);
  };

  return (
    <div className="movie-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="poster-container">
        <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
      </div>
      
      <div className="movie-info">
        <h3 className="card-title">{movie.title}</h3>
        <p className="card-subtitle">{movie.genre} • {movie.duration}</p>
        
        <div className="card-tags">
          <span className="tag age-tag">{movie.age}</span>
        </div>
        
        {!isComingSoon ? (
          <div className="card-footer">
            <span className="price">From ₾{movie.price}</span>
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
            <span className="release-date">{movie.releaseDate}</span>
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