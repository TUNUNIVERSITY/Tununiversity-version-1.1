const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database errors
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry. Record already exists.',
      error: err.detail,
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Foreign key constraint violation. Referenced record does not exist.',
      error: err.detail,
    });
  }

  if (err.code === '23502') {
    return res.status(400).json({
      success: false,
      message: 'Missing required field.',
      error: err.column,
    });
  }

  // Validation errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
