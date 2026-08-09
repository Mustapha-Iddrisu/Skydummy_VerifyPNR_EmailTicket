// src/components/booking/BookingForm.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { bookingSchema } from '../../utils/validation';
import useBookingStore from '../../store/bookingStore';
import TripDetails from './TripDetails';
import PassengerDetails from './PassengerDetails';
import PaymentMethod from './PaymentMethod';
import PaymentModal from './PaymentModal';
import { validateCoupon } from '../../utils/coupons';

const BookingForm = () => {
  const navigate = useNavigate();
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [formDataForPayment, setFormDataForPayment] = useState(null);
  
  const [routeError, setRouteError] = useState(false);
  
  const { 
    updateField, 
    generateTicket, 
    setLoading,
    fetchFlightDetails,
    isLoading,
    selectedRoute,
    availableRoutes,
    ...formData 
  } = useBookingStore();
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      tripType: formData.tripType || 'round',
      passengers: formData.passengers || 1,
      departure: formData.departure || '',
      destination: formData.destination || '',
      departDate: formData.departDate || '',
      returnDate: formData.returnDate || '',
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      passport: formData.passport || '',
      email: formData.email || '',
      paymentMethod: formData.paymentMethod || 'card',
      couponCode: '',
      passengerList: formData.passengerList || [{ firstName: '', lastName: '' }]
    }
  });

  // Watch values
  const watchCouponCode = watch('couponCode');
  const watchPaymentMethod = watch('paymentMethod');
  const watchTripType = watch('tripType');
  const passengerCount = watch('passengers') || 1;
  const totalPriceUSD = useBookingStore.getState().getPrice();

  // Exchange rate: 1 USD = 12 GHS
  const USD_TO_GHS = 12.00;
  const totalPriceGHS = totalPriceUSD * USD_TO_GHS;

  // Set payment method for modal
  useEffect(() => {
    setPaymentMethod(watchPaymentMethod || 'card');
  }, [watchPaymentMethod]);

  // Generate passenger list based on count
  useEffect(() => {
    const currentPassengers = watch('passengerList') || [];
    const newCount = passengerCount;
    const newPassengers = [];
    
    for (let i = 0; i < newCount; i++) {
      if (currentPassengers[i]) {
        newPassengers.push(currentPassengers[i]);
      } else {
        newPassengers.push({ firstName: '', lastName: '' });
      }
    }
    
    setValue('passengerList', newPassengers);
  }, [passengerCount, setValue, watch]);

  // Fetch flight details when departure, destination, or dates change
  useEffect(() => {
    const departure = watch('departure');
    const destination = watch('destination');
    const departDate = watch('departDate');
    const tripType = watch('tripType');
    
    if (departure && destination && departDate) {
      fetchFlightDetails(tripType);
    }
  }, [watch('departure'), watch('destination'), watch('departDate'), watch('tripType')]);

  // Handle coupon application
  const handleApplyCoupon = () => {
    const code = watchCouponCode;
    if (!code) {
      alert('Please enter a coupon code');
      return;
    }
    
    const result = validateCoupon(code, totalPriceUSD);
    
    if (result.valid) {
      setIsCouponApplied(true);
      setDiscountAmount(result.discountAmount);
      setCouponCode(code);
      alert(`✅ Coupon applied! You saved $${result.discountAmount.toFixed(2)} USD`);
    } else {
      alert(`❌ ${result.message}`);
      setIsCouponApplied(false);
      setDiscountAmount(0);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    setIsCouponApplied(false);
    setDiscountAmount(0);
    setCouponCode('');
    setValue('couponCode', '');
  };

  // Calculate final price
  const getFinalPriceUSD = () => {
    if (isCouponApplied) {
      return Math.max(0, totalPriceUSD - discountAmount);
    }
    return totalPriceUSD;
  };

  // Get GHS price for Paystack
  const getFinalPriceGHS = () => {
    const usdPrice = getFinalPriceUSD();
    return usdPrice * USD_TO_GHS;
  };

  // Check if admin coupon is applied
  const isAdminCoupon = couponCode === 'SKYADMIN2024';

  // Sync store with form values
  useEffect(() => {
    const subscription = watch((value) => {
      if (!value || typeof value !== 'object') return;
      Object.keys(value).forEach(key => {
        const val = value[key];
        if (
          val !== undefined && 
          val !== null && 
          typeof val !== 'function' &&
          !(typeof val === 'object' && (val instanceof HTMLElement || val.nodeType || val.stateNode || val.target))
        ) {
          updateField(key, val);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateField]);

  // PROCESS THE FORM - Immediate navigation
const processForm = async (data) => {
  console.log('📝 Processing form...');
  
  setIsSubmitting(true);
  setLoading(true);
  
  try {
    // Fetch flight details
    let flightDetails = formData.flightDetails;
    if (!flightDetails) {
      const tripType = data.tripType || 'oneway';
      flightDetails = await fetchFlightDetails(tripType);
    }

    // Get passenger list with types
    const passengerList = data.passengerList || [{ 
      firstName: data.firstName || '', 
      lastName: data.lastName || '',
      passport: data.passport || '',
      type: 'adult',
      dob: ''
    }];
    
    // Build passenger details
    const passengerDetails = passengerList.map(p => {
      const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
      return {
        name: fullName || 'Passenger',
        passport: p.passport || 'N/A',
        type: p.type || 'adult',
        dob: p.dob || ''
      };
    });

    // Prepare ticket data
    const ticketData = {
      ...data,
      tripType: data.tripType || 'oneway',
      isAdmin: isAdminCoupon,
      couponApplied: isCouponApplied,
      couponCode: couponCode,
      discountAmount: discountAmount,
      finalPrice: getFinalPriceUSD(),
      originalPrice: totalPriceUSD,
      finalPriceGHS: getFinalPriceGHS(),
      flightDetails: flightDetails,
      paymentMethod: data.paymentMethod || 'card',
      paymentStatus: isAdminCoupon ? 'free' : 'paid',
      passengerList: passengerList,
      passengerDetails: passengerDetails,
      passengerCount: data.passengers || 1
    };
    
    generateTicket(ticketData);
    setShowPaymentModal(false);
    navigate('/ticket');
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('There was an error generating your ticket. Please try again.');
  } finally {
    setIsSubmitting(false);
    setLoading(false);
  }
};

  // HANDLE PAYMENT SUCCESS - Direct navigation
  const handlePaymentSuccess = () => {
    console.log('💰 BookingForm: Payment success!');
    setPaymentCompleted(true);
    
    const data = formDataForPayment || watch();
    setShowPaymentModal(false);
    processForm(data);
  };

  // Handle payment modal close
  const handlePaymentModalClose = () => {
    console.log('🔚 Payment modal closed');
    setShowPaymentModal(false);
    setPaymentCompleted(false);
    setFormDataForPayment(null);
  };

  // Handle form submission when valid
  const onFormValid = (data) => {
    console.log('🎯 Form submission valid:', data);
    
    // Extract first passenger details for root normalization
    const passengerList = data.passengerList || [];
    const firstP = passengerList[0] || {};
    const firstName = data.firstName || firstP.firstName || '';
    const lastName = data.lastName || firstP.lastName || '';
    const passport = data.passport || firstP.passport || '';
    
    const normalizedData = {
      ...data,
      firstName,
      lastName,
      passport,
      passengerList
    };

    // Validate departure date
    if (data.departDate) {
      const departDateObj = new Date(data.departDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (departDateObj < today) {
        alert('Departure date must be in the future');
        return;
      }

      // Validate return date if round trip
      if (data.tripType === 'round') {
        if (!data.returnDate) {
          alert('Please enter a return date for round trip');
          return;
        }
        const returnDateObj = new Date(data.returnDate);
        if (returnDateObj <= departDateObj) {
          alert('Return date must be after departure date');
          return;
        }
      }
    }

    // Check if route is selected
    if (!selectedRoute) {
      setRouteError(true);
      const routeElement = document.getElementById('route-selection-section');
      if (routeElement) {
        routeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      alert('Please select a flight route from the available options before proceeding.');
      return;
    } else {
      setRouteError(false);
    }
    
    setFormDataForPayment(normalizedData);
    
    if (isAdminCoupon) {
      processForm(normalizedData);
      return;
    }
    
    setPaymentCompleted(false);
    setShowPaymentModal(true);
  };

  // Handle form submission when invalid
  const onFormInvalid = (formErrors) => {
    console.error('❌ Form validation failed:', formErrors);
    const missing = [];
    if (formErrors.departure) missing.push('Departure airport');
    if (formErrors.destination) missing.push('Destination airport');
    if (formErrors.departDate) missing.push('Departure date');
    if (formErrors.returnDate) missing.push('Return date');
    if (formErrors.email) missing.push('Email address');
    
    if (formErrors.passengerList) {
      formErrors.passengerList.forEach((pErr, i) => {
        if (pErr?.firstName) missing.push(`Passenger ${i+1} First Name`);
        if (pErr?.lastName) missing.push(`Passenger ${i+1} Last Name`);
        if (pErr?.passport) missing.push(`Passenger ${i+1} Passport Number`);
      });
    }

    const msg = missing.length > 0 
      ? `Please complete the following required fields:\n• ${missing.join('\n• ')}`
      : 'Please complete all required fields correctly before proceeding.';
    alert(msg);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onFormValid, onFormInvalid)} className="booking-form">
        <div className="form-grid">
          <TripDetails 
            register={register} 
            errors={errors} 
            watch={watch}
            setValue={setValue}
            routeError={routeError}
          />
          
          <div>
            <PassengerDetails 
              register={register} 
              errors={errors} 
              watch={watch}
              setValue={setValue}
              passengers={passengerCount}
            />
            
            {/* Coupon Section */}
            <div className="coupon-section">
              <div className="section-title">
                <i className="fas fa-gift"></i> Coupon Code
              </div>
              
              {!isCouponApplied ? (
                <div className="coupon-input-group">
                  <input
                    type="text"
                    {...register('couponCode')}
                    placeholder="Enter coupon code..."
                    className="coupon-input"
                  />
                  <button 
                    type="button" 
                    className="coupon-apply-btn"
                    onClick={handleApplyCoupon}
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="coupon-applied">
                  <div className="coupon-applied-info">
                    <i className="fas fa-check-circle"></i>
                    <span>Coupon applied successfully!</span>
                  </div>
                  <button 
                    type="button" 
                    className="coupon-remove-btn"
                    onClick={handleRemoveCoupon}
                  >
                    <i className="fas fa-times"></i> Remove
                  </button>
                </div>
              )}
            </div>
            
            <PaymentMethod register={register} errors={errors} watch={watch} />
            
            {/* Price Display - USD with GHS approx */}
            <div className="price-display">
              <div className="price-item">
                <span>Original Price:</span>
                <span>${totalPriceUSD.toFixed(2)} USD</span>
                <span style={{ color: '#8aa3b5', fontSize: '0.75rem' }}>
                  (~GHS {totalPriceGHS.toFixed(0)})
                </span>
              </div>
              {isCouponApplied && discountAmount > 0 && (
                <div className="price-item" style={{ color: '#28a745' }}>
                  <span>Discount:</span>
                  <span>-${discountAmount.toFixed(2)} USD</span>
                  <span style={{ color: '#8aa3b5', fontSize: '0.75rem' }}>
                    (~GHS {(discountAmount * USD_TO_GHS).toFixed(0)})
                  </span>
                </div>
              )}
              <div className="price-total">
                <span>Total:</span>
                <span className="total-amount">
                  {isAdminCoupon ? (
                    <span style={{ color: '#28a745' }}>FREE 🎉</span>
                  ) : (
                    `$${getFinalPriceUSD().toFixed(2)} USD`
                  )}
                </span>
                {!isAdminCoupon && (
                  <span style={{ color: '#8aa3b5', fontSize: '0.75rem' }}>
                    (~GHS {getFinalPriceGHS().toFixed(0)})
                  </span>
                )}
              </div>
              {isCouponApplied && !isAdminCoupon && (
                <div className="price-item" style={{ color: '#28a745', fontSize: '0.8rem', justifyContent: 'center' }}>
                  <i className="fas fa-tag"></i> Coupon applied - {((discountAmount / totalPriceUSD) * 100).toFixed(0)}% off
                </div>
              )}
              {isAdminCoupon && (
                <div className="price-item" style={{ color: '#28a745', fontSize: '0.8rem', justifyContent: 'center' }}>
                  <i className="fas fa-star"></i> Admin coupon - 100% discount
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="action-row">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> 
                {isSubmitting ? 'Generating Ticket...' : 'Processing...'}
              </>
            ) : (
              <>
                <i className="fas fa-ticket-alt"></i> 
                {isAdminCoupon ? 'Generate Free Ticket' : 
                 `Pay $${getFinalPriceUSD().toFixed(2)} USD`}
              </>
            )}
          </button>
          <p className="disclaimer">
            <i className="fas fa-info-circle"></i> 
            For visa application purposes only. No real flight reservation.
          </p>
        </div>
      </form>

      {!isAdminCoupon && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentModalClose}
          ticketData={formDataForPayment || watch()}
          priceUSD={totalPriceUSD}
          discountUSD={discountAmount}
          finalPriceGHS={getFinalPriceGHS()}
          paymentMethod={paymentMethod}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default BookingForm;