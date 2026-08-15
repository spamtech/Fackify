import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Register standard user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please provide username, email, and password');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  // Check existing user case-insensitively
  const existing = await query(
    'SELECT id FROM users WHERE LOWER(email) = $1 OR LOWER(username) = LOWER($2)',
    [cleanEmail, cleanUsername]
  );

  if (existing.rows.length > 0) {
    res.status(400);
    throw new Error('User with this email or username already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await query(
    'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
    [cleanUsername, cleanEmail, hashedPassword, 'user']
  );

  const token = generateToken(res, newUser.rows[0]);

  res.status(201).json({
    success: true,
    token,
    user: newUser.rows[0],
  });
});

// @desc    Login User or Admin
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const cleanEmail = email.trim().toLowerCase();

  // Case-insensitive email query
  const result = await query(
    'SELECT * FROM users WHERE LOWER(email) = $1',
    [cleanEmail]
  );
  const user = result.rows[0];

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(res, user);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc    Logout User / Admin
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  const userResult = await query(
    'SELECT id, username, email, role FROM users WHERE id = $1',
    [req.user.id]
  );

  if (userResult.rows.length === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    user: userResult.rows[0],
  });
});