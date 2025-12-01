const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Verify JWT token and check if user is a department head
 */
const authenticateDepartmentHead = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7);

    // FOR TESTING: Accept mock token without verification
    if (token.includes('mock_signature_for_testing')) {
      // Mock user data for testing (matches frontend mock user)
      req.user = {
        id: 1,
        email: 'head@department.com',
        first_name: 'Department',
        last_name: 'Head',
        role: 'department_head',
        is_active: true,
        department_id: 1,
        department_name: 'Computer Science',
        department_code: 'CS'
      };
      return next();
    }

    // Verify token (for real tokens from auth service)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is a department head
    const result = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active,
              d.id as department_id, d.name as department_name, d.code as department_code
       FROM users u
       LEFT JOIN departments d ON d.head_id = u.id
       WHERE u.id = $1 AND u.role = 'department_head' AND u.is_active = true`,
      [decoded.userId || decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        error: 'Access denied. User is not an active department head.' 
      });
    }

    // Attach user info to request
    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Optional: Verify token without strict role check (for shared endpoints)
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await db.query(
      'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId || decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'User not found or inactive.' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  authenticateDepartmentHead,
  authenticateUser
};
