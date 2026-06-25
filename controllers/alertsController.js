const Alert = require("../models/Alert");

// Thresholds — tune these to your setup
const THRESHOLDS = {
  voltage:   { high: 250, low: 200 },   // Volts
  current:   { high: 6.0, medium: 4.0 }, // Amps
  realPower: { high: 1400, medium: 900 }, // Watts
  energyWh:  { high: 20.0, medium: 14.0 },// Wh per reading
};

// const THRESHOLDS = {
//   voltage:   { high: 250, low: 200 },
//   current:   { high: 0.1, medium: 0.05 },  // ← changed
//   realPower: { high: 1400, medium: 900 },
//   energyWh:  { high: 20.0, medium: 14.0 },
// };

/**
 * Evaluate a sensor reading and return an alert object if thresholds are exceeded.
 * Returns null if no alert.
 */
function evaluateReading(data) {
  const { voltage, current, realPower, energyWh, deviceId } = data;

  let severity = null;
  const reasons = [];

  // Check each metric
  if (current >= THRESHOLDS.current.high || realPower >= THRESHOLDS.realPower.high || energyWh >= THRESHOLDS.energyWh.high) {
    severity = "high";
  } else if (current >= THRESHOLDS.current.medium || realPower >= THRESHOLDS.realPower.medium || energyWh >= THRESHOLDS.energyWh.medium) {
    severity = "medium";
  }

  if (voltage > THRESHOLDS.voltage.high) {
    reasons.push(`Overvoltage: ${voltage}V`);
    if (severity !== "high") severity = "medium";
  } else if (voltage < THRESHOLDS.voltage.low) {
    reasons.push(`Undervoltage: ${voltage}V`);
    if (severity !== "high") severity = "medium";
  }

  if (!severity) return null;

  if (current   >= THRESHOLDS.current.high)   reasons.push(`High current: ${current}A`);
  else if (current >= THRESHOLDS.current.medium) reasons.push(`Elevated current: ${current}A`);

  if (realPower >= THRESHOLDS.realPower.high)   reasons.push(`High power: ${realPower}W`);
  else if (realPower >= THRESHOLDS.realPower.medium) reasons.push(`Elevated power: ${realPower}W`);

  if (energyWh >= THRESHOLDS.energyWh.high)    reasons.push(`High energy: ${energyWh}Wh`);
  else if (energyWh >= THRESHOLDS.energyWh.medium) reasons.push(`Elevated energy: ${energyWh}Wh`);

  return {
    deviceId,
    voltage,
    current,
    realPower,
    energyWh,
    severity,
    message: reasons.join(" | ") || "High usage detected",
    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    dismissed: false,
  };
}

/**
 * Called per incoming sensor reading.
 * Saves alert to DB and emits via Socket.IO if threshold is breached.
 */
async function checkAndEmitAlert(data, io) {
  try {
    const alert = evaluateReading(data);
    if (!alert) return;

    const saved = await Alert.create(alert);
    io.emit("new-alert", saved);
    console.log(`🚨 Alert [${alert.severity.toUpperCase()}] for ${alert.deviceId}: ${alert.message}`);
  } catch (err) {
    console.error("❌ Alert check failed:", err.message);
  }
}

/** REST: GET /api/alerts  — with optional ?severity=high&deviceId=ESP32_01 */
async function getAlerts(req, res) {
  try {
    const query = { dismissed: false };
    if (req.query.severity) query.severity = req.query.severity;
    if (req.query.deviceId) query.deviceId = req.query.deviceId;

    const alerts = await Alert.find(query).sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/** REST: PATCH /api/alerts/:id/dismiss */
async function dismissAlert(req, res) {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { dismissed: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, error: "Alert not found" });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/** REST: DELETE /api/alerts/dismiss-all */
async function dismissAll(req, res) {
  try {
    await Alert.updateMany({ dismissed: false }, { dismissed: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { checkAndEmitAlert, getAlerts, dismissAlert, dismissAll };