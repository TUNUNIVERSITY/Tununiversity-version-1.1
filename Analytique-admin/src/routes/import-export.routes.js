const express = require('express');
const router = express.Router();
const multer = require('multer');
const importExportController = require('../controllers/import-export.controller');

// Configure multer for file uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// ==================== STUDENTS ROUTES ====================
router.post('/students/import', upload.single('file'), importExportController.importStudents);
router.get('/students/export', importExportController.exportStudents);

// ==================== TEACHERS ROUTES ====================
router.post('/teachers/import', upload.single('file'), importExportController.importTeachers);
router.get('/teachers/export', importExportController.exportTeachers);

// ==================== DEPARTMENT HEADS ROUTES ====================
router.post('/department-heads/import', upload.single('file'), importExportController.importDepartmentHeads);
router.get('/department-heads/export', importExportController.exportDepartmentHeads);

// ==================== GROUPS ROUTES ====================
router.post('/groups/import', upload.single('file'), importExportController.importGroups);
router.get('/groups/export', importExportController.exportGroups);

// ==================== ROOMS ROUTES ====================
router.post('/rooms/import', upload.single('file'), importExportController.importRooms);
router.get('/rooms/export', importExportController.exportRooms);

// ==================== SUBJECTS ROUTES ====================
router.post('/subjects/import', upload.single('file'), importExportController.importSubjects);
router.get('/subjects/export', importExportController.exportSubjects);

module.exports = router;
