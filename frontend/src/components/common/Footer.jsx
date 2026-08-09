// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToSection = (sectionId) => {
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
    <footer className="footer-dark">
      <div className="footer-container">
        {/* Column 1: Brand */}
        <div className="footer-column">
          <div className="footer-brand">
            <div className="footer-logo-icon">
              <i className="fas fa-plane-departure"></i>
            </div>
            <div className="footer-logo-text">
              <span className="footer-logo-main">SkyDummy</span>
              <span className="footer-logo-sub">Visa-Ready Tickets</span>
            </div>
          </div>
          <p className="footer-description">
            Generate verified flight itineraries for your visa applications instantly. 
            Trusted by travelers worldwide.
          </p>
 {/* In Footer.jsx - Update social links */}
<div className="footer-social">
  <a href="https://facebook.com/skydummy" className="social-link">
    <i className="fab fa-facebook-f"></i>
  </a>
  <a href="https://twitter.com/skydummy" className="social-link">
    <i className="fab fa-twitter"></i>
  </a>
  <a href="https://instagram.com/skydummy" className="social-link">
    <i className="fab fa-instagram"></i>
  </a>
  <a href="https://linkedin.com/company/skydummy" className="social-link">
    <i className="fab fa-linkedin-in"></i>
  </a>
</div>
        </div>

        {/* Column 2: Quick Navigation */}
        <div className="footer-column">
          <h3 className="footer-heading">Quick Navigation</h3>
          <ul className="footer-links">
            <li>
              <Link to="/" className="footer-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <i className="fas fa-home"></i> Home
              </Link>
            </li>
            <li>
              <Link to="/verify" className="footer-link">
                <i className="fas fa-check-double"></i> Verify PNR
              </Link>
            </li>
            <li>
              <button 
                className="footer-link-btn"
                onClick={() => scrollToSection('why-us')}
              >
                <i className="fas fa-question-circle"></i> Why Us
              </button>
            </li>
            <li>
              <button 
                className="footer-link-btn"
                onClick={() => scrollToSection('faqs')}
              >
                <i className="fas fa-comments"></i> FAQs
              </button>
            </li>
            <li>
              <button 
                className="footer-link-btn"
                onClick={() => scrollToSection('contact')}
              >
                <i className="fas fa-envelope"></i> Contact Us
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div className="footer-column">
          <h3 className="footer-heading">Contact Us</h3>
          <ul className="footer-contact">
            <li>
              <i className="fas fa-envelope"></i>
              <a href="mailto:support@skydummy.com">support@skydummy.com</a>
            </li>
            <li>
              <i className="fas fa-map-marker-alt"></i>
              <span>California, United States</span>
            </li>
            <li>
              <i className="fas fa-clock"></i>
              <span>24/7 Online Support</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Legal Links */}
        <div className="footer-column">
          <h3 className="footer-heading">Legal</h3>
          <ul className="footer-links">
            <li>
              <Link to="/privacy-policy" className="footer-link">
                <i className="fas fa-shield-alt"></i> Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-conditions" className="footer-link">
                <i className="fas fa-file-contract"></i> Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/refund-policy" className="footer-link">
                <i className="fas fa-undo-alt"></i> Refund Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <span className="footer-copyright">
            © {new Date().getFullYear()} SkyDummy. All rights reserved.
          </span>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-conditions">Terms of Service</Link>
            <Link to="/refund-policy">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;