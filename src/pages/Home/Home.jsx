import { useState } from 'react';
import Hero from '../../components/Hero/Hero';
import MovieCard from '../../components/MovieCard/MovieCard';
import './Home.css';
import HorizontalMovieCard from '../../components/HorizontalMovieCard/HorizontalMovieCard';

// Mock data for the lists
const nowPlayingMovies = [
  { id: 1, title: "The Odyssey", genre: "Drama", duration: "134 Min", age: "12+", price: "14", posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&auto=format&fit=crop" },
  { id: 2, title: "Spider-Man", genre: "Action", duration: "148 Min", age: "12+", price: "14", posterUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=400&auto=format&fit=crop" },
  { id: 3, title: "Dune: Part Three", genre: "Sci-Fi", duration: "156 Min", age: "16+", price: "14", posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop" },
  { id: 4, title: "Avengers: Doomsday", genre: "Action", duration: "142 Min", age: "12+", price: "14", posterUrl: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?q=80&w=400&auto=format&fit=crop" },
  { id: 5, title: "Joker", genre: "Thriller", duration: "122 Min", age: "18+", price: "14", posterUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=400&auto=format&fit=crop" }
];

const comingSoonMovies = [
  { id: 6, title: "The Cartographer's Wife", genre: "Drama", duration: "124 Min", age: "16+", releaseDate: "15 OCTOBER", posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&auto=format&fit=crop" },
  { id: 7, title: "Moonlight", genre: "Drama", duration: "111 Min", age: "16+", releaseDate: "22 OCTOBER", posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop" }
];

export default function Home() {
    const [isAuthorized, setIsAuthorized] = useState(true);
  return (
    <div className="home-page">
      <Hero />
      
      <div className="home-content">
        
        {/* Recently Viewed Placeholder - The design shows these are smaller horizontal cards */}
        {isAuthorized && (
          <section className="movie-section">
            <div className="section-header">
              <h2>Recently viewed</h2>
            </div>
            <div className="movie-list">
              {nowPlayingMovies.slice(0, 2).map(movie => (
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
            {nowPlayingMovies.map(movie => (
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
            {comingSoonMovies.map(movie => (
              <HorizontalMovieCard key={movie.id} movie={movie} isComingSoon={true} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}