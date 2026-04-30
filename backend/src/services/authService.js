const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { ErrorHandler } = require('../utils/errorHandler');
const emailService = require('./emailService');
const crypto = require('crypto');

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName, farmName, nickname, phoneNumber, address, city, zipCode, profileImage, profileImageMime } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.isVerified) {
        throw new ErrorHandler('User already exists', 400);
      }

      // Supprime l'ancien compte non vérifié pour permettre une nouvelle inscription
      await User.findByIdAndDelete(userExists._id);
    }

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      email,
      password,
      role: 'farmer',
      firstName,
      lastName,
      nickname,
      farmName,
      phoneNumber,
      address,
      city,
      zipCode,
      profileImage,
      profileImageMime,
      verificationCode,
      codeExpiresAt,
      isVerified: false,
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationCode);
    } catch (error) {
      // If email fails, delete the user
      await User.findByIdAndDelete(user._id);
      throw new ErrorHandler('Failed to send verification email', 500);
    }

    return { message: 'Registration successful. Please check your email for verification code.' };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new ErrorHandler('Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ErrorHandler('Invalid credentials', 401);
    }

    if (!user.isVerified && user.role !== 'admin') {
      throw new ErrorHandler('Please verify your email before logging in', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ErrorHandler('Invalid credentials', 401);
    }

    user.password = undefined;
    const token = generateToken(user._id, user.role);

    return { user, token };
  }

  async verifyEmail(email, code) {
    const user = await User.findOne({ email, verificationCode: code });
    if (!user) {
      throw new ErrorHandler('Invalid verification code', 400);
    }

    if (user.codeExpiresAt < new Date()) {
      throw new ErrorHandler('Verification code has expired', 400);
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.codeExpiresAt = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    return { user, token };
  }

  async sendPasswordReset(email) {
    if (!email) {
      throw new ErrorHandler('Please provide an email', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      // generic response for security
      return { message: 'If your email exists, you will receive a password reset code.' };
    }

    const resetPasswordCode = crypto.randomInt(100000, 999999).toString();
    const resetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordCode = resetPasswordCode;
    user.resetCodeExpiresAt = resetCodeExpiresAt;
    await user.save();

    try {
      await emailService.sendPasswordResetEmail(email, resetPasswordCode);
    } catch (error) {
      throw new ErrorHandler('Failed to send password reset email', 500);
    }

    return { message: 'Password reset code sent. Please check your email.' };
  }

  async resetPassword(email, code, newPassword) {
    if (!email || !code || !newPassword) {
      throw new ErrorHandler('Please provide email, code and new password', 400);
    }

    const user = await User.findOne({ email, resetPasswordCode: code }).select('+password');
    if (!user) {
      throw new ErrorHandler('Invalid password reset code', 400);
    }

    if (user.resetCodeExpiresAt < new Date()) {
      throw new ErrorHandler('Password reset code has expired', 400);
    }

    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetCodeExpiresAt = undefined;
    await user.save();

    return { message: 'Password has been reset successfully. Please sign in with your new password.' };
  }

  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler('User not found', 404);
    }
    return user;
  }

  async updateProfile(userId, profileData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler('User not found', 404);
    }

    // Champs autorisés pour la mise à jour
    const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'address', 'city', 'zipCode', 'bio', 'website', 'farmName'];
    
    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        user[field] = profileData[field];
      }
    });

    await user.save();
    return user;
  }

  async updateProfileImage(userId, imageData, imageMime) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler('User not found', 404);
    }

    if (imageData === null || imageData === '') {
      user.profileImage = null;
      user.profileImageMime = null;
    } else {
      user.profileImage = imageData;
      user.profileImageMime = imageMime;
    }

    await user.save();
    return user;
  }
}

module.exports = new AuthService();
