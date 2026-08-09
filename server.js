import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import paystackRoutes from './backend/routes/paystack.js';
import ticketsRoutes from './backend/routes/tickets.js';
import emailRoutes from './backend/routes/email.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.use('/api/paystack', paystackRoutes);
  app.use('/api/payment', paystackRoutes);
  app.use('/api/tickets', ticketsRoutes);
  app.use('/api/email', emailRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'SkyDummy Backend is running',
      timestamp: new Date().toISOString()
    });
  });

  // Serve Frontend
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      root: path.join(__dirname, 'frontend'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SkyDummy Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
