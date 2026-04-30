const Kit = require('../models/Kit');
const Terrain = require('../models/Terrain');
const { ErrorHandler } = require('../utils/errorHandler');

class KitService {
  async getAllKits(skip = 0, limit = 10) {
    const kits = await Kit.find()
      .populate('assignedTo', 'firstName lastName email farmName')
      .populate('terrainId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Kit.countDocuments();

    return {
      data: kits,
      pagination: { total, skip, limit, pages: Math.ceil(total / limit) },
    };
  }

  async createKit(kitData) {
    const kitExists = await Kit.findOne({ kitId: kitData.kitId });
    if (kitExists) {
      throw new ErrorHandler('Kit ID already exists', 400);
    }

    const kit = await Kit.create(kitData);
    return kit;
  }

  async assignKitToFarmer(kitId, farmerId, terrainId) {
    const kit = await Kit.findById(kitId);
    if (!kit) {
      throw new ErrorHandler('Kit not found', 404);
    }

    kit.assignedTo = farmerId || null;
    kit.terrainId = terrainId || null;
    kit.status = 'assigned';

    await kit.save();
    return await kit.populate('assignedTo', 'firstName lastName email');
  }

  async updateKit(id, kitData) {
    const kit = await Kit.findById(id);
    if (!kit) {
      throw new ErrorHandler('Kit not found', 404);
    }
    const { kitId, ...updateData } = kitData;
    Object.assign(kit, updateData);
    await kit.save();
    return await Kit.findById(id).populate('assignedTo', 'firstName lastName email');
  }

  async deleteKit(id) {
    const kit = await Kit.findByIdAndDelete(id);
    if (!kit) {
      throw new ErrorHandler('Kit not found', 404);
    }
    return kit;
  }

  async updateKitStatus(kitId, status, data = {}) {
    const kit = await Kit.findOne({ kitId });
    if (!kit) {
      throw new ErrorHandler('Kit not found', 404);
    }

    kit.status = status;
    Object.assign(kit, data);

    await kit.save();
    return kit;
  }

  async getKitsByFarmer(farmerId) {
    const kits = await Kit.find({ assignedTo: farmerId })
      .populate('terrainId', 'name variety');

    return kits;
  }

  async getKitById(kitId) {
    const kit = await Kit.findById(kitId)
      .populate('assignedTo', 'firstName lastName email farmName')
      .populate('terrainId', 'name variety location');

    if (!kit) {
      throw new ErrorHandler('Kit not found', 404);
    }

    return kit;
  }

  async assignKitToFarmerTerrain(kitId, farmerId, terrainId) {
    const kit = await Kit.findById(kitId);
    if (!kit) {
      throw new ErrorHandler('Kit not found', 404);
    }

    if (!kit.assignedTo || kit.assignedTo.toString() !== farmerId) {
      throw new ErrorHandler('You are not allowed to manage this kit', 403);
    }

    const terrain = await Terrain.findById(terrainId);
    if (!terrain) {
      throw new ErrorHandler('Terrain not found', 404);
    }

    if (terrain.userId.toString() !== farmerId) {
      throw new ErrorHandler('You can only assign kits to your own terrains', 403);
    }

    kit.terrainId = terrain._id;
    await kit.save();

    return await Kit.findById(kitId)
      .populate('assignedTo', 'firstName lastName email farmName')
      .populate('terrainId', 'name variety location');
  }

  async unassignKitFromFarmerTerrain(kitId, farmerId) {
    const kit = await Kit.findById(kitId);
    if (!kit) {
      throw new ErrorHandler('Kit not found', 404);
    }

    if (!kit.assignedTo || kit.assignedTo.toString() !== farmerId) {
      throw new ErrorHandler('You are not allowed to manage this kit', 403);
    }

    kit.terrainId = null;
    await kit.save();

    return await Kit.findById(kitId)
      .populate('assignedTo', 'firstName lastName email farmName')
      .populate('terrainId', 'name variety location');
  }
}

module.exports = new KitService();
