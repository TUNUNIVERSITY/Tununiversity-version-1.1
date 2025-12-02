const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Complete Dashboard Overview
router.get('/', dashboardController.getDashboardOverview);

// Students per Department
router.get('/students-per-department', dashboardController.getStudentsPerDepartment);

// Absences per Month
router.get('/absences-per-month', dashboardController.getAbsencesPerMonth);

// Success Rate by Level
router.get('/success-rate-by-level', dashboardController.getSuccessRateByLevel);

// Top Students per Department
router.get('/top-students', dashboardController.getTopStudentsPerDepartment);

// Teacher Workload
router.get('/teacher-workload', dashboardController.getTeacherWorkload);

// Room Usage Statistics
router.get('/room-usage', dashboardController.getRoomUsageStatistics);

// Timetable Occupancy Rate
router.get('/timetable-occupancy', dashboardController.getTimetableOccupancyRate);

// Recent Activities
router.get('/recent-activities', dashboardController.getRecentActivities);

module.exports = router;
