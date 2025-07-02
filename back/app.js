const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();
connectDB();
const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/formations', require('./routes/formationRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/student-schedules', require('./routes/studentScheduleRoutes'));
app.use('/api/preinscriptions', require('./routes/preinscriptionRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/payment-alerts', require('./routes/paymentAlertRoutes'));
app.use('/api/teacher-spaces', require('./routes/teacherSpaceRoutes'));
app.use('/api/qcms', require('./routes/qcmRoutes'));
app.use('/api/qcm-submissions', require('./routes/qcmRoutes')); // QCM submissions use the same controller
app.use('/api/qcm-results', require('./routes/qcmRoutes')); // QCM results use the same controller
app.use('/api/statistics', require('./routes/statisticsRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'IPforma API is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

