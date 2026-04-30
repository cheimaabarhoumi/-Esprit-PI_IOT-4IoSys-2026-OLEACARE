const express = require('express');
const { body } = require('express-validator');
const iotController = require('../controllers/iotController');
const { verifyIoTKey } = require('../middleware/iotAuth');

const router = express.Router();

// Protect IoT endpoint with API Key
router.post(
  '/data',
  verifyIoTKey,
  [
    body('kitId').notEmpty(),
    body('terrainId').notEmpty(),
    body('temperature').isFloat(),
    body('humidity_air').isFloat(),
    body('soil_moisture').isFloat(),
    body('light').isFloat(),
  ],
  iotController.receiveSensorData
);

module.exports = router;
