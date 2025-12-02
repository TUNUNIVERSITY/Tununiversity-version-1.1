const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

// Complete Analytics Overview
router.get('/', analyticsController.getCompleteAnalytics);

// Students Analytics
router.get('/students', analyticsController.getStudentsAnalytics);

// Absences Analytics
router.get('/absences', analyticsController.getAbsencesAnalytics);

// Grades Analytics
router.get('/grades', analyticsController.getGradesAnalytics);

// Teachers & Subjects Analytics
router.get('/teachers-subjects', analyticsController.getTeachersAndSubjectsAnalytics);

// Notifications & Messaging Analytics
router.get('/notifications-messaging', analyticsController.getNotificationsAndMessagingAnalytics);

module.exports = router;
