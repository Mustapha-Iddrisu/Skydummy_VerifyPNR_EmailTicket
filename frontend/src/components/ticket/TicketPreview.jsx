// src/components/ticket/TicketPreview.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useBookingStore from '../../store/bookingStore';
import { generateTicketPDF, generatePrintHTML } from '../../services/pdfService';
import { sendAppreciationEmail, sendAutomatedPDFEmail } from '../../services/emailService';

const TicketPreview = ({ ticketData: customTicketData }) => {
  const navigate = useNavigate();
  const { ticketData: storeTicketData, resetForm } = useBookingStore();
  const ticketData = customTicketData || storeTicketData;
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ status: 'idle', message: '' });
  const hasSentRef = useRef(false);

  // Automatically send PDF Email to customer right after loading the ticket page
  useEffect(() => {
    if (!ticketData || !ticketData.email || hasSentRef.current) return;

    const autoSendEmail = async () => {
      hasSentRef.current = true;
      setEmailStatus({ status: 'sending', message: `Sending PDF ticket to ${ticketData.email}...` });

      try {
        // Generate PDF base64 without triggering browser file download
        const doc = generateTicketPDF(ticketData, false);
        const pdfBase64 = doc.output('datauristring');

        const result = await sendAutomatedPDFEmail(ticketData, pdfBase64);

        if (result.success) {
          setEmailStatus({
            status: 'sent',
            message: `PDF ticket and itinerary emailed automatically to ${ticketData.email}`
          });
        } else {
          setEmailStatus({
            status: 'failed',
            message: result.message || `Could not send email to ${ticketData.email}`
          });
        }
      } catch (err) {
        console.error('Error in automated PDF email send:', err);
        setEmailStatus({
          status: 'failed',
          message: 'Automated email dispatch failed'
        });
      }
    };

    autoSendEmail();
  }, [ticketData]);

  if (!ticketData) {
    if (!customTicketData) {
      navigate('/');
    }
    return null;
  }

  const handleDownload = () => {
    try {
      generateTicketPDF(ticketData, true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    try {
      const printHTML = generatePrintHTML(ticketData);
      
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Please allow popups to print the ticket.');
        return;
      }
      
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    } catch (error) {
      console.error('Error printing:', error);
      alert('There was an error printing the ticket. Please try downloading instead.');
    }
  };

  // Email handler - sends appreciation email with promo code
  const handleSendEmail = async () => {
    if (!ticketData.email) {
      alert('❌ No email address found for this ticket.');
      return;
    }

    try {
      setIsSending(true);
      console.log('📧 Sending appreciation email to:', ticketData.email);
      
      const result = await sendAppreciationEmail({
        toEmail: ticketData.email,
        passengerName: `${ticketData.firstName} ${ticketData.lastName}`,
        ticketData: ticketData
      });
      
      if (result.success) {
        alert(`✅ Email sent! Use code ${result.promoCode} for 10% off your next booking.`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('❌ Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleResendPDFEmail = async () => {
    if (!ticketData.email) {
      alert('❌ Customer email address is missing.');
      return;
    }
    try {
      setIsSending(true);
      setEmailStatus({ status: 'sending', message: `Resending PDF ticket to ${ticketData.email}...` });
      const doc = generateTicketPDF(ticketData, false);
      const pdfBase64 = doc.output('datauristring');
      const result = await sendAutomatedPDFEmail(ticketData, pdfBase64);
      if (result.success) {
        setEmailStatus({ status: 'sent', message: `PDF ticket re-sent to ${ticketData.email}` });
      } else {
        setEmailStatus({ status: 'failed', message: result.message || 'Failed to resend email' });
      }
    } catch (err) {
      console.error('Error resending email:', err);
      setEmailStatus({ status: 'failed', message: 'Error resending email' });
    } finally {
      setIsSending(false);
    }
  };

  const handleNewBooking = () => {
    resetForm();
    navigate('/');
  };

  const flightDetails = ticketData.flightDetails;
  const depFlight = flightDetails?.departure;
  const retFlight = flightDetails?.return;

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getTransitText = (flight) => {
    if (!flight) return '';
    if (flight.stops > 0 && flight.stopoverDetails) {
      const hrs = Math.floor(flight.stopoverDetails.duration / 60);
      const mins = flight.stopoverDetails.duration % 60;
      const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
      return `Transit Stop: ${flight.stopoverDetails.city}, ${flight.stopoverDetails.country} (${flight.stopoverDetails.airport}) — Layover: ${durationStr}`;
    }
    return `Transit: Direct Non-stop flight from ${flight.departure?.city || flight.departure?.airport} to ${flight.arrival?.city || flight.arrival?.airport}`;
  };

  const renderFlightBox = (flight, isReturn = false) => {
    if (!flight) return null;
    const isConnecting = flight.stops > 0 && flight.stopoverDetails;
    const transit = flight.stopoverDetails;
    const depTime = formatTime(flight.departure?.time);
    const arrTime = formatTime(flight.arrival?.time);

    let layoverStr = '';
    if (transit) {
      const hrs = Math.floor(transit.duration / 60);
      const mins = transit.duration % 60;
      layoverStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    }

    return (
      <div className="ticket-flight-box">
        <div className="flight-box-top">
          <span className="airline-tag">{flight.airline.name} ({flight.airline.code})</span>
          <span className="flight-num"><i className="fas fa-ticket-alt"></i> {flight.flightNumber}</span>
          <span className="class-tag"><i className="fas fa-chair"></i> {flight.bookingClass}</span>
        </div>

        {isConnecting ? (
          <div className="multi-leg-container">
            {/* Leg 1: Departure -> Transit */}
            <div className="leg-segment">
              <div className="leg-badge-title">
                <i className="fas fa-plane-departure"></i> 1. Departure → Transit
              </div>
              <div className="flight-box-route">
                <div className="route-city-block">
                  <span className="city-code">{flight.departure.airport}</span>
                  <span className="city-name">{flight.departure.city}, {flight.departure.country}</span>
                  <span className="flight-time">{depTime}</span>
                </div>

                <div className="route-path-middle">
                  <span className="duration-text">Leg 1</span>
                  <div className="line-with-plane">
                    <span className="dot"></span>
                    <span className="dash"></span>
                    <i className="fas fa-plane"></i>
                    <span className="dash"></span>
                    <span className="dot"></span>
                  </div>
                </div>

                <div className="route-city-block right">
                  <span className="city-code">{transit.airport}</span>
                  <span className="city-name">{transit.city}, {transit.country}</span>
                  <span className="transit-label-pill"><i className="fas fa-exchange-alt"></i> Transit Stop</span>
                </div>
              </div>
            </div>

            {/* Layover Indicator */}
            <div className="transit-layover-bar">
              <i className="fas fa-clock"></i> Layover at {transit.city} ({transit.airport}): <strong>{layoverStr}</strong>
            </div>

            {/* Leg 2: Transit -> Arrival */}
            <div className="leg-segment">
              <div className="leg-badge-title">
                <i className="fas fa-plane-arrival"></i> 2. Transit → Arrival
              </div>
              <div className="flight-box-route">
                <div className="route-city-block">
                  <span className="city-code">{transit.airport}</span>
                  <span className="city-name">{transit.city}, {transit.country}</span>
                  <span className="transit-label-pill"><i className="fas fa-exchange-alt"></i> Transit Point</span>
                </div>

                <div className="route-path-middle">
                  <span className="duration-text">Leg 2</span>
                  <div className="line-with-plane">
                    <span className="dot"></span>
                    <span className="dash"></span>
                    <i className="fas fa-plane"></i>
                    <span className="dash"></span>
                    <span className="dot"></span>
                  </div>
                </div>

                <div className="route-city-block right">
                  <span className="city-code">{flight.arrival.airport}</span>
                  <span className="city-name">{flight.arrival.city}, {flight.arrival.country}</span>
                  <span className="flight-time">{arrTime}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Direct Flight */
          <div className="flight-box-route">
            <div className="route-city-block">
              <span className="city-code">{flight.departure.airport}</span>
              <span className="city-name">{flight.departure.city}, {flight.departure.country}</span>
              <span className="flight-time">{depTime}</span>
            </div>

            <div className="route-path-middle">
              <span className="duration-text">{flight.durationFormatted}</span>
              <div className="line-with-plane">
                <span className="dot"></span>
                <span className="dash"></span>
                <i className={`fas fa-plane ${isReturn ? 'reverse' : ''}`}></i>
                <span className="dash"></span>
                <span className="dot"></span>
              </div>
              <span className="badge-stops direct">Direct Non-stop</span>
            </div>

            <div className="route-city-block right">
              <span className="city-code">{flight.arrival.airport}</span>
              <span className="city-name">{flight.arrival.city}, {flight.arrival.country}</span>
              <span className="flight-time">{arrTime}</span>
            </div>
          </div>
        )}

        <div className="flight-box-meta">
          <span><strong>Aircraft:</strong> {flight.aircraft}</span>
          <span><strong>Terminal:</strong> {flight.departure?.terminal || '1'}</span>
          <span><strong>Gate:</strong> {flight.departure?.gate || 'A1'}</span>
          <span><strong>Seat:</strong> {flight.seat || 'Assigned at Check-in'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="ticket-preview" id="ticket-preview">
      <div className="ticket-header">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h2>Ticket Generated Successfully!</h2>
        <p>Your flight ticket generated using your selected route is ready for download or print</p>
      </div>

      {/* Automated Email Status Notification Banner */}
      {emailStatus.status !== 'idle' && (
        <div style={{
          margin: '0 auto 20px auto',
          maxWidth: '700px',
          padding: '12px 18px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: '500',
          backgroundColor: emailStatus.status === 'sending' ? '#f0f9ff' : emailStatus.status === 'sent' ? '#f0fdf4' : '#fff1f2',
          border: `1px solid ${emailStatus.status === 'sending' ? '#bae6fd' : emailStatus.status === 'sent' ? '#bbf7d0' : '#fecdd3'}`,
          color: emailStatus.status === 'sending' ? '#0369a1' : emailStatus.status === 'sent' ? '#15803d' : '#be123c'
        }}>
          <i className={`fas ${emailStatus.status === 'sending' ? 'fa-spinner fa-spin' : emailStatus.status === 'sent' ? 'fa-envelope-open-text' : 'fa-exclamation-triangle'}`} style={{ fontSize: '18px' }}></i>
          <span style={{ flex: 1 }}>{emailStatus.message}</span>
          {emailStatus.status !== 'sending' && (
            <button 
              onClick={handleResendPDFEmail}
              disabled={isSending}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                backgroundColor: 'white',
                border: '1px solid currentColor',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {isSending ? 'Sending...' : 'Resend PDF Email'}
            </button>
          )}
        </div>
      )}
      
      <div className="ticket-card">
        {/* Reservation Header */}
        <div className="ticket-row">
          <div className="ticket-field">
            <label>Booking Reference</label>
            <span className="ticket-value">{ticketData.bookingReference}</span>
          </div>
          <div className="ticket-field">
            <label>Ticket Number</label>
            <span className="ticket-value">{ticketData.ticketNumber}</span>
          </div>
        </div>
        
        <div className="ticket-row">
          <div className="ticket-field">
            <label>Passenger Name</label>
            <span className="ticket-value">{ticketData.firstName} {ticketData.lastName}</span>
          </div>
          <div className="ticket-field">
            <label>Passport Number</label>
            <span className="ticket-value">{ticketData.passport}</span>
          </div>
        </div>

        {/* Selected Route Itinerary Section */}
        {depFlight && (
          <div className="ticket-route-breakdown">
            <div className="route-section-header">
              <i className="fas fa-plane-departure"></i> OUTBOUND FLIGHT ITINERARY
            </div>
            {renderFlightBox(depFlight, false)}

            {/* Return Segment if Round Trip */}
            {ticketData.tripType === 'round' && retFlight && (
              <>
                <div className="route-section-header return-header">
                  <i className="fas fa-plane-arrival"></i> RETURN FLIGHT ITINERARY
                </div>
                {renderFlightBox(retFlight, true)}
              </>
            )}
          </div>
        )}
        
        <div className="ticket-row price-row">
          <div className="ticket-field">
            <label>Total Price</label>
            <span className="ticket-value price">{ticketData.totalPrice}</span>
          </div>
          <div className="ticket-field">
            <label>Status</label>
            <span className="status-badge confirmed">
              <i className="fas fa-check"></i> Confirmed Ticket
            </span>
          </div>
        </div>
      </div>
      
      <div className="ticket-actions">
        <button onClick={handleDownload} className="btn-download">
          <i className="fas fa-file-pdf"></i> Download PDF
        </button>
        
        <button onClick={handlePrint} className="btn-print">
          <i className="fas fa-print"></i> Print Ticket
        </button>

        <button 
          onClick={handleSendEmail} 
          className="btn-email"
          disabled={isSending}
        >
          <i className="fas fa-envelope"></i> 
          {isSending ? 'Sending...' : 'Get Promo Code'}
        </button>

        <button onClick={handleNewBooking} className="btn-secondary">
          <i className="fas fa-plus"></i> Book Another Ticket
        </button>
      </div>
      
      <div className="ticket-disclaimer">
        <i className="fas fa-info-circle"></i>
        <span>This is an official dummy ticket generated for visa application purposes. No actual flight seat is booked.</span>
      </div>
      
      <div className="ticket-helper">
        <h4>💡 Get 10% off your next booking!</h4>
        <p>Click "Get Promo Code" to receive a discount code via email.</p>
      </div>
    </div>
  );
};

export default TicketPreview;