import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';


// ============================================================
// GET USER PLAYLISTS
// GET /api/playlists
// Private
// ============================================================

export const getUserPlaylists = asyncHandler(async (req, res) => {
  const result = await query(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.is_public,
      p.user_id,
      p.created_at,
      p.updated_at,

      u.username AS creator_username,
      u.role AS creator_role,

      CASE
        WHEN u.role = 'admin' THEN true
        ELSE false
      END AS is_admin_playlist,

      COUNT(ps.song_id)::int AS song_count,

      COALESCE(
        json_agg(
          json_build_object(
            'id', s.id,
            'title', s.title,
            'artist', s.artist,
            'thumbnail_url', s.thumbnail_url,
            'source_url', s.source_url,
            'source_type', s.source_type
          )
          ORDER BY ps.added_at DESC
        )
        FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
      ) AS songs

    FROM playlists p

    LEFT JOIN users u
      ON p.user_id = u.id

    LEFT JOIN playlist_songs ps
      ON p.id = ps.playlist_id

    LEFT JOIN songs s
      ON ps.song_id = s.id

    WHERE
      p.user_id = $1
      OR p.is_public = true

    GROUP BY
      p.id,
      u.username,
      u.role

    ORDER BY
      p.created_at DESC
    `,
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    playlists: result.rows,
  });
});


// ============================================================
// CREATE PLAYLIST
// POST /api/playlists
// Private
// ============================================================

export const createPlaylist = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    isPublic,
  } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Playlist name is required');
  }

  const cleanName = name.trim();
  const cleanDescription = description?.trim() || null;

  let publicValue = false;

  if (typeof isPublic === 'boolean') {
    publicValue = isPublic;
  } else if (typeof isPublic === 'string') {
    publicValue = isPublic.toLowerCase() === 'true';
  }

  const result = await query(
    `
    INSERT INTO playlists
    (
      name,
      description,
      is_public,
      user_id
    )

    VALUES
    ($1, $2, $3, $4)

    RETURNING
      id,
      name,
      description,
      is_public,
      user_id,
      created_at,
      updated_at
    `,
    [
      cleanName,
      cleanDescription,
      publicValue,
      req.user.id,
    ]
  );

  const playlist = result.rows[0];

  const creatorResult = await query(
    `
    SELECT
      username,
      role
    FROM users
    WHERE id = $1
    `,
    [req.user.id]
  );

  const creator = creatorResult.rows[0] || {};

  res.status(201).json({
    success: true,

    playlist: {
      ...playlist,

      creator_username: creator.username || null,

      creator_role:
        creator.role || req.user.role,

      is_admin_playlist:
        creator.role === 'admin' ||
        req.user.role === 'admin',

      song_count: 0,

      songs: [],
    },
  });
});


// ============================================================
// GET PLAYLIST BY ID
// GET /api/playlists/:id
// Private
// ============================================================

export const getPlaylistById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const playlistRes = await query(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.is_public,
      p.user_id,
      p.created_at,
      p.updated_at,

      u.username AS creator_username,
      u.role AS creator_role,

      CASE
        WHEN u.role = 'admin' THEN true
        ELSE false
      END AS is_admin_playlist

    FROM playlists p

    JOIN users u
      ON p.user_id = u.id

    WHERE p.id = $1
    `,
    [id]
  );

  if (playlistRes.rowCount === 0) {
    res.status(404);
    throw new Error('Playlist not found');
  }

  const playlist = playlistRes.rows[0];

  const isOwner =
    String(playlist.user_id) ===
    String(req.user.id);

  const isAdmin =
    req.user.role === 'admin';

  const isPublic =
    playlist.is_public === true;

  if (!isOwner && !isAdmin && !isPublic) {
    res.status(403);
    throw new Error('This playlist is private');
  }

  const songsRes = await query(
    `
    SELECT
      s.*,

      ps.added_at,

      COUNT(l.user_id)::int AS likes_count,

      CASE
        WHEN EXISTS (
          SELECT 1
          FROM likes
          WHERE user_id = $2
            AND song_id = s.id
        )
        THEN true
        ELSE false
      END AS is_liked

    FROM playlist_songs ps

    JOIN songs s
      ON ps.song_id = s.id

    LEFT JOIN likes l
      ON s.id = l.song_id

    WHERE ps.playlist_id = $1

    GROUP BY
      s.id,
      ps.added_at

    ORDER BY
      ps.added_at DESC
    `,
    [
      id,
      req.user.id,
    ]
  );

  res.status(200).json({
    success: true,

    playlist: {
      ...playlist,

      songs: songsRes.rows,

      song_count:
        songsRes.rows.length,
    },
  });
});


