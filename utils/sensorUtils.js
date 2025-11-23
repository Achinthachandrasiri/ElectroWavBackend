// utils/sensorDataGenerator.js (or wherever your generator is)
let lastTimestamp = Date.now(); 
const DEVICE_ID = "ESP32_01";

function generateSensorData() {
  const now = Date.now();
  const deltaMinutes = (now - lastTimestamp) / 60000;
  lastTimestamp = now;

  const voltage = 220 + Math.random() * 10;        // 220V ±10V
  const current = 0.5 + Math.random() * 5;         // 0.5A - 5.5A
  const powerFactor = 0.8 + Math.random() * 0.2;   // 0.8 - 1.0
  const frequency = 49 + Math.random() * 2;        // 49-51 Hz

  const apparentPower = voltage * current;
  const realPower = apparentPower * powerFactor;
  
  // ✅ FIXED: Convert minutes to hours for Wh calculation
  const energyWh = (realPower * deltaMinutes) / 60;  // Wh = W × (minutes/60)

  return {
    deviceId: DEVICE_ID,
    voltage: parseFloat(voltage.toFixed(2)),
    current: parseFloat(current.toFixed(2)),
    apparentPower: parseFloat(apparentPower.toFixed(2)),
    realPower: parseFloat(realPower.toFixed(2)),
    powerFactor: parseFloat(powerFactor.toFixed(2)),
    frequency: parseFloat(frequency.toFixed(2)),
    energyWh: parseFloat(energyWh.toFixed(4)),
    timestamp: new Date().toISOString()
  };
}

module.exports = { generateSensorData };