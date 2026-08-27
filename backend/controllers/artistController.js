import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
// ============================================================
// GET ALL ARTISTS
// GET /api/artists
// ============================================================
export const getArtists = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        a.name,
        a.image_url,
        a.is_premium,
        a.created_at,
        COUNT(sa.song_id)::int AS song_count
      FROM artists a
      LEFT JOIN song_artists sa
        ON a.id = sa.artist_id
      GROUP BY
        a.id,
        a.name,
        a.image_url,
        a.is_premium,
        a.created_at
      ORDER BY a.name ASC
    `);

    res.json({
      success: true,
      artists: result.rows,
    });
  } catch (error) {
    console.error('Get artists error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch artists',
    });
  }
};


// ============================================================
// GET SINGLE ARTIST
// GET /api/artists/:id
// ============================================================
export const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;

    const artistResult = await pool.query(
      `
      SELECT
        a.id,
        a.name,
        a.image_url,
        a.is_premium,
        a.created_at
      FROM artists a
      WHERE a.id = $1
      `,
      [id]
    );

    if (artistResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found',
      });
    }

    const songsResult = await pool.query(
      `
      SELECT
        s.id,
        s.title,
        s.source_url,
        s.thumbnail_url,
        s.source_type,
        s.created_at
      FROM songs s
      INNER JOIN song_artists sa
        ON s.id = sa.song_id
      WHERE sa.artist_id = $1
      ORDER BY s.created_at DESC
      `,
      [id]
    );

    res.json({
      success: true,
      artist: artistResult.rows[0],
      songs: songsResult.rows,
    });
  } catch (error) {
    console.error('Get artist error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch artist',
    });
  }
};


// ============================================================
// CREATE ARTIST
// POST /api/artists
// ============================================================
export const createArtist = async (req, res) => {
  try {
    const { name, imageUrl, isPremium } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Artist name is required',
      });
    }

    const artistName = name.trim();

    // Check duplicate artist
    const existingArtist = await pool.query(
      `
      SELECT
        id,
        name,
        image_url,
        is_premium
      FROM artists
      WHERE LOWER(name) = LOWER($1)
      LIMIT 1
      `,
      [artistName]
    );

    if (existingArtist.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Artist already exists',
        artist: existingArtist.rows[0],
      });
    }

    const result = await pool.query(
      `
      INSERT INTO artists (
        name,
        image_url,
        is_premium
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        image_url,
        is_premium,
        created_at
      `,
      [
        artistName,
        imageUrl?.trim() || null,
        Boolean(isPremium),
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Artist created successfully',
      artist: result.rows[0],
    });
  } catch (error) {
    console.error('Create artist error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create artist',
    });
  }
};


// ============================================================
// UPDATE ARTIST
// PUT /api/artists/:id
// ============================================================
export const updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      imageUrl,
      isPremium,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Artist name is required',
      });
    }

    const artistName = name.trim();

    // Check duplicate name
    const duplicate = await pool.query(
      `
      SELECT id
      FROM artists
      WHERE LOWER(name) = LOWER($1)
        AND id != $2
      LIMIT 1
      `,
      [artistName, id]
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Another artist with this name already exists',
      });
    }

    const result = await pool.query(
      `
      UPDATE artists
      SET
        name = $1,
        image_url = $2,
        is_premium = $3
      WHERE id = $4
      RETURNING
        id,
        name,
        image_url,
        is_premium,
        created_at
      `,
      [
        artistName,
        imageUrl?.trim() || null,
        Boolean(isPremium),
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found',
      });
    }

    res.json({
      success: true,
      message: 'Artist updated successfully',
      artist: result.rows[0],
    });
  } catch (error) {
    console.error('Update artist error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update artist',
    });
  }
};


// ============================================================
// TOGGLE PREMIUM ARTIST
// PUT /api/artists/:id/premium
// ADMIN ONLY
// ============================================================
export const toggleArtistPremium = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE artists
      SET is_premium = NOT COALESCE(is_premium, FALSE)
      WHERE id = $1
      RETURNING
        id,
        name,
        image_url,
        is_premium,
        created_at
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found',
      });
    }

    const artist = result.rows[0];

    res.json({
      success: true,
      message: artist.is_premium
        ? 'Artist marked as Premium'
        : 'Artist removed from Premium',
      artist,
    });
  } catch (error) {
    console.error(
      'Toggle artist premium error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to update premium status',
    });
  }
};


// ============================================================
// DELETE ARTIST
// DELETE /api/artists/:id
// ============================================================
export const deleteArtist = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Check artist
    const artistResult = await client.query(
      `
      SELECT
        id,
        name,
        is_premium
      FROM artists
      WHERE id = $1
      `,
      [id]
    );

    if (artistResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        success: false,
        message: 'Artist not found',
      });
    }

    // Remove song relationships
    await client.query(
      `
      DELETE FROM song_artists
      WHERE artist_id = $1
      `,
      [id]
    );

    // Delete artist
    await client.query(
      `
      DELETE FROM artists
      WHERE id = $1
      `,
      [id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Artist deleted successfully',
      artist: artistResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Delete artist error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete artist',
    });
  } finally {
    client.release();
  }
};

/* ============================================================
   GET ALL ARTISTS (Favorites pinned to top)
   GET /api/artists
============================================================ */
export const getAllArtists = asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;

  const sql = `
    SELECT
      a.id,
      a.name,
      a.image_url,
      a.is_premium,
      COUNT(DISTINCT sa.song_id)::int AS song_count,
      CASE
        WHEN $1::uuid IS NOT NULL AND EXISTS (
          SELECT 1
          FROM user_favorite_artists ufa
          WHERE ufa.user_id = $1::uuid
          AND ufa.artist_id = a.id
        ) THEN true
        ELSE false
      END AS is_favorite
    FROM artists a
    LEFT JOIN song_artists sa ON a.id = sa.artist_id
    GROUP BY a.id
    ORDER BY
      is_favorite DESC,
      a.name ASC
  `;

  const result = await pool.query(sql, [userId]);

  res.status(200).json({
    success: true,
    artists: result.rows,
  });
});

/* ============================================================
   TOGGLE FAVORITE / BEST ARTIST
   POST /api/artists/:id/favorite
============================================================ */
export const toggleFavoriteArtist = asyncHandler(async (req, res) => {
  const { id: artistId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401);
    throw new Error('Authentication required');
  }

  const check = await pool.query(
    `SELECT 1 FROM user_favorite_artists WHERE user_id = $1 AND artist_id = $2`,
    [userId, artistId]
  );

  let isFavorite = false;

  if (check.rowCount > 0) {
    await pool.query(
      `DELETE FROM user_favorite_artists WHERE user_id = $1 AND artist_id = $2`,
      [userId, artistId]
    );
    isFavorite = false;
  } else {
    await pool.query(
      `INSERT INTO user_favorite_artists (user_id, artist_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, artistId]
    );
    isFavorite = true;
  }

  res.status(200).json({
    success: true,
    is_favorite: isFavorite,
    message: isFavorite ? 'Artist marked as Best Artist' : 'Removed from Best Artists',
  });
});

export const getMyPremiumArtistsCount = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const result = await pool.query(
    `
    SELECT COUNT(DISTINCT a.id)::int AS count
    FROM artists a
    INNER JOIN user_favorite_artists ufa ON ufa.artist_id = a.id
    WHERE ufa.user_id = $1
      AND a.is_premium = true
    `,
    [userId]
  );

  res.status(200).json({
    success: true,
    count: result.rows[0]?.count || 0,
  });
});