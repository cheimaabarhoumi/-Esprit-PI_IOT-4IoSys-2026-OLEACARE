const express = require('express');
const { body } = require('express-validator');
const farmerController = require('../controllers/farmerController');
const { verifyAuthToken, verifyFarmer } = require('../middleware/auth');

const router = express.Router();

// Protect all farmer routes
router.use(verifyAuthToken, verifyFarmer);

// Kits
router.get('/kits', farmerController.getMyKits);
router.put('/kits/:kitId/terrain', [body('terrainId').notEmpty()], farmerController.assignKitToTerrain);
router.delete('/kits/:kitId/terrain', farmerController.unassignKitFromTerrain);

// Terrains
router.get('/terrains', farmerController.getTerrains);

router.post(
  '/terrains',
  [
    body('name').notEmpty().trim().escape(),
    body('variety').isIn(['Chemlali', 'Koroneiki', 'Arbequina', 'Frantoio', 'Other']),
    body('surface_hectares').isFloat({ min: 0.1 }),
    body('location.latitude').isFloat({ min: -90, max: 90 }),
    body('location.longitude').isFloat({ min: -180, max: 180 }),
  ],
  farmerController.createTerrain
);

router.put('/terrains/:id', farmerController.updateTerrain);

router.delete('/terrains/:id', farmerController.deleteTerrain);

// Sensors
router.get('/sensors/:terrainId/latest', farmerController.getLatestSensorData);

// Predictions
router.get('/predictions/:terrainId/latest', farmerController.getLatestPrediction);

router.get('/predictions/:terrainId', farmerController.getAllPredictions);

router.post('/predictions/:terrainId/generate', farmerController.generatePrediction);

// YOLO Detection Routes
router.post('/yolo/detect/:terrainId', farmerController.runYoloDetection);
router.get('/yolo/latest/:terrainId', farmerController.getLatestYoloDetection);
router.get('/yolo/health', farmerController.checkYoloHealth);

// Alerts
router.get('/alerts', farmerController.getAlerts);

router.put('/alerts/:alertId/read', farmerController.markAlertAsRead);

router.get('/alerts/unread/count', farmerController.getUnreadCount);

module.exports = router;
