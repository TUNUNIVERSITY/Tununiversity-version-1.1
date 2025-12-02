const express = require('express');
const router = express.Router();
const { authenticateDepartmentHead } = require('../middleware/auth');
const {
  getAbsenceAnalytics,
  getRoomOccupancyAnalytics,
  getTeacherWorkloadAnalytics,
  getStudentPerformanceAnalytics,
  getDepartmentSummary
} = require('../controllers/analyticsController');

// All routes require authentication
router.use(authenticateDepartmentHead);

// GET /api/analytics/absences
router.get('/absences', getAbsenceAnalytics);

// GET /api/analytics/room-occupancy
router.get('/room-occupancy', getRoomOccupancyAnalytics);

// GET /api/analytics/teacher-workload
router.get('/teacher-workload', getTeacherWorkloadAnalytics);

// GET /api/analytics/student-performance
router.get('/student-performance', getStudentPerformanceAnalytics);

// GET /api/analytics/summary
router.get('/summary', getDepartmentSummary);

module.exports = router;
