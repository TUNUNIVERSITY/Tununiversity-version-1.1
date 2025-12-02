const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const pool = require('./config/database');

// Import routes
let teacherRoutes, sessionRoutes, absenceRoutes, absenceRequestRoutes, makeupSessionRoutes, messageRoutes, attendanceRoutes;
try {
  teacherRoutes = require('./routes/teacherRoutes');
  sessionRoutes = require('./routes/sessionRoutes');
  absenceRoutes = require('./routes/absenceRoutes');
  absenceRequestRoutes = require('./routes/absenceRequestRoutes');
  makeupSessionRoutes = require('./routes/makeupSessionRoutes');
  messageRoutes = require('./routes/messageRoutes');
  attendanceRoutes = require('./routes/attendanceRoutes');
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  process.exit(1);
}

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parser middleware with increased size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Teacher Service is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/teachers', teacherRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/absence-requests', absenceRequestRoutes);
app.use('/api/makeup-sessions', makeupSessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/attendance', attendanceRoutes);

// Simple rooms endpoint
app.get('/api/rooms', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM rooms ORDER BY building, name');
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 4008;

app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║   Teacher Service Started Successfully ║
    ╠════════════════════════════════════════╣
    ║   Environment: ${process.env.NODE_ENV || 'development'}
    ║   Port: ${PORT}
    ║   Database: ${process.env.DB_NAME}
    ╚════════════════════════════════════════╝
  `);
});

module.exports = app;
