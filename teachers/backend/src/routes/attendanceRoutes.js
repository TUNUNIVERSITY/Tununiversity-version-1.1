const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Attendance routes
router.get('/sessions/:sessionId/attendance', attendanceController.getSessionAttendance);
router.post('/sessions/:sessionId/attendance/mark', attendanceController.markAttendance);
router.post('/sessions/:sessionId/attendance/bulk', attendanceController.markBulkAttendance);
router.get('/sessions/:sessionId/attendance/statistics', attendanceController.getStatistics);
router.get('/students/:studentId/attendance/history', attendanceController.getStudentHistory);

module.exports = router;
