import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';

// Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ============================================================
// REGISTER USER
// POST /api/auth/register
// ACCESS: Public
// ============================================================

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please provide username, email, and password');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  if (cleanUsername.length < 3) {
    res.status(400);
    throw new Error('Username must be at least 3 characters');
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters');
  }

  // Check existing user
  const existing = await query(
    `
    SELECT id
    FROM users
    WHERE LOWER(email) = $1
       OR LOWER(username) = LOWER($2)
    `,
    [cleanEmail, cleanUsername]
  );

  if (existing.rows.length > 0) {
    res.status(400);
    throw new Error(
      'User with this email or username already exists'
    );
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user with default is_premium = FALSE, premium_requested = FALSE
  const newUser = await query(
    `
    INSERT INTO users
      (username, email, password, role, is_premium, premium_requested, last_login)
    VALUES
      ($1, $2, $3, $4, FALSE, FALSE, NOW())
    RETURNING id, username, email, role, is_premium, premium_requested, avatar_url, created_at, last_login
    `,
    [
      cleanUsername,
      cleanEmail,
      hashedPassword,
      'user',
    ]
  );

  const user = newUser.rows[0];

  // Generate Fackify JWT + HTTP-only cookie
  generateToken(res, user);

  res.status(201).json({
    success: true,
    user,
  });
});

// ============================================================
// LOGIN USER / ADMIN
// POST /api/auth/login
// ACCESS: Public
// ============================================================

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const cleanEmail = email.trim().toLowerCase();

  const result = await query(
    `
    SELECT *
    FROM users
    WHERE LOWER(email) = $1
    `,
    [cleanEmail]
  );

  const user = result.rows[0];

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Google-only account
  if (!user.password) {
    res.status(401);
    throw new Error(
      'This account uses Google Sign-In. Please continue with Google.'
    );
  }

  const isPasswordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Update last login and return is_premium and premium_requested
  const updatedUser = await query(
    `
    UPDATE users
    SET last_login = NOW()
    WHERE id = $1
    RETURNING 
      id, 
      username, 
      email, 
      role, 
      is_premium, 
      premium_requested,
      avatar_url,
      bio, 
      created_at, 
      last_login, 
      COALESCE(total_listening_seconds, 0)::int AS total_listening_seconds
    `,
    [user.id]
  );

  const loggedInUser = updatedUser.rows[0];

  // Generate Fackify JWT + HTTP-only cookie
  generateToken(res, loggedInUser);

  res.status(200).json({
    success: true,
    user: loggedInUser,
  });
});

