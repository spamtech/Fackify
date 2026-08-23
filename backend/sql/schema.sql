CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Songs Table
CREATE TABLE IF NOT EXISTS songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) DEFAULT 'Unknown Artist',
    source_url TEXT NOT NULL,
    source_type VARCHAR(50) DEFAULT 'youtube',
    thumbnail_url TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Likes Table (Join Table)
CREATE TABLE IF NOT EXISTS likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, song_id)
);


SELECT id, username, email, role FROM users;


ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;



-- 1. Playlists Table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Playlist Songs Join Table (Junction)
CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (playlist_id, song_id)
);

SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'playlists'
ORDER BY ordinal_position;


CREATE TABLE IF NOT EXISTS playlists (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    is_public BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id INTEGER NOT NULL
        REFERENCES playlists(id)
        ON DELETE CASCADE,

    song_id INTEGER NOT NULL
        REFERENCES songs(id)
        ON DELETE CASCADE,

    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (playlist_id, song_id)
);



SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'playlist_songs';

ALTER TABLE playlist_songs
ADD CONSTRAINT playlist_songs_playlist_id_song_id_key
UNIQUE (playlist_id, song_id);

SELECT * FROM playlist_songs;


CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    type VARCHAR(50) NOT NULL DEFAULT 'system',

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    link VARCHAR(500),

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
ON notifications(created_at DESC);



SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'playlists'
ORDER BY ordinal_position;


SELECT *
FROM playlists
LIMIT 5;



SELECT *
FROM playlists
ORDER BY created_at DESC;


SELECT
    p.id AS playlist_id,
    p.name AS playlist_name,
    p.is_public,
    u.username AS created_by,
    s.id AS song_id,
    s.title AS song_title,
    s.artist AS song_artist,
    ps.added_at
FROM playlists p
JOIN users u
    ON p.user_id = u.id
LEFT JOIN playlist_songs ps
    ON p.id = ps.playlist_id
LEFT JOIN songs s
    ON ps.song_id = s.id
ORDER BY
    p.created_at DESC,
    ps.added_at DESC;




SELECT
    p.id,
    p.name,
    u.username AS created_by,
    p.created_at
FROM playlists p
JOIN users u
    ON p.user_id = u.id
WHERE p.is_public = false
ORDER BY p.created_at DESC;



SELECT
    p.id,
    p.name,
    u.username AS created_by,
    p.created_at
FROM playlists p
JOIN users u
    ON p.user_id = u.id
WHERE p.is_public = true
ORDER BY p.created_at DESC;





/* ============================================================
   ARTISTS TABLE
============================================================ */

CREATE TABLE IF NOT EXISTS artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    image_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


/* ============================================================
   UNIQUE ARTIST NAME
============================================================ */

CREATE UNIQUE INDEX IF NOT EXISTS
artists_name_unique_idx
ON artists (LOWER(TRIM(name)));


/* ============================================================
   ADD ARTIST ID TO SONGS
============================================================ */

ALTER TABLE songs
ADD COLUMN IF NOT EXISTS artist_id UUID;


/* ============================================================
   FOREIGN KEY
============================================================ */

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'songs_artist_id_fkey'
    ) THEN

        ALTER TABLE songs
        ADD CONSTRAINT songs_artist_id_fkey
        FOREIGN KEY (artist_id)
        REFERENCES artists(id)
        ON DELETE SET NULL;

    END IF;

END $$;


/* ============================================================
   INDEX
============================================================ */

CREATE INDEX IF NOT EXISTS
songs_artist_id_idx
ON songs(artist_id);



INSERT INTO artists (name)
SELECT DISTINCT TRIM(artist)
FROM songs
WHERE artist IS NOT NULL
  AND TRIM(artist) <> ''
  AND NOT EXISTS (
      SELECT 1
      FROM artists a
      WHERE LOWER(TRIM(a.name)) = LOWER(TRIM(songs.artist))
  );




UPDATE songs s
SET artist_id = a.id
FROM artists a
WHERE s.artist_id IS NULL
AND LOWER(TRIM(s.artist)) = LOWER(TRIM(a.name));



CREATE TABLE IF NOT EXISTS song_artists (
    song_id UUID NOT NULL,
    artist_id UUID NOT NULL,

    PRIMARY KEY (song_id, artist_id),

    CONSTRAINT song_artists_song_fkey
        FOREIGN KEY (song_id)
        REFERENCES songs(id)
        ON DELETE CASCADE,

    CONSTRAINT song_artists_artist_fkey
        FOREIGN KEY (artist_id)
        REFERENCES artists(id)
        ON DELETE CASCADE
);