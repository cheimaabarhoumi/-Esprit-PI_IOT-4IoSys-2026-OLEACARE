const { ErrorHandler } = require('../utils/errorHandler');

const verifyIoTKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return next(new ErrorHandler('No API key provided', 401));
  }

  if (apiKey !== process.env.IOT_API_KEY) {
    return next(new ErrorHandler('Invalid API key', 401));
  }

  next();
};

module.exports = { verifyIoTKey };
