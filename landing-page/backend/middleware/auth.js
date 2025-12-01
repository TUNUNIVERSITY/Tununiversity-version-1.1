const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

// Middleware to check if user is a student
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Students only.' 
    });
  }
  next();
};

module.exports = { authMiddleware, isStudent };
