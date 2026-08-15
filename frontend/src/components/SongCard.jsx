import React, { useEffect, useRef, useState } from 'react';
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
  MoreHorizontal,
} from 'lucide-react';

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

    // Playlist functions
    playlists = [],
    addSongToPlaylist,
    removeSongFromPlaylist,
  } = usePlayer();

  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const menuRef = useRef(null);

  const isCurrentActive =
    String(currentSong?.id) === String(song.id);

  const PlatformIcon = getPlatformIcon(song.source_type);

  /*
   * Close playlist menu when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowPlaylistMenu(false);
      }
    };

    if (showPlaylistMenu) {
      document.addEventListener(
        'mousedown',
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, [showPlaylistMenu]);

  /*
   * Check whether this song exists
   * inside a playlist.
   */
  const isSongInPlaylist = (playlist) => {
    if (!playlist?.songs) {
      return false;
    }

    return playlist.songs.some(
      (playlistSong) =>
        String(playlistSong.id) === String(song.id)
    );
  };

  /*
   * Add/remove song from playlist.
   */
  const handlePlaylistToggle = (playlist) => {
    if (!playlist) return;

    const alreadyAdded = isSongInPlaylist(playlist);

    if (alreadyAdded) {
      if (removeSongFromPlaylist) {
        removeSongFromPlaylist(
          playlist.id,
          song.id
        );
      }
    } else {
      if (addSongToPlaylist) {
        addSongToPlaylist(
          playlist.id,
          song
        );
      }
    }
  };

  return (
    <article
      className="
        group relative overflow-visible
        rounded-2xl
        border border-slate-800/80
        bg-slate-900/80
        shadow-lg shadow-black/10
        transition-all duration-300
        hover:-translate-y-1
        hover:border-slate-700
        hover:bg-slate-900
        hover:shadow-2xl
        hover:shadow-black/30
      "
    >
      {/* =====================================================
          COVER IMAGE
      ====================================================== */}

      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-slate-950">

        <img
          src={song.thumbnail_url}
          alt={song.title}
          loading="lazy"
          className="
            h-full w-full object-cover
            transition-transform duration-700
            ease-out
            group-hover:scale-110
          "
        />

        {/* Cinematic gradient */}

        <div
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-t
            from-slate-950
            via-slate-950/10
            to-transparent
            opacity-80
          "
        />

        {/* Emerald lighting */}

        <div
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-br
            from-emerald-500/0
            via-transparent
            to-emerald-500/10
            opacity-0
            transition-opacity duration-300
            group-hover:opacity-100
          "
        />

        {/* =================================================
            PLATFORM BADGE
        ================================================== */}

        <div
          className="
            absolute left-3 top-3
            flex items-center gap-1.5
            rounded-lg
            border border-white/10
            bg-slate-950/70
            px-2.5 py-1.5
            text-[10px]
            font-semibold
            text-slate-200
            shadow-lg
            backdrop-blur-md
          "
        >
          <PlatformIcon
            className="h-3 w-3 text-emerald-400"
          />

          <span>
            {getPlatformLabel(song.source_type)}
          </span>
        </div>

        {/* =================================================
            TOP RIGHT ACTIONS
        ================================================== */}

        <div className="absolute right-3 top-3 flex items-center gap-2">

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
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-full
                border border-white/10
                bg-slate-950/70
                text-slate-300
                opacity-0
                shadow-lg
                backdrop-blur-md
                transition-all duration-200
                hover:scale-110
                hover:bg-slate-900
                group-hover:opacity-100
              "
            >
              <Heart
                className={`
                  h-4 w-4
                  transition-all duration-200
                  ${
                    song.is_liked
                      ? 'scale-110 fill-rose-500 text-rose-500'
                      : 'text-slate-300 hover:text-rose-400'
                  }
                `}
              />
            </button>
          )}

          {/* ADD TO PLAYLIST */}

          <div
            ref={menuRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setShowPlaylistMenu(
                  (previous) => !previous
                )
              }
              aria-label="Add to playlist"
              title="Add to playlist"
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-full
                border border-white/10
                bg-slate-950/70
                text-slate-300
                opacity-0
                shadow-lg
                backdrop-blur-md
                transition-all duration-200
                hover:scale-110
                hover:bg-emerald-500
                hover:text-slate-950
                group-hover:opacity-100
              "
            >
              {showPlaylistMenu ? (
                <X className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>

            {/* =================================================
                PLAYLIST MENU
            ================================================== */}

            {showPlaylistMenu && (
              <div
                className="
                  absolute right-0 top-11 z-[100]
                  w-64
                  overflow-hidden
                  rounded-2xl
                  border border-slate-700
                  bg-slate-950/95
                  shadow-2xl
                  shadow-black/50
                  backdrop-blur-xl
                "
              >

                {/* Header */}

                <div
                  className="
                    flex items-center justify-between
                    border-b border-slate-800
                    px-4 py-3
                  "
                >
                  <div className="flex items-center gap-2">

                    <div
                      className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        bg-emerald-500/10
                        text-emerald-400
                      "
                    >
                      <ListMusic className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white">
                        Add to playlist
                      </p>

                      <p className="text-[10px] text-slate-500">
                        Choose a playlist
                      </p>
                    </div>

                  </div>
                </div>

                {/* Playlist list */}

                <div className="max-h-64 overflow-y-auto p-2">

                  {playlists.length === 0 ? (
                    <div className="px-4 py-6 text-center">

                      <ListMusic
                        className="
                          mx-auto h-8 w-8
                          text-slate-700
                        "
                      />

                      <p className="mt-2 text-xs font-semibold text-slate-400">
                        No playlists yet
                      </p>

                      <p className="mt-1 text-[10px] text-slate-600">
                        Create a playlist first.
                      </p>

                    </div>
                  ) : (
                    playlists.map((playlist) => {

                      const added =
                        isSongInPlaylist(
                          playlist
                        );

                      return (
                        <button
                          key={playlist.id}
                          type="button"
                          onClick={() =>
                            handlePlaylistToggle(
                              playlist
                            )
                          }
                          className="
                            flex w-full
                            items-center gap-3
                            rounded-xl
                            px-3 py-2.5
                            text-left
                            transition
                            hover:bg-slate-800
                          "
                        >

                          {/* Playlist icon */}

                          <div
                            className={`
                              flex h-9 w-9
                              shrink-0
                              items-center justify-center
                              rounded-lg
                              ${
                                added
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-slate-800 text-slate-500'
                              }
                            `}
                          >
                            {added ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <ListMusic className="h-4 w-4" />
                            )}
                          </div>

                          {/* Name */}

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

                            <p className="text-[10px] text-slate-500">
                              {playlist.songs?.length || 0}{' '}
                              {playlist.songs?.length === 1
                                ? 'song'
                                : 'songs'}
                            </p>

                          </div>

                          {/* Status */}

                          {added && (
                            <span
                              className="
                                text-[9px]
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
            )}
          </div>
        </div>

        {/* =================================================
            PLAY BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={() => playSong(song)}
          aria-label={
            isCurrentActive && isPlaying
              ? `Pause ${song.title}`
              : `Play ${song.title}`
          }
          className={`
            absolute bottom-4 right-4
            flex h-12 w-12
            items-center justify-center
            rounded-full
            bg-emerald-500
            text-slate-950
            shadow-xl
            shadow-emerald-500/20
            transition-all duration-300
            hover:scale-110
            hover:bg-emerald-400
            active:scale-95
            ${
              isCurrentActive
                ? 'scale-100 opacity-100'
                : 'translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
            }
          `}
        >
          {isCurrentActive && isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          )}
        </button>

        {/* =================================================
            CURRENTLY PLAYING
        ================================================== */}

        {isCurrentActive && (
          <div
            className="
              absolute bottom-4 left-4
              flex items-center gap-1.5
              rounded-lg
              border border-emerald-400/20
              bg-slate-950/75
              px-2.5 py-1.5
              backdrop-blur-md
            "
          >
            <span className="flex items-end gap-[2px]">

              <span
                className={`
                  h-2 w-[2px]
                  rounded-full
                  bg-emerald-400
                  ${
                    isPlaying
                      ? 'animate-pulse'
                      : ''
                  }
                `}
              />

              <span
                className={`
                  h-3 w-[2px]
                  rounded-full
                  bg-emerald-400
                  ${
                    isPlaying
                      ? 'animate-pulse'
                      : ''
                  }
                `}
              />

              <span
                className={`
                  h-1.5 w-[2px]
                  rounded-full
                  bg-emerald-400
                  ${
                    isPlaying
                      ? 'animate-pulse'
                      : ''
                  }
                `}
              />

            </span>

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-emerald-400
              "
            >
              {isPlaying
                ? 'Playing'
                : 'Paused'}
            </span>
          </div>
        )}
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
              text-sm font-bold
              text-slate-100
              transition-colors
              group-hover:text-emerald-300
            "
          >
            {song.title}
          </h3>

          <p
            title={
              song.artist ||
              'Unknown Artist'
            }
            className="
              mt-1 truncate
              text-xs
              text-slate-500
            "
          >
            {song.artist ||
              'Unknown Artist'}
          </p>

        </div>

        {/* =================================================
            BOTTOM META
        ================================================== */}

        <div
          className="
            mt-3
            flex items-center
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
                flex items-center gap-1.5
                rounded-lg
                px-1.5 py-1
                text-[11px]
                text-slate-500
                transition
                hover:bg-slate-800
                hover:text-rose-400
              "
            >
              <Heart
                className={`
                  h-3.5 w-3.5
                  transition-transform
                  ${
                    song.is_liked
                      ? 'fill-rose-500 text-rose-500 scale-110'
                      : 'text-slate-500'
                  }
                `}
              />

              <span>
                {song.likes_count || 0}
              </span>
            </button>
          ) : (
            <span />
          )}

          {/* Playlist shortcut */}

          <button
            type="button"
            onClick={() =>
              setShowPlaylistMenu(
                true
              )
            }
            className="
              flex items-center gap-1.5
              rounded-lg
              px-2 py-1
              text-[10px]
              font-semibold
              text-slate-500
              transition
              hover:bg-emerald-500/10
              hover:text-emerald-400
            "
          >
            <Plus className="h-3.5 w-3.5" />

            Playlist
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
                  aria-label="Edit Track"
                  className="
                    flex h-7 w-7
                    items-center justify-center
                    rounded-lg
                    text-slate-500
                    transition
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
                  aria-label="Delete Track"
                  className="
                    flex h-7 w-7
                    items-center justify-center
                    rounded-lg
                    text-slate-500
                    transition
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
          ACTIVE BOTTOM INDICATOR
      ====================================================== */}

      <div
        className={`
          absolute bottom-0 left-0 right-0
          h-[2px]
          origin-left
          bg-gradient-to-r
          from-emerald-400
          via-teal-300
          to-cyan-400
          transition-transform duration-300
          ${
            isCurrentActive
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }
        `}
      />
    </article>
  );
}