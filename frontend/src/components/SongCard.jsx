import React, {
  useEffect,
  useState,
} from 'react';

import { createPortal } from 'react-dom';

import { usePlayer } from '../context/PlayerContext';

import {
  Play,
  Pause,
  Heart,
  Trash2,
  Edit,
  Youtube,
  Disc3,
  Radio,
  Music2,
  Plus,
  Check,
  ListMusic,
  X,
  ListPlus,
} from 'lucide-react';

/* =========================================================
   PLATFORM ICON
========================================================= */

const getPlatformIcon = (sourceType) => {
  switch (sourceType?.toLowerCase()) {
    case 'youtube':
      return Youtube;

    case 'spotify':
      return Disc3;

    case 'direct':
      return Radio;

    default:
      return Music2;
  }
};

/* =========================================================
   PLATFORM LABEL
========================================================= */

const getPlatformLabel = (sourceType) => {
  switch (sourceType?.toLowerCase()) {
    case 'youtube':
      return 'YouTube';

    case 'spotify':
      return 'Spotify';

    case 'direct':
      return 'Direct Audio';

    default:
      return 'Media';
  }
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
    const names =
      song.artists
        .map((artist) => {
          if (
            typeof artist ===
            'string'
          ) {
            return artist;
          }

          return (
            artist?.name ||
            artist?.artist_name ||
            artist?.artist ||
            ''
          );
        })
        .filter(Boolean);

    if (names.length > 0) {
      return names.join(' • ');
    }
  }

  if (
    Array.isArray(song.artist_names) &&
    song.artist_names.length > 0
  ) {
    return song.artist_names
      .filter(Boolean)
      .join(' • ');
  }

  return (
    song.artist_name ||
    song.artist ||
    'Unknown Artist'
  );
};

/* =========================================================
   PLAYLIST MENU (rendered outside the card, via portal)
========================================================= */

