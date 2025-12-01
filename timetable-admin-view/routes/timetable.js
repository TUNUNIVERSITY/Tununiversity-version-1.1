// routes/timetable.js
const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

// List views
router.get('/teachers', timetableController.listTeachers);
router.get('/students', timetableController.listStudents);
router.get('/groups', timetableController.listGroups);

// Timetable views
router.get('/teacher/:teacherId', timetableController.getTeacherTimetable);
router.get('/student/:studentId', timetableController.getStudentTimetable);
router.get('/group/:groupId', timetableController.getGroupTimetable);

// Management routes
router.get('/manage', timetableController.manageView);
router.post('/slot/create', timetableController.createSlot);
router.post('/slot/update/:id', timetableController.updateSlot);
router.post('/slot/delete/:id', timetableController.deleteSlot);

// API endpoints for AJAX
router.get('/api/teachers', timetableController.getTeachersAPI);
router.get('/api/groups', timetableController.getGroupsAPI);
router.get('/api/subjects/:levelId', timetableController.getSubjectsByLevel);
router.get('/api/rooms', timetableController.getRoomsAPI);

module.exports = router;