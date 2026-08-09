// src/components/booking/RouteSelection.jsx
import React from 'react';

const RouteSelection = ({
  availableRoutes,
  selectedRoute,
  onSelectRoute,
  isLoadingRoutes,
  departure,
  destination,
  departDate,
  returnDate,
  tripType,
  hasError
}) => {
  const isFormReady = departure && destination && departDate && (tripType !== 'round' || returnDate);

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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

  return (
    <div className={`route-selection-wrapper ${hasError ? 'route-selection-error' : ''}`} id="route-selection-section">
      <div className="section-title">
        <i className="fas fa-route"></i> Select Flight Route
        <span className="route-badge">World Flight Data</span>
      </div>

      {!isFormReady ? (
        <div className="route-prompt-card">
          <i className="fas fa-plane-departure prompt-icon"></i>
          <p>Please select your <strong>Departure Airport</strong>, <strong>Destination Airport</strong>, and <strong>Date(s)</strong> above to view available routes.</p>
        </div>
      ) : isLoadingRoutes ? (
        <div className="route-loading-card">
          <i className="fas fa-spinner fa-spin loading-icon"></i>
          <p>Searching world flight database for <strong>{departure} ➔ {destination}</strong>...</p>
        </div>
      ) : availableRoutes && availableRoutes.length > 0 ? (
        <div className="route-options-container">
          <p className="route-instructions">
            <i className="fas fa-mouse-pointer"></i> Select one of the {availableRoutes.length} available flight routes below (hover over any route to inspect transit/stop details):
          </p>

          <div className="route-cards-list">
            {availableRoutes.map((route, index) => {
              const isSelected = selectedRoute && selectedRoute.id === route.id;
              const depFlight = route.departure;
              const retFlight = route.return;

              const depTransitText = getTransitText(depFlight);
              const retTransitText = getTransitText(retFlight);

              return (
                <div
                  key={route.id || index}
                  className={`route-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectRoute(route)}
                >
                  <div className="route-card-header">
                    <div className="airline-info">
                      <span className="airline-code-badge">{depFlight.airline.code}</span>
                      <div className="airline-meta">
                        <span className="airline-name">{depFlight.airline.name}</span>
                        <span className="alliance-tag">{depFlight.airline.alliance}</span>
                      </div>
                    </div>
                    <div className="flight-number-tag">
                      <i className="fas fa-ticket-alt"></i> {depFlight.flightNumber}
                    </div>
                  </div>

                  {/* Outbound Segment */}
                  <div className="route-segment">
                    <div className="segment-label">
                      <i className="fas fa-plane-departure"></i> Outbound ({formatDate(depFlight.departure.time)})
                    </div>
                    <div className="segment-details">
                      <div className="time-block">
                        <span className="time">{formatTime(depFlight.departure.time)}</span>
                        <span className="airport">{depFlight.departure.airport}</span>
                      </div>

                      <div className="flight-path" title={depTransitText}>
                        <span className="duration">{depFlight.durationFormatted}</span>
                        <div className="path-line">
                          <span className="dot"></span>
                          <span className="line"></span>
                          <i className="fas fa-plane plane-icon"></i>
                          <span className="line"></span>
                          <span className="dot"></span>
                        </div>
                        <div className="stops-badge-container">
                          <span className={`stops-badge ${depFlight.stops === 0 ? 'direct' : 'connecting'}`}>
                            {depFlight.stops === 0 ? 'Direct Flight' : `${depFlight.stops} Stop (${depFlight.stopoverDetails?.airport || 'Hub'})`}
                          </span>
                          <div className="transit-tooltip">
                            <i className="fas fa-info-circle"></i> {depTransitText}
                          </div>
                        </div>
                      </div>

                      <div className="time-block right">
                        <span className="time">{formatTime(depFlight.arrival.time)}</span>
                        <span className="airport">{depFlight.arrival.airport}</span>
                      </div>
                    </div>

                    {/* Transit Detail Strip on Hover */}
                    <div className="transit-info-strip">
                      <i className="fas fa-exchange-alt"></i> <span>{depTransitText}</span>
                    </div>
                  </div>

                  {/* Return Segment if Round Trip */}
                  {tripType === 'round' && retFlight && (
                    <div className="route-segment return-segment">
                      <div className="segment-label">
                        <i className="fas fa-plane-arrival"></i> Return ({formatDate(retFlight.departure.time)})
                      </div>
                      <div className="segment-details">
                        <div className="time-block">
                          <span className="time">{formatTime(retFlight.departure.time)}</span>
                          <span className="airport">{retFlight.departure.airport}</span>
                        </div>

                        <div className="flight-path" title={retTransitText}>
                          <span className="duration">{retFlight.durationFormatted}</span>
                          <div className="path-line">
                            <span className="dot"></span>
                            <span className="line"></span>
                            <i className="fas fa-plane plane-icon reverse"></i>
                            <span className="line"></span>
                            <span className="dot"></span>
                          </div>
                          <div className="stops-badge-container">
                            <span className={`stops-badge ${retFlight.stops === 0 ? 'direct' : 'connecting'}`}>
                              {retFlight.stops === 0 ? 'Direct Flight' : `${retFlight.stops} Stop (${retFlight.stopoverDetails?.airport || 'Hub'})`}
                            </span>
                            <div className="transit-tooltip">
                              <i className="fas fa-info-circle"></i> {retTransitText}
                            </div>
                          </div>
                        </div>

                        <div className="time-block right">
                          <span className="time">{formatTime(retFlight.arrival.time)}</span>
                          <span className="airport">{retFlight.arrival.airport}</span>
                        </div>
                      </div>

                      {/* Transit Detail Strip on Hover */}
                      <div className="transit-info-strip">
                        <i className="fas fa-exchange-alt"></i> <span>{retTransitText}</span>
                      </div>
                    </div>
                  )}

                  {/* Route Card Footer */}
                  <div className="route-card-footer">
                    <div className="aircraft-info">
                      <span><i className="fas fa-plane"></i> {depFlight.aircraft}</span>
                      <span><i className="fas fa-chair"></i> {depFlight.bookingClass}</span>
                    </div>

                    <button
                      type="button"
                      className={`select-route-btn ${isSelected ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRoute(route);
                      }}
                    >
                      {isSelected ? (
                        <>
                          <i className="fas fa-check-circle"></i> Selected
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus"></i> Select Route
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="route-prompt-card">
          <i className="fas fa-exclamation-triangle warning-icon"></i>
          <p>No available routes found for the selected airport pair. Try picking major international airports.</p>
        </div>
      )}

      {hasError && (
        <div className="route-error-msg">
          <i className="fas fa-exclamation-circle"></i> Please select one of the flight routes above to proceed with your ticket booking.
        </div>
      )}
    </div>
  );
};

export default RouteSelection;
