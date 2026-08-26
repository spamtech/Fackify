import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  X,
  Trash2,
  ChevronDown,
  Music2,
} from 'lucide-react';

import { usePlayer } from '../context/PlayerContext';

/* =========================================================
   TIME FORMATTER
========================================================= */
const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

/* =========================================================
   TITLE FORMATTER
========================================================= */
const getSongTitle = (song) => {
  if (!song) return 'Untitled Track';
  if (typeof song === 'string') return song;

  return (
    song.title ||
    song.song_title ||
    song.name ||
    song.songName ||
    song.song?.title ||
    song.track?.title ||
    'Untitled Track'
  );
};

/* =========================================================
   ARTIST FORMATTER
========================================================= */
const getArtistName = (song) => {
  if (!song) return 'Unknown Artist';
  if (typeof song === 'string') return 'Unknown Artist';

  const target = song.song || song.track || song;

  if (Array.isArray(target.artists) && target.artists.length > 0) {
    const names = target.artists
      .map((artist) => {
        if (typeof artist === 'string') return artist;

        return (
          artist?.name ||
          artist?.artist_name ||
          artist?.artist ||
          ''
        );
      })
      .filter(Boolean);

    if (names.length > 0) return names.join(' • ');
  }

  if (
    Array.isArray(target.artist_names) &&
    target.artist_names.length > 0
  ) {
    return target.artist_names.filter(Boolean).join(' • ');
  }

  return (
    target.artist_name ||
    target.artist ||
    target.author ||
    target.channelTitle ||
    'Unknown Artist'
  );
};

/* =========================================================
   IMAGE FORMATTER
========================================================= */
const getThumbnail = (song) => {
  if (!song || typeof song === 'string') return '';

  const target = song.song || song.track || song;

  return (
    target.thumbnail_url ||
    target.thumbnailUrl ||
    target.thumbnail ||
    target.image_url ||
    target.imageUrl ||
    target.coverUrl ||
    target.image ||
    ''
  );
};

/* =========================================================
   STABLE KEY FOR A QUEUE ENTRY
========================================================= */
const getQueueKey = (song, index) =>
  song?.id ??
  song?.queueId ??
  song?.uid ??
  `${song?.title || 'untitled'}-${index}`;

/* =========================================================
   FLOATING MUSIC SYMBOLS
========================================================= */
const FLOATING_MUSIC_SYMBOLS = [
  '♪',
  '♫',
  '♬',
  '♩',
  '𝄞',
  '♪',
  '♫',
  '♬',
  '♩',
  '𝅘𝅥𝅮',
  '♪',
  '♫',
  '♬',
  '♩',
  '♪',
  '♫',
];

