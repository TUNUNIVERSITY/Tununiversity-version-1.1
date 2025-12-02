const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

// Absences Report
// GET /api/reports/absences?format=json&startDate=2024-01-01&endDate=2024-12-31&departmentId=1
router.get('/absences', reportsController.getAbsencesReport);

// Grades Report
// GET /api/reports/grades?format=pdf&studentId=123
router.get('/grades', reportsController.getGradesReport);

// Students Report
// GET /api/reports/students?format=csv&departmentId=1&levelId=2
router.get('/students', reportsController.getStudentsReport);

// Teachers & Subjects Report
// GET /api/reports/teachers-subjects?format=json&departmentId=1
router.get('/teachers-subjects', reportsController.getTeachersSubjectsReport);

module.exports = router;
