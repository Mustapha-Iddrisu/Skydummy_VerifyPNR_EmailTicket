// backend/routes/paystack.js - ES Module version
import express from 'express';
import axios from 'axios';

const router = express.Router();

const getSecretKey = () => process.env.PAYSTACK_SECRET_KEY;

// Verify Paystack payment handler
const handleVerify = async (req, res) => {
  try {
    const { reference } = req.body;
    const PAYSTACK_SECRET_KEY = getSecretKey();

    if (!reference) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transaction reference is required' 
      });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Payment verification not configured (PAYSTACK_SECRET_KEY missing)' 
      });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status && response.data.data.status === 'success') {
      res.json({ 
        success: true, 
        data: response.data.data 
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.message || error.message 
    });
  }
};

router.post('/verify', handleVerify);
router.post('/verify-paystack', handleVerify);

// Initialize Paystack transaction
router.post('/initialize', async (req, res) => {
  try {
    const { email, amount, reference, channels } = req.body;
    const PAYSTACK_SECRET_KEY = getSecretKey();

    if (!email || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and amount are required' 
      });
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: Math.round(amount * 100),
        reference: reference || `SKY-${Date.now()}`,
        channels: channels || ['card', 'mobile_money', 'bank_transfer'],
        callback_url: `${req.headers.origin}/payment-callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status) {
      res.json({ 
        success: true, 
        data: response.data.data 
      });
    } else {
      res.json({ 
        success: false, 
        error: response.data.message 
      });
    }
  } catch (error) {
    console.error('Initialize payment error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.message || error.message 
    });
  }
});

// Get transaction status
router.get('/status/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const PAYSTACK_SECRET_KEY = getSecretKey();

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    res.json({ 
      success: true, 
      data: response.data.data 
    });
  } catch (error) {
    console.error('Transaction status error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.message || error.message 
    });
  }
});

export default router;
