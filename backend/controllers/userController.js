import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ============================================================
// GET USER PROFILE SUMMARY (Full DB Aggregation)
// GET /api/users/profile/summary
// Private
// ============================================================
export const getUserProfileSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Fetch User Profile Info & Aggregated Counts
  const userResult = await query(
    `
    SELECT
      u.id,
      u.username,
      u.email,
      u.role,
      u.created_at,
      u.bio,
      (
        SELECT COUNT(*)
        FROM likes l
        WHERE l.user_id = u.id
      )::int AS liked_songs_count,
      (
        SELECT COUNT(*)
        FROM playlists p
        WHERE p.user_id = u.id
      )::int AS playlists_count,
      (
        SELECT COUNT(*)
        FROM songs
      )::int AS total_catalog_songs,
      COALESCE(
        (
          SELECT COUNT(*)
          FROM listening_history lh
          WHERE lh.user_id = u.id
        ),
        0
      )::int AS songs_played_count
    FROM users u
    WHERE u.id = $1
    `,
    [userId]
  );

  if (userResult.rowCount === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  const user = userResult.rows[0];

  // 2. Fetch User's Liked Songs (with song & artist metadata)
  const likedSongsResult = await query(
    `
    SELECT 
      s.id,
      s.title,
      s.thumbnail_url,
      s.source_url,
      s.source_type,
      l.created_at AS liked_at,
      COALESCE(
        (
          SELECT string_agg(a.name, ', ')
          FROM song_artists sa
          JOIN artists a ON a.id = sa.artist_id
          WHERE sa.song_id = s.id
        ),
        s.artist,
        'Unknown Artist'
      ) AS artist
    FROM likes l
    JOIN songs s ON s.id = l.song_id
    WHERE l.user_id = $1
    ORDER BY l.created_at DESC
    LIMIT 20
    `,
    [userId]
  );

  // 3. Fetch User's Playlists (with fallback to 1st song's thumbnail)
  const playlistsResult = await query(
    `
    SELECT 
      p.id,
      p.name,
      p.description,
      p.is_public,
      p.created_at,
      COALESCE(
        (
          SELECT s.thumbnail_url 
          FROM playlist_songs ps 
          JOIN songs s ON s.id = ps.song_id 
          WHERE ps.playlist_id = p.id 
          ORDER BY ps.added_at DESC 
          LIMIT 1
        ),
        NULL
      ) AS cover_url,
      (
        SELECT COUNT(*) 
        FROM playlist_songs ps 
        WHERE ps.playlist_id = p.id
      )::int AS song_count
    FROM playlists p
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
    `,
    [userId]
  );

  // 4. Fetch Recently Played Songs
  const recentHistoryResult = await query(
    `
    SELECT DISTINCT ON (s.id)
      s.id,
      s.title,
      s.thumbnail_url,
      s.source_url,
      s.source_type,
      lh.created_at AS played_at,
      COALESCE(
        (
          SELECT string_agg(a.name, ', ')
          FROM song_artists sa
          JOIN artists a ON a.id = sa.artist_id
          WHERE sa.song_id = s.id
        ),
        s.artist,
        'Unknown Artist'
      ) AS artist
    FROM listening_history lh
    JOIN songs s ON s.id = lh.song_id
    WHERE lh.user_id = $1
    ORDER BY s.id, lh.created_at DESC
    LIMIT 10
    `,
    [userId]
  );

  // 5. Fetch User's Premium / Top Favorited Artists
  let favoriteArtists = [];
  try {
    const topArtistsResult = await query(
      `
      SELECT 
        a.id,
        a.name,
        COALESCE(a.image_url, a.avatar_url, NULL) AS image_url,
        COUNT(DISTINCT s.id)::int AS total_liked_tracks
      FROM likes l
      JOIN songs s ON s.id = l.song_id
      JOIN song_artists sa ON sa.song_id = s.id
      JOIN artists a ON a.id = sa.artist_id
      WHERE l.user_id = $1
      GROUP BY a.id, a.name, a.image_url, a.avatar_url
      ORDER BY total_liked_tracks DESC
      LIMIT 6
      `,
      [userId]
    );
    favoriteArtists = topArtistsResult.rows || [];
  } catch {
    // Fallback if artists/song_artists tables are not used directly
    const fallbackArtistsResult = await query(
      `
      SELECT 
        s.artist AS name,
        MAX(s.thumbnail_url) AS image_url,
        COUNT(s.id)::int AS total_liked_tracks
      FROM likes l
      JOIN songs s ON s.id = l.song_id
      WHERE l.user_id = $1 AND s.artist IS NOT NULL
      GROUP BY s.artist
      ORDER BY total_liked_tracks DESC
      LIMIT 6
      `,
      [userId]
    );
    favoriteArtists = fallbackArtistsResult.rows || [];
  }

  // Calculate actual listening time
  const totalMinutes = Math.round((user.songs_played_count * 210) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const listeningTimeFormatted = `${hours}h ${mins}m`;

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        bio: user.bio || '',
      },
      stats: {
        totalCatalogSongs: user.total_catalog_songs || 0,
        likedCount: user.liked_songs_count || 0,
        playlistCount: user.playlists_count || 0,
        listeningTime: listeningTimeFormatted,
      },
      likedSongs: likedSongsResult.rows || [],
      playlists: playlistsResult.rows || [],
      recentlyPlayed: recentHistoryResult.rows || [],
      favoriteArtists: favoriteArtists,
    },
  });
});

