const express = require('express');
const router = express.Router();
const { authenticateDepartmentHead } = require('../middleware/auth');
const {
  getAllStudents,
  getStudentById,
  getStudentStats
} = require('../controllers/studentsController');

// All routes require authentication
router.use(authenticateDepartmentHead);

// GET /api/students
router.get('/', getAllStudents);

// GET /api/students/:id
router.get('/:id', getStudentById);

// GET /api/students/:id/stats
router.get('/:id/stats', getStudentStats);

// DELETE /api/students/:id
const { deleteStudent } = require('../controllers/studentsController');
router.delete('/:id', deleteStudent);

module.exports = router;
