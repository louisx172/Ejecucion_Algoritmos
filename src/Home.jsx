import { useState } from 'react'
import { Link } from 'react-router-dom';
import './App.css'

 //==============================================================================================================

function Home() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

 //==============================================================================================================

  return (
    <div className="Home">
      <header>
        <h1>Principal</h1>
        <nav>
            <button>Botón 1</button>

            <Link to="/algoritmos">
                <button>Botón 2</button>
            </Link>

            <Link to="/prueba1">
                <button>Prueba</button>
            </Link>

          <button>Botón 3</button>
          <button>Botón 4</button>
          <div className="dropdown">
            <button onClick={toggleDropdown}>Menú</button>
            {dropdownOpen && (
              <ul className="dropdown-menu">
                <li>Opción 1</li>
                <li>Opción 2</li>
                <li>Opción 3</li>
              </ul>
            )}
          </div>
        </nav>
      </header>
    </div>
  );
}

export default Home;