const express = require('express');
const router = express.Router();
const { authenticateDepartmentHead } = require('../middleware/auth');
const {
  getAllSpecialties,
  getSpecialtyById
} = require('../controllers/specialtiesController');

// All routes require authentication
router.use(authenticateDepartmentHead);

// GET /api/specialties
router.get('/', getAllSpecialties);

// GET /api/specialties/:id
router.get('/:id', getSpecialtyById);

module.exports = router;
