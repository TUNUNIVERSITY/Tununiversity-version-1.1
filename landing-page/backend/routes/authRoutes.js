const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// NOTE: Login route removed - authentication is handled by external service
// This service only provides user data endpoints

// Protected routes (require token from external auth service)
router.get('/me', authMiddleware, getMe);

module.exports = router;
