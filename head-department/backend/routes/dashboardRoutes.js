const express = require('express');
const router = express.Router();
const { authenticateDepartmentHead } = require('../middleware/auth');
const {
  getDashboardStats,
  getRecentActivity,
  getUpcomingSessions
} = require('../controllers/dashboardController');

// All routes require authentication
router.use(authenticateDepartmentHead);

// GET /api/dashboard/stats
router.get('/stats', getDashboardStats);

// GET /api/dashboard/activity
router.get('/activity', getRecentActivity);

// GET /api/dashboard/upcoming-sessions
router.get('/upcoming-sessions', getUpcomingSessions);

module.exports = router;
