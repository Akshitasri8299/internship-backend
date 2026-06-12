/**
 * Custom error class for predictable, structured API errors.
 * Usage: throw new ApiError(404, 'Internship not found');
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}

module.exports = ApiError;
