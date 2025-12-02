const express = require('express');
const router = express.Router();
const { authenticateDepartmentHead } = require('../middleware/auth');
const {
  getAllTimetableSlots,
  getTimetableSlotById,
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
  checkConflicts
} = require('../controllers/timetableController');

// All routes require authentication
router.use(authenticateDepartmentHead);

// GET /api/timetable
router.get('/', getAllTimetableSlots);

// GET /api/timetable/conflicts
router.get('/conflicts', checkConflicts);

// GET /api/timetable/:id
router.get('/:id', getTimetableSlotById);

// POST /api/timetable
router.post('/', createTimetableSlot);

// PUT /api/timetable/:id
router.put('/:id', updateTimetableSlot);

// DELETE /api/timetable/:id
router.delete('/:id', deleteTimetableSlot);

module.exports = router;
