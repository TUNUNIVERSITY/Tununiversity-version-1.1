const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:3007'],
  credentials: true
}));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// IMPORTANT: Don't use express.json() globally - it breaks http-proxy-middleware
// Only parse JSON for specific non-proxy routes if needed

// Service endpoints configuration
const services = {
  landing: process.env.LANDING_SERVICE_URL || 'http://localhost:4001',
  login: process.env.LOGIN_SERVICE_URL || 'http://localhost:4002',
  admin: process.env.ADMIN_FRONTEND_URL || 'http://localhost:3003',
  analytique: process.env.ANALYTIQUE_SERVICE_URL || 'http://localhost:4003',
  timetable: process.env.TIMETABLE_SERVICE_URL || 'http://localhost:4004',
  repository: process.env.REPOSITORY_SERVICE_URL || 'http://localhost:8000',
  student: process.env.STUDENT_SERVICE_URL || 'http://localhost:4006',
  headDepartment: process.env.HEAD_DEPARTMENT_SERVICE_URL || 'http://localhost:4007',
  teacher: process.env.TEACHER_SERVICE_URL || 'http://localhost:4008'
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Gateway is running',
    services: {
      landing: services.landing,
      login: services.login,
      admin: services.admin,
      analytique: services.analytique,
      timetable: services.timetable,
      repository: services.repository,
      student: services.student,
      studentFrontend: services.studentFrontend
    },
    timestamp: new Date().toISOString()
  });
});

// Landing page service - Main authentication API
app.use('/api/auth', createProxyMiddleware({
  target: services.landing,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  onError: (err, req, res) => {
    console.error('Landing service proxy error:', err);
    res.status(503).json({ success: false, message: 'Landing service unavailable' });
  }
}));

app.use('/api/student', createProxyMiddleware({
  target: services.landing,
  changeOrigin: true,
  pathRewrite: {
    '^/api/student': '/api/student'
  }
}));

app.use('/api/events', createProxyMiddleware({
  target: services.landing,
  changeOrigin: true,
  pathRewrite: {
    '^/api/events': '/api/events'
  }
}));

// Login service - Alternative authentication
app.use('/auth', createProxyMiddleware({
  target: services.login,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/auth'
  },
  onError: (err, req, res) => {
    console.error('Login service proxy error:', err);
    res.status(503).json({ success: false, message: 'Login service unavailable' });
  }
}));

// Analytique admin service
app.use('/api/analytics', createProxyMiddleware({
  target: services.analytique,
  changeOrigin: true,
  pathRewrite: {
    '^/api/analytics': '/api/analytics'
  }
}));

app.use('/api/reports', createProxyMiddleware({
  target: services.analytique,
  changeOrigin: true,
  pathRewrite: {
    '^/api/reports': '/api/reports'
  }
}));

app.use('/api/dashboard', createProxyMiddleware({
  target: services.analytique,
  changeOrigin: true,
  pathRewrite: {
    '^/api/dashboard': '/api/dashboard'
  }
}));

app.use('/api/metadata', createProxyMiddleware({
  target: services.analytique,
  changeOrigin: true,
  pathRewrite: {
    '^/api/metadata': '/api/metadata'
  }
}));

app.use('/api/import-export', createProxyMiddleware({
  target: services.analytique,
  changeOrigin: true,
  pathRewrite: {
    '^/api/import-export': '/api/import-export'
  }
}));

// Timetable service
app.use('/api/timetable', createProxyMiddleware({
  target: services.timetable,
  changeOrigin: true,
  pathRewrite: {
    '^/api/timetable': '/timetable'
  }
}));

app.use('/api/pdf', createProxyMiddleware({
  target: services.timetable,
  changeOrigin: true,
  pathRewrite: {
    '^/api/pdf': '/pdf'
  }
}));

// Repository service
app.use('/api/repository', createProxyMiddleware({
  target: services.repository,
  changeOrigin: true,
  pathRewrite: {
    '^/api/repository': '/api'
  }
}));

