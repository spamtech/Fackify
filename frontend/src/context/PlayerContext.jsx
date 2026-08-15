import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from 'react';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  // ============================================================
  // PLAYLIST / QUEUE
  // ============================================================

  const [playlist, setPlaylist] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);

  // ============================================================
  // PLAYBACK
  // ============================================================

  const [isPlaying, setIsPlaying] = useState(false);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // ============================================================
  // VOLUME
  // ============================================================

  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // ============================================================
  // PLAYBACK MODES
  // ============================================================

  const [isShuffle, setIsShuffle] = useState(false);

  /*
   * off
   * all
   * one
   */
  const [repeatMode, setRepeatMode] = useState('off');

  // ============================================================
  // VIDEO
  // ============================================================

  const [showVideo, setShowVideo] = useState(false);

  // ============================================================
  // SEEKING
  // ============================================================

  const [isSeeking, setIsSeeking] = useState(false);

  // ============================================================
  // REACT PLAYER REF
  // ============================================================

  const playerRef = useRef(null);

  // ============================================================
  // CREATE / PLAY SONG
  // ============================================================

  const playSong = useCallback(
    (song, queue = null) => {
      if (!song) return;

      /*
       * If a queue was supplied,
       * replace the current queue.
       */
      if (Array.isArray(queue) && queue.length > 0) {
        setPlaylist(queue);
      } else {
        /*
         * Otherwise make sure the song exists
         * inside the current queue.
         */
        setPlaylist((previous) => {
          const exists = previous.some(
            (item) =>
              String(item.id) === String(song.id)
          );

          if (exists) {
            return previous;
          }

          return [...previous, song];
        });
      }

      /*
       * Clicking currently playing song
       * toggles pause.
       */
      if (
        currentSong &&
        String(currentSong.id) === String(song.id)
      ) {
        setIsPlaying((previous) => !previous);
        return;
      }

      /*
       * New song.
       */
      setCurrentSong(song);

      setProgress(0);
      setDuration(0);

      setIsPlaying(true);
    },
    [currentSong]
  );

  // ============================================================
  // PLAY / PAUSE
  // ============================================================

  const togglePlay = useCallback(() => {
    /*
     * Nothing currently selected.
     *
     * Try playing first item in queue.
     */
    if (!currentSong) {
      if (playlist.length > 0) {
        const firstSong = playlist[0];

        setCurrentSong(firstSong);
        setProgress(0);
        setDuration(0);
        setIsPlaying(true);
      }

      return;
    }

    setIsPlaying((previous) => !previous);
  }, [currentSong, playlist]);

  // ============================================================
  // NEXT SONG
  // ============================================================

  const nextSong = useCallback(() => {
    if (!playlist.length) {
      return;
    }

    const currentIndex = playlist.findIndex(
      (song) =>
        String(song.id) ===
        String(currentSong?.id)
    );

    /*
     * If current song somehow isn't in queue,
     * start the first song.
     */
    if (currentIndex === -1) {
      const firstSong = playlist[0];

      setCurrentSong(firstSong);
      setProgress(0);
      setDuration(0);
      setIsPlaying(true);

      return;
    }

    // ==========================================================
    // SHUFFLE
    // ==========================================================

    if (
      isShuffle &&
      playlist.length > 1
    ) {
      let randomIndex;

      do {
        randomIndex = Math.floor(
          Math.random() * playlist.length
        );
      } while (
        randomIndex === currentIndex
      );

      const randomSong =
        playlist[randomIndex];

      setCurrentSong(randomSong);
      setProgress(0);
      setDuration(0);
      setIsPlaying(true);

      return;
    }

    // ==========================================================
    // NORMAL NEXT
    // ==========================================================

    const nextIndex =
      currentIndex + 1;

    /*
     * There is another song.
     */
    if (
      nextIndex <
      playlist.length
    ) {
      const nextSongItem =
        playlist[nextIndex];

      setCurrentSong(nextSongItem);

      setProgress(0);
      setDuration(0);

      /*
       * IMPORTANT:
       * Automatically start the next song.
       */
      setIsPlaying(true);

      return;
    }

    // ==========================================================
    // END OF QUEUE
    // ==========================================================

    /*
     * Repeat ALL
     */
    if (repeatMode === 'all') {
      const firstSong = playlist[0];

      setCurrentSong(firstSong);

      setProgress(0);
      setDuration(0);

      setIsPlaying(true);

      return;
    }

    /*
     * No repeat.
     *
     * Stop playback.
     */
    setIsPlaying(false);
    setProgress(0);
  }, [
    playlist,
    currentSong,
    isShuffle,
    repeatMode,
  ]);

  // ============================================================
  // PREVIOUS SONG
  // ============================================================

  const prevSong = useCallback(() => {
    if (!playlist.length) {
      return;
    }

    /*
     * If song has played more than 3 seconds,
     * restart current song.
     */
    if (
      progress > 3 &&
      playerRef.current
    ) {
      try {
        playerRef.current.seekTo(
          0,
          'seconds'
        );
      } catch (error) {
        console.error(
          'Failed to restart song:',
          error
        );
      }

      setProgress(0);

      return;
    }

    const currentIndex =
      playlist.findIndex(
        (song) =>
          String(song.id) ===
          String(currentSong?.id)
      );

    /*
     * If current song is not found,
     * play first song.
     */
    if (currentIndex === -1) {
      const firstSong = playlist[0];

      setCurrentSong(firstSong);

      setProgress(0);
      setDuration(0);
      setIsPlaying(true);

      return;
    }

    /*
     * Previous song.
     */
    if (currentIndex > 0) {
      const previousSong =
        playlist[currentIndex - 1];

      setCurrentSong(previousSong);

      setProgress(0);
      setDuration(0);
      setIsPlaying(true);

      return;
    }

    /*
     * If already at first song,
     * go to last song.
     */
    const lastSong =
      playlist[playlist.length - 1];

    setCurrentSong(lastSong);

    setProgress(0);
    setDuration(0);
    setIsPlaying(true);
  }, [
    playlist,
    currentSong,
    progress,
  ]);

  // ============================================================
  // SHUFFLE
  // ============================================================

  const toggleShuffle = useCallback(() => {
    setIsShuffle(
      (previous) => !previous
    );
  }, []);

  // ============================================================
  // REPEAT
  // ============================================================

  /*
   * OFF → ALL → ONE → OFF
   */

  const toggleRepeat = useCallback(() => {
    setRepeatMode((previous) => {
      if (previous === 'off') {
        return 'all';
      }

      if (previous === 'all') {
        return 'one';
      }

      return 'off';
    });
  }, []);

  // ============================================================
  // MUTE
  // ============================================================

  const toggleMute = useCallback(() => {
    setIsMuted(
      (previous) => !previous
    );
  }, []);

  // ============================================================
  // SEEK
  // ============================================================

  const handleSeekChange = useCallback(
    (event) => {
      const value = Number(
        event.target.value
      );

      setIsSeeking(true);
      setProgress(value);
    },
    []
  );

  // ============================================================
  // COMMIT SEEK
  // ============================================================

  const handleSeekMouseUp =
    useCallback((event) => {
      const targetSeconds =
        Number(event.target.value);

      setIsSeeking(false);

      if (!playerRef.current) {
        return;
      }

      try {
        playerRef.current.seekTo(
          targetSeconds,
          'seconds'
        );
      } catch (error) {
        console.error(
          'Seek failed:',
          error
        );
      }
    }, []);

  // ============================================================
  // SONG ENDED
  // ============================================================

  const handleEnded = useCallback(() => {
    console.log(
      '🎵 Song ended:',
      currentSong?.title
    );

    /*
     * REPEAT ONE
     *
     * Restart exactly the same song.
     */
    if (repeatMode === 'one') {
      setProgress(0);

      if (playerRef.current) {
        try {
          playerRef.current.seekTo(
            0,
            'seconds'
          );
        } catch (error) {
          console.error(
            'Failed to restart repeated song:',
            error
          );
        }
      }

      /*
       * Make sure ReactPlayer starts again.
       */
      setIsPlaying(false);

      setTimeout(() => {
        setIsPlaying(true);
      }, 50);

      return;
    }

    /*
     * NORMAL / SHUFFLE / REPEAT ALL
     *
     * nextSong() handles all of these.
     */
    nextSong();
  }, [
    currentSong,
    repeatMode,
    nextSong,
  ]);

  // ============================================================
  // CONTEXT
  // ============================================================

  return (
    <PlayerContext.Provider
      value={{
        // ------------------------------------------------------
        // QUEUE
        // ------------------------------------------------------

        playlist,
        setPlaylist,

        // ------------------------------------------------------
        // CURRENT SONG
        // ------------------------------------------------------

        currentSong,

        // ------------------------------------------------------
        // PLAYBACK
        // ------------------------------------------------------

        isPlaying,
        setIsPlaying,

        playSong,
        togglePlay,

        nextSong,
        prevSong,

        // ------------------------------------------------------
        // PROGRESS
        // ------------------------------------------------------

        progress,
        setProgress,

        duration,
        setDuration,

        // ------------------------------------------------------
        // VOLUME
        // ------------------------------------------------------

        volume,
        setVolume,

        isMuted,
        toggleMute,

        // ------------------------------------------------------
        // SHUFFLE / REPEAT
        // ------------------------------------------------------

        isShuffle,
        toggleShuffle,

        repeatMode,
        toggleRepeat,

        // ------------------------------------------------------
        // VIDEO
        // ------------------------------------------------------

        showVideo,
        setShowVideo,

        // ------------------------------------------------------
        // SEEK
        // ------------------------------------------------------

        handleSeekChange,
        handleSeekMouseUp,

        // ------------------------------------------------------
        // PLAYER END
        // ------------------------------------------------------

        handleEnded,

        // ------------------------------------------------------
        // PLAYER REF
        // ------------------------------------------------------

        playerRef,

        // ------------------------------------------------------
        // SEEKING
        // ------------------------------------------------------

        isSeeking,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

export const usePlayer = () => {
  const context =
    useContext(PlayerContext);

  if (!context) {
    throw new Error(
      'usePlayer must be used inside PlayerProvider'
    );
  }

  return context;
};