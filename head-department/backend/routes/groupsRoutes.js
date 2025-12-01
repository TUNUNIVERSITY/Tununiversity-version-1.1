const express = require('express');
const router = express.Router();
const { authenticateDepartmentHead } = require('../middleware/auth');
const {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup
} = require('../controllers/groupsController');

// All routes require authentication
router.use(authenticateDepartmentHead);

// GET /api/groups
router.get('/', getAllGroups);

// GET /api/groups/:id
router.get('/:id', getGroupById);

// POST /api/groups
router.post('/', createGroup);

// PUT /api/groups/:id
router.put('/:id', updateGroup);

// DELETE /api/groups/:id
router.delete('/:id', deleteGroup);

module.exports = router;
