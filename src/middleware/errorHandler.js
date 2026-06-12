const ApiError = require('../utils/ApiError');

/**
 * Global error-handling middleware.
 * Ensures every error response follows the structure:
 * { "success": false, "message": "...", "errors": [...] (optional) }
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Handle known PostgreSQL errors
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Duplicate entry: resource already exists';
  } else if (err.code === '23503') {
    statusCode = 400;
    message = 'Invalid reference: related resource does not exist';
  }

  if (!statusCode) statusCode = 500;
  if (!message) message = 'Internal server error';

  const response = {
    success: false,
    message
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  if (process.env.NODE_ENV === 'development' && !(err instanceof ApiError)) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

const notFound = (req, res, next) => {
  const err = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(err);
};

module.exports = { errorHandler, notFound };
