const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIO = require('socket.io');

const connectDB = require('./config/database');
const { errorMiddleware } = require('./utils/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const iotRoutes = require('./routes/iotRoutes');
const predictRoutes = require('./routes/predictRoutes');

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: process.env.CORS_ORIGIN },
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/iot', iotRoutes);
// Live ML proxy (POST /predict-live)

app.use('/api/farmer/predict-live', predictRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error middleware
app.use(errorMiddleware);

// Socket.io setup
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-terrain', (terrainId) => {
    socket.join(`terrain-${terrainId}`);
    console.log(`Socket ${socket.id} joined terrain-${terrainId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Export io for other modules
app.io = io;

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Socket.io listening on port ${PORT}`);
});

module.exports = { app, io };
