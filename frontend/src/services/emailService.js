// src/services/emailService.js
import emailjs from '@emailjs/browser';

// ============================================
// EMAILJS CONFIGURATION
// ============================================

const EMAILJS_API_KEY = import.meta.env.VITE_EMAILJS_API_KEY || '';
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_APPRECIATION_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_APPRECIATION_TEMPLATE_ID || '';

const COMPANY_EMAIL = import.meta.env.VITE_RECIPIENT_EMAIL || 'support@skydummy.com';
const COMPANY_NAME = 'SkyDummy';

// Fixed promo code for all customers
const PROMO_CODE = 'SKY10';
const DISCOUNT_PERCENTAGE = 10;
const VALID_DAYS = 365;

// Initialize EmailJS
if (EMAILJS_API_KEY) {
  emailjs.init(EMAILJS_API_KEY);
  console.log('✅ EmailJS initialized');
}

/**
 * Send appreciation email with promo code only
 */
export const sendAppreciationEmail = async ({ toEmail, passengerName, ticketData }) => {
  try {
    // Validate email
    const cleanEmail = toEmail?.trim();
    if (!cleanEmail) {
      throw new Error('Email address is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address');
    }

    // Check if template ID is set
    if (!EMAILJS_APPRECIATION_TEMPLATE_ID || EMAILJS_APPRECIATION_TEMPLATE_ID === 'template_xxxxxxxxxxx') {
      console.warn('⚠️ Appreciation template not configured');
      // Return success to not break the UI
      return { 
        success: true, 
        message: 'Appreciation email not configured',
        promoCode: PROMO_CODE 
      };
    }

    console.log('📧 Sending appreciation email to:', cleanEmail);
    console.log('🎁 Promo code:', PROMO_CODE);

    const templateParams = {
      to_email: cleanEmail,
      to_name: passengerName,
      from_name: COMPANY_NAME,
      from_email: COMPANY_EMAIL,
      booking_reference: ticketData.bookingReference,
      passenger_name: `${ticketData.firstName} ${ticketData.lastName}`,
      departure: ticketData.departure,
      destination: ticketData.destination,
      depart_date: new Date(ticketData.departDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      promo_code: PROMO_CODE,
      discount_percentage: DISCOUNT_PERCENTAGE,
      valid_days: VALID_DAYS,
      company_email: COMPANY_EMAIL,
      year: new Date().getFullYear()
    };

    console.log('📝 Template params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_APPRECIATION_TEMPLATE_ID,
      templateParams
    );
    
    console.log('✅ Appreciation email sent successfully with promo code:', PROMO_CODE);
    return { 
      success: true, 
      response, 
      promoCode: PROMO_CODE 
    };
    
  } catch (error) {
    console.error('❌ Error sending appreciation email:', error);
    if (error.text) {
      console.error('Error text:', error.text);
    }
    throw error;
  }
};

/**
 * Send automated flight ticket PDF email directly via Backend Express Route
 */
export const sendAutomatedPDFEmail = async (ticketData, pdfBase64 = null) => {
  try {
    if (!ticketData || !ticketData.email) {
      console.warn('⚠️ Cannot send ticket email: Customer email is missing');
      return { success: false, message: 'Missing customer email' };
    }

    console.log('🚀 Dispatching automated ticket PDF email to:', ticketData.email);

    const response = await fetch('/api/email/send-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketData,
        pdfBase64
      })
    });

    const data = await response.json();
    console.log('📧 Backend email dispatch response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending automated PDF email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Main function to send appreciation email (simplified)
 */
export const sendTicketEmail = async ({ toEmail, passengerName, ticketData }) => {
  // Just send the appreciation email with promo code
  return sendAppreciationEmail({ toEmail, passengerName, ticketData });
};