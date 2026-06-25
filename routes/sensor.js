const express = require('express');
const router = express.Router();
const { generateSensorData } = require('../utils/sensorUtils');
const { getChannel } = require('../config/rabbitmq');
const trackingPeekTime = require('../controllers/trackingPeekTime');
const monthlyAnylist = require("../controllers/monthlyAnylist");

// POST /api/  ← Updated for real ESP32 data only
router.post('/', async (req, res) => {
  const data = req.body;  // ← No more generateSensorData() fallback

  // Validate incoming data
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid or empty data body' });
  }

  try {
    const channel = getChannel();
    await channel.assertQueue("sensor_data", { durable: true });
    channel.sendToQueue("sensor_data", Buffer.from(JSON.stringify(data)), { persistent: true });

    console.log('[SENT SENSOR DATA VIA API (from ESP32)]', data);
    res.json({ status: 'ok', sent: data });
  } catch (err) {
    console.error('[API POST ERROR]', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/dailyChartData
router.get('/peekTimeOfUsage', trackingPeekTime.getPeakPowerByPeriod);
router.get("/monthlyEnergy", monthlyAnylist.getMonthlyEnergyByYear);

module.exports = router;
