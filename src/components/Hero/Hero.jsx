import { useState, useEffect } from 'react';
import './Hero.css';


// Mock data for the 4 featured movies
const featuredMovies = [
  {
    id: 1,
    title: "THE ODYSSEY",
    premiere: "PREMIERE - WEEK OF 15 SEPT",
    age: "12+",
    duration: "134 Min",
    formats: ["MAX", "PANORAMA"],
    description: "A king spends ten years finding his way home from a war he already won, while monsters, gods, and his own restlessness make sure the return takes longer than the fighting did. By the time land comes back into view, the man arriving is not quite the one who left.",
    bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "DUNE: PART THREE",
    premiere: "PREMIERE - WEEK OF 22 SEPT",
    age: "16+",
    duration: "156 Min",
    formats: ["IMAX", "3D"],
    description: "The epic continuation of the saga. As the war for Arrakis escalates across the galaxy, new alliances are formed and old betrayals come to light. The fate of the universe hangs by a thread in the harsh desert sands.",
    bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "AVENGERS: DOOMSDAY",
    premiere: "PREMIERE - WEEK OF 29 SEPT",
    age: "12+",
    duration: "142 Min",
    formats: ["MAX", "PANORAMA"],
    description: "Earth's mightiest heroes must reunite to face a threat that spans across the multiverse. With realities colliding, the ultimate sacrifice might be the only way to restore balance to existence itself.",
    bgImage: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?q=80&w=1920&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "JOKER: FOLIE À DEUX",
    premiere: "PREMIERE - WEEK OF 5 OCT",
    age: "18+",
    duration: "138 Min",
    formats: ["STANDARD"],
    description: "A musical psychological thriller that delves deeper into the mind of Arthur Fleck. Institutionalized at Arkham State Hospital, he finds a twisted romance and a shared delusion that will burn Gotham to the ground.",
    bgImage: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1920&auto=format&fit=crop"
  }
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play animation: switch slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredMovies.length);
    }, 5000);

    return () => clearInterval(timer); // Cleanup timer if component unmounts or user clicks
  }, [currentIndex]); // Restarts timer when slide changes

  // Manual navigation handlers
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);

  const activeMovie = featuredMovies[currentIndex];

  return (
    <section className="hero">
      {/* Background Image Wrapper for smooth fading */}
      <div 
        key={activeMovie.id} // The key forces React to trigger the fade-in animation
        className="hero-background fade-in"
        style={{ backgroundImage: `url(${activeMovie.bgImage})` }}
      ></div>

      <div className="hero-overlay">
        {/* Content Wrapper */}
        <div key={`content-${activeMovie.id}`} className="hero-content fade-in">
          <p className="hero-premiere">{activeMovie.premiere}</p>
          <h1 className="hero-title">{activeMovie.title}</h1>
          
          <div className="hero-tags">
            <span className="tag age-tag">{activeMovie.age}</span>
            <span className="tag duration-tag">⏱ {activeMovie.duration}</span>
            {activeMovie.formats.map(format => (
              <span key={format} className="tag format-tag">{format}</span>
            ))}
          </div>
          
          <p className="hero-description">{activeMovie.description}</p>
          
          <div className="hero-actions">
            <button className="btn-buy">
              <span className="ticket-icon">🎟</span> Buy tickets
            </button>
            <button className="btn-sessions">All sessions</button>
          </div>
        </div>

        <div className="hero-slider-controls">
          <div className="progress-bars">
            {featuredMovies.map((_, index) => (
              <div 
                key={index} 
                className="progress-bar"
                onClick={() => setCurrentIndex(index)} // Allow clicking bars to change slides
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