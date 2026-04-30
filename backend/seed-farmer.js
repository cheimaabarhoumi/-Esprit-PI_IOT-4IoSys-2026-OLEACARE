#!/usr/bin/env node

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  farmName: String,
  role: { type: String, enum: ['admin', 'farmer'], default: 'farmer' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

async function seedFarmer() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/oleacare';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const existingFarmer = await User.findOne({ email: 'farmer@oleacare.com' });
    if (existingFarmer) {
      console.log('⚠ Farmer user already exists');
      await mongoose.disconnect();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Farmer@123', salt);

    const farmerUser = new User({
      email: 'farmer@oleacare.com',
      password: hashedPassword,
      firstName: 'Ahmed',
      lastName: 'Farmer',
      farmName: 'Domaine Ben Salem',
      role: 'farmer',
      createdAt: new Date()
    });

    await farmerUser.save();
    console.log('✓ Farmer user created successfully!');
    console.log('');
    console.log('📧 Email: farmer@oleacare.com');
    console.log('🔐 Password: Farmer@123');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding farmer user:', error.message);
    process.exit(1);
  }
}

seedFarmer();
