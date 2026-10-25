import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth.js';
import quizzesRouter from './routes/quizzes.js';
import submissionsRouter from './routes/submissions.js';
import usersRouter from './routes/users.js';
import seedRouter from './routes/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'CCA Assessment Portal Backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/seed', seedRouter);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>CCA Assessment Portal API</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 4rem;">
        <h1 style="color: #0f172a;">Cadets Coaching Academy Backend API</h1>
        <p style="color: #475569;">Express & MongoDB Server is Online.</p>
        <p>Database Status: <strong>${mongoose.connection.readyState === 1 ? '🟢 Connected to MongoDB' : '🟡 Waiting for MONGODB_URI connection string'}</strong></p>
        <p><a href="/api/health">Check API Health</a></p>
      </body>
    </html>
  `);
});

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Database Connection & Startup
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB Atlas successfully.');
      app.listen(PORT, () => {
        console.log(`🚀 CCA Backend Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
      app.listen(PORT, () => {
        console.log(`⚠️ CCA Server running on port ${PORT} (Database pending connection: ${err.message})`);
      });
    });
} else {
  console.warn('⚠️ MONGODB_URI environment variable is missing.');
  console.warn('ℹ️ Running server in setup mode. Please configure MONGODB_URI in server/.env or Render.');
  app.listen(PORT, () => {
    console.log(`🚀 CCA Backend Server running on port ${PORT} (Waiting for MongoDB Atlas URI)`);
  });
}

export default app;
