// src/components/booking/TripDetails.jsx
import React, { useEffect } from 'react';
import AirportSearch from '../common/AirportSearch';
import RouteSelection from './RouteSelection';
import useBookingStore from '../../store/bookingStore';

const TripDetails = ({ register, errors, watch, setValue, routeError }) => {
  const { 
    updateField, 
    getPrice,
    availableRoutes,
    selectedRoute,
    isLoadingRoutes,
    fetchAvailableRoutes,
    selectRoute
  } = useBookingStore();

  const tripType = watch('tripType');
  const passengers = watch('passengers') || 1;
  const departure = watch('departure');
  const destination = watch('destination');
  const departDate = watch('departDate');
  const returnDate = watch('returnDate');
  const totalPrice = getPrice();

  // Exchange rate: 1 USD = 12 GHS
  const USD_TO_GHS = 12.00;

  // Fetch available route options when departure, destination, and date(s) are filled out
  useEffect(() => {
    if (departure && destination && departDate) {
      if (tripType === 'round' && !returnDate) {
        return;
      }
      fetchAvailableRoutes({
        departure,
        destination,
        departDate,
        returnDate,
        tripType,
        passengers
      });
    }
  }, [departure, destination, departDate, returnDate, tripType, passengers, fetchAvailableRoutes]);

  return (
    <div className="col-left">
      <div className="section-title">
        <i className="fas fa-calendar-alt"></i> Trip details
      </div>

      <div className="field-group radio-group">
        <label className={`radio-label ${tripType === 'oneway' ? 'active' : ''}`}>
          <input type="radio" value="oneway" {...register('tripType')} />
          <i className="fas fa-arrow-right"></i> One-way
          <span className="price-tag">$10</span>
        </label>
        <label className={`radio-label ${tripType === 'round' ? 'active' : ''}`}>
          <input type="radio" value="round" {...register('tripType')} />
          <i className="fas fa-exchange-alt"></i> Round trip
          <span className="price-tag">$12</span>
        </label>
      </div>

      <div className="field-group">
        <label><i className="fas fa-user-friends"></i> Passengers</label>
        <div className="passenger-selector">
          <button 
            type="button" 
            onClick={() => {
              const val = Math.max(1, passengers - 1);
              setValue('passengers', val);
              updateField('passengers', val);
            }}
          >
            −
          </button>
          <span>{passengers}</span>
          <button 
            type="button" 
            onClick={() => {
              const val = Math.min(9, passengers + 1);
              setValue('passengers', val);
              updateField('passengers', val);
            }}
          >
            +
          </button>
        </div>
        {errors.passengers && (
          <span className="error-message">{errors.passengers.message}</span>
        )}
      </div>

      <div className="field-group">
        <AirportSearch
          label="Departure airport"
          value={watch('departure')}
          onChange={(code) => {
            setValue('departure', code);
            updateField('departure', code);
          }}
          placeholder="Type airport name or code..."
          required={true}
          className={errors.departure ? 'has-error' : ''}
        />
        {errors.departure && (
          <span className="error-message">{errors.departure.message}</span>
        )}
      </div>

      <div className="field-group">
        <AirportSearch
          label="Destination airport"
          value={watch('destination')}
          onChange={(code) => {
            setValue('destination', code);
            updateField('destination', code);
          }}
          placeholder="Type airport name or code..."
          required={true}
          className={errors.destination ? 'has-error' : ''}
        />
        {errors.destination && (
          <span className="error-message">{errors.destination.message}</span>
        )}
      </div>

      <div className="field-group">
        <label><i className="fas fa-calendar-day"></i> Departure date</label>
        <input 
          type="date" 
          {...register('departDate')}
          className={errors.departDate ? 'has-error' : ''}
          min={new Date().toISOString().split('T')[0]}
        />
        {errors.departDate && (
          <span className="error-message">{errors.departDate.message}</span>
        )}
      </div>

      {tripType === 'round' && (
        <div className="field-group">
          <label><i className="fas fa-calendar-week"></i> Return date</label>
          <input 
            type="date" 
            {...register('returnDate')}
            className={errors.returnDate ? 'has-error' : ''}
            min={watch('departDate') || new Date().toISOString().split('T')[0]}
          />
          {errors.returnDate && (
            <span className="error-message">{errors.returnDate.message}</span>
          )}
        </div>
      )}

      {/* Available Routes Component - User picks one after selecting date(s) */}
      <RouteSelection
        availableRoutes={availableRoutes}
        selectedRoute={selectedRoute}
        onSelectRoute={selectRoute}
        isLoadingRoutes={isLoadingRoutes}
        departure={departure}
        destination={destination}
        departDate={departDate}
        returnDate={returnDate}
        tripType={tripType}
        hasError={routeError}
      />

      {/* Price Display */}
      <div className="price-display">
        <div className="price-item">
          <span>Base price (per passenger):</span>
          <span>{tripType === 'oneway' ? '$10.00 USD' : '$12.00 USD'}</span>
          <span style={{ color: '#8aa3b5', fontSize: '0.75rem' }}>
            (~GHS {(tripType === 'oneway' ? 10 : 12) * USD_TO_GHS})
          </span>
        </div>
        <div className="price-item">
          <span>Passengers:</span>
          <span>{passengers}</span>
        </div>
        <div className="price-total">
          <span>Total:</span>
          <span className="total-amount">${totalPrice.toFixed(2)} USD</span>
          <span style={{ color: '#8aa3b5', fontSize: '0.75rem' }}>
            (~GHS {(totalPrice * USD_TO_GHS).toFixed(0)})
          </span>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;