// Student service - Pass through to backend
app.use('/api/students', createProxyMiddleware({
  target: services.student,
  changeOrigin: true,
  timeout: 120000,
  proxyTimeout: 120000,
  onError: (err, req, res) => {
    console.error('Student service proxy error:', err);
    res.status(503).json({ success: false, message: 'Student service unavailable' });
  }
}));

// Head Department service
app.use('/api/head-department', createProxyMiddleware({
  target: services.headDepartment,
  changeOrigin: true,
  pathRewrite: {
    '^/api/head-department': '/api'
  },
  onError: (err, req, res) => {
    console.error('Head Department service proxy error:', err);
    res.status(503).json({ success: false, message: 'Head Department service unavailable' });
  }
}));

// Teacher service
app.use('/api/teachers', createProxyMiddleware({
  target: services.teacher,
  changeOrigin: true,
  timeout: 120000,
  proxyTimeout: 120000,
  pathRewrite: {
    '^/api/teachers': '/api/teachers'
  },
  onError: (err, req, res) => {
    console.error('Teacher service proxy error:', err);
    res.status(503).json({ success: false, message: 'Teacher service unavailable' });
  }
}));

app.use('/api/sessions', createProxyMiddleware({
  target: services.teacher,
  changeOrigin: true,
  timeout: 120000,
  proxyTimeout: 120000,
  pathRewrite: {
    '^/api/sessions': '/api/sessions'
  }
}));

app.use('/api/absences', createProxyMiddleware({
  target: services.teacher,
  changeOrigin: true,
  timeout: 120000,
  proxyTimeout: 120000,
  pathRewrite: {
    '^/api/absences': '/api/absences'
  }
}));

app.use('/api/absence-requests', createProxyMiddleware({
  target: services.teacher,
  changeOrigin: true,
  timeout: 120000,
  proxyTimeout: 120000,
  pathRewrite: {
    '^/api/absence-requests': '/api/absence-requests'
  }
}));

app.use('/api/makeup-sessions', createProxyMiddleware({
  target: services.teacher,
  changeOrigin: true,
  timeout: 120000,
  proxyTimeout: 120000,
  pathRewrite: {
    '^/api/makeup-sessions': '/api/makeup-sessions'
  }
}));

app.use('/api/messages', createProxyMiddleware({
  target: services.teacher,
  changeOrigin: true,
  timeout: 120000,
  proxyTimeout: 120000,
  pathRewrite: {
    '^/api/messages': '/api/messages'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.path}`);
  }
}));

app.use('/api/attendance', createProxyMiddleware({
  target: services.teacher,
  changeOrigin: true,
  timeout: 120000,
  proxyTimeout: 120000,
  pathRewrite: {
    '^/api/attendance': '/api/attendance'
  }
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'University Platform API Gateway',
    version: '1.0.0',
    documentation: '/health',
    services: {
      landing: '/api/auth, /api/student, /api/events',
      login: '/auth',
      analytique: '/api/analytics, /api/reports, /api/dashboard',
      timetable: '/api/timetable, /api/pdf',
      repository: '/api/repository',
      students: '/api/students',
      headDepartment: '/api/head-department',
      teachers: '/api/teachers, /api/sessions, /api/absences, /api/messages, /api/attendance'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found in API Gateway'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Gateway Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('🚀 UNIVERSITY PLATFORM API GATEWAY');
  console.log('='.repeat(70));
  console.log(`✅ Gateway running on port ${PORT}`);
  console.log(`🌐 Gateway URL: http://localhost:${PORT}`);
  console.log(`📋 Health Check: http://localhost:${PORT}/health`);
  console.log('='.repeat(70));
  console.log('📡 Proxying to services:');
  console.log(`   Landing:         ${services.landing}`);
  console.log(`   Login:           ${services.login}`);
  console.log(`   Admin:           ${services.admin}`);
  console.log(`   Analytique:      ${services.analytique}`);
  console.log(`   Timetable:       ${services.timetable}`);
  console.log(`   Repository:      ${services.repository}`);
  console.log(`   Student:         ${services.student}`);
  console.log(`   Head Department: ${services.headDepartment}`);
  console.log(`   Teacher:         ${services.teacher}`);
  console.log('='.repeat(70));
});

module.exports = app;