// ============================================================
// ADD SONG TO PLAYLIST
// POST /api/playlists/:id/songs
// ============================================================

export const addSongToPlaylist = asyncHandler(async (req, res) => {
  const { id: playlistId } = req.params;
  const { songId } = req.body;

  if (!songId) {
    res.status(400);
    throw new Error('songId is required');
  }

  const playlistResult = await query(
    `
    SELECT
      id,
      user_id
    FROM playlists
    WHERE id = $1
    `,
    [playlistId]
  );

  if (playlistResult.rowCount === 0) {
    res.status(404);
    throw new Error('Playlist not found');
  }

  const playlist = playlistResult.rows[0];

  const isOwner =
    String(playlist.user_id) ===
    String(req.user.id);

  const isAdmin =
    req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error(
      'Not authorized to edit this playlist'
    );
  }

  const songResult = await query(
    `
    SELECT id
    FROM songs
    WHERE id = $1
    `,
    [songId]
  );

  if (songResult.rowCount === 0) {
    res.status(404);
    throw new Error('Song not found');
  }

  const insertResult = await query(
    `
    INSERT INTO playlist_songs
    (
      playlist_id,
      song_id
    )

    VALUES
    ($1, $2)

    ON CONFLICT
    (
      playlist_id,
      song_id
    )

    DO NOTHING

    RETURNING *
    `,
    [
      playlistId,
      songId,
    ]
  );

  if (insertResult.rowCount === 0) {
    return res.status(200).json({
      success: true,
      alreadyExists: true,
      message: 'Song is already in this playlist',
    });
  }

  res.status(201).json({
    success: true,
    alreadyExists: false,
    message: 'Song added to playlist',
    playlistSong: insertResult.rows[0],
  });
});


// ============================================================
// REMOVE SONG FROM PLAYLIST
// DELETE /api/playlists/:id/songs/:songId
// ============================================================

export const removeSongFromPlaylist =
  asyncHandler(async (req, res) => {

    const {
      id: playlistId,
      songId,
    } = req.params;

    const playlistResult = await query(
      `
      SELECT
        user_id
      FROM playlists
      WHERE id = $1
      `,
      [playlistId]
    );

    if (playlistResult.rowCount === 0) {
      res.status(404);
      throw new Error('Playlist not found');
    }

    const ownerId =
      playlistResult.rows[0].user_id;

    const isOwner =
      String(ownerId) ===
      String(req.user.id);

    const isAdmin =
      req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error(
        'Not authorized to modify this playlist'
      );
    }

    const result = await query(
      `
      DELETE FROM playlist_songs

      WHERE playlist_id = $1
        AND song_id = $2

      RETURNING *
      `,
      [
        playlistId,
        songId,
      ]
    );

    if (result.rowCount === 0) {
      res.status(404);
      throw new Error(
        'Song is not in this playlist'
      );
    }

    res.status(200).json({
      success: true,
      message: 'Song removed from playlist',
    });
  });


// ============================================================
// DELETE PLAYLIST
// DELETE /api/playlists/:id
// ============================================================

