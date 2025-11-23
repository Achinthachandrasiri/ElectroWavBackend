// models/Average1Day.js
const mongoose = require("mongoose");

const average1DaySchema = new mongoose.Schema({
  deviceId: { type: String, required: true, index: true },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  realPower: { type: Number, required: true },
  energy: { type: Number, required: true },  // Average energyWh over 1 day
  timestamp: { type: Date, default: Date.now, index: true },
  count: { type: Number, required: true },
  interval: { type: String, default: "1day" }
}, {
  timestamps: true
});

average1DaySchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model("Average1Day", average1DaySchema);