import { useState, useEffect } from 'react';
import { fetchFeaturedMovies, fetchNowPlayingMovies, fetchComingSoonMovies } from '../../api';
import Hero from '../../components/Hero/Hero';
import MovieCard from '../../components/MovieCard/MovieCard';
import './Home.css';
import HorizontalMovieCard from '../../components/HorizontalMovieCard/HorizontalMovieCard';

export default function Home({ filterOptions }) {
  const [isAuthorized, setIsAuthorized] = useState(true);
  
  // 1. Setup state for our three API endpoints
  const [featured, setFeatured] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fetch all data simultaneously when the page loads
  useEffect(() => {
    const loadHomepageData = async () => {
      const [featuredData, nowPlayingData, comingSoonData] = await Promise.all([
        fetchFeaturedMovies(),
        fetchNowPlayingMovies(),
        fetchComingSoonMovies()
      ]);
      
      setFeatured(featuredData || []);
      setNowPlaying(nowPlayingData || []);
      setComingSoon(comingSoonData || []);
      setIsLoading(false);
    };

    loadHomepageData();
  }, []);

  if (isLoading) {
    return <div className="home-page" style={{ color: 'white', padding: '100px', textAlign: 'center' }}>Loading movies...</div>;
  }

  return (
    <div className="home-page">
      {/* Pass the featured movies to the Hero so it can render the carousel */}
      <Hero movies={featured} />
      
      <div className="home-content">
        
        {/* Recently Viewed Placeholder - Reusing the first 2 now playing movies for now */}
        {isAuthorized && nowPlaying.length > 0 && (
          <section className="movie-section">
            <div className="section-header">
              <h2>Recently viewed</h2>
            </div>
            <div className="movie-list">
              {nowPlaying.slice(0, 2).map(movie => (
                <HorizontalMovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Now Playing Section */}
        <section className="movie-section">
          <div className="section-header">
            <h2>NOW PLAYING</h2>
            <a href="/sessions" className="see-all">See all</a>
          </div>
          <div className="movie-list">
            {nowPlaying.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="movie-section">
          <div className="section-header">
            <h2>COMING SOON...</h2>
            <a href="/sessions" className="see-all">See all</a>
          </div>
          <div className="movie-list">
            {comingSoon.map(movie => (
              <HorizontalMovieCard key={movie.id} movie={movie} isComingSoon={true} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
