import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/* ============================================================
   DETECT SOURCE TYPE
============================================================ */

const detectSource = (url) => {
  if (!url) return 'direct';

  const cleanUrl = String(url).toLowerCase();

  if (
    cleanUrl.includes('youtube.com') ||
    cleanUrl.includes('youtu.be')
  ) {
    return 'youtube';
  }

  if (cleanUrl.includes('spotify.com')) {
    return 'spotify';
  }

  if (
    cleanUrl.includes('facebook.com') ||
    cleanUrl.includes('fb.watch')
  ) {
    return 'facebook';
  }

  return 'direct';
};


/* ============================================================
   NORMALIZE ARTIST IDS
============================================================ */

const normalizeArtistIds = (artistIds, artistId) => {
  let ids = [];

  /*
   * New frontend:
   * artistIds: ["uuid-1", "uuid-2"]
   */
  if (Array.isArray(artistIds)) {
    ids = artistIds;
  }

  /*
   * Backward compatibility:
   * artistId: "uuid"
   */
  if (
    ids.length === 0 &&
    artistId
  ) {
    ids = [artistId];
  }

  /*
   * Remove null / undefined / empty values
   */
  ids = ids
    .map((id) => {
      if (id === null || id === undefined) {
        return null;
      }
      return String(id).trim();
    })
    .filter(Boolean);

  /*
   * Remove duplicate IDs
   */
  return [...new Set(ids)];
};


/* ============================================================
   GET ARTISTS BY IDS
============================================================ */

const getArtistsByIds = async (
  client,
  artistIds
) => {
  if (
    !Array.isArray(artistIds) ||
    artistIds.length === 0
  ) {
    return [];
  }

  const result = await client.query(
    `
      SELECT
        id,
        name,
        image_url
      FROM artists
      WHERE id = ANY($1::uuid[])
    `,
    [artistIds]
  );

  /*
   * Preserve the exact order selected by the AdminDashboard.
   */
  const artistMap = new Map(
    result.rows.map((artist) => [
      String(artist.id),
      artist,
    ])
  );

  return artistIds
    .map((id) =>
      artistMap.get(String(id))
    )
    .filter(Boolean);
};


/* ============================================================
   GET OR CREATE ARTIST
   ONLY USED FOR OLD FRONTEND PAYLOADS
============================================================ */

const getOrCreateArtist = async (
  client,
  artistName,
  artistImageUrl = null
) => {
  const cleanName =
    String(
      artistName || 'Unknown Artist'
    )
      .trim() ||
    'Unknown Artist';

  const cleanImage =
    typeof artistImageUrl === 'string' &&
    artistImageUrl.trim()
      ? artistImageUrl.trim()
      : null;


  /* ----------------------------------------------------------
     FIND EXISTING ARTIST
  ---------------------------------------------------------- */

  const existingArtist =
    await client.query(
      `
        SELECT
          id,
          name,
          image_url
        FROM artists
        WHERE LOWER(TRIM(name)) =
              LOWER(TRIM($1))
        LIMIT 1
      `,
      [cleanName]
    );

  if (
    existingArtist.rowCount > 0
  ) {
    const artist =
      existingArtist.rows[0];

    /*
     * Only update image if a new one was actually supplied.
     */
    if (
      cleanImage &&
      cleanImage !== artist.image_url
    ) {
      const updatedArtist =
        await client.query(
          `
            UPDATE artists
            SET
              image_url = $1,
              updated_at = NOW()
            WHERE id = $2
            RETURNING
              id,
              name,
              image_url
          `,
          [
            cleanImage,
            artist.id,
          ]
        );

      return updatedArtist.rows[0];
    }

    return artist;
  }


  /* ----------------------------------------------------------
     CREATE ARTIST
  ---------------------------------------------------------- */

  const newArtist =
    await client.query(
      `
        INSERT INTO artists
        (
          name,
          image_url
        )
        VALUES
        (
          $1,
          $2
        )
        RETURNING
          id,
          name,
          image_url
      `,
      [
        cleanName,
        cleanImage,
      ]
    );

  return newArtist.rows[0];
};


/* ============================================================
   RESOLVE ARTISTS
============================================================ */

