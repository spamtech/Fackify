import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ============================================================
// GET USER PLAYLISTS
// GET /api/playlists
// Private
// ============================================================

export const getUserPlaylists = asyncHandler(
  async (req, res) => {
    const result = await query(
      `
      SELECT
        p.*,

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

      LEFT JOIN playlist_songs ps
        ON p.id = ps.playlist_id

      LEFT JOIN songs s
        ON ps.song_id = s.id

      WHERE p.user_id = $1

      GROUP BY p.id

      ORDER BY p.created_at DESC
      `,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      playlists: result.rows,
    });
  }
);

// ============================================================
// CREATE PLAYLIST
// POST /api/playlists
// Private
// ============================================================

export const createPlaylist = asyncHandler(
  async (req, res) => {
    const {
      name,
      description,
      isPublic,
    } = req.body;

    if (
      !name ||
      !name.trim()
    ) {
      res.status(400);

      throw new Error(
        'Playlist name is required'
      );
    }

    const cleanName =
      name.trim();

    const cleanDescription =
      description?.trim() || null;

    const publicValue =
      isPublic !== undefined
        ? Boolean(isPublic)
        : true;

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

      RETURNING *
      `,
      [
        cleanName,
        cleanDescription,
        publicValue,
        req.user.id,
      ]
    );

    res.status(201).json({
      success: true,

      playlist: {
        ...result.rows[0],

        song_count: 0,

        songs: [],
      },
    });
  }
);

// ============================================================
// GET PLAYLIST BY ID
// GET /api/playlists/:id
// Private
// ============================================================

export const getPlaylistById =
  asyncHandler(
    async (req, res) => {
      const {
        id,
      } = req.params;

      const playlistRes =
        await query(
          `
          SELECT
            p.*,
            u.username AS creator_name

          FROM playlists p

          JOIN users u
            ON p.user_id = u.id

          WHERE p.id = $1
          `,
          [id]
        );

      if (
        playlistRes.rowCount === 0
      ) {
        res.status(404);

        throw new Error(
          'Playlist not found'
        );
      }

      const playlist =
        playlistRes.rows[0];

      // Private playlist protection
      if (
        !playlist.is_public &&
        String(playlist.user_id) !==
          String(req.user.id) &&
        req.user.role !== 'admin'
      ) {
        res.status(403);

        throw new Error(
          'This playlist is private'
        );
      }

      const songsRes =
        await query(
          `
          SELECT
            s.*,

            ps.added_at,

            COUNT(l.user_id)::int
              AS likes_count,

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
    }
  );

// ============================================================
// ADD SONG TO PLAYLIST
// POST /api/playlists/:id/songs
// Private
// ============================================================

