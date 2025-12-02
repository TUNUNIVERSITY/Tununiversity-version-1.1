/**
 * Middleware to authorize user by role
 * @param {...string} allowedRoles - Roles allowed to access the route
 */
export function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    try {
      // Check if user is authenticated (should be set by authMiddleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
      });
    }
  };
}
