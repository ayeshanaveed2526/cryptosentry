import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import dashboardRouter from './routes/dashboard.js';
import { startPriceFetcher, stopPriceFetcher } from './services/priceFetcher.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Standard middleware
app.use(cors());
app.use(express.json());

// Routes setup
app.use('/', apiRouter);      // Mount /api/prices and /health
app.use('/', dashboardRouter); // Mount / dashboard

// Graceful shutdown hooks
const handleShutdown = (signal: string) => {
  console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
  stopPriceFetcher();
  process.exit(0);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Start server
const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🟢 Express Surveillance Engine Started`);
  console.log(`🔌 Listening on port: http://localhost:${PORT}`);
  console.log(`📊 Health Endpoint:   http://localhost:${PORT}/health`);
  console.log(`📈 API Feed:          http://localhost:${PORT}/api/prices`);
  console.log(`==================================================`);

  // Start the 30-second price fetching background scheduler
  startPriceFetcher();
});
