import React from 'react';
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
} from 'lucide-react';

import { usePlayer } from '../context/PlayerContext';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

export default function MediaPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,

    progress,
    setProgress,

    duration,
    setDuration,

    volume,
    setVolume,

    isMuted,
    toggleMute,

    isShuffle,
    toggleShuffle,

    repeatMode,
    toggleRepeat,

    showVideo,
    setShowVideo,

    handleSeekChange,
    handleSeekMouseUp,
    handleEnded,

    playerRef,
    isSeeking,
  } = usePlayer();

  if (!currentSong) {
    return null;
  }

  /*
   * Calculate progress percentage for the visual progress glow.
   * This does not change playback functionality.
   */
  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (progress / duration) * 100))
      : 0;

  return (
    <>
      {/* =========================================================
          HIDDEN / VIDEO REACT PLAYER
      ========================================================== */}

      <div
        className={
          showVideo
            ? `
              fixed
              bottom-24
              right-4
              sm:right-6
              z-[60]
              w-[calc(100vw-2rem)]
              max-w-[420px]
              aspect-video
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-black
              shadow-2xl
              shadow-black/60
              ring-1
              ring-emerald-400/10
            `
            : `
              fixed
              -top-[9999px]
              -left-[9999px]
              opacity-0
              pointer-events-none
            `
        }
      >
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
              setProgress(state.playedSeconds);
            }
          }}

          onDuration={(seconds) => {
            console.log('PLAYER DURATION:', seconds);
            setDuration(seconds);
          }}

          onEnded={() => {
            console.log(
              'PLAYER ENDED:',
              currentSong.title
            );

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

      {/* =========================================================
          PREMIUM PLAYER
      ========================================================== */}

      <div
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-50
          px-2
          sm:px-4
          pb-2
          sm:pb-3
          pointer-events-none
        "
      >
        <div
          className="
            pointer-events-auto
            relative
            mx-auto
            max-w-7xl
            overflow-hidden
            rounded-2xl
            sm:rounded-3xl
            border
            border-white/[0.08]
            bg-slate-950/90
            shadow-[0_-10px_50px_rgba(0,0,0,0.45)]
            backdrop-blur-2xl
          "
        >

          {/* =====================================================
              AMBIENT BACKGROUND
          ====================================================== */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">

            <div
              className="
                absolute
                -left-20
                -top-32
                h-64
                w-64
                rounded-full
                bg-emerald-500/[0.07]
                blur-3xl
              "
            />

            <div
              className="
                absolute
                -right-20
                -bottom-40
                h-72
                w-72
                rounded-full
                bg-cyan-500/[0.05]
                blur-3xl
              "
            />

            <div
              className="
                absolute
                inset-x-0
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-emerald-400/40
                to-transparent
              "
            />

          </div>

          {/* =====================================================
              DESKTOP / TABLET LAYOUT
          ====================================================== */}

          <div
            className="
              relative
              hidden
              md:grid
              md:grid-cols-[1fr_auto_1fr]
              items-center
              gap-6
              px-5
              py-3
            "
          >

            {/* =================================================
                LEFT — SONG INFORMATION
            ================================================= */}

            <div className="flex min-w-0 items-center gap-3">

              {/* Album artwork */}

              <div
                className={`
                  relative
                  h-14
                  w-14
                  shrink-0
                  overflow-hidden
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-slate-900
                  shadow-lg
                  shadow-black/30
                  ${isPlaying ? 'ring-1 ring-emerald-400/20' : ''}
                `}
              >

                <img
                  src={currentSong.thumbnail_url}
                  alt={currentSong.title}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    hover:scale-110
                  "
                />

                {/* Playing overlay */}

                {isPlaying && (
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-end
                      justify-center
                      bg-gradient-to-t
                      from-black/60
                      via-transparent
                      to-transparent
                      pb-1.5
                    "
                  >
                    <div className="flex items-end gap-[2px] h-4">

                      <span className="h-2 w-[2px] rounded-full bg-emerald-400 animate-[pulse_0.7s_ease-in-out_infinite]" />

                      <span className="h-4 w-[2px] rounded-full bg-emerald-400 animate-[pulse_0.9s_ease-in-out_infinite]" />

                      <span className="h-3 w-[2px] rounded-full bg-emerald-400 animate-[pulse_0.6s_ease-in-out_infinite]" />

                      <span className="h-4 w-[2px] rounded-full bg-emerald-400 animate-[pulse_1s_ease-in-out_infinite]" />

                    </div>
                  </div>
                )}

              </div>

              {/* Song text */}

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <h4
                    className="
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
                        shrink-0
                        rounded-full
                        border
                        border-emerald-400/20
                        bg-emerald-400/10
                        px-1.5
                        py-0.5
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-emerald-400
                      "
                    >
                      Playing
                    </span>
                  )}

                </div>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-xs
                    text-slate-500
                  "
                >
                  {currentSong.artist || 'Unknown Artist'}
                </p>

              </div>

            </div>

            {/* =================================================
                CENTER — PLAYER CONTROLS
            ================================================= */}

            <div className="flex w-[420px] max-w-[45vw] flex-col items-center">

              {/* Controls */}

              <div className="flex items-center gap-2">

                {/* Shuffle */}

                <button
                  type="button"
                  onClick={toggleShuffle}
                  title="Shuffle"
                  className={`
                    group
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    transition-all
                    duration-200
                    ${
                      isShuffle
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'text-slate-500 hover:bg-white/[0.05] hover:text-white'
                    }
                  `}
                >
                  <Shuffle className="h-4 w-4 transition-transform group-hover:scale-110" />
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
                  title={isPlaying ? 'Pause' : 'Play'}
                  className="
                    group
                    relative
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-emerald-400
                    text-slate-950
                    shadow-lg
                    shadow-emerald-500/20
                    transition-all
                    duration-200
                    hover:scale-105
                    hover:bg-emerald-300
                    hover:shadow-emerald-400/30
                    active:scale-95
                  "
                >

                  <span
                    className="
                      absolute
                      inset-0
                      rounded-full
                      bg-emerald-400
                      opacity-20
                      blur-md
                      transition-opacity
                      group-hover:opacity-40
                    "
                  />

                  <span className="relative">

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
                    group
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    transition-all
                    ${
                      repeatMode !== 'off'
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'text-slate-500 hover:bg-white/[0.05] hover:text-white'
                    }
                  `}
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="h-4 w-4" />
                  ) : (
                    <Repeat className="h-4 w-4" />
                  )}
                </button>

              </div>

              {/* Progress */}

              <div className="mt-1.5 flex w-full items-center gap-2">

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

                <div className="relative flex-1">

                  {/* Track */}

                  <div
                    className="
                      h-1
                      w-full
                      overflow-hidden
                      rounded-full
                      bg-slate-800
                    "
                  >

                    {/* Progress */}

                    <div
                      className="
                        h-full
                        rounded-full
                        bg-gradient-to-r
                        from-emerald-500
                        via-emerald-400
                        to-cyan-400
                        transition-[width]
                        duration-100
                      "
                      style={{
                        width: `${progressPercent}%`,
                      }}
                    />

                  </div>

                  {/* Actual range input */}

                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.1"
                    value={
                      duration
                        ? Math.min(progress, duration)
                        : 0
                    }
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekMouseUp}
                    onTouchEnd={handleSeekMouseUp}
                    disabled={!duration}
                    className="
                      absolute
                      inset-0
                      h-1
                      w-full
                      cursor-pointer
                      opacity-0
                    "
                  />

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
                RIGHT — VIDEO + VOLUME
            ================================================= */}

            <div className="flex items-center justify-end gap-3">

              {/* Video */}

              <button
                type="button"
                onClick={() =>
                  setShowVideo((previous) => !previous)
                }
                title={showVideo ? 'Hide Video' : 'Show Video'}
                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  transition-all
                  ${
                    showVideo
                      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400 shadow-lg shadow-emerald-500/5'
                      : 'border-white/[0.06] bg-white/[0.03] text-slate-500 hover:border-white/10 hover:text-white'
                  }
                `}
              >
                {showVideo ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
              </button>

              {/* Volume */}

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
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
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                  }}
                  className="
                    h-1
                    w-20
                    cursor-pointer
                    appearance-none
                    rounded-full
                    bg-slate-800
                    accent-emerald-400
                  "
                />

              </div>

            </div>

          </div>

          {/* =====================================================
              MOBILE PLAYER
          ====================================================== */}

          <div className="relative px-3 py-3 md:hidden">

            {/* Top row */}

            <div className="flex items-center gap-3">

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
              >

                <img
                  src={currentSong.thumbnail_url}
                  alt={currentSong.title}
                  className="h-full w-full object-cover"
                />

                {isPlaying && (
                  <div className="absolute inset-0 flex items-end justify-center bg-black/30 pb-1">

                    <div className="flex h-3 items-end gap-[2px]">

                      <span className="h-2 w-[2px] rounded-full bg-emerald-400 animate-pulse" />
                      <span className="h-3 w-[2px] rounded-full bg-emerald-400 animate-pulse" />
                      <span className="h-2.5 w-[2px] rounded-full bg-emerald-400 animate-pulse" />

                    </div>

                  </div>
                )}

              </div>

              {/* Song information */}

              <div className="min-w-0 flex-1">

                <h4 className="truncate text-xs font-bold text-white">
                  {currentSong.title}
                </h4>

                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                  {currentSong.artist || 'Unknown Artist'}
                </p>

              </div>

              {/* Video */}

              <button
                type="button"
                onClick={() =>
                  setShowVideo((previous) => !previous)
                }
                className={`
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  ${
                    showVideo
                      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400'
                      : 'border-white/[0.06] bg-white/[0.03] text-slate-500'
                  }
                `}
              >
                {showVideo ? (
                  <Video className="h-3.5 w-3.5" />
                ) : (
                  <VideoOff className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Play */}

              <button
                type="button"
                onClick={togglePlay}
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-400
                  text-slate-950
                  shadow-lg
                  shadow-emerald-500/20
                  transition
                  active:scale-90
                "
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                )}
              </button>

            </div>

            {/* Mobile controls */}

            <div className="mt-3 flex items-center justify-between">

              <div className="flex items-center gap-1">

                <button
                  type="button"
                  onClick={toggleShuffle}
                  className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    ${
                      isShuffle
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }
                  `}
                >
                  <Shuffle className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={prevSong}
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    text-slate-400
                  "
                >
                  <SkipBack className="h-4 w-4 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={nextSong}
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    text-slate-400
                  "
                >
                  <SkipForward className="h-4 w-4 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={toggleRepeat}
                  className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    ${
                      repeatMode !== 'off'
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }
                  `}
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="h-3.5 w-3.5" />
                  ) : (
                    <Repeat className="h-3.5 w-3.5" />
                  )}
                </button>

              </div>

              {/* Mobile volume */}

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-slate-500"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                  }}
                  className="
                    h-1
                    w-16
                    cursor-pointer
                    appearance-none
                    rounded-full
                    bg-slate-800
                    accent-emerald-400
                  "
                />

              </div>

            </div>

            {/* Mobile progress */}

            <div className="mt-2 flex items-center gap-2">

              <span className="w-8 text-[9px] font-mono text-slate-600">
                {formatTime(progress)}
              </span>

              <div className="relative flex-1">

                <div className="h-1 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-emerald-500
                      to-cyan-400
                    "
                    style={{
                      width: `${progressPercent}%`,
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
                      ? Math.min(progress, duration)
                      : 0
                  }
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekMouseUp}
                  onTouchEnd={handleSeekMouseUp}
                  disabled={!duration}
                  className="
                    absolute
                    inset-0
                    h-1
                    w-full
                    cursor-pointer
                    opacity-0
                  "
                />

              </div>

              <span className="w-8 text-right text-[9px] font-mono text-slate-600">
                {formatTime(duration)}
              </span>

            </div>

          </div>

          {/* =====================================================
              DECORATIVE MUSIC INDICATOR
          ====================================================== */}

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
              opacity-20
              md:flex
            "
          >
            <Music2 className="h-3 w-3 text-emerald-400" />

            <Waves className="h-3 w-3 text-cyan-400" />

          </div>

        </div>
      </div>
    </>
  );
}