import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<div style={{ paddingTop: '80px', paddingLeft: '60px', color: 'white', minHeight: '80vh' }}><h1>Sessions Page</h1></div>} />
          <Route path="/movie/:id" element={<div style={{ paddingTop: '80px', paddingLeft: '60px', color: 'white', minHeight: '80vh' }}><h1>Movie Details</h1></div>} />
          <Route path="/profile" element={<div style={{ paddingTop: '80px', paddingLeft: '60px', color: 'white', minHeight: '80vh' }}><h1>Profile Page</h1></div>} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;