const resolveArtists = async ({
  client,
  artistIds,
  artistId,
  artist,
  artistImageUrl,
}) => {

  const normalizedIds =
    normalizeArtistIds(
      artistIds,
      artistId
    );

  /* ----------------------------------------------------------
     1. EXISTING ARTISTS SELECTED
  ---------------------------------------------------------- */

  if (
    normalizedIds.length > 0
  ) {
    const artists =
      await getArtistsByIds(
        client,
        normalizedIds
      );

    if (
      artists.length !==
      normalizedIds.length
    ) {
      const foundIds = new Set(
        artists.map((item) =>
          String(item.id)
        )
      );

      const missingIds =
        normalizedIds.filter(
          (id) =>
            !foundIds.has(
              String(id)
            )
        );

      const error =
        new Error(
          `Selected artist(s) not found: ${missingIds.join(', ')}`
        );

      error.statusCode = 400;

      throw error;
    }

    return artists;
  }


  /* ----------------------------------------------------------
     2. OLD FRONTEND FALLBACK
  ---------------------------------------------------------- */

  const fallbackArtist =
    await getOrCreateArtist(
      client,
      artist,
      artistImageUrl
    );

  return [fallbackArtist];
};


/* ============================================================
   INSERT SONG ARTIST RELATIONSHIPS
============================================================ */

const insertSongArtistRelationships = async (
  client,
  songId,
  artists
) => {
  if (
    !songId ||
    !Array.isArray(artists) ||
    artists.length === 0
  ) {
    return;
  }

  for (const artist of artists) {
    await client.query(
      `
        INSERT INTO song_artists
        (
          song_id,
          artist_id
        )
        VALUES
        (
          $1,
          $2
        )
        ON CONFLICT DO NOTHING
      `,
      [
        songId,
        artist.id,
      ]
    );
  }
};


/* ============================================================
   GET SONG WITH ARTISTS
============================================================ */

const getSongWithArtists = async (
  client,
  songId
) => {
  const result =
    await client.query(
      `
        SELECT
          s.id,
          s.title,
          s.artist,
          s.artist_id,
          s.source_url,
          s.source_type,
          s.thumbnail_url,
          s.created_by,
          s.created_at,
          COALESCE(
            JSON_AGG(
              DISTINCT JSONB_BUILD_OBJECT(
                'id', a.id,
                'name', a.name,
                'image_url', a.image_url
              )
            )
            FILTER (
              WHERE a.id IS NOT NULL
            ),
            '[]'::json
          ) AS artists
        FROM songs s
        LEFT JOIN song_artists sa
          ON s.id = sa.song_id
        LEFT JOIN artists a
          ON sa.artist_id = a.id
        WHERE s.id = $1
        GROUP BY s.id
      `,
      [songId]
    );

  return result.rows[0] || null;
};


/* ============================================================
   ADD SONG
   POST /api/songs
============================================================ */

