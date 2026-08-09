// src/components/common/ContactInfo.jsx
import React from 'react';

const ContactInfo = () => {
  return (
    <div className="contact-info">
      <h3>Contact Us</h3>
      <div className="contact-details">
        <div className="contact-item">
          <i className="fas fa-envelope"></i>
          <a href="mailto:support@skydummy.com">support@skydummy.com</a>
        </div>
        <div className="contact-item">
          <i className="fas fa-globe"></i>
          <a href="https://www.skydummy.com">www.skydummy.com</a>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;