// ============================================================
// GET USER PROFILE
// GET /api/users/profile
// Private
// ============================================================
export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    `
    SELECT
      u.id,
      u.username,
      u.email,
      u.role,
      u.created_at,
      u.bio,
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
});

// ============================================================
// UPDATE PROFILE
// PUT /api/users/profile
// Private
// ============================================================
export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { username, email, bio } = req.body;

  if (username && !username.trim()) {
    res.status(400);
    throw new Error('Username cannot be empty');
  }

  if (email && !email.trim()) {
    res.status(400);
    throw new Error('Email cannot be empty');
  }

  const currentResult = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
  if (currentResult.rowCount === 0) {
    res.status(404);
    throw new Error('User not found');
  }
  const currentUser = currentResult.rows[0];

  const cleanUsername = username ? username.trim() : currentUser.username;
  const cleanEmail = email ? email.trim().toLowerCase() : currentUser.email;
  const cleanBio = bio !== undefined ? bio : currentUser.bio;

  if (username && cleanUsername.toLowerCase() !== currentUser.username.toLowerCase()) {
    const usernameCheck = await query(
      `SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2`,
      [cleanUsername, userId]
    );
    if (usernameCheck.rowCount > 0) {
      res.status(409);
      throw new Error('Username is already taken');
    }
  }

  if (email && cleanEmail !== currentUser.email.toLowerCase()) {
    const emailCheck = await query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2`,
      [cleanEmail, userId]
    );
    if (emailCheck.rowCount > 0) {
      res.status(409);
      throw new Error('Email is already in use');
    }
  }

  const result = await query(
    `
    UPDATE users
    SET
      username = $1,
      email = $2,
      bio = $3
    WHERE id = $4
    RETURNING
      id,
      username,
      email,
      role,
      bio,
      created_at
    `,
    [cleanUsername, cleanEmail, cleanBio, userId]
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: result.rows[0],
  });
});

// ============================================================
// CHANGE PASSWORD
// PUT /api/users/change-password
// Private
// ============================================================
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current password and new password are required');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const userResult = await query(
    `SELECT id, password FROM users WHERE id = $1`,
    [userId]
  );

  if (userResult.rowCount === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  const user = userResult.rows[0];

  const passwordMatches = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatches) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await query(
    `UPDATE users SET password = $1 WHERE id = $2`,
    [hashedPassword, userId]
  );

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});