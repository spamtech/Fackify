import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const detectSource = (url) => {
  if (!url) return 'direct';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('spotify.com')) return 'spotify';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
  return 'direct';
};

// @desc Add a new song
// @route POST /api/songs
export const addSong = asyncHandler(async (req, res) => {
  const { title, artist, sourceUrl, thumbnailUrl } = req.body;

  if (!title || !sourceUrl || !thumbnailUrl) {
    res.status(400);
    throw new Error('Title, sourceUrl, and thumbnailUrl are required');
  }

  const sourceType = detectSource(sourceUrl);

  const result = await query(
    `INSERT INTO songs (title, artist, source_url, source_type, thumbnail_url, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [title.trim(), (artist || 'Unknown Artist').trim(), sourceUrl.trim(), sourceType, thumbnailUrl.trim(), req.user.id]
  );

  res.status(201).json({ success: true, song: result.rows[0] });
});

// @desc Get all songs (Simplified query that never fails)
// @route GET /api/songs
// Inside backend/controllers/songController.js

// @desc Get all songs with search & platform filter
// @route GET /api/songs
export const getAllSongs = asyncHandler(async (req, res) => {
  const search = req.query.search ? `%${req.query.search.trim()}%` : null;
  const platform = req.query.platform && req.query.platform !== 'all' ? req.query.platform.trim() : null;
  const userId = req.user?.id || null;

  let sql = `
    SELECT 
      s.id,
      s.title,
      s.artist,
      s.source_url,
      s.source_type,
      s.thumbnail_url,
      s.created_by,
      s.created_at,
      COUNT(l.user_id)::int AS likes_count,
      CASE 
        WHEN $1::uuid IS NOT NULL AND EXISTS (
          SELECT 1 FROM likes WHERE user_id = $1::uuid AND song_id = s.id
        ) THEN true 
        ELSE false 
      END AS is_liked
    FROM songs s
    LEFT JOIN likes l ON s.id = l.song_id
    WHERE 1=1
  `;

  const params = [userId];
  let paramIndex = 2;

  if (search) {
    sql += ` AND (s.title ILIKE $${paramIndex} OR s.artist ILIKE $${paramIndex})`;
    params.push(search);
    paramIndex++;
  }

  if (platform) {
    sql += ` AND s.source_type = $${paramIndex}`;
    params.push(platform);
    paramIndex++;
  }

  sql += ` GROUP BY s.id ORDER BY s.created_at DESC`;

  const result = await query(sql, params);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    songs: result.rows,
  });
});

// @desc Delete song
// @route DELETE /api/songs/:id
export const deleteSong = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await query('DELETE FROM songs WHERE id = $1 RETURNING id', [id]);

  if (result.rowCount === 0) {
    res.status(404);
    throw new Error('Song not found');
  }

  res.status(200).json({ success: true, message: 'Song removed' });
});

// Add this to backend/controllers/songController.js

// @desc Update song details (Admin Only)
// @route PUT /api/songs/:id
export const updateSong = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, artist, sourceUrl, thumbnailUrl } = req.body;

  if (!title || !sourceUrl || !thumbnailUrl) {
    res.status(400);
    throw new Error('Title, sourceUrl, and thumbnailUrl are required');
  }

  const sourceType = detectSource(sourceUrl);

  const result = await query(
    `UPDATE songs
     SET title = $1, artist = $2, source_url = $3, source_type = $4, thumbnail_url = $5
     WHERE id = $6
     RETURNING *`,
    [title.trim(), (artist || 'Unknown Artist').trim(), sourceUrl.trim(), sourceType, thumbnailUrl.trim(), id]
  );

  if (result.rowCount === 0) {
    res.status(404);
    throw new Error('Song not found');
  }

  res.status(200).json({
    success: true,
    song: result.rows[0],
  });
});