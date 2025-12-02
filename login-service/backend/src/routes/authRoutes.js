import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @route   POST /auth/login
 * @desc    Login with CIN, password, and role
 * @access  Public
 */
router.post(
  '/login',
  [
    body('cin')
      .notEmpty()
      .withMessage('CIN is required')
      .trim(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .notEmpty()
      .withMessage('Role is required')
      .isIn(['student', 'teacher', 'admin', 'department_head'])
      .withMessage('Role must be student, teacher, admin, or department_head'),
  ],
  authController.login
);

/**
 * @route   POST /auth/send-verification
 * @desc    Send verification email by CIN
 * @access  Public
 */
router.post(
  '/send-verification',
  [
    body('cin')
      .notEmpty()
      .withMessage('CIN is required')
      .trim(),
  ],
  authController.sendVerificationEmail
);

/**
 * @route   GET /auth/verify
 * @desc    Verify email with token
 * @access  Public
 */
router.get('/verify', authController.verifyEmail);

/**
 * @route   POST /auth/request-reset
 * @desc    Request password reset by CIN
 * @access  Public
 */
router.post(
  '/request-reset',
  [
    body('cin')
      .notEmpty()
      .withMessage('CIN is required')
      .trim(),
  ],
  authController.requestPasswordReset
);

/**
 * @route   POST /auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  authController.resetPassword
);

/**
 * @route   GET /auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   POST /auth/logout
 * @desc    Logout user (sets is_verified to false)
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   GET /auth/admin
 * @desc    Admin only route (example)
 * @access  Private (Admin only)
 */
router.get(
  '/admin',
  authenticateToken,
  authorizeRole('admin'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Welcome Admin!',
      user: req.user,
    });
  }
);

export default router;