export const addSong =
  asyncHandler(
    async (req, res) => {

      const {
        title,
        artist,
        artistIds,
        artistId,
        artistImageUrl,
        sourceUrl,
        thumbnailUrl,
      } = req.body;

      /* ------------------------------------------------------
         VALIDATION
      ------------------------------------------------------ */

      if (
        !title ||
        !sourceUrl ||
        !thumbnailUrl
      ) {
        res.status(400);
        throw new Error(
          'Title, sourceUrl, and thumbnailUrl are required'
        );
      }

      const cleanTitle = String(title).trim();
      const cleanSourceUrl = String(sourceUrl).trim();
      const cleanThumbnailUrl = String(thumbnailUrl).trim();

      if (!cleanTitle) {
        res.status(400);
        throw new Error('Song title cannot be empty');
      }

      if (!cleanSourceUrl) {
        res.status(400);
        throw new Error('Source URL cannot be empty');
      }

      if (!cleanThumbnailUrl) {
        res.status(400);
        throw new Error('Thumbnail URL cannot be empty');
      }

      const sourceType = detectSource(cleanSourceUrl);

      /* ------------------------------------------------------
         TRANSACTION
      ------------------------------------------------------ */

      const client = await pool.connect();
      let newSong = null;

      try {
        await client.query('BEGIN');

        const resolvedArtists =
          await resolveArtists({
            client,
            artistIds,
            artistId,
            artist,
            artistImageUrl,
          });

        if (resolvedArtists.length === 0) {
          const error = new Error('At least one artist is required');
          error.statusCode = 400;
          throw error;
        }

        const primaryArtist = resolvedArtists[0];

        const songResult =
          await client.query(
            `
              INSERT INTO songs
              (
                title,
                artist,
                artist_id,
                source_url,
                source_type,
                thumbnail_url,
                created_by
              )
              VALUES
              (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7
              )
              RETURNING *
            `,
            [
              cleanTitle,
              primaryArtist.name,
              primaryArtist.id,
              cleanSourceUrl,
              sourceType,
              cleanThumbnailUrl,
              req.user.id,
            ]
          );

        newSong = songResult.rows[0];

        await insertSongArtistRelationships(
          client,
          newSong.id,
          resolvedArtists
        );

        await client.query('COMMIT');

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      /* ------------------------------------------------------
         NOTIFICATIONS
      ------------------------------------------------------ */

      try {
        await pool.query(
          `
            INSERT INTO notifications
            (
              user_id,
              title,
              message,
              type
            )
            SELECT
              id,
              $1,
              $2,
              $3
            FROM users
            WHERE role = 'user'
          `,
          [
            'New song added',
            `"${newSong.title}" is now available`,
            'song',
          ]
        );
      } catch (notificationError) {
        console.error(
          'Notification creation failed:',
          notificationError
        );
      }

      /* ------------------------------------------------------
         GET FINAL SONG WITH ARTISTS
      ------------------------------------------------------ */

      const finalSongClient = await pool.connect();
      let finalSong;

      try {
        finalSong =
          await getSongWithArtists(
            finalSongClient,
            newSong.id
          );
      } finally {
        finalSongClient.release();
      }

      res.status(201).json({
        success: true,
        song: finalSong || newSong,
      });
    }
  );


/* ============================================================
   GET ALL SONGS
   GET /api/songs
============================================================ */

export const getAllSongs =
  asyncHandler(
    async (req, res) => {

      const search =
        req.query.search
          ? `%${String(
              req.query.search
            ).trim()}%`
          : null;

      const platform =
        req.query.platform &&
        req.query.platform !== 'all'
          ? String(
              req.query.platform
            ).trim()
          : null;

      const userId =
        req.user?.id || null;

      const requestedLimit =
        Number.parseInt(
          req.query.limit,
          10
        );

      const requestedOffset =
        Number.parseInt(
          req.query.offset,
          10
        );

      const limit =
        Number.isInteger(
          requestedLimit
        ) &&
        requestedLimit > 0
          ? Math.min(
              requestedLimit,
              100
            )
          : 100;

      const offset =
        Number.isInteger(
          requestedOffset
        ) &&
        requestedOffset >= 0
          ? requestedOffset
          : 0;

      /* ------------------------------------------------------
         MAIN QUERY
      ------------------------------------------------------ */

      let sql = `
        SELECT
          s.id,
          s.title,
          s.artist,
          s.artist_id,
          s.source_url,
          s.source_type,
          s.thumbnail_url,
          s.created_by,
          s.created_at,
          COALESCE(
            JSON_AGG(
              DISTINCT JSONB_BUILD_OBJECT(
                'id', a.id,
                'name', a.name,
                'image_url', a.image_url
              )
            )
            FILTER (
              WHERE a.id IS NOT NULL
            ),
            '[]'::json
          ) AS artists,
          COUNT(
            DISTINCT l.user_id
          )::int AS likes_count,
          CASE
            WHEN $1::uuid IS NOT NULL
            AND EXISTS (
              SELECT 1
              FROM likes
              WHERE user_id = $1::uuid
              AND song_id = s.id
            )
            THEN true
            ELSE false
          END AS is_liked
        FROM songs s
        LEFT JOIN song_artists sa
          ON s.id = sa.song_id
        LEFT JOIN artists a
          ON sa.artist_id = a.id
        LEFT JOIN likes l
          ON s.id = l.song_id
        WHERE 1 = 1
      `;

      const params = [userId];
      let paramIndex = 2;

      /* ------------------------------------------------------
         SEARCH
      ------------------------------------------------------ */

      if (search) {
        sql += `
          AND (
            s.title ILIKE $${paramIndex}
            OR
            s.artist ILIKE $${paramIndex}
            OR
            EXISTS (
              SELECT 1
              FROM song_artists search_sa
              INNER JOIN artists search_a
                ON search_sa.artist_id = search_a.id
              WHERE search_sa.song_id = s.id
              AND search_a.name ILIKE $${paramIndex}
            )
          )
        `;
        params.push(search);
        paramIndex++;
      }

      /* ------------------------------------------------------
         PLATFORM
      ------------------------------------------------------ */

      if (platform) {
        sql += `
          AND s.source_type = $${paramIndex}
        `;
        params.push(platform);
        paramIndex++;
      }

      /* ------------------------------------------------------
         GROUP & ORDER
      ------------------------------------------------------ */

      sql += `
        GROUP BY s.id
        ORDER BY s.created_at DESC
        LIMIT $${paramIndex}
        OFFSET $${paramIndex + 1}
      `;

      params.push(limit);
      params.push(offset);

      const result = await pool.query(sql, params);

      /* ------------------------------------------------------
         COUNT
      ------------------------------------------------------ */

      let countSql = `
        SELECT
          COUNT(*)::int AS total
        FROM songs s
        WHERE 1 = 1
      `;

      const countParams = [];
      let countParamIndex = 1;

      if (search) {
        countSql += `
          AND (
            s.title ILIKE $${countParamIndex}
            OR
            s.artist ILIKE $${countParamIndex}
            OR
            EXISTS (
              SELECT 1
              FROM song_artists search_sa
              INNER JOIN artists search_a
                ON search_sa.artist_id = search_a.id
              WHERE search_sa.song_id = s.id
              AND search_a.name ILIKE $${countParamIndex}
            )
          )
        `;
        countParams.push(search);
        countParamIndex++;
      }

      if (platform) {
        countSql += `
          AND s.source_type = $${countParamIndex}
        `;
        countParams.push(platform);
        countParamIndex++;
      }

      const countResult = await pool.query(countSql, countParams);
      const total = Number(countResult.rows[0]?.total || 0);
      const hasMore = offset + result.rows.length < total;

      res.status(200).json({
        success: true,
        count: result.rows.length,
        total,
        limit,
        offset,
        hasMore,
        songs: result.rows,
      });
    }
  );


/* ============================================================
   GET SONGS BY ARTIST ID (ALL SONGS FOR ARTIST)
   GET /api/songs/artist/:artistId
============================================================ */

export const getSongsByArtistId =
  asyncHandler(
    async (req, res) => {
      const { artistId } = req.params;
      const userId = req.user?.id || null;

      if (!artistId) {
        res.status(400);
        throw new Error('Artist ID is required');
      }

      const sql = `
        SELECT
          s.id,
          s.title,
          s.artist,
          s.artist_id,
          s.source_url,
          s.source_type,
          s.thumbnail_url,
          s.created_by,
          s.created_at,
          COALESCE(
            JSON_AGG(
              DISTINCT JSONB_BUILD_OBJECT(
                'id', a.id,
                'name', a.name,
                'image_url', a.image_url
              )
            )
            FILTER (
              WHERE a.id IS NOT NULL
            ),
            '[]'::json
          ) AS artists,
          COUNT(
            DISTINCT l.user_id
          )::int AS likes_count,
          CASE
            WHEN $2::uuid IS NOT NULL
            AND EXISTS (
              SELECT 1
              FROM likes
              WHERE user_id = $2::uuid
              AND song_id = s.id
            )
            THEN true
            ELSE false
          END AS is_liked
        FROM songs s
        LEFT JOIN song_artists sa
          ON s.id = sa.song_id
        LEFT JOIN artists a
          ON sa.artist_id = a.id
        LEFT JOIN likes l
          ON s.id = l.song_id
        WHERE (
          s.artist_id = $1::uuid
          OR EXISTS (
            SELECT 1
            FROM song_artists sa_sub
            WHERE sa_sub.song_id = s.id
            AND sa_sub.artist_id = $1::uuid
          )
        )
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `;

      const result = await pool.query(sql, [artistId, userId]);

      res.status(200).json({
        success: true,
        count: result.rows.length,
        songs: result.rows,
      });
    }
  );


/* ============================================================
   GET TRENDING SONGS
   GET /api/songs/trending
============================================================ */

export const getTrendingSongs =
  asyncHandler(
    async (req, res) => {

      const userId = req.user?.id || null;

      const result =
        await pool.query(
          `
            SELECT
              s.id,
              s.title,
              s.artist,
              s.artist_id,
              s.source_url,
              s.source_type,
              s.thumbnail_url,
              s.created_by,
              s.created_at,
              COALESCE(
                JSON_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                    'id', a.id,
                    'name', a.name,
                    'image_url', a.image_url
                  )
                )
                FILTER (
                  WHERE a.id IS NOT NULL
                ),
                '[]'::json
              ) AS artists,
              COUNT(
                DISTINCT l.user_id
              )::int AS likes_count,
              CASE
                WHEN $1::uuid IS NOT NULL
                AND EXISTS (
                  SELECT 1
                  FROM likes
                  WHERE user_id = $1::uuid
                  AND song_id = s.id
                )
                THEN true
                ELSE false
              END AS is_liked
            FROM songs s
            LEFT JOIN song_artists sa
              ON s.id = sa.song_id
            LEFT JOIN artists a
              ON sa.artist_id = a.id
            LEFT JOIN likes l
              ON s.id = l.song_id
            GROUP BY s.id
            ORDER BY
              COUNT(
                DISTINCT l.user_id
              ) DESC,
              s.created_at DESC
            LIMIT 5
          `,
          [userId]
        );

      res.status(200).json({
        success: true,
        count: result.rows.length,
        songs: result.rows,
      });
    }
  );


/* ============================================================
   DELETE SONG
   DELETE /api/songs/:id
============================================================ */

export const deleteSong =
  asyncHandler(
    async (req, res) => {

      const { id } = req.params;
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        await client.query(
          `
            DELETE FROM song_artists
            WHERE song_id = $1
          `,
          [id]
        );

        const result =
          await client.query(
            `
              DELETE FROM songs
              WHERE id = $1
              RETURNING id
            `,
            [id]
          );

        if (result.rowCount === 0) {
          await client.query('ROLLBACK');
          res.status(404);
          throw new Error('Song not found');
        }

        await client.query('COMMIT');

        res.status(200).json({
          success: true,
          message: 'Song removed',
        });

      } catch (error) {
        try {
          await client.query('ROLLBACK');
        } catch {
          // Ignore rollback error
        }
        throw error;
      } finally {
        client.release();
      }
    }
  );


