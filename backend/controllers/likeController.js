import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Toggle Like/Unlike on a song
// @route   POST /api/likes/:songId
// @access  Private (User/Admin)
export const toggleLike = asyncHandler(async (req, res) => {
  const { songId } = req.params;
  const userId = req.user.id;

  // 1. Verify that the song actually exists
  const songCheck = await query('SELECT id FROM songs WHERE id = $1', [songId]);
  if (songCheck.rows.length === 0) {
    res.status(404);
    throw new Error('Song not found');
  }

  // 2. Check if already liked by this user
  const exists = await query(
    'SELECT 1 FROM likes WHERE user_id = $1 AND song_id = $2',
    [userId, songId]
  );

  let liked = false;

  if (exists.rows.length > 0) {
    // Unlike
    await query('DELETE FROM likes WHERE user_id = $1 AND song_id = $2', [userId, songId]);
    liked = false;
  } else {
    // Like
    await query('INSERT INTO likes (user_id, song_id) VALUES ($1, $2)', [userId, songId]);
    liked = true;
  }

  // 3. Get updated like count for the song
  const countResult = await query(
    'SELECT COUNT(*)::int AS total_likes FROM likes WHERE song_id = $1',
    [songId]
  );

  res.status(200).json({
    success: true,
    liked,
    likesCount: countResult.rows[0].total_likes,
    message: liked ? 'Song liked' : 'Song unliked',
  });
});

// @desc    Get user liked songs
// @route   GET /api/likes
// @access  Private (User/Admin)
export const getLikedSongs = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT 
        s.id,
        s.title,
        s.artist,
        s.source_url,
        s.source_type,
        s.thumbnail_url,
        s.created_at,
        l.created_at AS liked_at,
        true AS is_liked,
        (SELECT COUNT(*)::int FROM likes WHERE song_id = s.id) AS likes_count
     FROM songs s
     INNER JOIN likes l ON s.id = l.song_id
     WHERE l.user_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );

  res.status(200).json({
    success: true,
    count: result.rows.length,
    songs: result.rows,
  });
});