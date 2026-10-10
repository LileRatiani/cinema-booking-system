import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import { fetchFilterOptions, fetchCurrentUser, logoutUser } from './api';
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
  
  // Auth states
  const [currentUser, setCurrentUser] = useState(null);
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      setIsAppLoading(true);

      // 1. Fetch Global Options
      // 1. Fetch Global Options
      try {
        const options = await fetchFilterOptions();
        
        // This logs exactly what the backend returned so you can see it in F12 -> Console
        console.log("RAW API RESPONSE:", options);

        // Safely extract the inner data object regardless of how deeply nested it is
        const extractedData = options?.data?.data || options?.data || options;
        setFilterOptions(extractedData); 
        
      } catch (err) {
        console.error("Failed to load filter options", err);
      }

      // 2. Restore User Session (GET /me)
      const token = localStorage.getItem('token');
      if (token) {
        const { status, data } = await fetchCurrentUser();
        
        if (status === 200 && data?.data) {
          // Token is valid, restore the user profile
          setCurrentUser(data.data);
        } else if (status === 401) {
          // Token is stale or expired, drop it
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      }

      setIsAppLoading(false);
    };

    initApp();
  }, []); // Empty dependency array ensures this runs exactly once at boot

  // Centralized logout handler
  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  if (isAppLoading) {
    return <div className="loading-screen">Loading Kino XII...</div>; 
  }

  return (
    <div className="app-container">
      <BrowserRouter>
        {/* Pass the auth state and logout handler down to the Navbar */}
        <Navbar 
          filterOptions={filterOptions} 
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <Routes>
          <Route path="/" element={<Home filterOptions={filterOptions} />} />
          <Route path="/sessions" element={<Sessions filterOptions={filterOptions} />} />
          <Route path="/movie/:id" element={<MovieDetails filterOptions={filterOptions} />} />
          
          {/* Profile will likely need the currentUser data to know what to display/edit */}
          <Route 
  path="/profile" 
  element={
    <Profile 
      currentUser={currentUser} 
      onProfileUpdate={(updatedUser) => setCurrentUser(updatedUser)} 
    />
  } 
/>
        </Routes>

        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;