// ============================================================
// GOOGLE LOGIN
// POST /api/auth/google
// ACCESS: Public
// ============================================================

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Google credential is required');
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('GOOGLE_CLIENT_ID is missing from environment');

    res.status(500);
    throw new Error(
      'Google authentication is not configured on the server'
    );
  }

  let payload;

  try {
    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    payload = ticket.getPayload();
  } catch (error) {
    console.error('Google token verification failed:', error.message);

    res.status(401);
    throw new Error('Invalid Google authentication token');
  }

  if (!payload) {
    res.status(401);
    throw new Error('Invalid Google account information');
  }

  const {
    sub: googleId,
    email,
    email_verified: emailVerified,
    name,
    given_name: givenName,
    picture,
  } = payload;

  // Basic validation
  if (!googleId || !email) {
    res.status(401);
    throw new Error('Google account information is incomplete');
  }

  // We require a verified Google email.
  if (!emailVerified) {
    res.status(401);
    throw new Error('Your Google email address is not verified');
  }

  const cleanEmail = email.trim().toLowerCase();

  // ----------------------------------------------------------
  // Find existing account by email
  // ----------------------------------------------------------

  const existingResult = await query(
    `
    SELECT
      id,
      username,
      email,
      password,
      role,
      is_premium,
      premium_requested,
      avatar_url,
      bio,
      created_at,
      last_login
    FROM users
    WHERE LOWER(email) = $1
    LIMIT 1
    `,
    [cleanEmail]
  );

  let user;

  // ----------------------------------------------------------
  // Existing Fackify account
  // ----------------------------------------------------------

  if (existingResult.rows.length > 0) {
    const existingUser = existingResult.rows[0];

    const updatedResult = await query(
      `
      UPDATE users
      SET 
        last_login = NOW(),
        avatar_url = COALESCE($2, avatar_url)
      WHERE id = $1
      RETURNING 
        id, 
        username, 
        email, 
        role, 
        is_premium, 
        premium_requested,
        avatar_url,
        bio, 
        created_at, 
        last_login, 
        COALESCE(total_listening_seconds, 0)::int AS total_listening_seconds
      `,
      [existingUser.id, picture || null]
    );

    user = updatedResult.rows[0];
  }

  // ----------------------------------------------------------
  // New Google account
  // ----------------------------------------------------------

  else {
    let username = '';

    if (givenName) {
      username = givenName.trim();
    } else if (name) {
      username = name.trim();
    } else {
      username = cleanEmail.split('@')[0];
    }

    // Remove characters that aren't ideal for username
    username = username
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 30);

    if (username.length < 3) {
      username = `user${Math.floor(
        100000 + Math.random() * 900000
      )}`;
    }

    // Make username unique
    const usernameResult = await query(
      `
      SELECT id
      FROM users
      WHERE LOWER(username) = LOWER($1)
      LIMIT 1
      `,
      [username]
    );

    if (usernameResult.rows.length > 0) {
      username = `${username}${Math.floor(
        1000 + Math.random() * 9000
      )}`;
    }

    const newUserResult = await query(
      `
      INSERT INTO users
        (
          username,
          email,
          password,
          role,
          is_premium,
          premium_requested,
          avatar_url,
          last_login
        )
      VALUES
        ($1, $2, NULL, 'user', FALSE, FALSE, $3, NOW())
      RETURNING
        id,
        username,
        email,
        role,
        is_premium,
        premium_requested,
        avatar_url,
        bio,
        created_at,
        last_login,
        COALESCE(total_listening_seconds, 0)::int AS total_listening_seconds
      `,
      [
        username,
        cleanEmail,
        picture || null,
      ]
    );

    user = newUserResult.rows[0];
  }

  // Generate Fackify JWT + HTTP-only cookie
  generateToken(res, user);

  res.status(200).json({
    success: true,
    user,
  });
});

// ============================================================
// LOGOUT
// POST /api/auth/logout
// ACCESS: Public
// ============================================================

export const logoutUser = asyncHandler(async (req, res) => {
  const isProduction =
    process.env.NODE_ENV === 'production';

  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
    maxAge: 0,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ============================================================
// GET CURRENT USER
// GET /api/auth/me
// ACCESS: Private
// ============================================================

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  const userResult = await query(
    `
    SELECT
      id,
      username,
      email,
      role,
      is_premium,
      premium_requested,
      avatar_url,
      bio,
      created_at,
      last_login,
      COALESCE(total_listening_seconds, 0)::int AS total_listening_seconds
    FROM users
    WHERE id = $1
    `,
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

// ============================================================
// REQUEST FACKIFY PREMIUM
// POST /api/auth/request-premium
// ACCESS: Private
// ============================================================

export const requestPremium = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401);
    throw new Error('Authentication required');
  }

  const updateResult = await query(
    `
    UPDATE users
    SET premium_requested = TRUE
    WHERE id = $1
    RETURNING
      id,
      username,
      email,
      role,
      is_premium,
      premium_requested,
      avatar_url,
      bio,
      created_at,
      last_login,
      COALESCE(total_listening_seconds, 0)::int AS total_listening_seconds
    `,
    [userId]
  );

  if (updateResult.rows.length === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    message: 'Fackify Premium request submitted successfully',
    user: updateResult.rows[0],
  });
});

