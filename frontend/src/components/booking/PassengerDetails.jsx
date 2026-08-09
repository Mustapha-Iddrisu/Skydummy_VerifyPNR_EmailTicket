// src/components/booking/PassengerDetails.jsx
import React from 'react';

const PassengerDetails = ({ register, errors, watch, setValue, passengers = 1 }) => {
  // Get passenger list from form
  const passengerList = watch('passengerList') || [];

  // Generate passenger fields based on count
  const renderPassengerFields = () => {
    const fields = [];
    for (let i = 0; i < passengers; i++) {
      const passengerNumber = i + 1;
      fields.push(
        <div key={i} className="passenger-group" style={{
          border: '1px solid #e2eaf0',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px',
          background: i % 2 === 0 ? '#f9fcff' : 'white'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <h4 style={{ 
              margin: 0, 
              color: '#0b2b40',
              fontSize: '0.95rem',
              fontWeight: 600
            }}>
              <i className="fas fa-user" style={{ color: '#2a7de1', marginRight: '8px' }}></i>
              Passenger {passengerNumber}
            </h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Age Category Selection */}
              <label style={{ 
                fontSize: '0.8rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  {...register(`passengerList.${i}.type`)}
                  value="adult"
                  defaultChecked={!passengerList[i]?.type || passengerList[i]?.type === 'adult'}
                />
                Adult
              </label>
              <label style={{ 
                fontSize: '0.8rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  {...register(`passengerList.${i}.type`)}
                  value="child"
                />
                Child
              </label>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="field-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1f3a4b' }}>
                <i className="fas fa-user"></i> First Name *
              </label>
              <input
                type="text"
                {...register(`passengerList.${i}.firstName`)}
                placeholder={`First name`}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  border: '2px solid rgba(0,0,0,0.08)',
                  borderRadius: '14px',
                  fontSize: '0.95rem',
                  background: 'rgba(249,252,255,0.8)',
                  transition: '0.2s'
                }}
              />
              {errors?.passengerList?.[i]?.firstName && (
                <span className="error-message">{errors.passengerList[i].firstName.message}</span>
              )}
            </div>
            
            <div className="field-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1f3a4b' }}>
                <i className="fas fa-user"></i> Last Name *
              </label>
              <input
                type="text"
                {...register(`passengerList.${i}.lastName`)}
                placeholder={`Last name`}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  border: '2px solid rgba(0,0,0,0.08)',
                  borderRadius: '14px',
                  fontSize: '0.95rem',
                  background: 'rgba(249,252,255,0.8)',
                  transition: '0.2s'
                }}
              />
              {errors?.passengerList?.[i]?.lastName && (
                <span className="error-message">{errors.passengerList[i].lastName.message}</span>
              )}
            </div>
          </div>

          {/* Passport Number */}
          <div className="field-group" style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1f3a4b' }}>
              <i className="fas fa-passport"></i> Passport Number *
            </label>
            <input
              type="text"
              {...register(`passengerList.${i}.passport`)}
              placeholder="AB1234567"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                border: '2px solid rgba(0,0,0,0.08)',
                borderRadius: '14px',
                fontSize: '0.95rem',
                background: 'rgba(249,252,255,0.8)',
                transition: '0.2s'
              }}
            />
            {errors?.passengerList?.[i]?.passport && (
              <span className="error-message">{errors.passengerList[i].passport.message}</span>
            )}
          </div>

          {/* Date of Birth (Optional for children) */}
          <div className="field-group" style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1f3a4b' }}>
              <i className="fas fa-calendar-alt"></i> Date of Birth (Optional)
            </label>
            <input
              type="date"
              {...register(`passengerList.${i}.dob`)}
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                border: '2px solid rgba(0,0,0,0.08)',
                borderRadius: '14px',
                fontSize: '0.95rem',
                background: 'rgba(249,252,255,0.8)',
                transition: '0.2s'
              }}
            />
          </div>
        </div>
      );
    }
    return fields;
  };

  return (
    <div className="col-right">
      <div className="section-title">
        <i className="fas fa-id-card"></i> Passenger Details
      </div>

      <div style={{
        background: '#f0f7ff',
        padding: '10px 15px',
        borderRadius: '8px',
        marginBottom: '15px',
        fontSize: '0.85rem',
        color: '#1f4a5e',
        borderLeft: '3px solid #2a7de1'
      }}>
        <i className="fas fa-info-circle" style={{ color: '#2a7de1' }}></i>
        {' '}Select "Child" for passengers under 12 years old.
      </div>

      {/* Dynamic passenger fields */}
      {renderPassengerFields()}

      {/* Email - Shared for all passengers */}
      <div className="field-group">
        <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1f3a4b' }}>
          <i className="fas fa-envelope"></i> Email address *
        </label>
        <input
          type="email"
          {...register('email')}
          placeholder="john.doe@example.com"
          style={{
            width: '100%',
            padding: '0.7rem 1rem',
            border: '2px solid rgba(0,0,0,0.08)',
            borderRadius: '14px',
            fontSize: '0.95rem',
            background: 'rgba(249,252,255,0.8)',
            transition: '0.2s'
          }}
        />
        {errors.email && (
          <span className="error-message">{errors.email.message}</span>
        )}
      </div>
    </div>
  );
};

export default PassengerDetails;