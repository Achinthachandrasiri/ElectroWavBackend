const logger = console; // Simple console logger

function requestLogger(req, res, next) {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
}

module.exports = requestLogger;
