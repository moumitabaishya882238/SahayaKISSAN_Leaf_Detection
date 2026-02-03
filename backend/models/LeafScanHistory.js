const mongoose = require("mongoose");

const leafScanHistorySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: false,
  },
  imagePath: {
    type: String,
    required: false,
  },
  disease: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  severity: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    required: true,
  },
  temperature: {
    type: Number,
    required: false,
  },
  humidity: {
    type: Number,
    required: false,
  },
  soil_moisture: {
    type: Number,
    required: false,
  },
  recommendations: {
    type: [String],
    default: [],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for better query performance
leafScanHistorySchema.index({ timestamp: -1 });
leafScanHistorySchema.index({ disease: 1 });
leafScanHistorySchema.index({ severity: 1 });

module.exports = mongoose.model("LeafScanHistory", leafScanHistorySchema);
