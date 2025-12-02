const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const absenceController = require('../controllers/absenceController');

// Session detail route
router.get('/:session_id', sessionController.getSessionDetails);

// Session absences route
router.get('/:session_id/absences', absenceController.getSessionAbsences);

module.exports = router;
