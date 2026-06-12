const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/jwt');
const UserModel = require('../models/userModel');

/**
 * @desc Register a new user (candidate, recruiter, or admin)
 * @route POST /auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await UserModel.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const allowedRoles = ['candidate', 'recruiter', 'admin'];
  const finalRole = allowedRoles.includes(role) ? role : 'candidate';

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await UserModel.create({ name, email, hashedPassword, role: finalRole });

  const token = generateToken({ id: user.id, role: user.role });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user, token }
  });
});

/**
 * @desc Login and receive a JWT
 * @route POST /auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.is_active) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken({ id: user.id, role: user.role });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    }
  });
});

/**
 * @desc Get current authenticated user's profile
 * @route GET /profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.status(200).json({ success: true, data: user });
});

module.exports = { register, login, getProfile };
