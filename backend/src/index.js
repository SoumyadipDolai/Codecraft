require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth.routes');
const healthIdRoutes = require('./routes/healthId.routes');
const recordsRoutes = require('./routes/records.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const remindersRoutes = require('./routes/reminders.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'HealthVault API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health-id', healthIdRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/reminders', remindersRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🏥 HealthVault API running on port ${PORT}`);
});

module.exports = app;
