const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const sessionController = require('../controllers/sessionController');
const absenceController = require('../controllers/absenceController');
const absenceRequestController = require('../controllers/absenceRequestController');
const makeupSessionController = require('../controllers/makeupSessionController');

// Teacher profile routes
router.get('/by-user/:userId', teacherController.getTeacherByUserId);
router.get('/:id', teacherController.getTeacher);
router.get('/:id/subjects', teacherController.getTeacherSubjects);
router.get('/:id/groups', teacherController.getTeacherGroups);

// Teacher timetable and session routes
router.get('/:id/timetable', sessionController.getTeacherTimetable);
router.get('/:id/sessions/today', sessionController.getTodaySessions);
router.get('/:id/sessions/week', sessionController.getWeekSessions);

// Teacher absence routes
router.get('/:id/absences/reported', absenceController.getReportedAbsences);

// Teacher absence request routes
router.get('/:id/absence-requests', absenceRequestController.getTeacherAbsenceRequests);

// Teacher makeup session routes
router.get('/:id/makeup-sessions', makeupSessionController.getTeacherMakeupSessions);

module.exports = router;
