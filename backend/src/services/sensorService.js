const SensorReading = require('../models/SensorReading');
const { ErrorHandler } = require('../utils/errorHandler');

class SensorService {
  async saveSensorData(sensorData) {
    const reading = await SensorReading.create(sensorData);
    return reading;
  }

  async getLatestSensorData(terrainId, limit = 50) {
    const readings = await SensorReading.find({ terrainId })
      .sort({ timestamp: -1 })
      .limit(limit);

    if (readings.length === 0) {
      throw new ErrorHandler('No sensor data found for this terrain', 404);
    }

    return readings.reverse();
  }

  async getLatestReading(terrainId) {
    const reading = await SensorReading.findOne({ terrainId })
      .sort({ timestamp: -1 });

    if (!reading) {
      throw new ErrorHandler('No sensor data found', 404);
    }

    return reading;
  }

  async getSensorDataByDateRange(terrainId, startDate, endDate) {
    const readings = await SensorReading.find({
      terrainId,
      timestamp: { $gte: startDate, $lte: endDate },
    }).sort({ timestamp: 1 });

    return readings;
  }
}

module.exports = new SensorService();
