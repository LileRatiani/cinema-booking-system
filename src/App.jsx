import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import { fetchFilterOptions } from './api';
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Sessions from "./pages/Sessions/Sessions";
import MovieDetails from './pages/MovieDetails/MovieDetails';
import "./App.css";

function App() {
  // State to hold the global API rules
  const [filterOptions, setFilterOptions] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      const options = await fetchFilterOptions();
      console.log("SUCCESS! Loaded API Options:", options);
      setFilterOptions(options.data);
    };

    initApp();
  }, []); // Empty dependency array ensures this runs exactly once at boot

  return (
    <div className="app-container">
      <BrowserRouter>
        <Navbar filterOptions={filterOptions} />

        <Routes>
          <Route path="/" element={<Home filterOptions={filterOptions} />} />
          <Route path="/sessions" element={<Sessions filterOptions={filterOptions} />} />
          <Route path="/movie/:id" element={<MovieDetails filterOptions={filterOptions} />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;