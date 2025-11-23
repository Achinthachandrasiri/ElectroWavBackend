const express = require('express');
const router = express.Router();
const { generateSensorData } = require('../utils/sensorUtils');
const { getChannel } = require('../config/rabbitmq');
const trackingPeekTime = require('../controllers/trackingPeekTime');

// ✅ POST /api/
router.post('/', async (req, res) => {
  const data = req.body && Object.keys(req.body).length ? req.body : generateSensorData();
  try {
    const channel = getChannel();
    await channel.assertQueue("sensor_data", { durable: true });
    channel.sendToQueue("sensor_data", Buffer.from(JSON.stringify(data)), { persistent: true });

    console.log('[SENT SENSOR DATA VIA API]', data);
    res.json({ status: 'ok', sent: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ✅ GET /api/dailyChartData
router.get('/peekTimeOfUsage', trackingPeekTime.getPeakPowerByPeriod);

module.exports = router;
