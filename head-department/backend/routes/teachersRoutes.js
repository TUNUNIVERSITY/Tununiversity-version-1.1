const express = require('express');
const router = express.Router();
const { authenticateDepartmentHead } = require('../middleware/auth');
const {
  getAllTeachers,
  getTeacherById,
  getTeacherStats
} = require('../controllers/teachersController');

// All routes require authentication
router.use(authenticateDepartmentHead);

// GET /api/teachers
router.get('/', getAllTeachers);

// GET /api/teachers/:id
router.get('/:id', getTeacherById);

// GET /api/teachers/:id/stats
router.get('/:id/stats', getTeacherStats);

// DELETE /api/teachers/:id
const { deleteTeacher } = require('../controllers/teachersController');
router.delete('/:id', deleteTeacher);

module.exports = router;
