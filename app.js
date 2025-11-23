const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const limiter = require('./config/rateLimit');
const requestLogger = require('./middleware/requestLogger');
const healthRoute = require('./routes/health');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/health', healthRoute);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = { app };
