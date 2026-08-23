import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ============================================================
// GET USER PROFILE
// GET /api/users/profile
// Private
// ============================================================

export const getUserProfile = asyncHandler(
  async (req, res) => {
    const userId = req.user.id;

    const result = await query(
      `
      SELECT
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,

        (
          SELECT COUNT(*)
          FROM likes l
          WHERE l.user_id = u.id
        )::int AS liked_songs,

        (
          SELECT COUNT(*)
          FROM playlists p
          WHERE p.user_id = u.id
        )::int AS playlists,

        COALESCE(
          (
            SELECT COUNT(*)
            FROM listening_history lh
            WHERE lh.user_id = u.id
          ),
          0
        )::int AS songs_played

      FROM users u
      WHERE u.id = $1
      `,
      [userId]
    );

    if (result.rowCount === 0) {
      res.status(404);

      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      profile: result.rows[0],
    });
  }
);

// ============================================================
// UPDATE PROFILE
// PUT /api/users/profile
// Private
// ============================================================

export const updateUserProfile = asyncHandler(
  async (req, res) => {
    const userId = req.user.id;

    const {
      username,
      email,
    } = req.body;

    if (!username || !username.trim()) {
      res.status(400);

      throw new Error(
        'Username is required'
      );
    }

    if (!email || !email.trim()) {
      res.status(400);

      throw new Error(
        'Email is required'
      );
    }

    const cleanUsername =
      username.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    // --------------------------------------------------------
    // Check username already exists
    // --------------------------------------------------------

    const usernameCheck =
      await query(
        `
        SELECT id
        FROM users
        WHERE LOWER(username) = LOWER($1)
        AND id != $2
        `,
        [
          cleanUsername,
          userId,
        ]
      );

    if (usernameCheck.rowCount > 0) {
      res.status(409);

      throw new Error(
        'Username is already taken'
      );
    }

    // --------------------------------------------------------
    // Check email already exists
    // --------------------------------------------------------

    const emailCheck =
      await query(
        `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
        AND id != $2
        `,
        [
          cleanEmail,
          userId,
        ]
      );

    if (emailCheck.rowCount > 0) {
      res.status(409);

      throw new Error(
        'Email is already in use'
      );
    }

    // --------------------------------------------------------
    // Update
    // --------------------------------------------------------

    const result = await query(
      `
      UPDATE users

      SET
        username = $1,
        email = $2

      WHERE id = $3

      RETURNING
        id,
        username,
        email,
        role,
        created_at
      `,
      [
        cleanUsername,
        cleanEmail,
        userId,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0],
    });
  }
);

// ============================================================
// CHANGE PASSWORD
// PUT /api/users/change-password
// Private
// ============================================================

export const changePassword = asyncHandler(
  async (req, res) => {
    const userId = req.user.id;

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      res.status(400);

      throw new Error(
        'Current password and new password are required'
      );
    }

    if (newPassword.length < 6) {
      res.status(400);

      throw new Error(
        'New password must be at least 6 characters'
      );
    }

    // --------------------------------------------------------
    // Get current password
    // --------------------------------------------------------

    const userResult =
      await query(
        `
        SELECT
          id,
          password
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

    if (userResult.rowCount === 0) {
      res.status(404);

      throw new Error(
        'User not found'
      );
    }

    const user =
      userResult.rows[0];

    // --------------------------------------------------------
    // Verify current password
    // --------------------------------------------------------

    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatches) {
      res.status(401);

      throw new Error(
        'Current password is incorrect'
      );
    }

    // --------------------------------------------------------
    // Hash new password
    // --------------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    // --------------------------------------------------------
    // Save new password
    // --------------------------------------------------------

    await query(
      `
      UPDATE users
      SET password = $1
      WHERE id = $2
      `,
      [
        hashedPassword,
        userId,
      ]
    );

    res.status(200).json({
      success: true,
      message:
        'Password changed successfully',
    });
  }
);