function PlaylistMenuPortal({
  song,
  anchor,
  playlists,
  isSongInPlaylist,
  onToggle,
  onClose,
}) {
  /* =========================================================
     CLOSE ON ESCAPE
  ========================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [onClose]);

  /* =========================================================
     CLOSE ON SCROLL / RESIZE
     (anchor position would otherwise go stale)
  ========================================================= */

  useEffect(() => {
    const handleReposition = () => onClose();

    window.addEventListener(
      'scroll',
      handleReposition,
      true
    );

    window.addEventListener(
      'resize',
      handleReposition
    );

    return () => {
      window.removeEventListener(
        'scroll',
        handleReposition,
        true
      );

      window.removeEventListener(
        'resize',
        handleReposition
      );
    };
  }, [onClose]);

  const isMobileLayout =
    anchor?.isMobileLayout;

  const menuContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add to playlist"
      onClick={(event) =>
        event.stopPropagation()
      }
      style={
        isMobileLayout
          ? {
              bottom:
                'max(16px, env(safe-area-inset-bottom))',
            }
          : {
              top: anchor.top,
              left: anchor.left,
            }
      }
      className={`
        z-[201]
        flex
        w-72
        max-w-[calc(100vw-24px)]
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-slate-700/80
        bg-slate-950/95
        shadow-2xl
        shadow-black/60
        backdrop-blur-2xl

        ${
          isMobileLayout
            ? `
              fixed
              left-1/2
              max-h-[75vh]
              w-[calc(100vw-24px)]
              -translate-x-1/2
              animate-[playlistSheetIn_0.25s_ease-out]
            `
            : `
              fixed
              max-h-[70vh]
              animate-[playlistPopIn_0.18s_ease-out]
            `
        }
      `}
    >
      {/* Drag-handle affordance (mobile only) */}

      {isMobileLayout && (
        <div className="flex shrink-0 justify-center pb-1 pt-2.5">
          <span className="h-1 w-9 rounded-full bg-slate-700" />
        </div>
      )}

      {/* Header */}

      <div
        className="
          flex
          shrink-0
          items-center
          justify-between
          gap-3
          border-b
          border-slate-800
          bg-slate-900/50
          px-4
          py-3
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-500/10
              text-emerald-400
            "
          >
            <ListMusic className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-xs
                font-bold
                text-white
              "
            >
              Add to playlist
            </p>

            <p
              title={song?.title}
              className="
                mt-0.5
                truncate
                text-[10px]
                text-slate-500
              "
            >
              {song?.title || 'Save this song for later'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-slate-500
            transition-all
            hover:bg-slate-800
            hover:text-white
            active:scale-90
          "
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Playlists */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          p-2
        "
      >
        {playlists.length === 0 ? (
          <div
            className="
              px-4
              py-8
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-slate-900
                text-slate-700
              "
            >
              <ListMusic className="h-5 w-5" />
            </div>

            <p
              className="
                mt-3
                text-xs
                font-semibold
                text-slate-400
              "
            >
              No playlists yet
            </p>

            <p
              className="
                mt-1
                text-[10px]
                leading-4
                text-slate-600
              "
            >
              Create a playlist first.
            </p>
          </div>
        ) : (
          playlists.map((playlist) => {
            const added =
              isSongInPlaylist(playlist);

            return (
              <button
                key={playlist.id}
                type="button"
                onClick={() =>
                  onToggle(playlist)
                }
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  transition-all
                  hover:bg-slate-800
                "
              >
                <div
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl

                    ${
                      added
                        ? `
                          bg-emerald-500/15
                          text-emerald-400
                        `
                        : `
                          bg-slate-800
                          text-slate-500
                        `
                    }
                  `}
                >
                  {added ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <ListMusic className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="
                      truncate
                      text-xs
                      font-semibold
                      text-slate-200
                    "
                  >
                    {playlist.name}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-slate-500
                    "
                  >
                    {playlist.songs?.length || 0}{' '}
                    songs
                  </p>
                </div>

                {added && (
                  <span
                    className="
                      rounded-full
                      bg-emerald-500/10
                      px-2
                      py-1
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-emerald-400
                    "
                  >
                    Added
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return createPortal(
    <>
      {/* Backdrop — click anywhere outside the menu to close it */}

      <div
        className="
          fixed
          inset-0
          z-[200]
          bg-slate-950/40
          backdrop-blur-[2px]
          animate-[playlistBackdropIn_0.18s_ease-out]
        "
        onClick={onClose}
        aria-hidden="true"
      />

      {menuContent}
    </>,
    document.body
  );
}

/* =========================================================
   SONG CARD
========================================================= */

export default function SongCard({
  song,
  onLikeToggle,
  onEdit,
  onDelete,
  isAdmin = false,
}) {
  const {
    currentSong,
    isPlaying,
    playSong,

    /* QUEUE */

    addToQueue,
    isSongInQueue,

    /* PLAYLIST */

    playlists = [],
    addSongToPlaylist,
    removeSongFromPlaylist,
  } = usePlayer();

  const [
    showPlaylistMenu,
    setShowPlaylistMenu,
  ] = useState(false);

  const [
    imageLoaded,
    setImageLoaded,
  ] = useState(false);

  const [
    imageError,
    setImageError,
  ] = useState(false);

  const [
    queueAdded,
    setQueueAdded,
  ] = useState(false);

  const [
    menuAnchor,
    setMenuAnchor,
  ] = useState(null);

  /* =========================================================
     ACTIVE
  ========================================================= */

  const isCurrentActive =
    String(currentSong?.id) ===
    String(song.id);

  /* =========================================================
     QUEUED
  ========================================================= */

  const queued =
    typeof isSongInQueue ===
    'function'
      ? isSongInQueue(song.id)
      : false;

  /* =========================================================
     PLATFORM
  ========================================================= */

  const PlatformIcon =
    getPlatformIcon(
      song.source_type
    );

  /* =========================================================
     PLAYLIST MENU POSITIONING
     The menu itself renders outside the card (via a portal
     to document.body), so we just need to know where the
     trigger button sits on screen.
  ========================================================= */

  const MENU_WIDTH = 288;

  const computeMenuAnchor = (
    triggerElement
  ) => {
    if (!triggerElement) {
      return null;
    }

    const isMobileLayout =
      window.innerWidth < 640;

    if (isMobileLayout) {
      return { isMobileLayout: true };
    }

    const rect =
      triggerElement.getBoundingClientRect();

    let left = rect.right - MENU_WIDTH;

    left = Math.max(
      12,
      Math.min(
        left,
        window.innerWidth -
          MENU_WIDTH -
          12
      )
    );

    const estimatedMenuHeight = 320;

    let top = rect.bottom + 8;

    if (
      top + estimatedMenuHeight >
      window.innerHeight - 12
    ) {
      top = Math.max(
        12,
        rect.top -
          estimatedMenuHeight -
          8
      );
    }

    return { top, left, isMobileLayout: false };
  };

  const handleOpenPlaylistMenu = (
    event
  ) => {
    event.stopPropagation();

    setMenuAnchor(
      computeMenuAnchor(
        event.currentTarget
      )
    );

    setShowPlaylistMenu(true);
  };

  const handleTogglePlaylistMenu = (
    event
  ) => {
    event.stopPropagation();

    if (showPlaylistMenu) {
      setShowPlaylistMenu(false);

      return;
    }

    setMenuAnchor(
      computeMenuAnchor(
        event.currentTarget
      )
    );

    setShowPlaylistMenu(true);
  };

  const handleClosePlaylistMenu = () => {
    setShowPlaylistMenu(false);
  };

  /* =========================================================
     PLAYLIST CHECK
  ========================================================= */

  const isSongInPlaylist = (
    playlist
  ) => {
    if (!playlist?.songs) {
      return false;
    }

    return playlist.songs.some(
      (playlistSong) =>
        String(playlistSong.id) ===
        String(song.id)
    );
  };

  /* =========================================================
     PLAYLIST TOGGLE
  ========================================================= */

  const handlePlaylistToggle = (
    playlist
  ) => {
    if (!playlist) {
      return;
    }

    const alreadyAdded =
      isSongInPlaylist(
        playlist
      );

    if (alreadyAdded) {
      if (
        removeSongFromPlaylist
      ) {
        removeSongFromPlaylist(
          playlist.id,
          song.id
        );
      }
    } else {
      if (
        addSongToPlaylist
      ) {
        addSongToPlaylist(
          playlist.id,
          song
        );
      }
    }
  };

  /* =========================================================
     PLAY SONG
  ========================================================= */

  const handlePlay = () => {
    playSong(song);
  };

  /* =========================================================
     ADD TO QUEUE
  ========================================================= */

  const handleAddToQueue = (
    event
  ) => {
    /*
     * Prevent card / image / other
     * parent click behavior.
     */

    event.stopPropagation();

    if (!addToQueue) {
      return;
    }

    /*
     * Don't add duplicates.
     */

    if (queued) {
      return;
    }

    const added =
      addToQueue(song);

    if (added) {
      setQueueAdded(true);

      /*
       * Small visual confirmation.
       */

      window.setTimeout(() => {
        setQueueAdded(false);
      }, 1400);
    }
  };

  return (
    <>
    <article
      className={`
        group
        relative
        overflow-visible
        rounded-2xl
        border
        bg-slate-900/75
        shadow-lg
        backdrop-blur-sm
        transition-all
        duration-500
        ease-out
        hover:-translate-y-1.5
        hover:shadow-2xl

        ${
          isCurrentActive
            ? `
              border-emerald-400/25
              shadow-emerald-950/30
            `
            : `
              border-slate-800/80
              shadow-black/10
              hover:border-slate-700
              hover:shadow-emerald-950/20
            `
        }
      `}
    >
      {/* =====================================================
          ARTWORK
      ====================================================== */}

      <div
        className="
          relative
          aspect-square
          overflow-hidden
          rounded-t-2xl
          bg-slate-950
        "
      >
        {/* Skeleton */}

        {!imageLoaded &&
          !imageError && (
            <div
              className="
                absolute
                inset-0
                animate-pulse
                bg-gradient-to-br
                from-slate-800
                via-slate-900
                to-slate-950
              "
            />
          )}

        {/* Image */}

        {!imageError ? (
          <img
            src={
              song.thumbnail_url
            }
            alt={
              song.title
            }
            loading="lazy"
            onLoad={() =>
              setImageLoaded(true)
            }
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            className={`
              h-full
              w-full
              object-cover
              transition-all
              duration-700
              ease-out
              group-hover:scale-[1.07]

              ${
                imageLoaded
                  ? 'opacity-100'
                  : 'opacity-0'
              }
            `}
          />
        ) : (
          <div
            className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
              bg-gradient-to-br
              from-slate-900
              via-slate-950
              to-slate-900
              text-slate-700
            "
          >
            <Music2 className="h-12 w-12" />

            <span
              className="
                mt-2
                text-[9px]
                uppercase
                tracking-widest
              "
            >
              No artwork
            </span>
          </div>
        )}

        {/* Image overlay */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-slate-950
            via-slate-950/10
            to-transparent
            opacity-90
          "
        />

        {/* Hover atmosphere */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-emerald-400/0
            via-transparent
            to-cyan-400/0
            opacity-0
            transition-all
            duration-500
            group-hover:from-emerald-400/10
            group-hover:to-cyan-400/10
            group-hover:opacity-100
          "
        />

        {/* ==================================================
            PLATFORM
        ================================================== */}

        <div
          className="
            absolute
            left-3
            top-3
            flex
            items-center
            gap-1.5
            rounded-xl
            border
            border-white/[0.10]
            bg-slate-950/75
            px-2.5
            py-1.5
            text-[9px]
            font-bold
            text-slate-200
            shadow-xl
            backdrop-blur-xl
          "
        >
          <PlatformIcon
            className="
              h-3.5
              w-3.5
              text-emerald-400
            "
          />

          <span>
            {getPlatformLabel(
              song.source_type
            )}
          </span>
        </div>

        {/* ==================================================
            CURRENT PLAYING
        ================================================== */}

        {isCurrentActive && (
          <div
            className="
              absolute
              bottom-3
              left-3
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-emerald-400/20
              bg-slate-950/80
              px-2.5
              py-1.5
              shadow-xl
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                h-3.5
                items-end
                gap-[2px]
              "
            >
              {[2, 3.5, 2.5, 3].map(
                (height, index) => (
                  <span
                    key={index}
                    className={`
                      w-[2px]
                      rounded-full
                      bg-emerald-400
                      ${
                        isPlaying
                          ? `animate-[musicBar_${
                              index + 1
                            }s_ease-in-out_infinite]`
                          : ''
                      }
                    `}
                    style={{
                      height: `${height * 4}px`,
                    }}
                  />
                )
              )}
            </div>

            <span
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-emerald-400
              "
            >
              {isPlaying
                ? 'Playing'
                : 'Paused'}
            </span>
          </div>
        )}

        {/* ==================================================
            TOP RIGHT ACTIONS
        ================================================== */}

        <div
          className="
            absolute
            right-2.5
            top-2.5
            flex
            items-center
            gap-1.5
            sm:right-3
            sm:top-3
            sm:gap-2
          "
        >
          {/* LIKE */}

          {onLikeToggle && (
            <button
              type="button"
              onClick={() =>
                onLikeToggle(song.id)
              }
              aria-label={
                song.is_liked
                  ? 'Unlike song'
                  : 'Like song'
              }
              className={`
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                bg-slate-950/75
                shadow-xl
                backdrop-blur-xl
                transition-all
                duration-300
                active:scale-90
                sm:h-9
                sm:w-9

                ${
                  song.is_liked
                    ? `
                      border-rose-400/20
                      bg-rose-500/10
                      text-rose-400
                      opacity-100
                    `
                    : `
                      border-white/10
                      text-slate-300
                      opacity-100
                      sm:opacity-0
                      sm:group-hover:opacity-100
                      hover:border-rose-400/20
                      hover:bg-rose-500/10
                      hover:text-rose-400
                      hover:scale-110
                    `
                }
              `}
            >
              <Heart
                className={`
                  h-3.5
                  w-3.5
                  ${
                    song.is_liked
                      ? `
                        scale-110
                        fill-rose-500
                        text-rose-500
                      `
                      : ''
                  }
                `}
              />
            </button>
          )}

          {/* =================================================
              QUEUE BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={
              handleAddToQueue
            }
            disabled={queued}
            aria-label={
              queued
                ? 'Already in queue'
                : 'Add to queue'
            }
            title={
              queued
                ? 'Already in queue'
                : 'Add to queue'
            }
            className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
              shadow-xl
              backdrop-blur-xl
              transition-all
              duration-300
              active:scale-90
              sm:h-9
              sm:w-9

              ${
                queued ||
                queueAdded
                  ? `
                    border-emerald-400/30
                    bg-emerald-500/15
                    text-emerald-400
                    opacity-100
                  `
                  : `
                    border-white/10
                    bg-slate-950/75
                    text-slate-300
                    opacity-100
                    sm:opacity-0
                    sm:group-hover:opacity-100
                    hover:scale-110
                    hover:border-cyan-400/30
                    hover:bg-cyan-500/10
                    hover:text-cyan-400
                  `
              }
            `}
          >
            {queued ||
            queueAdded ? (
              <Check className="h-4 w-4" />
            ) : (
              <ListPlus className="h-4 w-4" />
            )}
          </button>

          {/* =================================================
              PLAYLIST
          ================================================= */}

          <div className="relative">
            <button
              type="button"
              onClick={
                handleTogglePlaylistMenu
              }
              aria-label="Add to playlist"
              aria-haspopup="dialog"
              aria-expanded={showPlaylistMenu}
              title="Add to playlist"
              className={`
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                bg-slate-950/75
                text-slate-300
                shadow-xl
                backdrop-blur-xl
                transition-all
                duration-300
                active:scale-90
                sm:h-9
                sm:w-9

                ${
                  showPlaylistMenu
                    ? `
                      border-emerald-400/30
                      bg-emerald-500
                      text-slate-950
                      opacity-100
                    `
                    : `
                      border-white/10
                      opacity-100
                      sm:opacity-0
                      sm:group-hover:opacity-100
                      hover:scale-110
                      hover:border-emerald-400/30
                      hover:bg-emerald-500
                      hover:text-slate-950
                    `
                }
              `}
            >
              {showPlaylistMenu ? (
                <X className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>

          </div>
        </div>

        {/* ==================================================
            MAIN PLAY BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={handlePlay}
          aria-label={
            isCurrentActive &&
            isPlaying
              ? `Pause ${song.title}`
              : `Play ${song.title}`
          }
          className={`
            absolute
            bottom-4
            right-4
            z-20
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-emerald-400
            text-slate-950
            shadow-xl
            shadow-emerald-500/30
            transition-all
            duration-300
            active:scale-90

            ${
              isCurrentActive
                ? `
                  scale-100
                  opacity-100
                `
                : `
                  opacity-100
                  sm:translate-y-3
                  sm:opacity-0
                  sm:group-hover:translate-y-0
                  sm:group-hover:opacity-100
                `
            }

            hover:scale-110
            hover:bg-emerald-300
          `}
        >
          <span className="relative z-10">
            {isCurrentActive &&
            isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            )}
          </span>
        </button>
      </div>

      {/* =====================================================
          CARD CONTENT
      ====================================================== */}

      <div className="p-3.5">
        <div className="min-w-0">
          <h3
            title={song.title}
            className="
              truncate
              text-sm
              font-bold
              tracking-tight
              text-slate-100
              transition-colors
              duration-300
              group-hover:text-emerald-300
            "
          >
            {song.title}
          </h3>

          <p
            title={getArtistName(song)}
            className="
              mt-1
              truncate
              text-xs
              text-slate-500
              transition-colors
              duration-300
              group-hover:text-slate-400
            "
          >
            {getArtistName(song)}
          </p>
        </div>

        {/* ==================================================
            META
        ================================================== */}

        <div
          className="
            mt-3
            flex
            min-h-8
            items-center
            justify-between
            border-t
            border-slate-800/70
            pt-3
          "
        >
          {/* LIKE */}

          {onLikeToggle ? (
            <button
              type="button"
              onClick={() =>
                onLikeToggle(song.id)
              }
              className="
                group/like
                flex
                items-center
                gap-1.5
                rounded-lg
                px-1.5
                py-1
                text-[11px]
                text-slate-500
                transition-all
                hover:bg-rose-500/10
                hover:text-rose-400
              "
            >
              <Heart
                className={`
                  h-3.5
                  w-3.5

                  ${
                    song.is_liked
                      ? `
                        scale-110
                        fill-rose-500
                        text-rose-500
                      `
                      : `
                        text-slate-500
                        group-hover/like:text-rose-400
                      `
                  }
                `}
              />

              <span>
                {song.likes_count ||
                  0}
              </span>
            </button>
          ) : (
            <span />
          )}

          {/* QUEUE SHORTCUT */}

          <button
            type="button"
            onClick={
              handleAddToQueue
            }
            disabled={queued}
            aria-label={
              queued
                ? 'Already queued'
                : 'Add to queue'
            }
            title={
              queued
                ? 'Already queued'
                : 'Add to queue'
            }
            className={`
              flex
              min-h-[32px]
              min-w-[32px]
              items-center
              justify-center
              gap-1.5
              rounded-lg
              px-1.5
              py-1
              text-[10px]
              font-semibold
              transition-all
              sm:min-w-0
              sm:justify-start
              sm:px-2

              ${
                queued
                  ? `
                    bg-emerald-500/10
                    text-emerald-400
                  `
                  : `
                    text-slate-500
                    hover:bg-cyan-500/10
                    hover:text-cyan-400
                  `
              }
            `}
          >
            {queued ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ListPlus className="h-3.5 w-3.5" />
            )}

            <span className="hidden sm:inline">
              {queued
                ? 'Queued'
                : 'Queue'}
            </span>
          </button>

          {/* PLAYLIST */}

          <button
            type="button"
            onClick={
              handleOpenPlaylistMenu
            }
            aria-label="Add to playlist"
            aria-haspopup="dialog"
            aria-expanded={showPlaylistMenu}
            title="Add to playlist"
            className="
              flex
              min-h-[32px]
              min-w-[32px]
              items-center
              justify-center
              gap-1.5
              rounded-lg
              px-1.5
              py-1
              text-[10px]
              font-semibold
              text-slate-500
              transition-all
              hover:bg-emerald-500/10
              hover:text-emerald-400
              sm:min-w-0
              sm:justify-start
              sm:px-2
            "
          >
            <Plus className="h-3.5 w-3.5" />

            <span className="hidden sm:inline">
              Playlist
            </span>
          </button>

          {/* ADMIN */}

          {isAdmin && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={() =>
                    onEdit(song)
                  }
                  title="Edit Track"
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-500
                    transition-all
                    hover:bg-amber-500/10
                    hover:text-amber-400
                  "
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() =>
                    onDelete(song.id)
                  }
                  title="Delete Track"
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-500
                    transition-all
                    hover:bg-rose-500/10
                    hover:text-rose-400
                  "
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          ACTIVE INDICATOR
      ====================================================== */}

      <div
        className={`
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          h-[2px]
          origin-left
          rounded-full
          bg-gradient-to-r
          from-emerald-400
          via-teal-300
          to-cyan-400
          transition-transform
          duration-500

          ${
            isCurrentActive
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }
        `}
      />

      {/* =====================================================
          ACTIVE GLOW
      ====================================================== */}

      {isCurrentActive && (
        <div
          className="
            pointer-events-none
            absolute
            -inset-px
            -z-10
            rounded-2xl
            bg-gradient-to-r
            from-emerald-500/20
            via-teal-400/10
            to-cyan-400/20
            blur-xl
          "
        />
      )}

      {/* =====================================================
          ANIMATIONS
      ====================================================== */}

      <style>{`
        @keyframes musicBar {
          0%, 100% {
            transform: scaleY(0.45);
          }

          50% {
            transform: scaleY(1);
          }
        }

        @keyframes playlistBackdropIn {
          0% {
            opacity: 0;
          }

          100% {
            opacity: 1;
          }
        }

        @keyframes playlistPopIn {
          0% {
            opacity: 0;
            transform: translateY(-6px) scale(0.97);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes playlistSheetIn {
          0% {
            opacity: 0;
            transform: translate(-50%, 16px);
          }

          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </article>

    {/* =======================================================
        PLAYLIST MENU — rendered outside the card via portal
    ======================================================= */}

    {showPlaylistMenu &&
      menuAnchor &&
      (
        <PlaylistMenuPortal
          song={song}
          anchor={menuAnchor}
          playlists={playlists}
          isSongInPlaylist={
            isSongInPlaylist
          }
          onToggle={
            handlePlaylistToggle
          }
          onClose={
            handleClosePlaylistMenu
          }
        />
      )}
    </>
  );
}