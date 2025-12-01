const pool = require('../config/database');

// NOTE: Login is handled by external authentication service
// This service only handles fetching user data after authentication

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Protected (requires token from external auth service)
exports.getMe = async (req, res) => {
  try {
    const userQuery = await pool.query(
      'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userQuery.rows[0];

    // If user is a student, get student details
    if (user.role === 'student') {
      const studentQuery = await pool.query(
        `SELECT s.*, sp.name as specialty_name, l.name as level_name, g.name as group_name
         FROM students s
         LEFT JOIN specialties sp ON s.specialty_id = sp.id
         LEFT JOIN levels l ON s.level_id = l.id
         LEFT JOIN groups g ON s.group_id = g.id
         WHERE s.user_id = $1`,
        [user.id]
      );
      user.student = studentQuery.rows[0];
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
