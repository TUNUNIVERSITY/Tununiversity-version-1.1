import React, { useState } from 'react';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <div className="logo-box"></div>
          <span className="logo-text">TUNUNIVERSITY</span>
        </div>
        
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
         
          <a href="#programs">Programs</a>
          <a href="#features">Instructors</a>
          <a href="#about">Community</a>
        
        </nav>

        <div className="header-buttons">
          <button className="btn-login" onClick={() => window.location.href = 'http://localhost:3001/login'}>
            Log in
          </button>
         
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
}

export default Header;
