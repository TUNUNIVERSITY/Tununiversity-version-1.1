const express = require('express');
const router = express.Router();
const { authenticateDepartmentHead } = require('../middleware/auth');
const {
  getAllLevels,
  getLevelById
} = require('../controllers/levelsController');

// All routes require authentication
router.use(authenticateDepartmentHead);

// GET /api/levels
router.get('/', getAllLevels);

// GET /api/levels/:id
router.get('/:id', getLevelById);

module.exports = router;
