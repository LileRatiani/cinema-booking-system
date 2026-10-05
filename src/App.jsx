import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<div style={{ paddingTop: '80px', paddingLeft: '60px' }}><h1>Home Page</h1></div>} />
          <Route path="/sessions" element={<div><h1>Sessions Page</h1></div>} />
          <Route path="/movie/:id" element={<div><h1>Movie Details</h1></div>} />
          <Route path="/profile" element={<div><h1>Profile Page</h1></div>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;