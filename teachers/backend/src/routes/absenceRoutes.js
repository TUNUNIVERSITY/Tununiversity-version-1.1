const express = require('express');
const router = express.Router();
const absenceController = require('../controllers/absenceController');
const { validate } = require('../middleware/validation');
const { reportAbsenceSchema } = require('../validators/schemas');

// Absence reporting routes
router.post('/report', validate(reportAbsenceSchema), absenceController.reportAbsence);

module.exports = router;
