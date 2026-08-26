import React, { useMemo, useState } from 'react';
import ReactPlayer from 'react-player/youtube';

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Video,
  VideoOff,
  Music2,
  Waves,
  Sparkles,
  ListMusic,
  X,
  Trash2,
  Maximize2,
} from 'lucide-react';

import { usePlayer } from '../context/PlayerContext';
import MaxPlayer from './MaxPlayer';

/* =========================================================
   TIME FORMATTER
========================================================= */

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

/* =========================================================
   ARTIST FORMATTER
========================================================= */

const getArtistName = (song) => {
  if (!song) {
    return 'Unknown Artist';
  }

  if (
    Array.isArray(song.artists) &&
    song.artists.length > 0
  ) {
    return song.artists
      .map((artist) => {
        if (typeof artist === 'string') {
          return artist;
        }

        return (
          artist?.name ||
          artist?.artist_name ||
          artist?.artist ||
          ''
        );
      })
      .filter(Boolean)
      .join(' • ');
  }

  if (
    Array.isArray(song.artist_names) &&
    song.artist_names.length > 0
  ) {
    return song.artist_names
      .filter(Boolean)
      .join(' • ');
  }

  if (song.artist_name) {
    return song.artist_name;
  }

  if (song.artist) {
    return song.artist;
  }

  return 'Unknown Artist';
};

/* =========================================================
   MAIN PLAYER
========================================================= */

