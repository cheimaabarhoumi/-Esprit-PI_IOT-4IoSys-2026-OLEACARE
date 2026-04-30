const { verifyToken } = require('../config/jwt');
const { ErrorHandler } = require('../utils/errorHandler');

const verifyAuthToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new ErrorHandler('No token provided', 401));
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    next(new ErrorHandler(error.message, 401));
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return next(new ErrorHandler('Admin access only', 403));
  }
  next();
};

const verifyFarmer = (req, res, next) => {
  if (req.userRole !== 'farmer') {
    return next(new ErrorHandler('Farmer access only', 403));
  }
  next();
};

module.exports = {
  verifyAuthToken,
  verifyAdmin,
  verifyFarmer
};
