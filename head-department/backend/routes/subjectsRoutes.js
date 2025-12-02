const express = require('express');
const router = express.Router();
const { authenticateDepartmentHead } = require('../middleware/auth');
const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectsController');

// All routes require authentication
router.use(authenticateDepartmentHead);

// GET /api/subjects
router.get('/', getAllSubjects);

// GET /api/subjects/:id
router.get('/:id', getSubjectById);

// POST /api/subjects
router.post('/', createSubject);

// PUT /api/subjects/:id
router.put('/:id', updateSubject);

// DELETE /api/subjects/:id
router.delete('/:id', deleteSubject);

module.exports = router;