// ============================================================
// UPDATE USER PROFILE (USERNAME & BIO)
// PUT /api/auth/profile
// ACCESS: Private
// ============================================================

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { username, bio } = req.body;

  if (!userId) {
    res.status(401);
    throw new Error('Authentication required');
  }

  const cleanUsername = username ? username.trim() : null;
  const cleanBio = bio !== undefined ? bio.trim() : null;

  if (cleanUsername && cleanUsername.length < 3) {
    res.status(400);
    throw new Error('Username must be at least 3 characters');
  }

  // If username is changing, ensure it is not taken by another user
  if (cleanUsername) {
    const existing = await query(
      `
      SELECT id
      FROM users
      WHERE LOWER(username) = LOWER($1) AND id != $2
      LIMIT 1
      `,
      [cleanUsername, userId]
    );

    if (existing.rows.length > 0) {
      res.status(400);
      throw new Error('Username is already taken');
    }
  }

  // Update profile with COALESCE to keep existing values if unchanged
  const updateResult = await query(
    `
    UPDATE users
    SET
      username = COALESCE($1, username),
      bio = COALESCE($2, bio)
    WHERE id = $3
    RETURNING
      id,
      username,
      email,
      role,
      is_premium,
      premium_requested,
      avatar_url,
      bio,
      created_at,
      last_login,
      COALESCE(total_listening_seconds, 0)::int AS total_listening_seconds
    `,
    [cleanUsername, cleanBio, userId]
  );

  if (updateResult.rows.length === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: updateResult.rows[0],
  });
});

// ============================================================
// BLOCK / UNBLOCK USER
// PUT /api/admin/users/:id/block
// Admin only
// ============================================================

export const updateUserBlockStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { blocked } = req.body;

  if (typeof blocked !== 'boolean') {
    res.status(400);
    throw new Error('blocked must be a boolean');
  }

  // Prevent admin from blocking themselves
  if (String(id) === String(req.user.id)) {
    res.status(400);
    throw new Error('You cannot block your own account');
  }

  const result = await query(
    `
    UPDATE users
    SET blocked = $1
    WHERE id = $2
    RETURNING
      id,
      username,
      email,
      role,
      is_premium,
      premium_requested,
      avatar_url,
      blocked,
      created_at,
      last_login
    `,
    [blocked, id]
  );

  if (result.rowCount === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    message: blocked
      ? 'User blocked successfully'
      : 'User unblocked successfully',
    user: result.rows[0],
  });
});

// ============================================================
// DELETE USER
// DELETE /api/admin/users/:id
// Admin only
// ============================================================

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (String(id) === String(req.user.id)) {
    res.status(400);
    throw new Error('You cannot delete your own admin account');
  }

  // Check user exists
  const userResult = await query(
    `
    SELECT id, username, email, role
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  if (userResult.rowCount === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  const user = userResult.rows[0];

  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Admin accounts cannot be deleted from this dashboard');
  }

  await query('DELETE FROM likes WHERE user_id = $1', [id]);

  await query(
    `
    DELETE FROM playlist_songs
    WHERE playlist_id IN (
      SELECT id
      FROM playlists
      WHERE user_id = $1
    )
    `,
    [id]
  );

  await query(
    `
    DELETE FROM playlists
    WHERE user_id = $1
    `,
    [id]
  );

  const deleteResult = await query(
    `
    DELETE FROM users
    WHERE id = $1
    RETURNING id, username, email, role, is_premium, premium_requested, avatar_url
    `,
    [id]
  );

  if (deleteResult.rowCount === 0) {
    res.status(404);
    throw new Error('User could not be deleted');
  }

  res.status(200).json({
    success: true,
    message: `User "${user.username}" deleted successfully`,
    user: deleteResult.rows[0],
  });
});

// ============================================================
// UPDATE USER ACTIVITY / HEARTBEAT
// POST /api/auth/heartbeat
// ACCESS: Private
// ============================================================

export const updateActivity = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401);
    throw new Error('Authentication required');
  }

  await query(
    `
    UPDATE users
    SET last_active_at = NOW()
    WHERE id = $1
    `,
    [userId]
  );

  res.status(200).json({
    success: true,
    message: 'Activity updated',
  });
});