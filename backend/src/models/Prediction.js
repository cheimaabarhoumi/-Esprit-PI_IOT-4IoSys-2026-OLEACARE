const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  terrainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terrain',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  maturity_index: {
    type: Number,
    required: true,
  },
  quality_grade: {
    type: String,
    enum: ['Extra_Vierge', 'Vierge', 'Lampante'],
    required: true,
  },
  quality_score: {
    type: Number,
    required: true,
  },
  acidity: {
    type: Number,
    required: true,
  },
  total_oil_liters: {
    type: Number,
    required: true,
  },
  oil_value_TND: {
    type: Number,
    required: true,
  },
  optimal_harvest_date: {
    type: Date,
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
PredictionSchema.index({ terrainId: 1, createdAt: -1 });
PredictionSchema.index({ userId: 1 });

module.exports = mongoose.model('Prediction', PredictionSchema);
