// src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    closeMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 70;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight - 20;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="navbar" id="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <div className="logo-icon">
            <i className="fas fa-plane-departure"></i>
          </div>
          <div className="logo-text">
            <span className="logo-main">SkyDummy</span>
            <span className="logo-sub">Visa-Ready Tickets</span>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button className="nav-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>

          <Link to="/verify" className="nav-link verify-highlight-link" onClick={closeMenu}>
            <i className="fas fa-check-double"></i>
            <span>Verify PNR</span>
          </Link>
          
          <button 
            className="nav-link"
            onClick={() => scrollToSection('why-us')}
          >
            <i className="fas fa-question-circle"></i>
            <span>Why Us</span>
          </button>

          <button 
            className="nav-link"
            onClick={() => scrollToSection('testimonials')}
          >
            <i className="fas fa-star"></i>
            <span>Testimonials</span>
          </button>
          
          <button 
            className="nav-link"
            onClick={() => scrollToSection('faqs')}
          >
            <i className="fas fa-comments"></i>
            <span>FAQs</span>
          </button>
          
          <button 
            className="nav-link"
            onClick={() => scrollToSection('contact')}
          >
            <i className="fas fa-envelope"></i>
            <span>Contact Us</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;