import { validationResult } from 'express-validator';
import * as authService from '../services/authService.js';

/**
 * Login controller - Login with CIN, password, and role
 */
export async function login(req, res) {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { cin, password, role } = req.body;

    const result = await authService.loginUser(cin, password, role);

    // Return the complete user info (firstName and lastName already included in service)
    res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'EMAIL_NOT_VERIFIED') {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. A verification email has been sent to your registered email address.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    res.status(401).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
}

/**
 * Send verification email controller
 */
export async function sendVerificationEmail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { cin } = req.body;

    const result = await authService.sendVerificationEmailToCin(cin);

    res.status(200).json(result);
  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send verification email',
    });
  }
}

/**
 * Verify email controller
 */
export async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    const result = await authService.verifyEmail(token);

    res.status(200).json(result);
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Email verification failed',
    });
  }
}

/**
 * Request password reset controller
 */
export async function requestPasswordReset(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { cin } = req.body;

    const result = await authService.requestPasswordReset(cin);

    res.status(200).json(result);
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to request password reset',
    });
  }
}

/**
 * Reset password controller
 */
export async function resetPassword(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { token, newPassword } = req.body;

    const result = await authService.resetPassword(token, newPassword);

    res.status(200).json(result);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Password reset failed',
    });
  }
}

/**
 * Get user profile controller
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user.id; // From auth middleware

    const result = await authService.getUserProfile(userId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get user profile',
    });
  }
}

/**
 * Logout controller - Set is_verified to false
 */
export async function logout(req, res) {
  try {
    const userId = req.user.id; // From auth middleware

    const result = await authService.logoutUser(userId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Logout error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Logout failed',
    });
  }
}
