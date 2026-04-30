const Prediction = require('../models/Prediction');
const Alert = require('../models/Alert');
const path = require('path');
const { spawn } = require('child_process');
const { ErrorHandler } = require('../utils/errorHandler');

class PredictionService {
  async callPythonMLBridge(payload) {
    const pythonExecutable =
      process.env.ML_PYTHON_EXECUTABLE ||
      process.env.PYTHON_EXECUTABLE ||
      'python';

    const bridgePath =
      process.env.ML_BRIDGE_PATH ||
      path.resolve(__dirname, '../../../ml-service/app.py');

    return new Promise((resolve, reject) => {
      const processHandle = spawn(
        pythonExecutable,
        [bridgePath, 'full_prediction'],
        { env: process.env }
      );

      let stdout = '';
      let stderr = '';

      processHandle.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      processHandle.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      processHandle.on('error', (error) => {
        reject(new Error(`Failed to launch ML bridge: ${error.message}`));
      });

      processHandle.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`ML bridge failed: ${stderr || stdout || 'Unknown error'}`));
        }

        try {
          const parsed = JSON.parse(stdout || '{}');
          resolve(parsed);
        } catch {
          reject(new Error(`Invalid ML bridge JSON output: ${stdout}`));
        }
      });

      processHandle.stdin.write(JSON.stringify(payload));
      processHandle.stdin.end();
    });
  }

  async generatePrediction(terrainId, userId, sensorData, terrainHectares = 1.0) {
    try {
      const mlResult = await this.callPythonMLBridge({
        temperature: sensorData.temperature,
        humidity: sensorData.humidity_air,
        soil_moisture: sensorData.soil_moisture,
        light: sensorData.light,
        terrain_hectares: terrainHectares,
      });

      const qualityData = mlResult.quality || {};
      const quantityData = mlResult.quantity || {};

      const prediction = await Prediction.create({
        terrainId,
        userId,
        maturity_index: qualityData.maturity_index,
        quality_grade: qualityData.quality_grade,
        quality_score: qualityData.quality_score,
        acidity: qualityData.acidity,
        total_oil_liters: quantityData.total_oil_liters,
        oil_value_TND: quantityData.oil_value_TND,
        optimal_harvest_date: qualityData.optimal_harvest_date,
        confidence: qualityData.confidence,
      });

      // Create alert if harvest is close
      if (qualityData.maturity_index > 0.85) {
        await Alert.create({
          userId,
          terrainId,
          type: 'harvest',
          message: `Terrain ready for harvest! Maturity index: ${(qualityData.maturity_index * 100).toFixed(1)}%`,
        });
      }

      return prediction;
    } catch (error) {
      throw new ErrorHandler(
        `Failed to generate prediction: ${error.message}`,
        500
      );
    }
  }

  async getLatestPrediction(terrainId) {
    const prediction = await Prediction.findOne({ terrainId })
      .sort({ createdAt: -1 })
      .populate('terrainId', 'name variety')
      .populate('userId', 'firstName lastName farmName');

    if (!prediction) {
      throw new ErrorHandler('No predictions found for this terrain', 404);
    }

    return prediction;
  }

  async getAllPredictions(terrainId, skip = 0, limit = 10) {
    const predictions = await Prediction.find({ terrainId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prediction.countDocuments({ terrainId });

    return {
      data: predictions,
      pagination: { total, skip, limit, pages: Math.ceil(total / limit) },
    };
  }
}

module.exports = new PredictionService();
