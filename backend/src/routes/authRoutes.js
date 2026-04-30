const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyAuthToken } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty().trim().escape(),
    body('lastName').notEmpty().trim().escape(),
    body('nickname').optional().trim().escape(),
    body('phoneNumber').optional().trim(),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('zipCode').optional().trim(),
    body('profileImage').optional().trim(),
    body('profileImageMime').optional().trim(),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  authController.login
);

router.post(
  '/verify-email',
  [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  authController.verifyEmail
);

router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail(),
  ],
  authController.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).isNumeric(),
    body('newPassword').isLength({ min: 6 }),
  ],
  authController.resetPassword
);

router.get('/me', verifyAuthToken, authController.getMe);

router.put(
  '/profile',
  verifyAuthToken,
  [
    body('firstName').optional().notEmpty().trim().escape(),
    body('lastName').optional().notEmpty().trim().escape(),
    body('phoneNumber').optional().trim(),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('zipCode').optional().trim(),
    body('bio').optional().trim(),
    body('website').optional().trim(),
  ],
  authController.updateProfile
);

router.put('/profile-image', verifyAuthToken, authController.updateProfileImage);

module.exports = router;