export default function MediaPlayer() {
  const {
    /* =====================================================
       SONG
    ====================================================== */

    currentSong,

    /* =====================================================
       PLAYBACK
    ====================================================== */

    isPlaying,
    togglePlay,
    nextSong,
    prevSong,

    /* =====================================================
       PROGRESS
    ====================================================== */

    progress,
    setProgress,
    duration,
    setDuration,

    /* =====================================================
       VOLUME
    ====================================================== */

    volume,
    setVolume,
    isMuted,
    toggleMute,

    /* =====================================================
       SHUFFLE / REPEAT
    ====================================================== */

    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,

    /* =====================================================
       VIDEO
    ====================================================== */

    showVideo,
    setShowVideo,

    /* =====================================================
       SEEK / PLAYER
    ====================================================== */

    handleSeekChange,
    handleSeekMouseUp,
    handleEnded,
    playerRef,
    isSeeking,

    /* =====================================================
       COLORS
    ====================================================== */

    songColors,

    /* =====================================================
       QUEUE
    ====================================================== */

    queue,
    playQueueSong,
    removeFromQueue,
    clearQueue,
    getCurrentIndex,
  } = usePlayer();

  /* =========================================================
     QUEUE PANEL STATE
  ========================================================= */

  const [showQueue, setShowQueue] = useState(false);

  /* =========================================================
     MAX PLAYER STATE
  ========================================================= */

  const [showMaxPlayer, setShowMaxPlayer] = useState(false);

  /* =========================================================
     ARTIST
  ========================================================= */

  const artistName = useMemo(
    () => getArtistName(currentSong),
    [currentSong]
  );

  /* =========================================================
     SAFE QUEUE
  ========================================================= */

  const safeQueue = Array.isArray(queue)
    ? queue
    : [];

  /* =========================================================
     CURRENT QUEUE INDEX
  ========================================================= */

  const currentQueueIndex = currentSong
    ? getCurrentIndex()
    : -1;

  /* =========================================================
     NO SONG
  ========================================================= */

  if (!currentSong) {
    return null;
  }

  /* =========================================================
     DYNAMIC COLORS
  ========================================================= */

  const colors = songColors || {
    primary: '#10b981',
    secondary: '#06b6d4',
    accent: '#34d399',
    glow: 'rgba(16, 185, 129, 0.18)',
    background: '#020617',
  };

  /* =========================================================
     PROGRESS
  ========================================================= */

  const progressPercent =
    duration > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (progress / duration) * 100
          )
        )
      : 0;

  /* =========================================================
     VOLUME
  ========================================================= */

  const volumePercent =
    isMuted ? 0 : volume * 100;

  /* =========================================================
     DYNAMIC PLAYER STYLE
  ========================================================= */

  const playerStyle = {
    '--player-primary': colors.primary,
    '--player-secondary': colors.secondary,
    '--player-accent': colors.accent,
    '--player-glow': colors.glow,
    '--player-background': colors.background,
  };

  /* =========================================================
     QUEUE HANDLERS
  ========================================================= */

  const handleQueueSongClick = (song) => {
    if (!song) {
      return;
    }

    playQueueSong(song);

    setShowQueue(false);
  };

  const handleRemoveQueueSong = (
    event,
    songId
  ) => {
    event.stopPropagation();

    if (!songId) {
      return;
    }

    removeFromQueue(songId);
  };

  const handleClearQueue = () => {
    clearQueue();
  };

  return (
    <>
      {/* =====================================================
          CINEMATIC AMBIENT BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-[35]
          overflow-hidden
        "
        style={playerStyle}
      >
        {/* Primary glow */}

        <div
          className={`
            absolute
            bottom-0
            left-1/2
            h-[420px]
            w-[80%]
            -translate-x-1/2
            rounded-full
            blur-[120px]
            transition-all
            duration-[1200ms]
            ${
              isPlaying
                ? 'opacity-[0.13]'
                : 'opacity-[0.06]'
            }
          `}
          style={{
            background: colors.primary,
          }}
        />

        {/* Secondary glow */}

        <div
          className="
            absolute
            bottom-[-180px]
            right-[-100px]
            h-[350px]
            w-[350px]
            rounded-full
            blur-[110px]
            opacity-[0.08]
          "
          style={{
            background: colors.secondary,
          }}
        />
      </div>

      {/* =====================================================
          VIDEO PLAYER
      ====================================================== */}

      <div
        className={`
          fixed
          z-[70]
          overflow-hidden
          bg-black
          transition-all
          duration-500
          ${
            showVideo
              ? `
                bottom-[155px]
                right-3
                w-[calc(100vw-1.5rem)]
                max-w-[460px]
                aspect-video
                rounded-2xl
                border
                border-white/10
                opacity-100
                shadow-[0_25px_100px_rgba(0,0,0,0.75)]
                sm:right-5
                sm:bottom-[115px]
                sm:rounded-3xl
              `
              : `
                pointer-events-none
                -top-[9999px]
                left-0
                h-0
                w-0
                opacity-0
              `
          }
        `}
      >
        {showVideo && (
          <>
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                z-10
                rounded-2xl
                ring-1
                ring-inset
                ring-white/[0.08]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                z-10
                bg-gradient-to-t
                from-black/20
                via-transparent
                to-white/[0.04]
              "
            />
          </>
        )}

        <ReactPlayer
          ref={playerRef}
          url={currentSong.source_url}
          playing={isPlaying}
          volume={isMuted ? 0 : volume}
          muted={isMuted}
          controls={showVideo}
          width="100%"
          height="100%"
          playsInline
          onReady={() => {
            console.log(
              'PLAYER READY:',
              currentSong.source_url
            );
          }}
          onPlay={() => {
            console.log(
              'PLAYER PLAYING:',
              currentSong.title
            );
          }}
          onPause={() => {
            console.log(
              'PLAYER PAUSED:',
              currentSong.title
            );
          }}
          onProgress={(state) => {
            if (!isSeeking) {
              setProgress(
                state.playedSeconds
              );
            }
          }}
          onDuration={(seconds) => {
            setDuration(seconds);
          }}
          onEnded={() => {
            handleEnded();
          }}
          onError={(error) => {
            console.error(
              'PLAYER ERROR:',
              error
            );
          }}
        />
      </div>

      {/* =====================================================
          QUEUE PANEL
      ====================================================== */}

      {showQueue && (
        <div
          className="
            fixed
            bottom-[105px]
            right-3
            z-[80]
            w-[calc(100vw-1.5rem)]
            max-w-[390px]
            overflow-hidden
            rounded-3xl
            border
            border-white/[0.10]
            bg-slate-950/95
            shadow-[0_25px_100px_rgba(0,0,0,0.8)]
            backdrop-blur-3xl
            sm:right-5
            sm:bottom-[105px]
          "
          style={{
            boxShadow: `
              0 25px 100px rgba(0,0,0,0.8),
              0 0 40px ${colors.glow}
            `,
          }}
        >
          {/* =================================================
              QUEUE HEADER
          ================================================== */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-white/[0.07]
              px-4
              py-3.5
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                "
                style={{
                  background:
                    `${colors.primary}18`,
                  color:
                    colors.primary,
                }}
              >
                <ListMusic className="h-4 w-4" />
              </div>

              <div>
                <h3
                  className="
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  Playing Queue
                </h3>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-slate-500
                  "
                >
                  {safeQueue.length}{' '}
                  {safeQueue.length === 1
                    ? 'song'
                    : 'songs'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {safeQueue.length > 1 && (
                <button
                  type="button"
                  onClick={
                    handleClearQueue
                  }
                  title="Clear queue"
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-500
                    transition-all
                    hover:bg-rose-500/10
                    hover:text-rose-400
                    active:scale-90
                  "
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setShowQueue(false)
                }
                title="Close queue"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-500
                  transition-all
                  hover:bg-white/[0.06]
                  hover:text-white
                  active:scale-90
                "
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* =================================================
              QUEUE LIST
          ================================================== */}

          <div
            className="
              max-h-[55vh]
              overflow-y-auto
              p-2
            "
          >
            {safeQueue.length === 0 ? (
              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  px-5
                  py-12
                  text-center
                "
              >
                <div
                  className="
                    mb-3
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                  "
                  style={{
                    background:
                      `${colors.primary}12`,
                    color:
                      colors.primary,
                  }}
                >
                  <ListMusic className="h-6 w-6" />
                </div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Queue is empty
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Add songs to start
                  building your queue.
                </p>
              </div>
            ) : (
              safeQueue.map(
                (song, index) => {
                  const isCurrent =
                    currentSong &&
                    String(song.id) ===
                      String(
                        currentSong.id
                      );

                  return (
                    <div
                      key={`${song.id}-${index}`}
                      onClick={() =>
                        handleQueueSongClick(
                          song
                        )
                      }
                      className={`
                        group
                        mb-1
                        flex
                        cursor-pointer
                        items-center
                        gap-3
                        rounded-2xl
                        p-2
                        transition-all
                        duration-200
                        ${
                          isCurrent
                            ? 'bg-white/[0.07]'
                            : 'hover:bg-white/[0.045]'
                        }
                      `}
                    >
                      {/* INDEX */}

                      <div
                        className="
                          w-5
                          shrink-0
                          text-center
                          text-[10px]
                          font-mono
                          text-slate-600
                        "
                      >
                        {isCurrent ? (
                          <div
                            className="
                              mx-auto
                              flex
                              h-4
                              w-4
                              items-end
                              justify-center
                              gap-[2px]
                            "
                          >
                            <span
                              className="
                                h-2
                                w-[2px]
                                rounded-full
                                animate-[musicbar_0.6s_ease-in-out_infinite]
                              "
                              style={{
                                background:
                                  colors.primary,
                              }}
                            />

                            <span
                              className="
                                h-3
                                w-[2px]
                                rounded-full
                                animate-[musicbar_0.8s_ease-in-out_infinite]
                              "
                              style={{
                                background:
                                  colors.primary,
                              }}
                            />

                            <span
                              className="
                                h-2
                                w-[2px]
                                rounded-full
                                animate-[musicbar_0.5s_ease-in-out_infinite]
                              "
                              style={{
                                background:
                                  colors.primary,
                              }}
                            />
                          </div>
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* ARTWORK */}

                      <div
                        className="
                          relative
                          h-11
                          w-11
                          shrink-0
                          overflow-hidden
                          rounded-xl
                          border
                          border-white/[0.08]
                          bg-slate-900
                        "
                      >
                        {song.thumbnail_url ? (
                          <img
                            src={
                              song.thumbnail_url
                            }
                            alt={
                              song.title ||
                              'Song'
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        ) : (
                          <div
                            className="
                              flex
                              h-full
                              w-full
                              items-center
                              justify-center
                            "
                          >
                            <Music2
                              className="h-4 w-4"
                              style={{
                                color:
                                  colors.primary,
                              }}
                            />
                          </div>
                        )}

                        {isCurrent && (
                          <div
                            className="
                              absolute
                              inset-0
                              bg-black/30
                            "
                          />
                        )}
                      </div>

                      {/* SONG INFO */}

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <p
                          className={`
                            truncate
                            text-xs
                            font-semibold
                            ${
                              isCurrent
                                ? 'text-white'
                                : 'text-slate-300'
                            }
                          `}
                          style={
                            isCurrent
                              ? {
                                  color:
                                    colors.primary,
                                }
                              : undefined
                          }
                        >
                          {song.title ||
                            'Untitled Song'}
                        </p>

                        <p
                          className="
                            mt-0.5
                            truncate
                            text-[10px]
                            text-slate-500
                          "
                        >
                          {getArtistName(
                            song
                          )}
                        </p>

                        {isCurrent && (
                          <span
                            className="
                              mt-1
                              inline-flex
                              items-center
                              rounded-full
                              px-1.5
                              py-0.5
                              text-[7px]
                              font-bold
                              uppercase
                              tracking-wider
                            "
                            style={{
                              color:
                                colors.primary,
                              background:
                                `${colors.primary}12`,
                            }}
                          >
                            Currently
                            Playing
                          </span>
                        )}
                      </div>

                      {/* REMOVE */}

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={(event) =>
                            handleRemoveQueueSong(
                              event,
                              song.id
                            )
                          }
                          title="Remove from queue"
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-slate-600
                            opacity-100
                            transition-all
                            hover:bg-rose-500/10
                            hover:text-rose-400
                            active:scale-90
                            sm:opacity-0
                            sm:group-hover:opacity-100
                          "
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                }
              )
            )}
          </div>

          {/* =================================================
              QUEUE FOOTER
          ================================================== */}

          {safeQueue.length > 0 && (
            <div
              className="
                border-t
                border-white/[0.06]
                px-4
                py-2.5
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  text-[9px]
                  uppercase
                  tracking-wider
                  text-slate-600
                "
              >
                <span>
                  {currentQueueIndex >= 0
                    ? `${currentQueueIndex + 1} of ${safeQueue.length}`
                    : `${safeQueue.length} songs`}
                </span>

                <span>
                  Click a song to play
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          MAIN PLAYER
      ====================================================== */}

      <div
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-50
          px-2
          pb-2
          sm:px-4
          sm:pb-3
        "
      >
        <div
          style={playerStyle}
          className="
            relative
            mx-auto
            max-w-7xl
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.09]
            bg-slate-950/90
            shadow-[0_-20px_90px_rgba(0,0,0,0.65)]
            backdrop-blur-3xl
            sm:rounded-3xl
          "
        >
          {/* =================================================
              CINEMATIC PLAYER BACKGROUND
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              overflow-hidden
            "
          >
            {/* Primary */}

            <div
              className={`
                absolute
                -left-24
                -top-36
                h-80
                w-80
                rounded-full
                blur-[90px]
                transition-all
                duration-1000
                ${
                  isPlaying
                    ? 'opacity-[0.14]'
                    : 'opacity-[0.06]'
                }
              `}
              style={{
                background:
                  colors.primary,
              }}
            />

            {/* Secondary */}

            <div
              className="
                absolute
                -bottom-40
                -right-20
                h-96
                w-96
                rounded-full
                blur-[100px]
                opacity-[0.08]
              "
              style={{
                background:
                  colors.secondary,
              }}
            />

            {/* Top cinematic line */}

            <div
              className="
                absolute
                inset-x-0
                top-0
                h-px
                opacity-60
              "
              style={{
                background: `linear-gradient(
                  90deg,
                  transparent,
                  ${colors.primary},
                  ${colors.secondary},
                  transparent
                )`,
              }}
            />

            {/* Glass */}

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-b
                from-white/[0.025]
                via-transparent
                to-black/20
              "
            />
          </div>

          {/* =================================================
              DESKTOP
          ================================================== */}

          <div
            className="
              relative
              hidden
              items-center
              gap-5
              px-5
              py-3.5
              md:grid
              md:grid-cols-[minmax(0,1fr)_minmax(360px,440px)_minmax(0,1fr)]
              lg:gap-8
            "
          >
            {/* =================================================
                LEFT — SONG
            ================================================== */}

            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >
              {/* Artwork */}

              <div
                className="
                  group
                  relative
                  h-14
                  w-14
                  shrink-0
                  overflow-hidden
                  rounded-xl
                  border
                  border-white/[0.10]
                  bg-slate-900
                  shadow-xl
                  transition-all
                  duration-500
                "
                style={{
                  boxShadow: isPlaying
                    ? `0 0 35px ${colors.glow}`
                    : undefined,
                }}
              >
                {currentSong.thumbnail_url ? (
                  <img
                    src={
                      currentSong.thumbnail_url
                    }
                    alt={
                      currentSong.title ||
                      'Song artwork'
                    }
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-700
                      group-hover:scale-110
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      w-full
                      items-center
                      justify-center
                    "
                    style={{
                      background:
                        colors.background,
                    }}
                  >
                    <Music2
                      className="h-6 w-6"
                      style={{
                        color:
                          colors.primary,
                      }}
                    />
                  </div>
                )}

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/70
                    via-transparent
                    to-transparent
                  "
                />

                {isPlaying && (
                  <div
                    className="
                      absolute
                      bottom-1.5
                      left-1/2
                      flex
                      h-4
                      -translate-x-1/2
                      items-end
                      gap-[2px]
                    "
                  >
                    <span
                      className="
                        h-2
                        w-[2px]
                        rounded-full
                        animate-[musicbar_0.65s_ease-in-out_infinite]
                      "
                      style={{
                        background:
                          colors.primary,
                      }}
                    />

                    <span
                      className="
                        h-4
                        w-[2px]
                        rounded-full
                        animate-[musicbar_0.85s_ease-in-out_infinite]
                      "
                      style={{
                        background:
                          colors.primary,
                      }}
                    />

                    <span
                      className="
                        h-3
                        w-[2px]
                        rounded-full
                        animate-[musicbar_0.55s_ease-in-out_infinite]
                      "
                      style={{
                        background:
                          colors.primary,
                      }}
                    />

                    <span
                      className="
                        h-4
                        w-[2px]
                        rounded-full
                        animate-[musicbar_0.75s_ease-in-out_infinite]
                      "
                      style={{
                        background:
                          colors.primary,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Song info */}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4
                    className="
                      max-w-[210px]
                      truncate
                      text-sm
                      font-bold
                      tracking-tight
                      text-white
                    "
                  >
                    {currentSong.title}
                  </h4>

                  {isPlaying && (
                    <span
                      className="
                        hidden
                        shrink-0
                        items-center
                        gap-1
                        rounded-full
                        border
                        px-1.5
                        py-0.5
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-wider
                        lg:inline-flex
                      "
                      style={{
                        color:
                          colors.primary,
                        borderColor:
                          `${colors.primary}30`,
                        background:
                          `${colors.primary}12`,
                      }}
                    >
                      <span
                        className="
                          h-1
                          w-1
                          rounded-full
                          animate-pulse
                        "
                        style={{
                          background:
                            colors.primary,
                        }}
                      />

                      Playing
                    </span>
                  )}
                </div>

                <p
                  className="
                    mt-1
                    max-w-[240px]
                    truncate
                    text-xs
                    text-slate-400
                  "
                >
                  {artistName}
                </p>

                <div
                  className="
                    mt-1.5
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <span
                    className="
                      h-1
                      w-1
                      rounded-full
                    "
                    style={{
                      background:
                        colors.primary,
                    }}
                  />

                  <span
                    className="
                      text-[9px]
                      font-medium
                      uppercase
                      tracking-wider
                      text-slate-600
                    "
                  >
                    Now playing
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                CENTER — CONTROLS
            ================================================== */}

            <div
              className="
                flex
                w-full
                flex-col
                items-center
              "
            >
              <div className="flex items-center gap-1.5">
                {/* Shuffle */}

                <button
                  type="button"
                  onClick={toggleShuffle}
                  title={
                    isShuffle
                      ? 'Shuffle On'
                      : 'Shuffle Off'
                  }
                  className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    transition-all
                    duration-200
                    active:scale-90
                    ${
                      isShuffle
                        ? 'bg-white/[0.06]'
                        : 'text-slate-500 hover:bg-white/[0.05] hover:text-white'
                    }
                  `}
                  style={
                    isShuffle
                      ? {
                          color:
                            colors.primary,
                        }
                      : undefined
                  }
                >
                  <Shuffle className="h-4 w-4" />
                </button>

                {/* Previous */}

                <button
                  type="button"
                  onClick={prevSong}
                  title="Previous"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    text-slate-300
                    transition-all
                    hover:bg-white/[0.05]
                    hover:text-white
                    active:scale-90
                  "
                >
                  <SkipBack className="h-5 w-5 fill-current" />
                </button>

                {/* Play */}

                <button
                  type="button"
                  onClick={togglePlay}
                  title={
                    isPlaying
                      ? 'Pause'
                      : 'Play'
                  }
                  className="
                    group
                    relative
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    text-slate-950
                    shadow-2xl
                    transition-all
                    duration-300
                    hover:scale-105
                    active:scale-95
                  "
                  style={{
                    background:
                      `linear-gradient(
                        135deg,
                        ${colors.primary},
                        ${colors.secondary}
                      )`,
                    boxShadow:
                      isPlaying
                        ? `0 0 35px ${colors.glow}`
                        : `0 0 20px ${colors.glow}`,
                  }}
                >
                  <span
                    className="
                      absolute
                      inset-[-5px]
                      rounded-full
                      border
                      opacity-40
                      transition-all
                      duration-500
                      group-hover:scale-110
                    "
                    style={{
                      borderColor:
                        colors.primary,
                    }}
                  />

                  {isPlaying && (
                    <span
                      className="
                        absolute
                        inset-[-10px]
                        rounded-full
                        border
                        opacity-20
                        animate-ping
                      "
                      style={{
                        borderColor:
                          colors.primary,
                      }}
                    />
                  )}

                  <span className="relative z-10">
                    {isPlaying ? (
                      <Pause className="h-5 w-5 fill-current" />
                    ) : (
                      <Play className="ml-0.5 h-5 w-5 fill-current" />
                    )}
                  </span>
                </button>

                {/* Next */}

                <button
                  type="button"
                  onClick={nextSong}
                  title="Next"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    text-slate-300
                    transition-all
                    hover:bg-white/[0.05]
                    hover:text-white
                    active:scale-90
                  "
                >
                  <SkipForward className="h-5 w-5 fill-current" />
                </button>

                {/* Repeat */}

                <button
                  type="button"
                  onClick={toggleRepeat}
                  title={`Repeat: ${repeatMode}`}
                  className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    transition-all
                    active:scale-90
                    ${
                      repeatMode !== 'off'
                        ? 'bg-white/[0.06]'
                        : 'text-slate-500 hover:bg-white/[0.05] hover:text-white'
                    }
                  `}
                  style={
                    repeatMode !== 'off'
                      ? {
                          color:
                            colors.primary,
                        }
                      : undefined
                  }
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="h-4 w-4" />
                  ) : (
                    <Repeat className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Progress */}

              <div
                className="
                  mt-2.5
                  flex
                  w-full
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    w-9
                    shrink-0
                    text-right
                    font-mono
                    text-[10px]
                    tabular-nums
                    text-slate-500
                  "
                >
                  {formatTime(progress)}
                </span>

                <div
                  className="
                    group
                    relative
                    flex-1
                  "
                >
                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-0
                      top-1/2
                      h-1
                      -translate-y-1/2
                      rounded-full
                      blur-md
                    "
                    style={{
                      width:
                        `${progressPercent}%`,
                      background:
                        colors.primary,
                      opacity: 0.35,
                    }}
                  />

                  <div
                    className="
                      relative
                      h-1.5
                      w-full
                      overflow-hidden
                      rounded-full
                      bg-slate-800/90
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                      "
                      style={{
                        width:
                          `${progressPercent}%`,
                        background:
                          `linear-gradient(
                            90deg,
                            ${colors.primary},
                            ${colors.secondary}
                          )`,
                      }}
                    />
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.1"
                    value={
                      duration
                        ? Math.min(
                            progress,
                            duration
                          )
                        : 0
                    }
                    onChange={
                      handleSeekChange
                    }
                    onMouseUp={
                      handleSeekMouseUp
                    }
                    onTouchEnd={
                      handleSeekMouseUp
                    }
                    disabled={!duration}
                    aria-label="Seek"
                    className="
                      absolute
                      left-0
                      top-1/2
                      h-5
                      w-full
                      -translate-y-1/2
                      cursor-pointer
                      opacity-0
                    "
                  />

                  {duration > 0 && (
                    <div
                      className="
                        pointer-events-none
                        absolute
                        top-1/2
                        h-2.5
                        w-2.5
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-white
                        opacity-0
                        shadow-lg
                        transition-opacity
                        group-hover:opacity-100
                      "
                      style={{
                        left:
                          `${progressPercent}%`,
                        boxShadow:
                          `0 0 12px ${colors.primary}`,
                      }}
                    />
                  )}
                </div>

                <span
                  className="
                    w-9
                    shrink-0
                    font-mono
                    text-[10px]
                    tabular-nums
                    text-slate-500
                  "
                >
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* =================================================
                RIGHT — QUEUE + VIDEO + MAXIMIZE + VOLUME
            ================================================== */}

            <div
              className="
                flex
                items-center
                justify-end
                gap-3
              "
            >
              {/* =================================================
                  QUEUE
              ================================================== */}

              <button
                type="button"
                onClick={() =>
                  setShowQueue(
                    (previous) =>
                      !previous
                  )
                }
                title="Playing Queue"
                className="
                  relative
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.03]
                  text-slate-500
                  transition-all
                  duration-200
                  hover:bg-white/[0.06]
                  hover:text-white
                  active:scale-90
                "
                style={
                  showQueue
                    ? {
                        color:
                          colors.primary,
                        borderColor:
                          `${colors.primary}30`,
                        background:
                          `${colors.primary}10`,
                      }
                    : undefined
                }
              >
                <ListMusic className="h-4 w-4" />

                {safeQueue.length > 0 && (
                  <span
                    className="
                      absolute
                      -right-1
                      -top-1
                      flex
                      h-4
                      min-w-4
                      items-center
                      justify-center
                      rounded-full
                      px-1
                      text-[8px]
                      font-bold
                      text-slate-950
                    "
                    style={{
                      background:
                        colors.primary,
                    }}
                  >
                    {safeQueue.length > 99
                      ? '99+'
                      : safeQueue.length}
                  </span>
                )}
              </button>

              {/* Divider */}

              <div
                className="
                  h-7
                  w-px
                  bg-white/[0.06]
                "
              />

              {/* =================================================
                  VIDEO
              ================================================== */}

              <button
                type="button"
                onClick={() =>
                  setShowVideo(
                    (previous) =>
                      !previous
                  )
                }
                title={
                  showVideo
                    ? 'Hide Video'
                    : 'Show Video'
                }
                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  transition-all
                  duration-200
                  active:scale-90
                  ${
                    showVideo
                      ? 'bg-white/[0.06]'
                      : 'border-white/[0.06] bg-white/[0.03] text-slate-500 hover:bg-white/[0.05] hover:text-white'
                  }
                `}
                style={
                  showVideo
                    ? {
                        color:
                          colors.primary,
                        borderColor:
                          `${colors.primary}30`,
                      }
                    : undefined
                }
              >
                {showVideo ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
              </button>

              {/* =================================================
                  MAXIMIZE — opens MaxPlayer
              ================================================== */}

              <button
                type="button"
                onClick={() =>
                  setShowMaxPlayer(true)
                }
                title="Open Full Player"
                aria-label="Open Full Player"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.03]
                  text-slate-500
                  transition-all
                  duration-200
                  hover:bg-white/[0.05]
                  hover:text-white
                  active:scale-90
                "
              >
                <Maximize2 className="h-4 w-4" />
              </button>

              <div
                className="
                  h-7
                  w-px
                  bg-white/[0.06]
                "
              />

              {/* =================================================
                  VOLUME
              ================================================== */}

              <div
                className="
                  group/volume
                  flex
                  items-center
                  gap-2
                "
              >
                <button
                  type="button"
                  onClick={toggleMute}
                  title={
                    isMuted
                      ? 'Unmute'
                      : 'Mute'
                  }
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-500
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  {isMuted ||
                  volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>

                <div
                  className="
                    relative
                    flex
                    h-5
                    w-20
                    items-center
                  "
                >
                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-0
                      right-0
                      h-1
                      overflow-hidden
                      rounded-full
                      bg-slate-800
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                        transition-[width]
                        duration-100
                      "
                      style={{
                        width:
                          `${volumePercent}%`,
                        background:
                          colors.primary,
                      }}
                    />
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={
                      isMuted
                        ? 0
                        : volume
                    }
                    onChange={(event) => {
                      setVolume(
                        Number(
                          event.target
                            .value
                        )
                      );
                    }}
                    aria-label="Volume"
                    className="
                      relative
                      z-10
                      h-5
                      w-full
                      cursor-pointer
                      appearance-none
                      bg-transparent
                      accent-emerald-400
                    "
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              MOBILE PLAYER
          ================================================== */}

          <div
            className="
              relative
              px-3
              py-3.5
              md:hidden
            "
          >
            {/* Song row */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              {/* Artwork */}

              <div
                className="
                  relative
                  h-12
                  w-12
                  shrink-0
                  overflow-hidden
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-slate-900
                "
                style={{
                  boxShadow: isPlaying
                    ? `0 0 25px ${colors.glow}`
                    : undefined,
                }}
              >
                {currentSong.thumbnail_url ? (
                  <img
                    src={
                      currentSong.thumbnail_url
                    }
                    alt={
                      currentSong.title ||
                      'Song'
                    }
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      w-full
                      items-center
                      justify-center
                    "
                    style={{
                      background:
                        colors.background,
                    }}
                  >
                    <Music2
                      className="h-5 w-5"
                      style={{
                        color:
                          colors.primary,
                      }}
                    />
                  </div>
                )}

                {isPlaying && (
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-end
                      justify-center
                      bg-black/35
                      pb-1.5
                    "
                  >
                    <div
                      className="
                        flex
                        h-3
                        items-end
                        gap-[2px]
                      "
                    >
                      <span
                        className="
                          h-2
                          w-[2px]
                          rounded-full
                          animate-[musicbar_0.6s_ease-in-out_infinite]
                        "
                        style={{
                          background:
                            colors.primary,
                        }}
                      />

                      <span
                        className="
                          h-3
                          w-[2px]
                          rounded-full
                          animate-[musicbar_0.8s_ease-in-out_infinite]
                        "
                        style={{
                          background:
                            colors.primary,
                        }}
                      />

                      <span
                        className="
                          h-2.5
                          w-[2px]
                          rounded-full
                          animate-[musicbar_0.5s_ease-in-out_infinite]
                        "
                        style={{
                          background:
                            colors.primary,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}

              <div
                className="
                  min-w-0
                  flex-1
                "
              >
                <h4
                  className="
                    truncate
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  {currentSong.title}
                </h4>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-[10px]
                    text-slate-500
                  "
                >
                  {artistName}
                </p>

                <div
                  className="
                    mt-1
                    flex
                    items-center
                    gap-1
                  "
                >
                  <span
                    className="
                      h-1
                      w-1
                      rounded-full
                    "
                    style={{
                      background:
                        colors.primary,
                    }}
                  />

                  <span
                    className="
                      text-[8px]
                      uppercase
                      tracking-wider
                      text-slate-600
                    "
                  >
                    {isPlaying
                      ? 'Playing'
                      : 'Paused'}
                  </span>
                </div>
              </div>

              {/* =================================================
                  MOBILE QUEUE
              ================================================== */}

              <button
                type="button"
                onClick={() =>
                  setShowQueue(
                    (previous) =>
                      !previous
                  )
                }
                title="Playing Queue"
                className="
                  relative
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.06]
                  bg-white/[0.03]
                  text-slate-500
                  transition
                  active:scale-90
                "
                style={
                  showQueue
                    ? {
                        color:
                          colors.primary,
                        borderColor:
                          `${colors.primary}30`,
                        background:
                          `${colors.primary}10`,
                      }
                    : undefined
                }
              >
                <ListMusic className="h-3.5 w-3.5" />

                {safeQueue.length > 0 && (
                  <span
                    className="
                      absolute
                      -right-1
                      -top-1
                      flex
                      h-3.5
                      min-w-3.5
                      items-center
                      justify-center
                      rounded-full
                      px-0.5
                      text-[7px]
                      font-bold
                      text-slate-950
                    "
                    style={{
                      background:
                        colors.primary,
                    }}
                  >
                    {safeQueue.length > 9
                      ? '9+'
                      : safeQueue.length}
                  </span>
                )}
              </button>

              {/* Mobile Video */}

              <button
                type="button"
                onClick={() =>
                  setShowVideo(
                    (previous) =>
                      !previous
                  )
                }
                title={
                  showVideo
                    ? 'Hide Video'
                    : 'Show Video'
                }
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.06]
                  bg-white/[0.03]
                  text-slate-500
                  transition
                  active:scale-90
                "
                style={
                  showVideo
                    ? {
                        color:
                          colors.primary,
                        borderColor:
                          `${colors.primary}30`,
                      }
                    : undefined
                }
              >
                {showVideo ? (
                  <Video className="h-3.5 w-3.5" />
                ) : (
                  <VideoOff className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Mobile Maximize */}

              <button
                type="button"
                onClick={() =>
                  setShowMaxPlayer(true)
                }
                title="Open Full Player"
                aria-label="Open Full Player"
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.06]
                  bg-white/[0.03]
                  text-slate-500
                  transition
                  active:scale-90
                "
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>

              {/* Play */}

              <button
                type="button"
                onClick={togglePlay}
                aria-label={
                  isPlaying
                    ? 'Pause'
                    : 'Play'
                }
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-slate-950
                  shadow-xl
                  transition
                  active:scale-90
                "
                style={{
                  background:
                    `linear-gradient(
                      135deg,
                      ${colors.primary},
                      ${colors.secondary}
                    )`,
                  boxShadow:
                    `0 0 22px ${colors.glow}`,
                }}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                )}
              </button>
            </div>

            {/* =================================================
                MOBILE PROGRESS
            ================================================== */}

            <div
              className="
                mt-3
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  w-8
                  shrink-0
                  text-[9px]
                  font-mono
                  tabular-nums
                  text-slate-600
                "
              >
                {formatTime(progress)}
              </span>

              <div
                className="
                  group
                  relative
                  flex-1
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    left-0
                    top-1/2
                    h-1
                    -translate-y-1/2
                    rounded-full
                    blur-sm
                  "
                  style={{
                    width:
                      `${progressPercent}%`,
                    background:
                      colors.primary,
                    opacity: 0.35,
                  }}
                />

                <div
                  className="
                    h-1.5
                    overflow-hidden
                    rounded-full
                    bg-slate-800
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                    "
                    style={{
                      width:
                        `${progressPercent}%`,
                      background:
                        `linear-gradient(
                          90deg,
                          ${colors.primary},
                          ${colors.secondary}
                        )`,
                    }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={
                    duration
                      ? Math.min(
                          progress,
                          duration
                        )
                      : 0
                  }
                  onChange={
                    handleSeekChange
                  }
                  onMouseUp={
                    handleSeekMouseUp
                  }
                  onTouchEnd={
                    handleSeekMouseUp
                  }
                  disabled={!duration}
                  aria-label="Seek"
                  className="
                    absolute
                    left-0
                    top-1/2
                    h-6
                    w-full
                    -translate-y-1/2
                    cursor-pointer
                    opacity-0
                  "
                />
              </div>

              <span
                className="
                  w-8
                  shrink-0
                  text-right
                  text-[9px]
                  font-mono
                  tabular-nums
                  text-slate-600
                "
              >
                {formatTime(duration)}
              </span>
            </div>

            {/* =================================================
                MOBILE CONTROLS
            ================================================== */}

            <div
              className="
                mt-2.5
                flex
                items-center
                justify-between
              "
            >
              {/* Playback */}

              <div
                className="
                  flex
                  items-center
                  gap-0.5
                "
              >
                {/* Shuffle */}

                <button
                  type="button"
                  onClick={toggleShuffle}
                  title="Shuffle"
                  className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    transition
                    active:scale-90
                    ${
                      isShuffle
                        ? 'bg-white/[0.05]'
                        : 'text-slate-500'
                    }
                  `}
                  style={
                    isShuffle
                      ? {
                          color:
                            colors.primary,
                        }
                      : undefined
                  }
                >
                  <Shuffle className="h-3.5 w-3.5" />
                </button>

                {/* Previous */}

                <button
                  type="button"
                  onClick={prevSong}
                  title="Previous"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-400
                    active:scale-90
                  "
                >
                  <SkipBack className="h-4 w-4 fill-current" />
                </button>

                {/* Next */}

                <button
                  type="button"
                  onClick={nextSong}
                  title="Next"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-400
                    active:scale-90
                  "
                >
                  <SkipForward className="h-4 w-4 fill-current" />
                </button>

                {/* Repeat */}

                <button
                  type="button"
                  onClick={toggleRepeat}
                  title={`Repeat: ${repeatMode}`}
                  className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    transition
                    active:scale-90
                    ${
                      repeatMode !== 'off'
                        ? 'bg-white/[0.05]'
                        : 'text-slate-500'
                    }
                  `}
                  style={
                    repeatMode !== 'off'
                      ? {
                          color:
                            colors.primary,
                        }
                      : undefined
                  }
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="h-3.5 w-3.5" />
                  ) : (
                    <Repeat className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Volume */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <button
                  type="button"
                  onClick={toggleMute}
                  title={
                    isMuted
                      ? 'Unmute'
                      : 'Mute'
                  }
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-500
                    transition
                    active:scale-90
                  "
                >
                  {isMuted ||
                  volume === 0 ? (
                    <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </button>

                <div
                  className="
                    relative
                    flex
                    h-5
                    w-16
                    items-center
                  "
                >
                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-0
                      right-0
                      h-1
                      overflow-hidden
                      rounded-full
                      bg-slate-800
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                      "
                      style={{
                        width:
                          `${volumePercent}%`,
                        background:
                          colors.primary,
                      }}
                    />
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={
                      isMuted
                        ? 0
                        : volume
                    }
                    onChange={(event) => {
                      setVolume(
                        Number(
                          event.target
                            .value
                        )
                      );
                    }}
                    aria-label="Volume"
                    className="
                      relative
                      z-10
                      h-5
                      w-full
                      cursor-pointer
                      appearance-none
                      bg-transparent
                      accent-emerald-400
                    "
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              DECORATIVE BOTTOM INDICATOR
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-0
              left-1/2
              hidden
              -translate-x-1/2
              items-center
              gap-1
              opacity-30
              md:flex
            "
          >
            <Music2
              className="h-3 w-3"
              style={{
                color:
                  colors.primary,
              }}
            />

            <Waves
              className="h-3 w-3"
              style={{
                color:
                  colors.secondary,
              }}
            />

            {isPlaying && (
              <Sparkles
                className="h-3 w-3 animate-pulse"
                style={{
                  color:
                    colors.accent,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          MAX PLAYER
      ====================================================== */}

      {showMaxPlayer && (
        <MaxPlayer
          isOpen={showMaxPlayer}
          onClose={() => setShowMaxPlayer(false)}
        />
      )}

      {/* =====================================================
          ANIMATIONS
      ====================================================== */}

      <style>{`
        @keyframes musicbar {
          0%,
          100% {
            transform: scaleY(0.45);
          }

          50% {
            transform: scaleY(1);
          }
        }

        @keyframes cinematicPulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }

          50% {
            opacity: 0.7;
            transform: scale(1.04);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </>
  );
}