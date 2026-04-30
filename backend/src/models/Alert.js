const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  terrainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terrain',
  },
  type: {
    type: String,
    enum: ['harvest', 'battery', 'offline', 'soil'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
AlertSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
