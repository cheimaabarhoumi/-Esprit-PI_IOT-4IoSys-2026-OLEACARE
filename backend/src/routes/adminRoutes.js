const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { verifyAuthToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Protect all admin routes
router.use(verifyAuthToken, verifyAdmin);

// Users management
router.get('/users', adminController.getAllUsers);

router.post(
  '/users',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty().trim().escape(),
    body('lastName').notEmpty().trim().escape(),
    body('role').isIn(['admin', 'farmer']),
  ],
  adminController.createUser
);

router.put('/users/:id', adminController.updateUser);

router.delete('/users/:id', adminController.deleteUser);

// Kits management
router.get('/kits', adminController.getAllKits);

router.post(
  '/kits',
  [
    body('kitId').notEmpty().trim(),
    body('status').isIn(['in_stock', 'assigned', 'active', 'offline']),
  ],
  adminController.createKit
);

router.put('/kits/:id', adminController.updateKit);

router.delete('/kits/:id', adminController.deleteKit);

router.post(
  '/kits/:id/assign',
  [
    body('farmerId').notEmpty(),
  ],
  adminController.assignKit
);

// Admin terrains route
router.get('/terrains', async (req, res, next) => {
  try {
    const Terrain = require('../models/Terrain');
    const terrains = await Terrain.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: terrains });
  } catch (error) { next(error); }
});

// Statistics
router.get('/stats/kits', adminController.getKitStats);

module.exports = router;
