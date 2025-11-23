// models/Average4Min.js
const mongoose = require("mongoose");

const average4MinSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, index: true },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },     
  realPower: { type: Number, required: true },    
  energy: { type: Number, required: true },  // Average energyWh over 4 minutes
  timestamp: { type: Date, default: Date.now, index: true },
  count: { type: Number, required: true },  // Number of samples averaged
  interval: { type: String, default: "4min" }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// Compound index for efficient queries
average4MinSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model("Average4Min", average4MinSchema);