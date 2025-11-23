// models/Average1Hour.js
const mongoose = require("mongoose");

const average1HourSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, index: true },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  realPower: { type: Number, required: true },
  energy: { type: Number, required: true },  // Average energyWh over 1 hour
  timestamp: { type: Date, default: Date.now, index: true },
  count: { type: Number, required: true },
  interval: { type: String, default: "1hr" }
}, {
  timestamps: true
});

average1HourSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model("Average1Hour", average1HourSchema);