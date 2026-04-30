const mongoose = require('mongoose');

const TerrainSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Terrain must belong to a user'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a terrain name'],
  },
  variety: {
    type: String,
    enum: ['Chemlali', 'Koroneiki', 'Arbequina', 'Frantoio', 'Other'],
    default: 'Chemlali',
  },
  surface_hectares: {
    type: Number,
    required: [true, 'Please provide surface area'],
    min: 0.1,
  },
  numberOfTrees: {
    type: Number,
    min: 1,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
TerrainSchema.index({ userId: 1 });

module.exports = mongoose.model('Terrain', TerrainSchema);
