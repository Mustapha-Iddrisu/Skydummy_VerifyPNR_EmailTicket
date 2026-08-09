// src/components/booking/PaymentMethod.jsx
import React from "react";

const PaymentMethod = ({ register, errors, watch, setValue }) => {
  const paymentMethod = watch("paymentMethod");

  return (
    <div className="payment-section">
      <div className="section-title">
        <i className="fas fa-credit-card"></i> Payment method
      </div>

      <div className="field-group radio-group payment-group">
        <label
          className={`radio-label ${paymentMethod === "card" ? "active" : ""}`}
        >
          <input type="radio" value="card" {...register("paymentMethod")} />
          <i className="fas fa-credit-card"></i> Credit / Debit Card
        </label>
        <label
          className={`radio-label ${paymentMethod === "mobile_money" ? "active" : ""}`}
        >
          <input
            type="radio"
            value="mobile_money"
            {...register("paymentMethod")}
          />
          <i className="fas fa-mobile-alt"></i> Mobile Money
        </label>
        {/* Remove Bank Transfer */}
      </div>

      {errors.paymentMethod && (
        <span className="error-message">{errors.paymentMethod.message}</span>
      )}

      {/* Card Info - Just a note */}
      {paymentMethod === "card" && (
        <div className="payment-info-box">
          <div className="payment-info-content">
            <p>
              You'll be redirected to Paystack to enter your card details
              securely.
            </p>
            <div className="payment-icons">
              <i className="fab fa-cc-visa"></i>
              <i className="fab fa-cc-mastercard"></i>
              <i className="fab fa-cc-amex"></i>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Money - Needs provider and phone */}
      {paymentMethod === "mobile_money" && (
        <div className="payment-info-box">
          <div className="payment-info-content">
            <p>Pay with MTN MoMo, Vodafone Cash, or AirtelTigo Money.</p>

            <div className="mobile-money-providers">
              <label className="provider-label">
                <i className="fas fa-phone"></i> Mobile Money Provider
              </label>
              <div className="provider-options">
                <label className="provider-option">
                  <input
                    type="radio"
                    value="mtn"
                    {...register("mobileMoneyProvider")}
                  />
                  <span className="provider-name">MTN MoMo</span>
                </label>
                <label className="provider-option">
                  <input
                    type="radio"
                    value="vodafone"
                    {...register("mobileMoneyProvider")}
                  />
                  <span className="provider-name">Vodafone Cash</span>
                </label>
                <label className="provider-option">
                  <input
                    type="radio"
                    value="airteltigo"
                    {...register("mobileMoneyProvider")}
                  />
                  <span className="provider-name">AirtelTigo Money</span>
                </label>
              </div>
            </div>

            <div className="mobile-money-phone">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="024XXXXXXX"
                {...register("mobileMoneyPhone")}
                className={errors.mobileMoneyPhone ? "has-error" : ""}
              />
              {errors.mobileMoneyPhone && (
                <span className="error-message">
                  {errors.mobileMoneyPhone.message}
                </span>
              )}
              <small className="field-hint">
                Enter the phone number registered with your mobile money account
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer - Just a note */}
      {paymentMethod === "bank_transfer" && (
        <div className="payment-info-box">
          <div className="payment-info-content">
            <p>
              You'll be redirected to Paystack to complete your bank transfer
              securely.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