/* ============================================================
   UPDATE SONG
   PUT /api/songs/:id
============================================================ */

export const updateSong =
  asyncHandler(
    async (req, res) => {

      const { id } = req.params;

      const {
        title,
        artist,
        artistIds,
        artistId,
        artistImageUrl,
        sourceUrl,
        thumbnailUrl,
      } = req.body;

      /* ------------------------------------------------------
         VALIDATION
      ------------------------------------------------------ */

      if (
        !title ||
        !sourceUrl ||
        !thumbnailUrl
      ) {
        res.status(400);
        throw new Error(
          'Title, sourceUrl, and thumbnailUrl are required'
        );
      }

      const cleanTitle = String(title).trim();
      const cleanSourceUrl = String(sourceUrl).trim();
      const cleanThumbnailUrl = String(thumbnailUrl).trim();

      if (!cleanTitle) {
        res.status(400);
        throw new Error('Song title cannot be empty');
      }

      if (!cleanSourceUrl) {
        res.status(400);
        throw new Error('Source URL cannot be empty');
      }

      if (!cleanThumbnailUrl) {
        res.status(400);
        throw new Error('Thumbnail URL cannot be empty');
      }

      const sourceType = detectSource(cleanSourceUrl);

      /* ------------------------------------------------------
         TRANSACTION
      ------------------------------------------------------ */

      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        const existingSong =
          await client.query(
            `
              SELECT id
              FROM songs
              WHERE id = $1
              FOR UPDATE
            `,
            [id]
          );

        if (existingSong.rowCount === 0) {
          const error = new Error('Song not found');
          error.statusCode = 404;
          throw error;
        }

        const resolvedArtists =
          await resolveArtists({
            client,
            artistIds,
            artistId,
            artist,
            artistImageUrl,
          });

        if (resolvedArtists.length === 0) {
          const error = new Error('At least one artist is required');
          error.statusCode = 400;
          throw error;
        }

        const primaryArtist = resolvedArtists[0];

        await client.query(
          `
            UPDATE songs
            SET
              title = $1,
              artist = $2,
              artist_id = $3,
              source_url = $4,
              source_type = $5,
              thumbnail_url = $6
            WHERE id = $7
          `,
          [
            cleanTitle,
            primaryArtist.name,
            primaryArtist.id,
            cleanSourceUrl,
            sourceType,
            cleanThumbnailUrl,
            id,
          ]
        );

        await client.query(
          `
            DELETE FROM song_artists
            WHERE song_id = $1
          `,
          [id]
        );

        await insertSongArtistRelationships(
          client,
          id,
          resolvedArtists
        );

        const updatedSong =
          await getSongWithArtists(
            client,
            id
          );

        await client.query('COMMIT');

        res.status(200).json({
          success: true,
          song: updatedSong,
        });

      } catch (error) {
        try {
          await client.query('ROLLBACK');
        } catch {
          // Ignore rollback error
        }
        throw error;
      } finally {
        client.release();
      }
    }
  );