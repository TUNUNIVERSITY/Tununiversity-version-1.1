const express = require('express');
const router = express.Router();
const { authenticateDepartmentHead } = require('../middleware/auth');
const {
  getAllAbsenceRequests,
  getAbsenceRequestById,
  approveAbsenceRequest,
  rejectAbsenceRequest,
  getAllMakeupSessions
} = require('../controllers/requestsController');

// All routes require authentication
router.use(authenticateDepartmentHead);

// GET /api/requests/absence
router.get('/absence', getAllAbsenceRequests);

// GET /api/requests/absence/:id
router.get('/absence/:id', getAbsenceRequestById);

// POST /api/requests/absence/:id/approve
router.post('/absence/:id/approve', approveAbsenceRequest);

// POST /api/requests/absence/:id/reject
router.post('/absence/:id/reject', rejectAbsenceRequest);

// GET /api/requests/makeup-sessions
router.get('/makeup-sessions', getAllMakeupSessions);

// GET /api/requests/makeup-sessions/:id
const { getMakeupSessionById, approveMakeupSession, rejectMakeupSession } = require('../controllers/requestsController');
router.get('/makeup-sessions/:id', getMakeupSessionById);

// POST /api/requests/makeup-sessions/:id/approve
router.post('/makeup-sessions/:id/approve', approveMakeupSession);

// POST /api/requests/makeup-sessions/:id/reject
router.post('/makeup-sessions/:id/reject', rejectMakeupSession);

module.exports = router;
