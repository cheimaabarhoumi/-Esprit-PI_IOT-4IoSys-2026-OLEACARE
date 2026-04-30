// Socket.io Real-time Data Utility
const broadcast = (io, event, data, room = null) => {
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
};

const broadcastSensorData = (io, terrainId, sensorData) => {
  broadcast(io, 'sensor-data-update', sensorData, `terrain-${terrainId}`);
};

const broadcastPredictionUpdate = (io, terrainId, prediction) => {
  broadcast(io, 'prediction-update', prediction, `terrain-${terrainId}`);
};

const broadcastAlert = (io, userId, alert) => {
  broadcast(io, 'new-alert', alert, `user-${userId}`);
};

const broadcastKitStatus = (io, kitId, status) => {
  broadcast(io, 'kit-status-update', { kitId, status }, 'admin-panel');
};

module.exports = {
  broadcastSensorData,
  broadcastPredictionUpdate,
  broadcastAlert,
  broadcastKitStatus,
};
