import { query, pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ============================================================
// GET ADMIN PLATFORM STATISTICS
// GET /api/admin/stats
// Admin only
// ============================================================

export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    usersCount,
    songsCount,
    playlistsCount,
    likesCount,
    artistsCount,
  ] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM users'),
    query('SELECT COUNT(*)::int AS count FROM songs'),
    query('SELECT COUNT(*)::int AS count FROM playlists'),
    query('SELECT COUNT(*)::int AS count FROM likes'),
    query('SELECT COUNT(*)::int AS count FROM artists'),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers: usersCount.rows[0]?.count || 0,
      totalSongs: songsCount.rows[0]?.count || 0,
      totalPlaylists: playlistsCount.rows[0]?.count || 0,
      totalLikes: likesCount.rows[0]?.count || 0,
      totalArtists: artistsCount.rows[0]?.count || 0,
    },
  });
});


// ============================================================
// GET ALL REGISTERED USERS
// GET /api/admin/users
// Admin only
// ============================================================

export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await query(
    `
    SELECT
      id,
      username,
      email,
      role,
      is_premium,
      premium_requested,
      avatar_url,
      blocked,
      created_at,
      last_login,
      last_active_at
    FROM users
    ORDER BY created_at DESC
    `
  );

  res.status(200).json({
    success: true,
    count: result.rows.length,
    users: result.rows,
  });
});


// ============================================================
// GET ALL LIKES ACTIVITY
// GET /api/admin/likes-activity
// Admin only
// ============================================================

export const getAllLikesActivity = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT
      l.user_id,
      l.song_id,
      l.created_at AS liked_at,

      u.username,
      u.email,

      s.title AS song_title,
      s.artist AS song_artist,
      s.thumbnail_url,
      s.source_type

    FROM likes l

    JOIN users u
      ON l.user_id = u.id

    JOIN songs s
      ON l.song_id = s.id

    ORDER BY l.created_at DESC
  `);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    likes: result.rows,
  });
});


// ============================================================
// GET COMPLETE USER DETAILS
// GET /api/admin/users/:id/details
// Admin only
// ============================================================

export const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ----------------------------------------------------------
  // USER
  // ----------------------------------------------------------

  const userRes = await query(
    `
    SELECT
      id,
      username,
      email,
      role,
      is_premium,
      premium_requested,
      avatar_url,
      password,
      blocked,
      created_at,
      last_login,
      last_active_at
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  if (userRes.rowCount === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  const user = userRes.rows[0];


  // ----------------------------------------------------------
  // USER PLAYLISTS
  // ----------------------------------------------------------

  const playlistsRes = await query(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.is_public,
      p.created_at,

      COUNT(ps.song_id)::int AS song_count

    FROM playlists p

    LEFT JOIN playlist_songs ps
      ON p.id = ps.playlist_id

    WHERE p.user_id = $1

    GROUP BY p.id

    ORDER BY p.created_at DESC
    `,
    [id]
  );


  // ----------------------------------------------------------
  // USER LIKED SONGS
  // ----------------------------------------------------------

  const likedSongsRes = await query(
    `
    SELECT
      s.id,
      s.title,
      s.artist,
      s.source_url,
      s.source_type,
      s.thumbnail_url,

      l.created_at AS liked_at

    FROM likes l

    JOIN songs s
      ON l.song_id = s.id

    WHERE l.user_id = $1

    ORDER BY l.created_at DESC
    `,
    [id]
  );


  // ----------------------------------------------------------
  // RESPONSE
  // ----------------------------------------------------------

  res.status(200).json({
    success: true,

    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_premium: Boolean(user.is_premium),
      premium_requested: Boolean(user.premium_requested),
      avatar_url: user.avatar_url,
      blocked: user.blocked,
      created_at: user.created_at,
      last_login: user.last_login,
      last_active_at: user.last_active_at,
      password_hash: user.password,
    },

    playlists: playlistsRes.rows,
    likedSongs: likedSongsRes.rows,
  });
});


// ============================================================
// UPDATE USER ROLE
// PUT /api/admin/users/:id/role
// Admin only
// ============================================================

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (
    !role ||
    !['admin', 'user'].includes(
      String(role).toLowerCase()
    )
  ) {
    res.status(400);
    throw new Error(
      "Invalid role. Role must be 'admin' or 'user'"
    );
  }

  const result = await query(
    `
    UPDATE users
    SET role = $1
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
      last_login,
      last_active_at
    `,
    [
      String(role).toLowerCase(),
      id,
    ]
  );

  if (result.rowCount === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    user: result.rows[0],
  });
});


// ============================================================
// UPDATE USER FACKIFY PREMIUM STATUS
// PUT /api/admin/users/:id/premium
// Admin only
// ============================================================

export const updateUserPremiumStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isPremium = req.body.isPremium ?? req.body.is_premium;

  if (typeof isPremium !== 'boolean') {
    res.status(400);
    throw new Error('isPremium must be a boolean value (true/false)');
  }

  // When approving or toggling premium, clear the pending request flag
  const result = await query(
    `
    UPDATE users
    SET 
      is_premium = $1,
      premium_requested = FALSE
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
      last_login,
      last_active_at
    `,
    [isPremium, id]
  );

  if (result.rowCount === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    message: isPremium
      ? 'Fackify Premium approved successfully'
      : 'Fackify Premium revoked successfully',
    user: result.rows[0],
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
    throw new Error(
      'blocked must be a boolean'
    );
  }

  if (
    String(id) === String(req.user.id)
  ) {
    res.status(400);
    throw new Error(
      'You cannot block your own account'
    );
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
      last_login,
      last_active_at
    `,
    [
      blocked,
      id,
    ]
  );

  if (result.rowCount === 0) {
    res.status(404);
    throw new Error(
      'User not found'
    );
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

  if (
    String(id) === String(req.user.id)
  ) {
    res.status(400);
    throw new Error(
      'You cannot delete your own admin account'
    );
  }

  const userResult = await query(
    `
    SELECT
      id,
      username,
      email,
      role
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  if (userResult.rowCount === 0) {
    res.status(404);
    throw new Error(
      'User not found'
    );
  }

  const user = userResult.rows[0];

  if (user.role === 'admin') {
    res.status(403);
    throw new Error(
      'Admin accounts cannot be deleted from this dashboard'
    );
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `
      DELETE FROM likes
      WHERE user_id = $1
      `,
      [id]
    );

    await client.query(
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

    await client.query(
      `
      DELETE FROM playlists
      WHERE user_id = $1
      `,
      [id]
    );

    const deleteResult = await client.query(
      `
      DELETE FROM users
      WHERE id = $1

      RETURNING
        id,
        username,
        email,
        role,
        is_premium,
        premium_requested,
        avatar_url
      `,
      [id]
    );

    if (deleteResult.rowCount === 0) {
      throw new Error(
        'User could not be deleted'
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message:
        `User "${user.username}" and all associated personal data were deleted successfully`,
      user: deleteResult.rows[0],
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(
      '❌ Delete user transaction failed:',
      error
    );
    throw error;
  } finally {
    client.release();
  }
});