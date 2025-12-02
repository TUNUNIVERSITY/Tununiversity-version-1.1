require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const subjectsRoutes = require('./routes/subjectsRoutes');
const groupsRoutes = require('./routes/groupsRoutes');
const teachersRoutes = require('./routes/teachersRoutes');
const studentsRoutes = require('./routes/studentsRoutes');
const requestsRoutes = require('./routes/requestsRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const roomsRoutes = require('./routes/roomsRoutes');
const levelsRoutes = require('./routes/levelsRoutes');
const specialtiesRoutes = require('./routes/specialtiesRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Department Head Service' });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/levels', levelsRoutes);
app.use('/api/specialties', specialtiesRoutes);
app.use('/api/messages', messageRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found', status: 404 } });
});

app.listen(PORT, () => {
  console.log(`🚀 Department Head Service running on port ${PORT}`);
});
