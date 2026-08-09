// backend/server.js - CommonJS version
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const paystackRoutes = require('./routes/paystack');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://skydummy.com', 'https://skydummy.netlify.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/paystack', paystackRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SkyDummy Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SkyDummy Backend running on port ${PORT}`);
});