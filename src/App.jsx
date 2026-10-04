import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        {/* Navigation Bar will go here later */}
        
        <Routes>
          <Route path="/" element={<div><h1>Home Page</h1></div>} />
          <Route path="/sessions" element={<div><h1>Sessions Page</h1></div>} />
          <Route path="/movie/:id" element={<div><h1>Movie Details</h1></div>} />
          <Route path="/profile" element={<div><h1>Profile Page</h1></div>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;