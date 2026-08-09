// src/pages/HomePage.jsx
import React from 'react';
import Navbar from '../components/common/Navbar';
import BookingForm from '../components/booking/BookingForm';
import Footer from '../components/common/Footer';
import ContactForm from '../components/common/ContactForm';
import Testimonials from '../components/common/Testimonials';

const HomePage = () => {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section id="home" style={{ position: 'relative', zIndex: 10 }}>
        <header className="hero" style={{ 
          padding: '2.5rem 0 2rem 0', 
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          <div className="hero-content" style={{ position: 'relative', zIndex: 10 }}>
            <h1 style={{ 
              fontSize: '2.8rem', 
              fontWeight: 700, 
              color: '#0b2b40',
              letterSpacing: '-0.01em',
              marginBottom: '0.5rem',
              position: 'relative',
              zIndex: 10
            }}>
              <i className="fas fa-globe-americas" style={{ color: '#2a7de1', marginRight: '0.5rem' }}></i> 
              Visa-ready dummy tickets
            </h1>
            <p style={{ 
              fontSize: '1.15rem', 
              color: '#2c4c61',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
              position: 'relative',
              zIndex: 10
            }}>
              Generate a verified flight itinerary for your visa application in seconds.<br />
              Trusted by travelers worldwide. Instant download.
            </p>
            
            <div className="hero-features" style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2rem', 
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 10
            }}>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'rgba(42, 125, 225, 0.1)',
                padding: '0.5rem 1.2rem',
                borderRadius: '40px',
                fontSize: '0.9rem',
                color: '#0b2b40',
                border: '1px solid rgba(42, 125, 225, 0.1)',
                position: 'relative',
                zIndex: 10
              }}>
                <i className="fas fa-check-circle" style={{ color: '#2a7de1' }}></i> 100% Visa Approved
              </span>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'rgba(42, 125, 225, 0.1)',
                padding: '0.5rem 1.2rem',
                borderRadius: '40px',
                fontSize: '0.9rem',
                color: '#0b2b40',
                border: '1px solid rgba(42, 125, 225, 0.1)',
                position: 'relative',
                zIndex: 10
              }}>
                <i className="fas fa-check-circle" style={{ color: '#2a7de1' }}></i> Instant Download
              </span>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'rgba(42, 125, 225, 0.1)',
                padding: '0.5rem 1.2rem',
                borderRadius: '40px',
                fontSize: '0.9rem',
                color: '#0b2b40',
                border: '1px solid rgba(42, 125, 225, 0.1)',
                position: 'relative',
                zIndex: 10
              }}>
                <i className="fas fa-check-circle" style={{ color: '#2a7de1' }}></i> $10 One-Way / $12 Round Trip
              </span>
            </div>
          </div>
        </header>
        
        <div className="booking-card" style={{ position: 'relative', zIndex: 10 }}>
          <BookingForm />
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="section-why-us" style={{ 
        padding: '60px 20px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="section-container">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.2rem', 
            color: '#0b2b40', 
            marginBottom: '40px',
            fontWeight: 700,
            position: 'relative',
            zIndex: 10
          }}>
            <i className="fas fa-question-circle" style={{ color: '#2a7de1', marginRight: '10px' }}></i> 
            Why Choose SkyDummy?
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-check-circle"></i>
              <h3>100% Visa Approved</h3>
              <p>Our dummy tickets are accepted by embassies worldwide for visa applications.</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-bolt"></i>
              <h3>Instant Generation</h3>
              <p>Get your dummy ticket in seconds, not hours or days.</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-shield-alt"></i>
              <h3>Secure & Private</h3>
              <p>Your data is encrypted and never shared with third parties.</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-dollar-sign"></i>
              <h3>Affordable Pricing</h3>
              <p>Only $10 for one-way and $12 for round trip tickets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQs Section */}
      <section id="faqs" className="section-faqs" style={{ 
        padding: '60px 20px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="section-container">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.2rem', 
            color: '#0b2b40', 
            marginBottom: '40px',
            fontWeight: 700,
            position: 'relative',
            zIndex: 10
          }}>
            <i className="fas fa-comments" style={{ color: '#2a7de1', marginRight: '10px' }}></i> 
            Frequently Asked Questions
          </h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>What is a dummy ticket?</h3>
              <p>A dummy ticket is a flight itinerary used for visa applications. It shows your travel plans without actual booking.</p>
            </div>
            <div className="faq-item">
              <h3>Is this ticket valid for visa applications?</h3>
              <p>Yes! Our tickets are formatted to meet embassy requirements and are accepted worldwide.</p>
            </div>
            <div className="faq-item">
              <h3>How fast do I get my ticket?</h3>
              <p>Instantly! Once you complete the form, your ticket is generated and ready for download immediately.</p>
            </div>
            <div className="faq-item">
              <h3>Can I use this for actual travel?</h3>
              <p>No, this is a dummy ticket for visa application purposes only. No actual flight is booked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="section-contact" style={{ 
        padding: '60px 20px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="section-container">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.2rem', 
            color: '#0b2b40', 
            marginBottom: '40px',
            fontWeight: 700,
            position: 'relative',
            zIndex: 10
          }}>
            <i className="fas fa-envelope" style={{ color: '#2a7de1', marginRight: '10px' }}></i> 
            Contact Us
          </h2>
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h4>Email</h4>
                  <a href="mailto:support@skydummy.com">support@skydummy.com</a>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-globe"></i>
                <div>
                  <h4>Website</h4>
                  <a href="https://www.skydummy.com">www.skydummy.com</a>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h4>Support Hours</h4>
                  <p>24/7 Online Support</p>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <h3>Send us a message</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default HomePage;