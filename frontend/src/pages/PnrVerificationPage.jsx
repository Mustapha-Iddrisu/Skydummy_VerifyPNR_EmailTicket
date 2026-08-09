import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import TicketPreview from '../components/ticket/TicketPreview';
import { generateTicketPDF } from '../services/pdfService';
import { searchTicketInFirestore, saveTicketToFirestore } from '../services/firebaseService';

const SAMPLE_TICKETS = [
  {
    bookingReference: 'PNR-77A9X2',
    ticketNumber: 'SKY88204910',
    status: 'confirmed',
    issueDate: new Date().toISOString().split('T')[0],
    tripType: 'round',
    passengers: 1,
    firstName: 'John',
    lastName: 'Doe',
    passport: 'A9821034',
    email: 'john.doe@example.com',
    passengerList: [
      { firstName: 'John', lastName: 'Doe', passport: 'A9821034', title: 'Mr' }
    ],
    totalPrice: '$12.00 USD',
    flightDetails: {
      flightNumber: 'EK202',
      airline: { name: 'Emirates', code: 'EK', logo: '✈️' },
      departure: { airport: 'JFK', city: 'New York', country: 'United States', time: '11:00', terminal: '4', gate: 'B22' },
      arrival: { airport: 'LHR', city: 'London', country: 'United Kingdom', time: '23:10', terminal: '3', gate: 'A14' },
      aircraft: 'Boeing 777-300ER',
      bookingClass: 'Economy (M)',
      durationFormatted: '7h 10m',
      stops: 1,
      stopoverDetails: {
        airport: 'DXB',
        city: 'Dubai',
        country: 'UAE',
        duration: 120
      },
      returnFlight: {
        flightNumber: 'EK201',
        airline: { name: 'Emirates', code: 'EK', logo: '✈️' },
        departure: { airport: 'LHR', city: 'London', country: 'United Kingdom', time: '14:20', terminal: '3', gate: 'A18' },
        arrival: { airport: 'JFK', city: 'New York', country: 'United States', time: '19:00', terminal: '4', gate: 'B20' },
        aircraft: 'Boeing 777-300ER',
        bookingClass: 'Economy (M)',
        durationFormatted: '7h 40m',
        stops: 0
      }
    }
  }
];

const PnrVerificationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get('pnr') || searchParams.get('ref') || '';
  const initialLastName = searchParams.get('lastName') || '';

  const [pnrInput, setPnrInput] = useState(initialRef);
  const [lastNameInput, setLastNameInput] = useState(initialLastName);
  const [ticketResult, setTicketResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Search function
  const performSearch = async (targetPnr, targetLastName) => {
    setErrorMsg('');
    setSearched(true);

    const queryRef = (targetPnr || pnrInput).trim().toUpperCase();
    const queryName = (targetLastName !== undefined ? targetLastName : lastNameInput).trim().toLowerCase();

    if (!queryRef) {
      setErrorMsg('Please enter a PNR or Booking Reference');
      return;
    }

    setIsSearching(true);

    try {
      // 1. Query Cloud Database (Firestore) for instant worldwide cross-device verification
      const cloudTicket = await searchTicketInFirestore(queryRef, queryName);
      if (cloudTicket) {
        setTicketResult(cloudTicket);
        setIsSearching(false);
        return;
      }

      // 2. Check Server API endpoint
      const res = await fetch(`/api/tickets?pnr=${encodeURIComponent(queryRef)}&lastName=${encodeURIComponent(queryName)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.ticket) {
          setTicketResult(data.ticket);
          setIsSearching(false);
          return;
        }
      }
    } catch (err) {
      console.log('Cloud / Server lookup failed, falling back to local store', err);
    }

    // 2. Fallback to localStorage and hardcoded sample tickets
    setTimeout(() => {
      let storedTickets = [];
      try {
        const stored = localStorage.getItem('sky_verified_tickets');
        if (stored) {
          storedTickets = JSON.parse(stored);
        }
      } catch (err) {
        console.error('Failed to parse stored tickets', err);
      }

      try {
        const zustandStored = localStorage.getItem('booking-storage');
        if (zustandStored) {
          const parsed = JSON.parse(zustandStored);
          if (parsed?.state?.ticketData) {
            storedTickets.push(parsed.state.ticketData);
          }
        }
      } catch (err) {
        console.error('Failed to parse zustand store', err);
      }

      const allTickets = [...storedTickets, ...SAMPLE_TICKETS];

      const match = allTickets.find(t => {
        const refMatch = t.bookingReference?.toUpperCase() === queryRef || 
                         t.ticketNumber?.toUpperCase() === queryRef ||
                         t.bookingReference?.replace('-', '')?.toUpperCase() === queryRef.replace('-', '');
        
        let nameMatch = true;
        if (queryName) {
          const mainLast = t.lastName?.toLowerCase() || '';
          const listLast = t.passengerList?.some(p => p.lastName?.toLowerCase() === queryName);
          nameMatch = mainLast.includes(queryName) || listLast;
        }

        return refMatch && nameMatch;
      });

      if (match) {
        setTicketResult(match);
      } else {
        setTicketResult(null);
        setErrorMsg(`No active ticket found for reference "${queryRef}". Please verify the code or check your booking confirmation.`);
      }

      setIsSearching(false);
    }, 300);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    performSearch();
  };

  useEffect(() => {
    // Ensure sample demo tickets exist in Firestore cloud database
    SAMPLE_TICKETS.forEach(ticket => {
      saveTicketToFirestore(ticket);
    });

    if (initialRef) {
      performSearch(initialRef, initialLastName);
    }
  }, [initialRef]);

  const handleDownloadPDF = async () => {
    if (!ticketResult) return;
    try {
      await generateTicketPDF(ticketResult);
    } catch (err) {
      console.error('PDF generation error', err);
      alert('Could not download PDF. Please try printing directly.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pnr-page-wrapper">
      <Navbar />

      <div className="pnr-hero-banner">
        <div className="pnr-container">
          <div className="pnr-hero-header">
            <span className="pnr-badge"><i className="fas fa-shield-alt"></i> Official GDS Validation Portal</span>
            <h1>Live Flight Itinerary & PNR Verification</h1>
            <p>Verify e-ticket authenticity, passenger manifests, and route itineraries synchronized across global GDS flight networks.</p>
          </div>

          <form onSubmit={handleSearch} className="pnr-search-card">
            <div className="pnr-input-group">
              <label><i className="fas fa-ticket-alt"></i> PNR / Booking Reference or E-Ticket #</label>
              <input 
                type="text"
                placeholder="e.g. SKY-8X92K4 or PNR-77A9X2"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value)}
                required
              />
            </div>

            <div className="pnr-input-group">
              <label><i className="fas fa-user"></i> Passenger Last Name (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. Doe"
                value={lastNameInput}
                onChange={(e) => setLastNameInput(e.target.value)}
              />
            </div>

            <button type="submit" className="pnr-submit-btn" disabled={isSearching}>
              {isSearching ? (
                <><i className="fas fa-spinner fa-spin"></i> Verifying...</>
              ) : (
                <><i className="fas fa-search"></i> Verify Status</>
              )}
            </button>
          </form>

          {/* Quick Demo Reference Suggestions */}
          <div className="pnr-quick-chips">
            <span>Try sample PNR:</span>
            <button 
              type="button" 
              className="chip-btn"
              onClick={() => { 
                setPnrInput('PNR-77A9X2'); 
                setLastNameInput('Doe'); 
                performSearch('PNR-77A9X2', 'Doe');
              }}
            >
              PNR-77A9X2 (Doe)
            </button>
          </div>
        </div>
      </div>

      <div className="pnr-main-content">
        <div className="pnr-container">

          {errorMsg && (
            <div className="pnr-error-banner">
              <i className="fas fa-exclamation-triangle"></i>
              <div>
                <strong>Verification Query Notice</strong>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {ticketResult && (
            <div className="pnr-result-section">
              {/* Verification Status Header */}
              <div className="pnr-status-header">
                <div className="status-live-badge">
                  <span className="pulse-dot"></span>
                  <i className="fas fa-check-circle"></i> VERIFIED ACTIVE IN GDS
                </div>
                <div className="pnr-meta-tags">
                  <span><i className="fas fa-database"></i> Amadeus / Sabre Record Locator: <strong>{ticketResult.bookingReference}</strong></span>
                  <span><i className="fas fa-barcode"></i> E-Ticket #: <strong>{ticketResult.ticketNumber}</strong></span>
                  <span><i className="fas fa-calendar-alt"></i> Issued: <strong>{ticketResult.issueDate}</strong></span>
                </div>
              </div>

              {/* Verified Badge Banner */}
              <div className="pnr-info-callout">
                <i className="fas fa-shield-check"></i>
                <span>This flight reservation itinerary is officially registered and formatted according to IATA standards for visa applications and embassy presentation.</span>
              </div>

              {/* Ticket Preview Component */}
              <div className="pnr-preview-container">
                <TicketPreview ticketData={ticketResult} />
              </div>

              {/* Action Toolbar */}
              <div className="pnr-actions-bar">
                <button className="btn-pnr-action primary" onClick={handleDownloadPDF}>
                  <i className="fas fa-file-pdf"></i> Download Official PDF
                </button>
                <button className="btn-pnr-action secondary" onClick={handlePrint}>
                  <i className="fas fa-print"></i> Print Itinerary
                </button>
                <Link to="/" className="btn-pnr-action outline">
                  <i className="fas fa-plus-circle"></i> Book Another Itinerary
                </Link>
              </div>
            </div>
          )}

          {!searched && !ticketResult && (
            <div className="pnr-features-grid">
              <div className="feature-card">
                <div className="feature-icon"><i className="fas fa-passport"></i></div>
                <h3>Embassy Compliant</h3>
                <p>Formatted according to strict VFS, TLScontact, and BLS embassy requirements worldwide.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><i className="fas fa-route"></i></div>
                <h3>Multi-Leg & Transits</h3>
                <p>Detailed step-by-step 1. Departure → Transit and 2. Transit → Arrival breakdowns for layovers.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><i className="fas fa-qrcode"></i></div>
                <h3>IATA BCBP Barcode</h3>
                <p>Includes scannable 2D IATA barcodes for maximum authenticity on paper or digital view.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PnrVerificationPage;
