import './MovieCard.css';

export default function MovieCard({ movie, isComingSoon }) {
  return (
    <div className="movie-card">
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
            <button className="btn-buy-card">Buy Ticket</button>
          </div>
        ) : (
          <div className="card-footer">
            <span className="release-date">{movie.releaseDate}</span>
            <button className="btn-notify">Notify Me</button>
          </div>
        )}
      </div>
    </div>
  );
}