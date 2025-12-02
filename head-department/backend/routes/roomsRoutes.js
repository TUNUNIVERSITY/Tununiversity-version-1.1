const express = require('express');
const router = express.Router();
const { authenticateDepartmentHead } = require('../middleware/auth');
const {
  getAllRooms,
  getRoomById,
  checkRoomAvailability
} = require('../controllers/roomsController');

// All routes require authentication
router.use(authenticateDepartmentHead);

// GET /api/rooms
router.get('/', getAllRooms);

// GET /api/rooms/check-availability
router.get('/check-availability', checkRoomAvailability);

// GET /api/rooms/:id
router.get('/:id', getRoomById);

module.exports = router;
