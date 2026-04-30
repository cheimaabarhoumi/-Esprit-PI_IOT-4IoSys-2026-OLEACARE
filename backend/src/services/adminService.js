const User = require('../models/User');
const { ErrorHandler } = require('../utils/errorHandler');

class AdminService {
  async getAllUsers(skip = 0, limit = 10) {
    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    return {
      data: users,
      pagination: { total, skip, limit, pages: Math.ceil(total / limit) },
    };
  }

  async createUser(userData) {
    const userExists = await User.findOne({ email: userData.email });
    if (userExists) {
      throw new ErrorHandler('Email already in use', 400);
    }

    const user = await User.create(userData);
    return user;
  }

  async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new ErrorHandler('User not found', 404);
    }

    return user;
  }

  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw new ErrorHandler('User not found', 404);
    }

    return user;
  }

  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler('User not found', 404);
    }
    return user;
  }
}

module.exports = new AdminService();
