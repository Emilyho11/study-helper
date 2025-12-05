import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './pages/About';

function App() {

  return (
      <BrowserRouter>
        <div className='min-h-screen flex flex-col'>
          <Navbar />
          <div className='grow bg-white'>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
  )
}

export default App
