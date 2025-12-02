const express = require('express');
const router = express.Router();
const absenceRequestController = require('../controllers/absenceRequestController');
const { validate } = require('../middleware/validation');
const { reviewAbsenceRequestSchema } = require('../validators/schemas');

// Absence request review routes
router.put('/:id/approve', validate(reviewAbsenceRequestSchema), absenceRequestController.approveAbsenceRequest);
router.put('/:id/reject', validate(reviewAbsenceRequestSchema), absenceRequestController.rejectAbsenceRequest);

module.exports = router;
