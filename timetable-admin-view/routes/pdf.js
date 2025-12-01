// routes/pdf.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// PDF export routes
router.get('/teacher/:teacherId', pdfController.generateTeacherPDF);
router.get('/student/:studentId', pdfController.generateStudentPDF);
router.get('/group/:groupId', pdfController.generateGroupPDF);

module.exports = router;