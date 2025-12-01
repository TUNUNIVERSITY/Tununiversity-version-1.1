import pool from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken, generateRandomToken } from '../utils/jwt.js';
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  sendLoginNotificationEmail 
} from './emailService.js';

/**
 * Login with CIN, password, and role
 * @param {string} cin - User CIN
 * @param {string} password - Plain text password
 * @param {string} role - User role (student, teacher, admin, department_head)
 * @returns {Promise<Object>} - User data and JWT token
 */
export async function loginUser(cin, password, role) {
  try {
    // Find user by CIN and role
    const result = await pool.query(
      'SELECT * FROM users WHERE cin = $1 AND role = $2',
      [cin, role]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid CIN, password, or role. User not found.');
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid CIN or password');
    }

    // Check if email is verified
    if (!user.is_verified) {
      // Send verification email only if not verified
      await sendVerificationEmailToCin(cin);
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      cin: user.cin,
      role: user.role,
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        cin: user.cin,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: user.is_verified,
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Send verification email by CIN
 * @param {string} cin - User CIN
 * @returns {Promise<Object>}
 */
export async function sendVerificationEmailToCin(cin) {
  try {
    // Find user by CIN
    const result = await pool.query(
      'SELECT * FROM users WHERE cin = $1',
      [cin]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.is_verified) {
      throw new Error('Email already verified');
    }

    // Delete any existing verification tokens for this user
    await pool.query(
      'DELETE FROM verification_tokens WHERE user_id = $1',
      [user.id]
    );

    // Generate verification token
    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database
    await pool.query(
      'INSERT INTO verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // Send verification email
    await sendVerificationEmail(user.email, user.first_name, token);

    return {
      success: true,
      message: `Verification email sent to ${user.email}`,
      email: user.email,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Verify email with token
 * @param {string} token - Verification token
 * @returns {Promise<Object>}
 */
export async function verifyEmail(token) {
  try {
    // Find token in database
    const result = await pool.query(
      `SELECT vt.*, u.email, u.first_name 
       FROM verification_tokens vt
       JOIN users u ON vt.user_id = u.id
       WHERE vt.token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired verification token');
    }

    const tokenData = result.rows[0];

    // Check if token has expired
    if (new Date() > new Date(tokenData.expires_at)) {
      // Delete expired token
      await pool.query('DELETE FROM verification_tokens WHERE token = $1', [token]);
      throw new Error('Verification token has expired');
    }

    // Mark user as verified
    await pool.query(
      'UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [tokenData.user_id]
    );

    // Delete used token
    await pool.query('DELETE FROM verification_tokens WHERE token = $1', [token]);

    return {
      success: true,
      message: 'Email verified successfully! You can now login.',
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Request password reset by CIN
 * @param {string} cin - User CIN
 * @returns {Promise<Object>}
 */
export async function requestPasswordReset(cin) {
  try {
    // Find user by CIN
    const result = await pool.query(
      'SELECT * FROM users WHERE cin = $1',
      [cin]
    );

    if (result.rows.length === 0) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message: 'If the CIN exists, a password reset email has been sent.',
      };
    }

    const user = result.rows[0];

    // Delete any existing reset tokens for this user
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1',
      [user.id]
    );

    // Generate reset token
    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.first_name, token);

    return {
      success: true,
      message: `Password reset email sent to ${user.email}`,
      email: user.email,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New plain text password
 * @returns {Promise<Object>}
 */
export async function resetPassword(token, newPassword) {
  try {
    // Find token in database
    const result = await pool.query(
      `SELECT prt.*, u.cin 
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    const tokenData = result.rows[0];

    // Check if token has expired
    if (new Date() > new Date(tokenData.expires_at)) {
      // Delete expired token
      await pool.query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);
      throw new Error('Reset token has expired');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, tokenData.user_id]
    );

    // Delete used token
    await pool.query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);

    return {
      success: true,
      message: 'Password reset successfully! You can now login with your new password.',
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get user profile by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>}
 */
export async function getUserProfile(userId) {
  try {
    const result = await pool.query(
      'SELECT id, cin, email, first_name, last_name, role, is_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return {
      success: true,
      user: result.rows[0],
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Logout user - Set is_verified to false
 * @param {number} userId - User ID
 * @returns {Promise<Object>}
 */
export async function logoutUser(userId) {
  try {
    // Set is_verified to false
    await pool.query(
      'UPDATE users SET is_verified = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    // Delete any existing verification tokens for this user
    await pool.query(
      'DELETE FROM verification_tokens WHERE user_id = $1',
      [userId]
    );

    return {
      success: true,
      message: 'Logged out successfully. You will need to verify your email on next login.',
    };
  } catch (error) {
    throw error;
  }
}
