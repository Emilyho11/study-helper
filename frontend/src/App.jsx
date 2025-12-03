import { HashRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {

  return (
      <HashRouter>
        <div className='min-h-screen flex flex-col'>
          <Navbar />
          <div className='flex-grow bg-white'>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </HashRouter>
  )
}

export default App
