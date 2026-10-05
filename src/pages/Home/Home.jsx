import Hero from '../../components/Hero/Hero';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      <Hero />
      {/* Recently Viewed, Now Playing, and Coming Soon will go here later */}
    </div>
  );
}