// models/MonthlyEnergy.js
const mongoose = require("mongoose");

const monthlyEnergySchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  totalEnergyKWh: { type: Number, default: 0 }
}, {
  timestamps: true
});

// One document per device per month
monthlyEnergySchema.index({ deviceId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("MonthlyEnergy", monthlyEnergySchema);
