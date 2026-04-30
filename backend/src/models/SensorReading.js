const mongoose = require('mongoose');

const SensorReadingSchema = new mongoose.Schema({
  kitId: {
    type: String,
    required: [true, 'Please provide a kit ID'],
  },
  terrainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terrain',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  temperature: {
    type: Number,
    required: true,
  },
  humidity_air: {
    type: Number,
    required: true,
  },
  soil_moisture: {
    type: Number,
    required: true,
  },
  light: {
    type: Number,
    required: true,
  },
});

// Compound index for efficient queries
SensorReadingSchema.index({ kitId: 1, timestamp: -1 });
SensorReadingSchema.index({ terrainId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorReading', SensorReadingSchema);