export const deletePlaylist =
  asyncHandler(async (req, res) => {

    const { id } = req.params;

    const playlistResult = await query(
      `
      SELECT
        user_id
      FROM playlists
      WHERE id = $1
      `,
      [id]
    );

    if (playlistResult.rowCount === 0) {
      res.status(404);
      throw new Error('Playlist not found');
    }

    const ownerId =
      playlistResult.rows[0].user_id;

    const isOwner =
      String(ownerId) ===
      String(req.user.id);

    const isAdmin =
      req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error(
        'Not authorized to delete this playlist'
      );
    }

    await query(
      `
      DELETE FROM playlists
      WHERE id = $1
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Playlist deleted',
    });
  });


// ============================================================
// UPDATE PLAYLIST
// PUT /api/playlists/:id
// ============================================================

export const updatePlaylist =
  asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {
      name,
      description,
      isPublic,
    } = req.body;

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Playlist name is required');
    }

    const playlistResult = await query(
      `
      SELECT
        user_id
      FROM playlists
      WHERE id = $1
      `,
      [id]
    );

    if (playlistResult.rowCount === 0) {
      res.status(404);
      throw new Error('Playlist not found');
    }

    const ownerId =
      playlistResult.rows[0].user_id;

    const isOwner =
      String(ownerId) ===
      String(req.user.id);

    const isAdmin =
      req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error(
        'Not authorized to edit this playlist'
      );
    }

    let publicValue = null;

    if (typeof isPublic === 'boolean') {
      publicValue = isPublic;
    } else if (typeof isPublic === 'string') {
      publicValue =
        isPublic.toLowerCase() === 'true';
    }

    const result = await query(
      `
      UPDATE playlists

      SET
        name = $1,
        description = $2,

        is_public =
          COALESCE(
            $3::boolean,
            is_public
          ),

        updated_at = NOW()

      WHERE id = $4

      RETURNING
        id,
        name,
        description,
        is_public,
        user_id,
        created_at,
        updated_at
      `,
      [
        name.trim(),
        description?.trim() || null,
        publicValue,
        id,
      ]
    );

    const updatedPlaylist =
      result.rows[0];

    const creatorResult =
      await query(
        `
        SELECT
          username,
          role
        FROM users
        WHERE id = $1
        `,
        [updatedPlaylist.user_id]
      );

    const creator =
      creatorResult.rows[0] || {};

    res.status(200).json({
      success: true,

      playlist: {
        ...updatedPlaylist,

        creator_username:
          creator.username || null,

        creator_role:
          creator.role || null,

        is_admin_playlist:
          creator.role === 'admin',

        song_count: 0,

        songs: [],
      },
    });
  });


// ============================================================
// ADMIN - GET ALL PLAYLISTS
// GET /api/playlists/admin/all
// ============================================================

export const getAdminAllPlaylists =
  asyncHandler(async (req, res) => {

    const result = await query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.is_public,
        p.user_id,
        p.created_at,
        p.updated_at,

        u.username AS creator_username,
        u.email AS creator_email,
        u.role AS creator_role,

        CASE
          WHEN u.role = 'admin'
          THEN true
          ELSE false
        END AS is_admin_playlist,

        COUNT(ps.song_id)::int
          AS song_count

      FROM playlists p

      JOIN users u
        ON p.user_id = u.id

      LEFT JOIN playlist_songs ps
        ON p.id = ps.playlist_id

      GROUP BY
        p.id,
        u.username,
        u.email,
        u.role

      ORDER BY
        p.created_at DESC
      `
    );

    res.status(200).json({
      success: true,

      count:
        result.rows.length,

      playlists:
        result.rows,
    });
  });


// ============================================================
// ADMIN - GET SINGLE PLAYLIST WITH ALL SONGS
// GET /api/playlists/admin/:id
// ============================================================

