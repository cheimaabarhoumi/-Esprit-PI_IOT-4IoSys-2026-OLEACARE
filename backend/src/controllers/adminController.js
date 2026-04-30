const adminService = require('../services/adminService');
const kitService = require('../services/kitService');

// Users management
exports.getAllUsers = async (req, res, next) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const result = await adminService.getAllUsers(skip, limit);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await adminService.deleteUser(req.params.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Kits management
exports.getAllKits = async (req, res, next) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const result = await kitService.getAllKits(skip, limit);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

exports.createKit = async (req, res, next) => {
  try {
    const kit = await kitService.createKit(req.body);
    res.status(201).json({
      success: true,
      data: kit,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateKit = async (req, res, next) => {
  try {
    const kit = await kitService.updateKit(req.params.id, req.body);
    res.status(200).json({ success: true, data: kit });
  } catch (error) {
    next(error);
  }
};

exports.deleteKit = async (req, res, next) => {
  try {
    const kit = await kitService.deleteKit(req.params.id);
    res.status(200).json({ success: true, data: kit });
  } catch (error) {
    next(error);
  }
};

exports.assignKit = async (req, res, next) => {
  try {
    const { farmerId, terrainId } = req.body;
    const kit = await kitService.assignKitToFarmer(
      req.params.id,
      farmerId,
      terrainId
    );
    res.status(200).json({
      success: true,
      data: kit,
    });
  } catch (error) {
    next(error);
  }
};

exports.getKitStats = async (req, res, next) => {
  try {
    const Kit = require('../models/Kit');
    const stats = await Kit.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const activeBattery = await Kit.countDocuments({
      status: 'active',
      batteryPercent: { $lt: 20 },
    });

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        lowBatteryCount: activeBattery,
      },
    });
  } catch (error) {
    next(error);
  }
};
