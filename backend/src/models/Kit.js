const mongoose = require('mongoose');

const KitSchema = new mongoose.Schema({
  kitId: {
    type: String,
    required: [true, 'Please provide a kit ID'],
    unique: true,
  },
  status: {
    type: String,
    enum: ['in_stock', 'assigned', 'active', 'offline'],
    default: 'in_stock',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  terrainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terrain',
  },
  batteryPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  signalStrength: {
    type: Number,
    min: -120,
    max: 0,
  },
  lastSeen: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
KitSchema.index({ kitId: 1 });
KitSchema.index({ assignedTo: 1 });
KitSchema.index({ terrainId: 1 });

module.exports = mongoose.model('Kit', KitSchema);
