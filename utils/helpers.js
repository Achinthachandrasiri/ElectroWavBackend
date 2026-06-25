const logger = require('./logger');

const getClientIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',').shift() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'Unknown'
  );
};

const logEvent = (level, message, meta = {}) => {
  logger.log(level, message, meta);
};

const logInfo = (message, meta = {}) => logEvent('info', message, meta);
const logWarn = (message, meta = {}) => logEvent('warn', message, meta);
const logError = (message, meta = {}) => logEvent('error', message, meta);
const logDebug = (message, meta = {}) => logEvent('debug', message, meta);

module.exports = {  getClientIP,  logEvent,  logInfo,  logWarn,  logError,  logDebug};
