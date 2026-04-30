#!/usr/bin/env node

/**
 * Seed script for OleaCare - Create admin test account
 * Run: node backend/seed.js
 */

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple User schema for seeding
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  farmName: String,
  role: { type: String, enum: ['admin', 'farmer'], default: 'farmer' },
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

async function seedAdminUser() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/oleacare';
    console.log(`Connecting to MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✓ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@oleacare.com' });
    if (existingAdmin) {
      console.log('⚠ Admin user already exists - updating verification status');
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      console.log('✓ Admin user updated successfully!');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    // Create admin user
    const adminUser = new User({
      email: 'admin@oleacare.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'OleaCare',
      farmName: 'OleaCare Central',
      role: 'admin',
      isVerified: true,
      createdAt: new Date()
    });

    await adminUser.save();
    console.log('✓ Admin user created successfully!');
    console.log('');
    console.log('📧 Email: admin@oleacare.com');
    console.log('🔐 Password: Admin@123');
    console.log('');
    console.log('Login at: http://localhost:4200 (or 4201)');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
}

seedAdminUser();
