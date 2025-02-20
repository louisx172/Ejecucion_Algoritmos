import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Algoritmos from './Algoritmos';
import About from './About';
import Prueba1 from './Prueba1';
import './App.css';

//==============================================================================================================

// Rutas de las apps
function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/algoritmos" element={<Algoritmos />} />
          <Route path="/about" element={<About />} />
          <Route path="/prueba1" element={<Prueba1 />} />
        </Routes>
    </Router>
  );
}

export default App;