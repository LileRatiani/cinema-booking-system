import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Sessions from "./pages/Sessions/Sessions";
import MovieDetails from './pages/MovieDetails/MovieDetails';
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/profile" element={<Profile />} />
          
        </Routes>

        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
