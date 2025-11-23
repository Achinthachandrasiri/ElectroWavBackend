const rateLimit = require('express-rate-limit');

// 🔒 Limit requests to prevent abuse (e.g. DDoS or brute force attacks)
const limiter = rateLimit({
  windowMs: 60 * 1000,       // ⏳ Time window: 1 minute
  max: 30,                   // 🚦 Limit: 30 requests per IP per minute
  message: {
    status: 429,
    error: 'Too many requests, please try again after a minute.'
  },
  standardHeaders: true,     // 📊 Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false       // ❌ Disable old `X-RateLimit-*` headers
});

module.exports = limiter;
