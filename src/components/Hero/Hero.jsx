import { useState, useEffect } from 'react';
import './Hero.css';

export default function Hero({ movies = [] }) {
  
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play animation: switch slides every 5 seconds
  useEffect(() => {
    if (movies.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex, movies.length]);

  if (!movies || movies.length === 0) {
    return null; // Don't render the hero if data hasn't loaded yet
  }

  // Manual navigation handlers
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % movies.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);

  const activeMovie = movies[currentIndex];

  // Format the date for the "PREMIERE - WEEK OF X" text
  const formattedDate = activeMovie.releaseDate 
    ? new Date(activeMovie.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()
    : '';
  const premiereText = formattedDate ? `PREMIERE - WEEK OF ${formattedDate}` : "NOW PLAYING";

  return (
    <section className="hero">
      {/* Background Image Wrapper for smooth fading */}
      <div 
        key={activeMovie.id} 
        className="hero-background fade-in"
        /* The API uses backdropUrl for the wide hero images, fallback to posterUrl if missing */
        style={{ backgroundImage: `url("${activeMovie.backdropUrl || activeMovie.posterUrl}")` }}
      ></div>

      <div className="hero-overlay">
        {/* Content Wrapper */}
        <div key={`content-${activeMovie.id}`} className="hero-content fade-in">
          <p className="hero-premiere">{premiereText}</p>
          <h1 className="hero-title">{activeMovie.title}</h1>
          
          <div className="hero-tags">
            <span className="tag age-tag">{activeMovie.ageRating?.code}</span>
            <span className="tag duration-tag">⏱ {activeMovie.runtimeMinutes} Min</span>
            {/* Formats from the API are likely objects, so we safely try to grab the name or code */}
            {activeMovie.formats?.map((format, idx) => (
              <span key={idx} className="tag format-tag">{format.name || format.code || format}</span>
            ))}
          </div>
          
          {/* The API uses synopsis instead of description */}
          <p className="hero-description">{activeMovie.synopsis}</p>
          
          <div className="hero-actions">
            <button className="btn-buy">
              <span className="ticket-icon">🎟</span> Buy tickets
            </button>
            <button className="btn-sessions">All sessions</button>
          </div>
        </div>

        <div className="hero-slider-controls">
          <div className="progress-bars">
            {movies.map((_, index) => (
              <div 
                key={index} 
                className="progress-bar"
                onClick={() => setCurrentIndex(index)}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className={`progress-fill ${index === currentIndex ? 'active-fill' : ''}`}
                ></div>
              </div>
            ))}
          </div>
          <div className="slider-arrows">
            <button className="arrow-btn" onClick={handlePrev}>{'<'}</button>
            <button className="arrow-btn" onClick={handleNext}>{'>'}</button>
          </div>
        </div>
      </div>
    </section>
  );
}