const sensorService = require('../services/sensorService');
const kitService = require('../services/kitService');
const alertService = require('../services/alertService');

exports.receiveSensorData = async (req, res, next) => {
  try {
    const { kitId, terrainId, ...sensorData } = req.body;

    // Save sensor reading
    const reading = await sensorService.saveSensorData({
      kitId,
      terrainId,
      ...sensorData,
      timestamp: new Date(),
    });

    // Update kit status and last seen
    await kitService.updateKitStatus(kitId, 'active', {
      lastSeen: new Date(),
    });

    // Check for critical conditions
    if (sensorData.soil_moisture < 30) {
      // Find kit user
      const kit = await kitService.getKitById(require('mongoose').Types.ObjectId.isValid(kitId) ? kitId : null);
      if (kit && kit.assignedTo) {
        await alertService.createSoilAlert(kit.assignedTo._id, terrainId, sensorData.soil_moisture);
      }
    }

    res.status(201).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};
