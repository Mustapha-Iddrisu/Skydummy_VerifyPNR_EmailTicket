// src/components/booking/PaymentModal.jsx
import React, { useState } from 'react';
import PaystackPayment from './PaystackPayment';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  ticketData, 
  priceUSD, 
  discountUSD = 0,
  finalPriceGHS = 0,
  paymentMethod = 'card',
  onSuccess
}) => {
  if (!isOpen) return null;

  const finalPriceUSD = priceUSD - discountUSD;
  const discountPercentage = discountUSD > 0 ? (discountUSD / priceUSD) * 100 : 0;

  const handlePaymentSuccess = (response) => {
    console.log('🎉 PaymentModal: Payment success!', response);
    
    // Immediately close this modal
    onClose();
    
    // Immediately call parent onSuccess
    if (onSuccess) {
      onSuccess();
    }
  };

  const handlePaymentClose = () => {
    console.log('🔚 Payment modal closed');
    onClose();
  };

  return (
    <div className="payment-modal-overlay" onClick={handlePaymentClose}>
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h3>
            <i className="fas fa-lock"></i> 
            Complete Payment
          </h3>
          <button className="payment-modal-close" onClick={handlePaymentClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="payment-modal-body">
          {/* Payment Summary */}
          <div className="payment-summary">
            <div className="payment-summary-item">
              <span>Ticket Price:</span>
              <span>${priceUSD.toFixed(2)} USD</span>
              <span style={{ color: '#8aa3b5', fontSize: '0.75rem' }}>
                (~GHS {(priceUSD * 12).toFixed(0)})
              </span>
            </div>
            {discountUSD > 0 && (
              <div className="payment-summary-item discount">
                <span>Discount ({discountPercentage.toFixed(0)}%):</span>
                <span>${discountUSD.toFixed(2)} USD</span>
                <span style={{ color: '#8aa3b5', fontSize: '0.75rem' }}>
                  (~GHS {(discountUSD * 12).toFixed(0)})
                </span>
              </div>
            )}
            <div className="payment-summary-total">
              <span>Total:</span>
              <span>${finalPriceUSD.toFixed(2)} USD</span>
              <span style={{ color: '#2a7de1', fontSize: '0.85rem' }}>
                (GHS {finalPriceGHS.toFixed(2)})
              </span>
            </div>
          </div>

          {/* Paystack Payment */}
          <PaystackPayment
            email={ticketData.email}
            amountGHS={finalPriceGHS}
            firstName={ticketData.firstName}
            lastName={ticketData.lastName}
            ticketData={ticketData}
            paymentMethod={paymentMethod}
            onSuccess={handlePaymentSuccess}
            onClose={handlePaymentClose}
          />
        </div>
        
        <div className="payment-modal-footer">
          <button 
            className="payment-modal-cancel"
            onClick={handlePaymentClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;