export const addSongToPlaylist =
  asyncHandler(
    async (req, res) => {
      const {
        id: playlistId,
      } = req.params;

      const {
        songId,
      } = req.body;

      // ----------------------------------------
      // Validate song ID
      // ----------------------------------------

      if (!songId) {
        res.status(400);

        throw new Error(
          'songId is required'
        );
      }

      // ----------------------------------------
      // Check playlist
      // ----------------------------------------

      const playlistResult =
        await query(
          `
          SELECT
            id,
            user_id
          FROM playlists
          WHERE id = $1
          `,
          [playlistId]
        );

      if (
        playlistResult.rowCount === 0
      ) {
        res.status(404);

        throw new Error(
          'Playlist not found'
        );
      }

      const playlist =
        playlistResult.rows[0];

      // ----------------------------------------
      // Check ownership
      // ----------------------------------------

      if (
        String(playlist.user_id) !==
        String(req.user.id)
      ) {
        res.status(403);

        throw new Error(
          'Not authorized to edit this playlist'
        );
      }

      // ----------------------------------------
      // Check song exists
      // ----------------------------------------

      const songResult =
        await query(
          `
          SELECT id
          FROM songs
          WHERE id = $1
          `,
          [songId]
        );

      if (
        songResult.rowCount === 0
      ) {
        res.status(404);

        throw new Error(
          'Song not found'
        );
      }

      // ----------------------------------------
      // Add song
      // ----------------------------------------

      const insertResult =
        await query(
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

      // ----------------------------------------
      // Already exists
      // ----------------------------------------

      if (
        insertResult.rowCount === 0
      ) {
        res.status(200).json({
          success: true,

          alreadyExists: true,

          message:
            'Song is already in this playlist',
        });

        return;
      }

      // ----------------------------------------
      // Success
      // ----------------------------------------

      res.status(201).json({
        success: true,

        alreadyExists: false,

        message:
          'Song added to playlist',

        playlistSong:
          insertResult.rows[0],
      });
    }
  );

// ============================================================
// REMOVE SONG
// DELETE /api/playlists/:id/songs/:songId
// Private
// ============================================================

export const removeSongFromPlaylist =
  asyncHandler(
    async (req, res) => {
      const {
        id: playlistId,
        songId,
      } = req.params;

      const playlistResult =
        await query(
          `
          SELECT
            user_id
          FROM playlists
          WHERE id = $1
          `,
          [playlistId]
        );

      if (
        playlistResult.rowCount === 0
      ) {
        res.status(404);

        throw new Error(
          'Playlist not found'
        );
      }

      const ownerId =
        playlistResult.rows[0]
          .user_id;

      if (
        String(ownerId) !==
          String(req.user.id) &&
        req.user.role !== 'admin'
      ) {
        res.status(403);

        throw new Error(
          'Not authorized to modify this playlist'
        );
      }

      const result =
        await query(
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

      if (
        result.rowCount === 0
      ) {
        res.status(404);

        throw new Error(
          'Song is not in this playlist'
        );
      }

      res.status(200).json({
        success: true,

        message:
          'Song removed from playlist',
      });
    }
  );

// ============================================================
// DELETE PLAYLIST
// DELETE /api/playlists/:id
// Private
// ============================================================

export const deletePlaylist =
  asyncHandler(
    async (req, res) => {
      const {
        id,
      } = req.params;

      const playlistResult =
        await query(
          `
          SELECT
            user_id
          FROM playlists
          WHERE id = $1
          `,
          [id]
        );

      if (
        playlistResult.rowCount === 0
      ) {
        res.status(404);

        throw new Error(
          'Playlist not found'
        );
      }

      const ownerId =
        playlistResult.rows[0]
          .user_id;

      if (
        String(ownerId) !==
          String(req.user.id) &&
        req.user.role !== 'admin'
      ) {
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

        message:
          'Playlist deleted',
      });
    }
  );

// ============================================================
// RENAME / UPDATE PLAYLIST
// PUT /api/playlists/:id
// Private
// ============================================================

export const updatePlaylist =
  asyncHandler(
    async (req, res) => {
      const {
        id,
      } = req.params;

      const {
        name,
        description,
        isPublic,
      } = req.body;

      if (
        !name ||
        !name.trim()
      ) {
        res.status(400);

        throw new Error(
          'Playlist name is required'
        );
      }

      const playlistResult =
        await query(
          `
          SELECT
            user_id
          FROM playlists
          WHERE id = $1
          `,
          [id]
        );

      if (
        playlistResult.rowCount === 0
      ) {
        res.status(404);

        throw new Error(
          'Playlist not found'
        );
      }

      const ownerId =
        playlistResult.rows[0]
          .user_id;

      if (
        String(ownerId) !==
          String(req.user.id) &&
        req.user.role !== 'admin'
      ) {
        res.status(403);

        throw new Error(
          'Not authorized to edit this playlist'
        );
      }

      const result =
        await query(
          `
          UPDATE playlists

          SET
            name = $1,
            description = $2,
            is_public =
              COALESCE($3, is_public)

          WHERE id = $4

          RETURNING *
          `,
          [
            name.trim(),
            description?.trim() || null,
            isPublic !== undefined
              ? Boolean(isPublic)
              : null,
            id,
          ]
        );

      res.status(200).json({
        success: true,

        playlist: {
          ...result.rows[0],

          song_count: 0,

          songs: [],
        },
      });
    }
  );

// ============================================================
// ADMIN - ALL PLAYLISTS
// GET /api/playlists/admin/all
// Admin only
// ============================================================

export const getAdminAllPlaylists =
  asyncHandler(
    async (req, res) => {
      const result =
        await query(
          `
          SELECT
            p.*,

            u.username
              AS creator_username,

            u.email
              AS creator_email,

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
            u.email

          ORDER BY
            p.created_at DESC
          `
        );

      res.status(200).json({
        success: true,

        playlists:
          result.rows,
      });
    }
  );