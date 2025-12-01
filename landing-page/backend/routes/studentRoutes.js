const express = require('express');
const router = express.Router();
const { authMiddleware, isStudent } = require('../middleware/auth');
const {
  getSchedule,
  getNotifications,
  markNotificationRead,
  getAbsences,
  requestAbsenceExcuse,
  getGrades,
  getMessages,
  sendMessage,
  getDashboardStats
} = require('../controllers/studentController');

// All routes require authentication and student role
router.use(authMiddleware, isStudent);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Schedule
router.get('/schedule', getSchedule);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

// Absences
router.get('/absences', getAbsences);
router.post('/absences/:id/request-excuse', requestAbsenceExcuse);

// Grades
router.get('/grades', getGrades);

// Messages
router.get('/messages', getMessages);
router.post('/messages', sendMessage);

module.exports = router;
