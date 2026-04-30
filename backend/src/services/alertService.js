const Alert = require('../models/Alert');
const { ErrorHandler } = require('../utils/errorHandler');

class AlertService {
  async createAlert(alertData) {
    const alert = await Alert.create(alertData);
    return alert.populate('userId terrainId');
  }

  async getUserAlerts(userId, skip = 0, limit = 10) {
    const alerts = await Alert.find({ userId })
      .populate('terrainId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Alert.countDocuments({ userId });

    return {
      data: alerts,
      pagination: { total, skip, limit, pages: Math.ceil(total / limit) },
    };
  }

  async markAlertAsRead(alertId) {
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      { read: true },
      { new: true }
    );

    if (!alert) {
      throw new ErrorHandler('Alert not found', 404);
    }

    return alert;
  }

  async getUnreadAlertsCount(userId) {
    const count = await Alert.countDocuments({ userId, read: false });
    return count;
  }

  async createBatteryAlert(userId, terrainId, batteryPercent) {
    return await this.createAlert({
      userId,
      terrainId,
      type: 'battery',
      message: `Kit battery low: ${batteryPercent}%`,
    });
  }

  async createOfflineAlert(userId, terrainId) {
    return await this.createAlert({
      userId,
      terrainId,
      type: 'offline',
      message: 'Kit is offline. Please check the device.',
    });
  }

  async createSoilAlert(userId, terrainId, soilMoisture) {
    return await this.createAlert({
      userId,
      terrainId,
      type: 'soil',
      message: `Soil moisture critical: ${soilMoisture}%. Check irrigation.`,
    });
  }
}

module.exports = new AlertService();
