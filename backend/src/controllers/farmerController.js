const kitService = require('../services/kitService');
const terrainService = require('../services/terrainService');
const sensorService = require('../services/sensorService');
const predictionService = require('../services/predictionService');
const alertService = require('../services/alertService');

// Kits
exports.getMyKits = async (req, res, next) => {
  try {
    const kits = await kitService.getKitsByFarmer(req.userId);
    res.status(200).json({
      success: true,
      data: kits,
    });
  } catch (error) {
    next(error);
  }
};

exports.assignKitToTerrain = async (req, res, next) => {
  try {
    const { terrainId } = req.body;
    const kit = await kitService.assignKitToFarmerTerrain(
      req.params.kitId,
      req.userId,
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

exports.unassignKitFromTerrain = async (req, res, next) => {
  try {
    const kit = await kitService.unassignKitFromFarmerTerrain(
      req.params.kitId,
      req.userId
    );

    res.status(200).json({
      success: true,
      data: kit,
    });
  } catch (error) {
    next(error);
  }
};

// Terrains
exports.getTerrains = async (req, res, next) => {
  try {
    const terrains = await terrainService.getTerrainsByUser(req.userId);
    res.status(200).json({
      success: true,
      data: terrains,
    });
  } catch (error) {
    next(error);
  }
};

exports.createTerrain = async (req, res, next) => {
  try {
    const terrain = await terrainService.createTerrain(req.userId, req.body);
    res.status(201).json({
      success: true,
      data: terrain,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTerrain = async (req, res, next) => {
  try {
    const terrain = await terrainService.updateTerrain(
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      data: terrain,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTerrain = async (req, res, next) => {
  try {
    const terrain = await terrainService.deleteTerrain(req.params.id);
    res.status(200).json({
      success: true,
      data: terrain,
    });
  } catch (error) {
    next(error);
  }
};

// Sensors
exports.getLatestSensorData = async (req, res, next) => {
  try {
    const readings = await sensorService.getLatestSensorData(
      req.params.terrainId,
      50
    );
    res.status(200).json({
      success: true,
      data: readings,
    });
  } catch (error) {
    next(error);
  }
};

// Predictions
exports.getLatestPrediction = async (req, res, next) => {
  try {
    const prediction = await predictionService.getLatestPrediction(
      req.params.terrainId
    );
    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPredictions = async (req, res, next) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const result = await predictionService.getAllPredictions(
      req.params.terrainId,
      skip,
      limit
    );
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

exports.generatePrediction = async (req, res, next) => {
  try {
    const terrain = await terrainService.getTerrainById(
      req.params.terrainId
    );

    const latestReading = await sensorService.getLatestReading(
      req.params.terrainId
    );

    const prediction = await predictionService.generatePrediction(
      req.params.terrainId,
      req.userId,
      latestReading,
      terrain.surface_hectares || 1.0
    );

    res.status(201).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
};

// Alerts
exports.getAlerts = async (req, res, next) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const result = await alertService.getUserAlerts(req.userId, skip, limit);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

exports.markAlertAsRead = async (req, res, next) => {
  try {
    const alert = await alertService.markAlertAsRead(req.params.alertId);
    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await alertService.getUnreadAlertsCount(req.userId);
    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};

// YOLO Detection
const axios = require('axios');

exports.runYoloDetection = async (req, res, next) => {
  try {
    const { terrainId } = req.params;
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    // Verify terrain belongs to farmer
    const terrain = await terrainService.getTerrainById(terrainId);
    if (!terrain || terrain.farmer_id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Terrain not found or unauthorized'
      });
    }

    // Call ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    const response = await axios.post(`${mlServiceUrl}/yolo/detect-base64`, {
      image: image
    });

    res.status(200).json({
      success: true,
      data: response.data.data || response.data
    });
  } catch (error) {
    console.error('YOLO Detection Error:', error.message);
    next(error);
  }
};

exports.getLatestYoloDetection = async (req, res, next) => {
  try {
    const { terrainId } = req.params;

    // Verify terrain belongs to farmer
    const terrain = await terrainService.getTerrainById(terrainId);
    if (!terrain || terrain.farmer_id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Terrain not found or unauthorized'
      });
    }

    // TODO: Implement database query to get latest YOLO detection
    // For now, return mock data
    res.status(200).json({
      success: true,
      data: {
        status: 'success',
        total_detected: 0,
        avg_confidence: 0,
        dominant_color: 'unknown',
        detections: [],
        message: 'No detection data available yet'
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.checkYoloHealth = async (req, res, next) => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    const response = await axios.get(`${mlServiceUrl}/yolo/health`);

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: 'YOLO service unavailable',
      error: error.message
    });
  }
};