export const getAdminPlaylistById =
  asyncHandler(async (req, res) => {

    const { id } = req.params;

    const playlistResult = await query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.is_public,
        p.user_id,
        p.created_at,
        p.updated_at,

        u.username AS creator_username,
        u.email AS creator_email,
        u.role AS creator_role,

        CASE
          WHEN u.role = 'admin'
          THEN true
          ELSE false
        END AS is_admin_playlist

      FROM playlists p

      JOIN users u
        ON p.user_id = u.id

      WHERE p.id = $1
      `,
      [id]
    );

    if (playlistResult.rowCount === 0) {
      res.status(404);
      throw new Error('Playlist not found');
    }

    const playlist =
      playlistResult.rows[0];

    const songsResult = await query(
      `
      SELECT
        s.id,
        s.title,
        s.artist,
        s.source_url,
        s.source_type,
        s.thumbnail_url,

        ps.added_at,

        COUNT(l.user_id)::int
          AS likes_count

      FROM playlist_songs ps

      JOIN songs s
        ON ps.song_id = s.id

      LEFT JOIN likes l
        ON s.id = l.song_id

      WHERE
        ps.playlist_id = $1

      GROUP BY
        s.id,
        ps.added_at

      ORDER BY
        ps.added_at DESC
      `,
      [id]
    );

    res.status(200).json({
      success: true,

      playlist: {
        ...playlist,

        songs:
          songsResult.rows,

        song_count:
          songsResult.rows.length,
      },
    });
  });


// ============================================================
// ADMIN - MAKE PLAYLIST PUBLIC
// PUT /api/playlists/admin/:id/public
// ============================================================

export const makePlaylistPublic =
  asyncHandler(async (req, res) => {

    const { id } = req.params;

    const playlistResult = await query(
      `
      SELECT
        p.id,
        p.name,
        p.user_id,
        p.is_public,

        u.username AS creator_username

      FROM playlists p

      JOIN users u
        ON p.user_id = u.id

      WHERE p.id = $1
      `,
      [id]
    );

    if (playlistResult.rowCount === 0) {
      res.status(404);
      throw new Error('Playlist not found');
    }

    const result = await query(
      `
      UPDATE playlists

      SET
        is_public = true,
        updated_at = NOW()

      WHERE id = $1

      RETURNING
        id,
        name,
        description,
        is_public,
        user_id,
        created_at,
        updated_at
      `,
      [id]
    );

    const playlist =
      result.rows[0];

    res.status(200).json({
      success: true,

      message:
        'Playlist approved and made public',

      playlist: {
        ...playlist,

        creator_username:
          playlistResult.rows[0]
            .creator_username,
      },
    });
  });


// ============================================================
// ADMIN - MAKE PLAYLIST PRIVATE
// PUT /api/playlists/admin/:id/private
// ============================================================

export const makePlaylistPrivate =
  asyncHandler(async (req, res) => {

    const { id } = req.params;

    const playlistResult = await query(
      `
      SELECT
        id,
        name,
        is_public
      FROM playlists
      WHERE id = $1
      `,
      [id]
    );

    if (playlistResult.rowCount === 0) {
      res.status(404);
      throw new Error('Playlist not found');
    }

    const result = await query(
      `
      UPDATE playlists

      SET
        is_public = false,
        updated_at = NOW()

      WHERE id = $1

      RETURNING
        id,
        name,
        description,
        is_public,
        user_id,
        created_at,
        updated_at
      `,
      [id]
    );

    res.status(200).json({
      success: true,

      message:
        'Playlist removed from public playlists',

      playlist:
        result.rows[0],
    });
  });


// ============================================================
// ADMIN - UPDATE PLAYLIST VISIBILITY
// PUT /api/playlists/admin/:id/visibility
// ============================================================
//
// This endpoint is important because your AdminDashboard is
// calling:
//
// PUT /api/playlists/admin/:id/visibility
//
// Body:
//
// {
//   "isPublic": true
// }
//
// OR
//
// {
//   "isPublic": false
// }
//
// ============================================================

export const updatePlaylistVisibility =
  asyncHandler(async (req, res) => {

    const { id } = req.params;

    const { isPublic } = req.body;

    // --------------------------------------------------------
    // Validate visibility value
    // --------------------------------------------------------

    if (typeof isPublic !== 'boolean') {
      res.status(400);

      throw new Error(
        'isPublic must be a boolean'
      );
    }

    // --------------------------------------------------------
    // Check playlist
    // --------------------------------------------------------

    const playlistResult = await query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.user_id,
        p.is_public,

        u.username AS creator_username,
        u.email AS creator_email

      FROM playlists p

      JOIN users u
        ON p.user_id = u.id

      WHERE p.id = $1
      `,
      [id]
    );

    if (playlistResult.rowCount === 0) {
      res.status(404);

      throw new Error(
        'Playlist not found'
      );
    }

    // --------------------------------------------------------
    // Update visibility
    // --------------------------------------------------------

    const result = await query(
      `
      UPDATE playlists

      SET
        is_public = $1,
        updated_at = NOW()

      WHERE id = $2

      RETURNING
        id,
        name,
        description,
        user_id,
        is_public,
        created_at,
        updated_at
      `,
      [
        isPublic,
        id,
      ]
    );

    const playlist =
      result.rows[0];

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    res.status(200).json({
      success: true,

      message: isPublic
        ? 'Playlist made public successfully'
        : 'Playlist made private successfully',

      playlist: {
        ...playlist,

        creator_username:
          playlistResult.rows[0]
            .creator_username,

        creator_email:
          playlistResult.rows[0]
            .creator_email,
      },
    });
  });