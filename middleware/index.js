const cors = require('cors');
const bodyParser = require('body-parser');

const applyMiddlewares = (app) => {
  // CORS configuration
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Body parsing
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging (example of additional middleware)
  app.use((req, res, next) => {
    next();
  });

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });
};

module.exports = { applyMiddlewares };