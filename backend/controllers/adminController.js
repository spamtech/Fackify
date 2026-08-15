import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get all users and like activity for Admin
// @route   GET /api/admin/activity
// @access  Private (Admin only)
export const getAdminActivity = asyncHandler(async (req, res) => {
  // 1. Fetch all users with their like count
  const usersResult = await query(`
    SELECT 
      u.id, 
      u.username, 
      u.email, 
      u.role, 
      u.created_at, 
      COALESCE(u.last_login, u.created_at) AS last_login,
      COUNT(l.song_id)::int AS liked_songs_count
    FROM users u
    LEFT JOIN likes l ON u.id = l.user_id
    GROUP BY u.id, u.username, u.email, u.role, u.created_at, u.last_login
    ORDER BY u.created_at DESC
  `);

  // 2. Fetch all like activity logs
  const likesActivity = await query(`
    SELECT 
      l.created_at AS liked_at,
      u.id AS user_id,
      u.username,
      u.email,
      s.id AS song_id,
      s.title AS song_title,
      s.artist AS song_artist,
      s.thumbnail_url,
      s.source_type
    FROM likes l
    JOIN users u ON l.user_id = u.id
    JOIN songs s ON l.song_id = s.id
    ORDER BY l.created_at DESC
  `);

  res.status(200).json({
    success: true,
    users: usersResult.rows,
    likeActivities: likesActivity.rows,
  });
});

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be user or admin.',
      });
    }

    // IMPORTANT:
    // Replace this with your actual database query.
    // Example for Neon PostgreSQL using your existing pool:
    const result = await pool.query(
      `
      UPDATE users
      SET role = $1
      WHERE id = $2
      RETURNING id, name, email, role
      `,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user: result.rows[0],
    });

  } catch (error) {
    console.error('Update user role error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update user role',
    });
  }
};