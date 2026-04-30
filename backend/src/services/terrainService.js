const Terrain = require('../models/Terrain');
const { ErrorHandler } = require('../utils/errorHandler');

class TerrainService {
  async createTerrain(userId, terrainData) {
    const terrain = await Terrain.create({
      userId,
      ...terrainData,
    });

    return terrain;
  }

  async getTerrainsByUser(userId) {
    const terrains = await Terrain.find({ userId }).sort({ createdAt: -1 });
    return terrains;
  }

  async getTerrainById(terrainId) {
    const terrain = await Terrain.findById(terrainId);
    if (!terrain) {
      throw new ErrorHandler('Terrain not found', 404);
    }
    return terrain;
  }

  async updateTerrain(terrainId, updateData) {
    const terrain = await Terrain.findByIdAndUpdate(terrainId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!terrain) {
      throw new ErrorHandler('Terrain not found', 404);
    }

    return terrain;
  }

  async deleteTerrain(terrainId) {
    const terrain = await Terrain.findByIdAndDelete(terrainId);

    if (!terrain) {
      throw new ErrorHandler('Terrain not found', 404);
    }

    return terrain;
  }
}

module.exports = new TerrainService();
