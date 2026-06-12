const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const pool = require('../config/db');

/**
 * Verifies the JWT from the Authorization header and attaches
 * the authenticated user (id, email, role) to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new ApiError(401, 'Not authorized, token is invalid or expired');
  }

  const { rows } = await pool.query(
    'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
    [decoded.id]
  );

  const user = rows[0];
  if (!user || !user.is_active) {
    throw new ApiError(401, 'Not authorized, user no longer exists or is inactive');
  }

  req.user = user;
  next();
});

module.exports = protect;
