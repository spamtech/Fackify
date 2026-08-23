import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import api from '../api/axiosInstance';

const PlayerContext = createContext(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error(
      'usePlayer must be used inside PlayerProvider'
    );
  }

  return context;
};

export function PlayerProvider({ children }) {
  /* =========================================================
     PLAYER STATE
  ========================================================= */

  const [currentSong, setCurrentSong] = useState(null);

  const [queue, setQueue] = useState([]);

  const [isPlaying, setIsPlaying] = useState(false);

  const [progress, setProgress] = useState(0);

  const [duration, setDuration] = useState(0);

  const [volume, setVolumeState] = useState(0.8);

  const [isMuted, setIsMuted] = useState(false);

  const [isShuffle, setIsShuffle] = useState(false);

  const [repeatMode, setRepeatMode] = useState('off');

  const [showVideo, setShowVideo] = useState(false);

  const [isSeeking, setIsSeeking] = useState(false);

  /* =========================================================
     DYNAMIC SONG COLORS
  ========================================================= */

  const [songColors, setSongColors] = useState({
    primary: '#10b981',
    secondary: '#06b6d4',
    accent: '#34d399',
    glow: 'rgba(16, 185, 129, 0.18)',
    background: '#020617',
  });

  /* =========================================================
     PLAYLIST STATE
  ========================================================= */

  const [playlists, setPlaylists] = useState([]);

  const [playlistsLoading, setPlaylistsLoading] =
    useState(false);

  /* =========================================================
     REFS
  ========================================================= */

  const currentSongRef = useRef(null);

  const queueRef = useRef([]);

  const isPlayingRef = useRef(false);

  const isShuffleRef = useRef(false);

  const repeatModeRef = useRef('off');

  const playerRef = useRef(null);

  /* =========================================================
     KEEP REFS SYNCHRONIZED
  ========================================================= */

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  /* =========================================================
     COLOR HELPERS
  ========================================================= */

  const createFallbackSongColors = useCallback(() => {
    return {
      primary: '#10b981',
      secondary: '#06b6d4',
      accent: '#34d399',
      glow: 'rgba(16, 185, 129, 0.18)',
      background: '#020617',
    };
  }, []);

  const rgbToString = useCallback(
    (r, g, b) => {
      return `rgb(${r}, ${g}, ${b})`;
    },
    []
  );

  const rgbaToString = useCallback(
    (r, g, b, alpha) => {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    []
  );

  /* =========================================================
     EXTRACT COLORS FROM THUMBNAIL
  ========================================================= */

  const extractSongColors = useCallback(
    (imageUrl) => {
      if (!imageUrl) {
        setSongColors(
          createFallbackSongColors()
        );

        return;
      }

      const image = new Image();

      image.crossOrigin = 'anonymous';

      image.onload = () => {
        try {
          const canvas =
            document.createElement('canvas');

          const size = 60;

          canvas.width = size;
          canvas.height = size;

          const context =
            canvas.getContext('2d', {
              willReadFrequently: true,
            });

          if (!context) {
            setSongColors(
              createFallbackSongColors()
            );

            return;
          }

          context.drawImage(
            image,
            0,
            0,
            size,
            size
          );

          const imageData =
            context.getImageData(
              0,
              0,
              size,
              size
            );

          const pixels = imageData.data;

          const colorBuckets = {};

          for (
            let index = 0;
            index < pixels.length;
            index += 4
          ) {
            const red = pixels[index];

            const green =
              pixels[index + 1];

            const blue =
              pixels[index + 2];

            const alpha =
              pixels[index + 3];

            if (alpha < 160) {
              continue;
            }

            if (
              red < 18 &&
              green < 18 &&
              blue < 18
            ) {
              continue;
            }

            if (
              red > 240 &&
              green > 240 &&
              blue > 240
            ) {
              continue;
            }

            const brightness =
              0.299 * red +
              0.587 * green +
              0.114 * blue;

            if (brightness < 25) {
              continue;
            }

            const r =
              Math.round(red / 32) * 32;

            const g =
              Math.round(green / 32) * 32;

            const b =
              Math.round(blue / 32) * 32;

            const key = `${r},${g},${b}`;

            colorBuckets[key] =
              (colorBuckets[key] || 0) + 1;
          }

          const sortedColors =
            Object.entries(colorBuckets)
              .sort(
                (a, b) =>
                  b[1] - a[1]
              )
              .slice(0, 6);

          if (
            sortedColors.length === 0
          ) {
            setSongColors(
              createFallbackSongColors()
            );

            return;
          }

          const dominant =
            sortedColors[0][0]
              .split(',')
              .map(Number);

          let primaryR =
            dominant[0];

          let primaryG =
            dominant[1];

          let primaryB =
            dominant[2];

          const enhanceColor = (
            value
          ) => {
            return Math.min(
              255,
              Math.round(
                value +
                  (255 - value) *
                    0.18
              )
            );
          };

          primaryR =
            enhanceColor(primaryR);

          primaryG =
            enhanceColor(primaryG);

          primaryB =
            enhanceColor(primaryB);

          let secondaryR =
            primaryR;

          let secondaryG =
            primaryG;

          let secondaryB =
            primaryB;

          if (
            sortedColors.length > 1
          ) {
            const secondary =
              sortedColors[1][0]
                .split(',')
                .map(Number);

            secondaryR =
              enhanceColor(
                secondary[0]
              );

            secondaryG =
              enhanceColor(
                secondary[1]
              );

            secondaryB =
              enhanceColor(
                secondary[2]
              );
          }

          const colorDifference =
            Math.max(
              primaryR,
              primaryG,
              primaryB
            ) -
            Math.min(
              primaryR,
              primaryG,
              primaryB
            );

          if (colorDifference < 18) {
            primaryR = 56;
            primaryG = 189;
            primaryB = 248;

            secondaryR = 129;
            secondaryG = 140;
            secondaryB = 248;
          }

          const primary =
            rgbToString(
              primaryR,
              primaryG,
              primaryB
            );

          const secondary =
            rgbToString(
              secondaryR,
              secondaryG,
              secondaryB
            );

          const accent = primary;

          const glow =
            rgbaToString(
              primaryR,
              primaryG,
              primaryB,
              0.22
            );

          const background =
            `rgb(${Math.round(
              primaryR * 0.045
            )}, ${Math.round(
              primaryG * 0.045
            )}, ${Math.round(
              primaryB * 0.045
            )})`;

          setSongColors({
            primary,
            secondary,
            accent,
            glow,
            background,
          });
        } catch (error) {
          console.warn(
            'SONG COLOR EXTRACTION FAILED:',
            error
          );

          setSongColors(
            createFallbackSongColors()
          );
        }
      };

      image.onerror = () => {
        setSongColors(
          createFallbackSongColors()
        );
      };

      image.src = imageUrl;
    },
    [
      createFallbackSongColors,
      rgbToString,
      rgbaToString,
    ]
  );

  /* =========================================================
     UPDATE COLORS WHEN SONG CHANGES
  ========================================================= */

  useEffect(() => {
    if (!currentSong) {
      setSongColors(
        createFallbackSongColors()
      );

      return;
    }

    if (!currentSong.thumbnail_url) {
      setSongColors(
        createFallbackSongColors()
      );

      return;
    }

    extractSongColors(
      currentSong.thumbnail_url
    );
  }, [
    currentSong?.id,
    currentSong?.thumbnail_url,
    extractSongColors,
    createFallbackSongColors,
  ]);

  /* =========================================================
     LOAD USER PLAYLISTS
  ========================================================= */

  const fetchPlaylists =
    useCallback(async () => {
      try {
        setPlaylistsLoading(true);

        const response =
          await api.get('/playlists');

        if (
          response.data?.success &&
          Array.isArray(
            response.data.playlists
          )
        ) {
          setPlaylists(
            response.data.playlists
          );
        } else {
          setPlaylists([]);
        }
      } catch (error) {
        console.error(
          'FAILED TO LOAD PLAYLISTS:',
          error.response?.data ||
            error.message
        );

        setPlaylists([]);
      } finally {
        setPlaylistsLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  /* =========================================================
     RESET PROGRESS WHEN SONG CHANGES
  ========================================================= */

  useEffect(() => {
    if (!currentSong) {
      setProgress(0);
      setDuration(0);

      return;
    }

    setProgress(0);
    setDuration(0);
  }, [currentSong?.id]);

  /* =========================================================
     CHECK SONG IN QUEUE
  ========================================================= */

  const isSongInQueue =
    useCallback((songId) => {
      if (!songId) {
        return false;
      }

      return queueRef.current.some(
        (song) =>
          String(song.id) ===
          String(songId)
      );
    }, []);

  /* =========================================================
     ADD SONG TO QUEUE
  ========================================================= */

  const addToQueue =
    useCallback((song) => {
      if (!song?.id) {
        return false;
      }

      const existingQueue =
        queueRef.current;

      const alreadyExists =
        existingQueue.some(
          (item) =>
            String(item.id) ===
            String(song.id)
        );

      if (alreadyExists) {
        return false;
      }

      const updatedQueue = [
        ...existingQueue,
        song,
      ];

      queueRef.current =
        updatedQueue;

      setQueue(updatedQueue);

      return true;
    }, []);

  /* =========================================================
     ADD MULTIPLE SONGS TO QUEUE
  ========================================================= */

  const addSongsToQueue =
    useCallback((songs) => {
      if (!Array.isArray(songs)) {
        return;
      }

      let updatedQueue = [
        ...queueRef.current,
      ];

      songs.forEach((song) => {
        if (!song?.id) {
          return;
        }

        const exists =
          updatedQueue.some(
            (item) =>
              String(item.id) ===
              String(song.id)
          );

        if (!exists) {
          updatedQueue.push(song);
        }
      });

      queueRef.current =
        updatedQueue;

      setQueue(updatedQueue);
    }, []);

  /* =========================================================
     REMOVE SONG FROM QUEUE
     
     Current song is protected.
  ========================================================= */

  const removeFromQueue =
    useCallback((songId) => {
      if (!songId) {
        return false;
      }

      const current =
        currentSongRef.current;

      if (
        current &&
        String(current.id) ===
          String(songId)
      ) {
        return false;
      }

      const updatedQueue =
        queueRef.current.filter(
          (song) =>
            String(song.id) !==
            String(songId)
        );

      queueRef.current =
        updatedQueue;

      setQueue(updatedQueue);

      return true;
    }, []);

  /* =========================================================
     CLEAR UPCOMING QUEUE
     
     Current song remains so the player
     can continue playing safely.
  ========================================================= */

  const clearQueue =
    useCallback(() => {
      const current =
        currentSongRef.current;

      const newQueue = current
        ? [current]
        : [];

      queueRef.current =
        newQueue;

      setQueue(newQueue);
    }, []);

  /* =========================================================
     REORDER QUEUE
  ========================================================= */

  const moveQueueItem =
    useCallback(
      (fromIndex, toIndex) => {
        const currentQueue =
          [...queueRef.current];

        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >=
            currentQueue.length ||
          toIndex >=
            currentQueue.length
        ) {
          return;
        }

        const [movedSong] =
          currentQueue.splice(
            fromIndex,
            1
          );

        currentQueue.splice(
          toIndex,
          0,
          movedSong
        );

        queueRef.current =
          currentQueue;

        setQueue(currentQueue);
      },
      []
    );

  /* =========================================================
     PLAY SONG FROM QUEUE
  ========================================================= */

  const playQueueSong =
    useCallback((song) => {
      if (!song) {
        return;
      }

      /*
       * Make sure song exists in queue.
       */

      if (
        !queueRef.current.some(
          (item) =>
            String(item.id) ===
            String(song.id)
        )
      ) {
        const updatedQueue = [
          ...queueRef.current,
          song,
        ];

        queueRef.current =
          updatedQueue;

        setQueue(updatedQueue);
      }

      currentSongRef.current =
        song;

      setCurrentSong(song);

      setProgress(0);

      setDuration(0);

      setIsPlaying(true);

      isPlayingRef.current =
        true;
    }, []);

  /* =========================================================
     PLAY SONG
     
     If `songs` is supplied, it becomes
     the active queue.
     
     This keeps your existing Artist
     queue functionality working.
  ========================================================= */

  const playSong =
    useCallback(
      (song, songs = null) => {
        if (!song) {
          return;
        }

        /*
         * Artist / playlist / album queue.
         */

        if (
          Array.isArray(songs) &&
          songs.length > 0
        ) {
          setQueue(songs);

          queueRef.current =
            songs;
        } else {
          /*
           * Normal song card playback.
           *
           * Add song to queue if it
           * isn't already there.
           */

          if (
            !queueRef.current.some(
              (item) =>
                String(item.id) ===
                String(song.id)
            )
          ) {
            const updatedQueue = [
              ...queueRef.current,
              song,
            ];

            setQueue(
              updatedQueue
            );

            queueRef.current =
              updatedQueue;
          }
        }

        /*
         * Clicking active song toggles
         * play / pause.
         */

        if (
          currentSongRef.current &&
          String(
            currentSongRef.current.id
          ) === String(song.id)
        ) {
          setIsPlaying(
            (previous) => {
              const nextValue =
                !previous;

              isPlayingRef.current =
                nextValue;

              return nextValue;
            }
          );

          return;
        }

        currentSongRef.current =
          song;

        setCurrentSong(song);

        setProgress(0);

        setDuration(0);

        setIsPlaying(true);

        isPlayingRef.current =
          true;
      },
      []
    );

  /* =========================================================
     TOGGLE PLAY / PAUSE
  ========================================================= */

  const togglePlay =
    useCallback(() => {
      if (
        !currentSongRef.current
      ) {
        return;
      }

      setIsPlaying(
        (previous) => {
          const nextValue =
            !previous;

          isPlayingRef.current =
            nextValue;

          return nextValue;
        }
      );
    }, []);

  /* =========================================================
     CURRENT SONG INDEX
  ========================================================= */

  const getCurrentIndex =
    useCallback(() => {
      const activeSong =
        currentSongRef.current;

      if (!activeSong) {
        return -1;
      }

      return queueRef.current.findIndex(
        (song) =>
          String(song.id) ===
          String(activeSong.id)
      );
    }, []);

  /* =========================================================
     NEXT SONG
  ========================================================= */

  const nextSong =
    useCallback(() => {
      const songs =
        queueRef.current;

      const activeSong =
        currentSongRef.current;

      if (
        !activeSong ||
        songs.length === 0
      ) {
        return;
      }

      const currentIndex =
        songs.findIndex(
          (song) =>
            String(song.id) ===
            String(activeSong.id)
        );

      if (currentIndex === -1) {
        return;
      }

      let nextIndex;

      /*
       * SHUFFLE
       */

      if (isShuffleRef.current) {
        if (songs.length === 1) {
          nextIndex = currentIndex;
        } else {
          const availableIndexes =
            songs
              .map(
                (_, index) =>
                  index
              )
              .filter(
                (index) =>
                  index !==
                  currentIndex
              );

          const randomPosition =
            Math.floor(
              Math.random() *
                availableIndexes.length
            );

          nextIndex =
            availableIndexes[
              randomPosition
            ];
        }
      } else {
        nextIndex =
          currentIndex + 1;

        if (
          nextIndex >=
          songs.length
        ) {
          if (
            repeatModeRef.current ===
            'all'
          ) {
            nextIndex = 0;
          } else {
            setIsPlaying(false);

            isPlayingRef.current =
              false;

            return;
          }
        }
      }

      const next =
        songs[nextIndex];

      if (!next) {
        return;
      }

      currentSongRef.current =
        next;

      setCurrentSong(next);

      setProgress(0);

      setDuration(0);

      setIsPlaying(true);

      isPlayingRef.current =
        true;
    }, []);

  /* =========================================================
     PREVIOUS SONG
  ========================================================= */

  const prevSong =
    useCallback(() => {
      const songs =
        queueRef.current;

      const activeSong =
        currentSongRef.current;

      if (
        !activeSong ||
        songs.length === 0
      ) {
        return;
      }

      if (progress > 3) {
        setProgress(0);

        if (playerRef.current) {
          try {
            playerRef.current.seekTo(
              0,
              'seconds'
            );
          } catch (error) {
            console.error(
              'FAILED TO RESTART SONG:',
              error
            );
          }
        }

        return;
      }

      const currentIndex =
        songs.findIndex(
          (song) =>
            String(song.id) ===
            String(activeSong.id)
        );

      if (currentIndex === -1) {
        return;
      }

      let previousIndex =
        currentIndex - 1;

      if (
        previousIndex < 0
      ) {
        previousIndex =
          repeatModeRef.current ===
          'all'
            ? songs.length - 1
            : 0;
      }

      const previous =
        songs[previousIndex];

      if (!previous) {
        return;
      }

      currentSongRef.current =
        previous;

      setCurrentSong(previous);

      setProgress(0);

      setDuration(0);

      setIsPlaying(true);

      isPlayingRef.current =
        true;
    }, [progress]);

  /* =========================================================
     HANDLE ENDED
  ========================================================= */

  const handleEnded =
    useCallback(() => {
      if (
        repeatModeRef.current ===
        'one'
      ) {
        setProgress(0);

        if (playerRef.current) {
          try {
            playerRef.current.seekTo(
              0,
              'seconds'
            );
          } catch (error) {
            console.error(
              'REPEAT SEEK ERROR:',
              error
            );
          }
        }

        setIsPlaying(true);

        isPlayingRef.current =
          true;

        return;
      }

      nextSong();
    }, [nextSong]);

  /* =========================================================
     SHUFFLE
  ========================================================= */

  const toggleShuffle =
    useCallback(() => {
      setIsShuffle(
        (previous) => {
          const nextValue =
            !previous;

          isShuffleRef.current =
            nextValue;

          return nextValue;
        }
      );
    }, []);

  /* =========================================================
     REPEAT
  ========================================================= */

  const toggleRepeat =
    useCallback(() => {
      setRepeatMode(
        (previous) => {
          let nextValue =
            'off';

          if (
            previous === 'off'
          ) {
            nextValue = 'all';
          } else if (
            previous === 'all'
          ) {
            nextValue = 'one';
          } else {
            nextValue = 'off';
          }

          repeatModeRef.current =
            nextValue;

          return nextValue;
        }
      );
    }, []);

  /* =========================================================
     MUTE
  ========================================================= */

  const toggleMute =
    useCallback(() => {
      setIsMuted(
        (previous) =>
          !previous
      );
    }, []);

  /* =========================================================
     VOLUME
  ========================================================= */

  const setVolume =
    useCallback((value) => {
      const safeValue =
        Math.min(
          1,
          Math.max(
            0,
            Number(value)
          )
        );

      setVolumeState(
        safeValue
      );

      if (safeValue > 0) {
        setIsMuted(false);
      }
    }, []);

  /* =========================================================
     SEEK
  ========================================================= */

  const handleSeekChange =
    useCallback((event) => {
      const value =
        Number(
          event.target.value
        );

      setProgress(value);

      setIsSeeking(true);
    }, []);

  /* =========================================================
     SEEK RELEASE
  ========================================================= */

  const handleSeekMouseUp =
    useCallback((event) => {
      const value =
        Number(
          event.target.value
        );

      setProgress(value);

      setIsSeeking(false);

      if (playerRef.current) {
        try {
          playerRef.current.seekTo(
            value,
            'seconds'
          );
        } catch (error) {
          console.error(
            'SEEK ERROR:',
            error
          );
        }
      }
    }, []);

  /* =========================================================
     ADD SONG TO PLAYLIST
  ========================================================= */

  const addSongToPlaylist =
    useCallback(
      async (
        playlistId,
        song
      ) => {
        if (
          !playlistId ||
          !song?.id
        ) {
          return;
        }

        try {
          const response =
            await api.post(
              `/playlists/${playlistId}/songs`,
              {
                songId: song.id,
              }
            );

          await fetchPlaylists();

          return response.data;
        } catch (error) {
          console.error(
            'FAILED TO ADD SONG:',
            error.response?.data ||
              error.message
          );

          throw error;
        }
      },
      [fetchPlaylists]
    );

  /* =========================================================
     REMOVE SONG FROM PLAYLIST
  ========================================================= */

  const removeSongFromPlaylist =
    useCallback(
      async (
        playlistId,
        songId
      ) => {
        if (
          !playlistId ||
          !songId
        ) {
          return;
        }

        try {
          const response =
            await api.delete(
              `/playlists/${playlistId}/songs/${songId}`
            );

          await fetchPlaylists();

          return response.data;
        } catch (error) {
          console.error(
            'FAILED TO REMOVE SONG:',
            error.response?.data ||
              error.message
          );

          throw error;
        }
      },
      [fetchPlaylists]
    );

  /* =========================================================
     SET PLAYER QUEUE
  ========================================================= */

  const setPlayerQueue =
    useCallback((songs) => {
      if (!Array.isArray(songs)) {
        return;
      }

      setQueue(songs);

      queueRef.current =
        songs;
    }, []);

  /* =========================================================
     CLEAR PLAYER
  ========================================================= */

  const clearPlayer =
    useCallback(() => {
      setCurrentSong(null);

      currentSongRef.current =
        null;

      setQueue([]);

      queueRef.current = [];

      setIsPlaying(false);

      isPlayingRef.current =
        false;

      setProgress(0);

      setDuration(0);

      setSongColors(
        createFallbackSongColors()
      );
    }, [
      createFallbackSongColors,
    ]);

  /* =========================================================
     CONTEXT VALUE
  ========================================================= */

  const value = useMemo(
    () => ({
      /* SONG */

      currentSong,

      songColors,

      /* QUEUE */

      queue,

      setQueue:
        setPlayerQueue,

      addToQueue,

      addSongsToQueue,

      removeFromQueue,

      clearQueue,

      moveQueueItem,

      playQueueSong,

      isSongInQueue,

      /* PLAYBACK */

      isPlaying,

      setIsPlaying,

      playSong,

      togglePlay,

      nextSong,

      prevSong,

      handleEnded,

      /* PROGRESS */

      progress,

      setProgress,

      duration,

      setDuration,

      isSeeking,

      setIsSeeking,

      handleSeekChange,

      handleSeekMouseUp,

      /* VOLUME */

      volume,

      setVolume,

      isMuted,

      toggleMute,

      /* SHUFFLE / REPEAT */

      isShuffle,

      toggleShuffle,

      repeatMode,

      toggleRepeat,

      /* VIDEO */

      showVideo,

      setShowVideo,

      /* PLAYER */

      playerRef,

      /* PLAYLISTS */

      playlists,

      setPlaylists,

      fetchPlaylists,

      playlistsLoading,

      addSongToPlaylist,

      removeSongFromPlaylist,

      /* UTILITY */

      getCurrentIndex,

      clearPlayer,
    }),
    [
      currentSong,
      songColors,
      queue,

      isPlaying,

      playSong,
      togglePlay,
      nextSong,
      prevSong,
      handleEnded,

      progress,
      duration,
      isSeeking,

      handleSeekChange,
      handleSeekMouseUp,

      volume,
      setVolume,
      isMuted,
      toggleMute,

      isShuffle,
      toggleShuffle,

      repeatMode,
      toggleRepeat,

      showVideo,

      setPlayerQueue,

      addToQueue,
      addSongsToQueue,
      removeFromQueue,
      clearQueue,
      moveQueueItem,
      playQueueSong,
      isSongInQueue,

      fetchPlaylists,
      playlistsLoading,
      addSongToPlaylist,
      removeSongFromPlaylist,

      getCurrentIndex,
      clearPlayer,
    ]
  );

  return (
    <PlayerContext.Provider
      value={value}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export default PlayerContext;