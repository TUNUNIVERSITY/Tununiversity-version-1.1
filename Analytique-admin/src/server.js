const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const analyticsRoutes = require('./routes/analytics.routes');
const reportsRoutes = require('./routes/reports.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const metadataRoutes = require('./routes/metadata.routes');
const importExportRoutes = require('./routes/import-export.routes');
const messageRoutes = require('./routes/message.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('dev'));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'University Analytics & Reports Service',
    version: '1.0.0',
    endpoints: {
      analytics: '/api/analytics',
      reports: '/api/reports',
      dashboard: '/api/dashboard',
      metadata: '/api/metadata',
      importExport: '/api/import-export',
      messages: '/api/messages'
    }
  });
});

app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/metadata', metadataRoutes);
app.use('/api/import-export', importExportRoutes);
app.use('/api/messages', messageRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Analytics Service: http://localhost:${PORT}/api/analytics`);
  console.log(`📄 Reports Service: http://localhost:${PORT}/api/reports`);
  console.log(`📈 Dashboard Service: http://localhost:${PORT}/api/dashboard`);
});

module.exports = app;
