const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  deviceId:  { type: String, required: true },
  voltage:   { type: Number, required: true },
  current:   { type: Number, required: true },
  realPower: { type: Number, required: true },
  energyWh:  { type: Number, required: true },
  severity:  { type: String, enum: ["low", "medium", "high"], required: true },
  message:   { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  dismissed: { type: Boolean, default: false },
});

alertSchema.index({ timestamp: -1 });
alertSchema.index({ deviceId: 1, dismissed: 1 });

module.exports = mongoose.model("Alert", alertSchema);