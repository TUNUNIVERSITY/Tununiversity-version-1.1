import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware to authenticate JWT token
 */
export function authenticateToken(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Attach user info to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    return res.status(403).json({
      success: false,
      message: error.message || 'Invalid or expired token',
    });
  }
}