/* =========================================================
   MAX PLAYER COMPONENT
========================================================= */
export default function MaxPlayer({ isOpen = true, onClose }) {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    progress,
    setProgress,
    duration,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    songColors,
    queue,
    playQueueSong,
    removeFromQueue,
    clearQueue,
    getCurrentIndex,
    handleSeekChange,
    handleSeekMouseUp,
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  const progressBarRef = useRef(null);
  const activeQueueItemRef = useRef(null);

  const safeQueue = Array.isArray(queue) ? queue : [];

  const currentIndex =
    typeof getCurrentIndex === 'function'
      ? getCurrentIndex()
      : -1;

  const currentTitle = useMemo(
    () => getSongTitle(currentSong),
    [currentSong]
  );

  const artistName = useMemo(
    () => getArtistName(currentSong),
    [currentSong]
  );

  const thumbnail = useMemo(
    () => getThumbnail(currentSong),
    [currentSong]
  );

  const colors = songColors || {
    primary: '#10b981',
    secondary: '#06b6d4',
    accent: '#34d399',
    glow: 'rgba(16, 185, 129, 0.28)',
    background: '#020617',
  };

  const progressPercent =
    duration > 0
      ? Math.min(
          100,
          Math.max(0, (progress / duration) * 100)
        )
      : 0;

  const volumePercent = isMuted ? 0 : volume * 100;

  /* =========================================================
     QUEUE ACTIVE CHECK
  ========================================================= */
  const isQueueSongActive = useCallback(
    (song, index) => {
      if (currentIndex >= 0) {
        return index === currentIndex;
      }

      if (!song || !currentSong) return false;

      if (song.id && currentSong.id) {
        return (
          String(song.id) === String(currentSong.id)
        );
      }

      return song === currentSong;
    },
    [currentIndex, currentSong]
  );

  /* =========================================================
     NEXT SONG
  ========================================================= */
  const nextUpSong = useMemo(() => {
    if (safeQueue.length === 0) return null;

    const upcomingIndex =
      currentIndex >= 0
        ? currentIndex + 1
        : 0;

    return safeQueue[upcomingIndex] || null;
  }, [safeQueue, currentIndex]);

  /* =========================================================
     AUTO SCROLL ACTIVE QUEUE ITEM
  ========================================================= */
  useEffect(() => {
    if (
      showQueue &&
      activeQueueItemRef.current
    ) {
      activeQueueItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [showQueue, currentIndex]);

  if (!isOpen || !currentSong) return null;

  /* =========================================================
     QUEUE SONG HANDLER
  ========================================================= */
  const handleQueueSong = (song, index) => {
    if (typeof playQueueSong === 'function') {
      playQueueSong(song, index);
    }
  };

  /* =========================================================
     PROGRESS BAR HOVER
  ========================================================= */
  const handleMouseMove = (e) => {
    if (!progressBarRef.current || !duration) return;

    const rect =
      progressBarRef.current.getBoundingClientRect();

    const pos = Math.max(
      0,
      Math.min(
        1,
        (e.clientX - rect.left) / rect.width
      )
    );

    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-slate-950 font-sans text-white select-none backdrop-blur-3xl"
      style={{
        '--player-primary': colors.primary,
        '--player-secondary': colors.secondary,
        '--player-accent': colors.accent,
        '--player-glow': colors.glow,
      }}
    >
      {/* =====================================================
          RANDOM FLOATING MUSIC SYMBOLS
      ====================================================== */}
      <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
        {FLOATING_MUSIC_SYMBOLS.map((symbol, index) => (
          <span
            key={`${symbol}-${index}`}
            className="absolute select-none font-serif font-bold"
            style={{
              left: `${5 + ((index * 17) % 90)}%`,
              top: `${8 + ((index * 29) % 82)}%`,
              fontSize: `${16 + ((index * 13) % 22)}px`,
              opacity:
                0.08 +
                ((index * 7) % 10) / 100,
              color:
                index % 3 === 0
                  ? colors.primary
                  : index % 3 === 1
                  ? colors.secondary
                  : colors.accent,
              animation: `floatingMusic ${
                5 + (index % 5)
              }s ease-in-out ${
                -(index * 0.7)
              }s infinite`,
              filter: `drop-shadow(0 0 8px ${colors.glow})`,
            }}
          >
            {symbol}
          </span>
        ))}
      </div>

      {/* =====================================================
          DYNAMIC BLURRED ALBUM ART BACKGROUND
      ====================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {thumbnail ? (
          <div
            className={`absolute inset-[-40px] bg-cover bg-center transition-all duration-1000 ${
              isPlaying
                ? 'scale-110 opacity-35 blur-[70px]'
                : 'scale-100 opacity-20 blur-[85px] saturate-50'
            }`}
            style={{
              backgroundImage: `url(${thumbnail})`,
            }}
          />
        ) : (
          <>
            <div
              className={`absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full blur-[150px] transition-all duration-1000 ${
                isPlaying
                  ? 'scale-125 opacity-40'
                  : 'scale-95 opacity-15 saturate-50'
              }`}
              style={{
                background: colors.primary,
              }}
            />

            <div
              className={`absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full blur-[150px] transition-all duration-1000 ${
                isPlaying
                  ? 'scale-125 opacity-30'
                  : 'scale-90 opacity-10 saturate-50'
              }`}
              style={{
                background: colors.secondary,
              }}
            />
          </>
        )}

        {/* Ambient Darkened Gradient Masks */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/85 to-slate-950" />

        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/50 to-slate-950" />
      </div>

      {/* =====================================================
          PAUSED VEIL
      ====================================================== */}
      <div
        className={`pointer-events-none absolute inset-0 z-[1] transition-all duration-700 ${
          isPlaying
            ? 'opacity-0'
            : 'opacity-100 bg-slate-950/30 backdrop-blur-[1px]'
        }`}
      />

      {/* =====================================================
          FLOATING MINIMIZE BUTTON
      ====================================================== */}
      <div className="absolute left-6 top-6 z-30">
        <button
          type="button"
          onClick={onClose}
          title="Minimize player"
          className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95 shadow-lg"
        >
          <ChevronDown className="h-6 w-6 transition-transform duration-200 group-hover:translate-y-0.5" />
        </button>
      </div>

      {/* =====================================================
          MAIN BODY AREA
      ====================================================== */}
      <main className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        {/* Core Player Center Section */}
        <section
          className={`flex min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 transition-all duration-500 sm:px-12 ${
            showQueue ? 'lg:pr-6' : ''
          }`}
        >
          <div className="relative my-auto flex w-full max-w-[480px] flex-col items-center">
            {/* =================================================
                VINYL & ARTWORK SHOWCASE
            ================================================== */}
            <div className="relative flex items-center justify-center">
              {/* Rotating Vinyl Disc */}
              <div
                className={`absolute h-[min(65vw,360px)] w-[min(65vw,360px)] rounded-full border border-white/10 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 p-2 shadow-2xl transition-all duration-700 ease-out sm:h-[min(48vw,390px)] sm:w-[min(48vw,390px)] ${
                  isPlaying
                    ? 'translate-x-16 animate-[spin_6s_linear_infinite] opacity-100 sm:translate-x-24'
                    : 'translate-x-10 opacity-60 sm:translate-x-16'
                }`}
              >
                <div className="relative flex h-full w-full items-center justify-center rounded-full border border-dashed border-white/15">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-slate-950 shadow-inner">
                    <div
                      className="h-7 w-7 rounded-full border border-white/20"
                      style={{
                        background: colors.primary,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Main Artwork Tile */}
              <button
                type="button"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                className={`group relative z-10 aspect-square w-[min(70vw,380px)] overflow-hidden rounded-[32px] border border-white/15 bg-slate-900 shadow-[0_25px_80px_rgba(0,0,0,0.8)] transition-all duration-700 sm:w-[min(50vw,420px)] ${
                  isPlaying
                    ? 'ring-2 ring-emerald-400/30 ring-offset-4 ring-offset-slate-950'
                    : 'ring-1 ring-white/10 grayscale-[0.15]'
                }`}
              >
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={currentTitle}
                    className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
                      isPlaying
                        ? 'blur-0 scale-100 brightness-100'
                        : 'blur-[3px] scale-[1.04] brightness-75'
                    }`}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900">
                    <Music2 className="h-16 w-16 text-slate-700" />
                  </div>
                )}

                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity duration-500">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-black/40 backdrop-blur-md transition-transform duration-200 group-hover:scale-110">
                      <Play className="ml-1 h-6 w-6 fill-white text-white" />
                    </div>
                  </div>
                )}

                {isPlaying && (
                  <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent pb-6 backdrop-blur-[1px] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="flex items-end gap-1.5 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-xl">
                      <Pause className="h-4 w-4 fill-white text-white" />
                    </div>
                  </div>
                )}

                {/* Music Playing Animation */}
                {isPlaying && (
                  <div className="pointer-events-none absolute bottom-4 left-4 flex items-end gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-1.5 backdrop-blur-xl">
                    <span
                      className="h-2 w-1 rounded-full animate-[musicbar_0.65s_ease-in-out_infinite]"
                      style={{
                        background: colors.primary,
                      }}
                    />
                    <span
                      className="h-3.5 w-1 rounded-full animate-[musicbar_0.85s_ease-in-out_infinite]"
                      style={{
                        background: colors.accent,
                      }}
                    />
                    <span
                      className="h-2.5 w-1 rounded-full animate-[musicbar_0.55s_ease-in-out_infinite]"
                      style={{
                        background: colors.secondary,
                      }}
                    />
                    <span
                      className="h-4 w-1 rounded-full animate-[musicbar_0.75s_ease-in-out_infinite]"
                      style={{
                        background: colors.primary,
                      }}
                    />
                  </div>
                )}
              </button>
            </div>

            {/* =================================================
                SONG META + VOLUME + QUEUE
            ================================================== */}
            <div className="mt-8 flex w-full items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {currentTitle}
                  </h1>

                  {!isPlaying && (
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Paused
                    </span>
                  )}
                </div>

                <p className="mt-1.5 truncate text-sm font-medium text-slate-400 sm:text-base">
                  {artistName}
                </p>
              </div>

              {/* =================================================
                  VOLUME CONTROL BESIDE QUEUE
              ================================================== */}
              <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2.5 py-2 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white active:scale-90"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-rose-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                  )}
                </button>

                <div className="relative flex h-3 w-20 items-center sm:w-28">
                  <div className="pointer-events-none absolute inset-x-0 h-1 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all duration-75"
                      style={{
                        width: `${volumePercent}%`,
                      }}
                    />
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) =>
                      setVolume(Number(e.target.value))
                    }
                    aria-label="Volume"
                    className="relative z-10 h-full w-full cursor-pointer opacity-0"
                  />
                </div>

                <span className="w-7 text-right font-mono text-[10px] text-slate-500">
                  {Math.round(volumePercent)}%
                </span>
              </div>

              {/* Queue Button */}
              <button
                type="button"
                onClick={() =>
                  setShowQueue((prev) => !prev)
                }
                title={`Queue (${safeQueue.length} tracks)`}
                className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all duration-200 active:scale-95 ${
                  showQueue
                    ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <ListMusic className="h-5 w-5" />

                {safeQueue.length > 0 && (
                  <span
                    className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black text-slate-950 shadow-md ring-2 ring-slate-950"
                    style={{
                      background: colors.primary,
                    }}
                  >
                    {safeQueue.length > 99
                      ? '99+'
                      : safeQueue.length}
                  </span>
                )}
              </button>
            </div>

            {/* =================================================
                PRECISION TIMELINE
            ================================================== */}
            <div className="mt-7 w-full">
              <div
                ref={progressBarRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() =>
                  setHoverTime(null)
                }
                className="group/slider relative flex cursor-pointer items-center py-2"
              >
                {hoverTime !== null && (
                  <div
                    className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-900/90 px-2 py-0.5 font-mono text-[10px] text-emerald-300 shadow-xl backdrop-blur-md"
                    style={{
                      left: `${hoverPosition}%`,
                    }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}

                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800/80 transition-all duration-200 group-hover/slider:h-2.5">
                  {hoverTime !== null && (
                    <div
                      className="absolute inset-y-0 left-0 bg-white/15"
                      style={{
                        width: `${hoverPosition}%`,
                      }}
                    />
                  )}

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-300 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.01"
                  value={Math.min(
                    progress || 0,
                    duration || 0
                  )}
                  onChange={(e) => {
                    const val = Number(
                      e.target.value
                    );

                    if (
                      typeof handleSeekChange ===
                      'function'
                    ) {
                      handleSeekChange(e);
                    } else if (
                      typeof setProgress ===
                      'function'
                    ) {
                      setProgress(val);
                    }
                  }}
                  onMouseUp={handleSeekMouseUp}
                  onTouchEnd={handleSeekMouseUp}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>

              <div className="mt-1 flex items-center justify-between font-mono text-[11px] tabular-nums text-slate-500">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* =================================================
                PLAYBACK CONTROLS
            ================================================== */}
            <div className="mt-6 flex items-center gap-3 sm:gap-5">
              {/* Shuffle */}
              <button
                type="button"
                onClick={toggleShuffle}
                title={`Shuffle: ${
                  isShuffle ? 'On' : 'Off'
                }`}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition active:scale-90 ${
                  isShuffle
                    ? 'bg-emerald-400/15 text-emerald-400 ring-1 ring-emerald-400/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Shuffle className="h-5 w-5" />
              </button>

              {/* Previous */}
              <button
                type="button"
                onClick={prevSong}
                title="Previous Track"
                className="flex h-12 w-12 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-90"
              >
                <SkipBack className="h-6 w-6 fill-current" />
              </button>

              {/* Play / Pause */}
              <button
                type="button"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-300 text-slate-950 shadow-[0_0_40px_rgba(52,211,153,0.35)] transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span className="absolute -inset-1 rounded-full border border-emerald-400/30 transition-transform duration-500 group-hover:scale-110" />

                {isPlaying ? (
                  <Pause className="h-7 w-7 fill-current" />
                ) : (
                  <Play className="ml-1 h-7 w-7 fill-current" />
                )}
              </button>

              {/* Next */}
              <button
                type="button"
                onClick={nextSong}
                title="Next Track"
                className="flex h-12 w-12 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-90"
              >
                <SkipForward className="h-6 w-6 fill-current" />
              </button>

              {/* Repeat */}
              <button
                type="button"
                onClick={toggleRepeat}
                title={`Repeat: ${repeatMode}`}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition active:scale-90 ${
                  repeatMode !== 'off'
                    ? 'bg-emerald-400/15 text-emerald-400 ring-1 ring-emerald-400/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="h-5 w-5" />
                ) : (
                  <Repeat className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* =================================================
                UP NEXT
            ================================================== */}
            {!showQueue && nextUpSong && (
              <button
                type="button"
                onClick={() =>
                  setShowQueue(true)
                }
                className="mt-6 flex w-full max-w-xs items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.99]"
              >
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-slate-900">
                  {getThumbnail(nextUpSong) ? (
                    <img
                      src={getThumbnail(nextUpSong)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music2 className="h-4 w-4 text-slate-700" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Up Next
                  </p>

                  <p className="truncate text-xs font-semibold text-slate-200">
                    {nextUpSong.title ||
                      'Untitled'}
                  </p>
                </div>
              </button>
            )}
          </div>
        </section>

        {/* ===================================================
            SIDEBAR QUEUE PANEL
        ==================================================== */}
        {showQueue && (
          <aside className="absolute inset-y-0 right-0 z-30 flex w-full flex-col border-l border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in slide-in-from-right sm:w-[400px] lg:relative lg:w-[380px] lg:shrink-0">
            {/* Drawer Header */}
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20">
                  <ListMusic className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white">
                    Playing Queue
                  </h2>

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {safeQueue.length} Tracks
                    Enqueued
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {safeQueue.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      typeof clearQueue ===
                        'function' &&
                      clearQueue()
                    }
                    title="Clear Queue"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-slate-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setShowQueue(false)
                  }
                  title="Close Queue"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-slate-400 transition hover:bg-white/10 hover:text-white active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Queue List Items */}
            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-4">
              {safeQueue.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] text-slate-600">
                    <ListMusic className="h-8 w-8" />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-300">
                    Your Queue is Empty
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Add songs to listen
                    seamlessly next.
                  </p>
                </div>
              ) : (
                safeQueue.map((song, index) => {
                  const active =
                    isQueueSongActive(
                      song,
                      index
                    );

                  const songImg =
                    getThumbnail(song);

                  const songTitle =
                    getSongTitle(song);

                  const songArt =
                    getArtistName(song);

                  const queueKey =
                    getQueueKey(
                      song,
                      index
                    );

                  return (
                    <div
                      key={queueKey}
                      ref={
                        active
                          ? activeQueueItemRef
                          : null
                      }
                      className={`group flex items-center gap-3.5 rounded-2xl p-2.5 transition-all duration-200 ${
                        active
                          ? 'border border-emerald-400/20 bg-emerald-400/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          : 'border border-transparent hover:border-white/5 hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className="w-4 shrink-0 text-center font-mono text-[10px] text-slate-600">
                        {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleQueueSong(
                            song,
                            index
                          )
                        }
                        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-md"
                      >
                        {songImg ? (
                          <img
                            src={songImg}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-900">
                            <Music2 className="h-5 w-5 text-slate-700" />
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          {active &&
                          isPlaying ? (
                            <Pause className="h-4 w-4 fill-white text-white" />
                          ) : (
                            <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
                          )}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleQueueSong(
                            song,
                            index
                          )
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`truncate text-xs font-semibold ${
                              active
                                ? 'font-bold text-emerald-300'
                                : 'text-slate-200'
                            }`}
                          >
                            {songTitle}
                          </p>

                          {active &&
                            isPlaying && (
                              <span className="flex shrink-0 items-end gap-[1.5px]">
                                <span className="h-1.5 w-[2px] rounded-full bg-emerald-400 animate-[musicbar_0.65s_ease-in-out_infinite]" />

                                <span className="h-2.5 w-[2px] rounded-full bg-emerald-400 animate-[musicbar_0.85s_ease-in-out_infinite]" />

                                <span className="h-2 w-[2px] rounded-full bg-emerald-400 animate-[musicbar_0.55s_ease-in-out_infinite]" />
                              </span>
                            )}
                        </div>

                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {songArt}
                        </p>
                      </button>

                      {typeof removeFromQueue ===
                        'function' && (
                        <button
                          type="button"
                          onClick={() =>
                            removeFromQueue(
                              index
                            )
                          }
                          title="Remove Track"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 opacity-0 transition-all hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Queue Footer */}
            {safeQueue.length > 0 && (
              <div className="flex shrink-0 items-center justify-between border-t border-white/10 px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <span>Position</span>

                <span>
                  {currentIndex >= 0
                    ? `${currentIndex + 1} of ${safeQueue.length}`
                    : '—'}
                </span>
              </div>
            )}
          </aside>
        )}
      </main>

      {/* =====================================================
          ANIMATIONS
      ====================================================== */}
      <style>{`
        @keyframes floatingMusic {
          0% {
            transform: translate3d(0, 25px, 0)
              rotate(-8deg)
              scale(0.8);
            opacity: 0;
          }

          20% {
            opacity: 0.7;
          }

          50% {
            transform: translate3d(18px, -20px, 0)
              rotate(8deg)
              scale(1);
            opacity: 0.45;
          }

          75% {
            opacity: 0.65;
          }

          100% {
            transform: translate3d(-15px, -75px, 0)
              rotate(-6deg)
              scale(0.85);
            opacity: 0;
          }
        }

        @keyframes musicbar {
          0%, 100% {
            transform: scaleY(0.3);
          }

          50% {
            transform: scaleY(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}