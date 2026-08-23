import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosInstance';
import SongCard from '../components/SongCard';
import { useDebounce } from '../hooks/useDebounce';

import {
  Search,
  X,
  Music2,
  Youtube,
  Disc3,
  Radio,
  Sparkles,
  TrendingUp,
  Library,
  SlidersHorizontal,
  ChevronRight,
  Waves,
  Heart,
  Headphones,
  Loader2,
  Archive,
  Database,
  ArrowUp,
  Clock3,
  Compass,
  Flame,
  HeartHandshake,
} from 'lucide-react';

/* ============================================================
   PLATFORM FILTERS
============================================================ */

const PLATFORM_FILTERS = [
  {
    id: 'all',
    label: 'All Tracks',
    icon: Sparkles,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: Youtube,
  },
  {
    id: 'spotify',
    label: 'Spotify',
    icon: Disc3,
  },
  {
    id: 'direct',
    label: 'Direct Audio',
    icon: Radio,
  },
];

/* ============================================================
   ROMANTIC CAPTIONS
============================================================ */

const ROMANTIC_CAPTIONS = [
  "Some songs sound better when you're in love. ❤️",
  'Every love story deserves its own soundtrack. 💕',
  'Maybe this is the song you were waiting for. ✨',
  'Late nights, soft music, beautiful memories. 🌙',
  'Press play and let the feelings begin. 🎧',
  "For every heartbeat, there's a song. ❤️",
  'Music says what the heart sometimes cannot. 💫',
  'One song can bring back a thousand memories. 🌹',
  'Close your eyes and let the music tell the story. 🎶',
  'Some melodies feel like a warm hug. 🤍',
  'Love sounds better with the right song. 💕',
  'A beautiful song can turn a moment into a memory. ✨',
  'Maybe your next favorite song is waiting here. 🎧',
  'For the one who makes your heart skip a beat. ❤️',
  'Turn up the volume, turn down the world. 🌙',
  'Sometimes a song feels like someone you miss. 💔',
  'Let the melody say what your heart cannot. 💫',
  'Your favorite memory might have a soundtrack. 🌹',
  'One melody. One moment. A thousand feelings. ❤️',
  'Music makes ordinary moments feel magical. ✨',
  'Find a song that feels like home. 🤍',
  'For nights when the heart needs a little music. 🌙',
  'Some songs are meant to be felt, not just heard. 🎧',
  'Let your heart choose what to play next. 💕',
];

/* ============================================================
   SKELETON CARD
============================================================ */

function SongSkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border border-slate-800/80
        bg-slate-900/70
        shadow-lg shadow-black/5
      "
    >
      <div
        className="
          relative
          aspect-square
          animate-pulse
          bg-gradient-to-br
          from-slate-800
          via-slate-850
          to-slate-900
        "
      >
        <div
          className="
            absolute
            left-3
            top-3
            h-6
            w-20
            rounded-lg
            bg-slate-700/70
          "
        />

        <div
          className="
            absolute
            bottom-4
            right-4
            h-12
            w-12
            rounded-full
            bg-slate-700/70
          "
        />
      </div>

      <div className="space-y-3 p-3.5">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-800" />

        <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-800" />

        <div className="border-t border-slate-800/70 pt-3">
          <div className="h-2.5 w-1/4 animate-pulse rounded bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   QUICK ACTION CARD
============================================================ */

function QuickActionCard({
  icon: Icon,
  title,
  description,
  accent = 'emerald',
  onClick,
  active = false,
}) {
  const accentClasses = {
    emerald: {
      icon: 'bg-emerald-500/10 text-emerald-400',
      hover: 'group-hover:border-emerald-500/30',
      glow: 'bg-emerald-500/[0.06]',
      active:
        'border-emerald-500/30 bg-emerald-500/[0.06]',
    },

    rose: {
      icon: 'bg-rose-500/10 text-rose-400',
      hover: 'group-hover:border-rose-500/30',
      glow: 'bg-rose-500/[0.06]',
      active:
        'border-rose-500/30 bg-rose-500/[0.06]',
    },

    cyan: {
      icon: 'bg-cyan-500/10 text-cyan-400',
      hover: 'group-hover:border-cyan-500/30',
      glow: 'bg-cyan-500/[0.06]',
      active:
        'border-cyan-500/30 bg-cyan-500/[0.06]',
    },

    purple: {
      icon: 'bg-purple-500/10 text-purple-400',
      hover: 'group-hover:border-purple-500/30',
      glow: 'bg-purple-500/[0.06]',
      active:
        'border-purple-500/30 bg-purple-500/[0.06]',
    },
  };

  const colors =
    accentClasses[accent] ||
    accentClasses.emerald;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        p-4
        text-left
        transition-all
        duration-300
        hover:-translate-y-1
        hover:bg-slate-900
        ${colors.hover}
        ${
          active
            ? colors.active
            : 'border-slate-800 bg-slate-900/70'
        }
      `}
    >
      <div
        className={`
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-24
          w-24
          rounded-full
          blur-2xl
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
          ${colors.glow}
        `}
      />

      <div className="relative flex items-center gap-3">
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${colors.icon}
          `}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-white">
            {title}
          </p>

          <p className="mt-0.5 truncate text-[9px] leading-4 text-slate-500">
            {description}
          </p>
        </div>

        <ChevronRight
          className="
            h-4
            w-4
            shrink-0
            text-slate-700
            transition-all
            duration-300
            group-hover:translate-x-1
            group-hover:text-slate-400
          "
        />
      </div>
    </button>
  );
}

/* ============================================================
   DASHBOARD
============================================================ */

export default function Dashboard() {
  /* ==========================================================
     GLOBAL SONG DATA
  ========================================================== */

  const [allSongs, setAllSongs] = useState([]);

  /* ==========================================================
     DISPLAYED SONGS
  ========================================================== */

  const [songs, setSongs] = useState([]);

  const [loading, setLoading] = useState(true);

  /* ==========================================================
     FILTERS
  ========================================================== */

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedPlatform, setSelectedPlatform] =
    useState('all');

  /* ==========================================================
     LIBRARY VIEW
     latest | khazana | liked
  ========================================================== */

  const [libraryView, setLibraryView] =
    useState('latest');

  /* ==========================================================
     CAPTION
  ========================================================== */

  const [captionIndex, setCaptionIndex] =
    useState(0);

  const debouncedSearch = useDebounce(
    searchTerm,
    300
  );

  /* ==========================================================
     CAPTION ROTATION
  ========================================================== */

  useEffect(() => {
    const interval = setInterval(() => {
      setCaptionIndex(
        (current) =>
          (current + 1) %
          ROMANTIC_CAPTIONS.length
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  /* ==========================================================
     FETCH ALL SONGS
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const fetchAllSongs = async () => {
      try {
        setLoading(true);

        const allFetchedSongs = [];

        const limit = 10;

        let offset = 0;

        let hasMore = true;

        while (hasMore) {
          const response = await api.get('/songs', {
            params: {
              limit,
              offset,
            },
          });

          if (cancelled) {
            return;
          }

          if (!response.data?.success) {
            console.error(
              'Songs API returned unsuccessful response:',
              response.data
            );

            break;
          }

          const pageSongs =
            response.data.songs || [];

          allFetchedSongs.push(...pageSongs);

          hasMore =
            Boolean(response.data.hasMore);

          offset += limit;

          if (pageSongs.length === 0) {
            hasMore = false;
          }
        }

        if (cancelled) {
          return;
        }

        const uniqueSongs = Array.from(
          new Map(
            allFetchedSongs.map((song) => [
              String(song.id),
              song,
            ])
          ).values()
        );

        const sortedSongs =
          uniqueSongs.sort(
            (first, second) =>
              new Date(
                second.created_at || 0
              ).getTime() -
              new Date(
                first.created_at || 0
              ).getTime()
          );

        setAllSongs(sortedSongs);
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Failed to load all songs:',
            error
          );

          setAllSongs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAllSongs();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
     LATEST 10
  ========================================================== */

  const latestTenSongs = useMemo(() => {
    return allSongs.slice(0, 10);
  }, [allSongs]);

  /* ==========================================================
     KHAZANA
  ========================================================== */

  const khazanaSongs = useMemo(() => {
    return allSongs.slice(10);
  }, [allSongs]);

  /* ==========================================================
     LIKED SONGS
  ========================================================== */

  const likedSongs = useMemo(() => {
    return allSongs.filter(
      (song) => Boolean(song.is_liked)
    );
  }, [allSongs]);

  /* ==========================================================
     GLOBAL TRENDING TOP 5
  ========================================================== */

  const popularSongs = useMemo(() => {
    return [...allSongs]
      .sort(
        (first, second) =>
          Number(
            second.likes_count || 0
          ) -
          Number(
            first.likes_count || 0
          )
      )
      .slice(0, 5);
  }, [allSongs]);

  /* ==========================================================
     DISCOVERY SONGS
  ========================================================== */

  const discoverySongs = useMemo(() => {
    if (allSongs.length <= 5) {
      return allSongs;
    }

    return [...allSongs]
      .sort(
        (first, second) =>
          Number(
            second.likes_count || 0
          ) -
          Number(
            first.likes_count || 0
          )
      )
      .slice(0, 10);
  }, [allSongs]);

  /* ==========================================================
     CURRENT LIBRARY
  ========================================================== */

  const currentLibrarySongs = useMemo(() => {
    let source;

    if (libraryView === 'latest') {
      source = latestTenSongs;
    } else if (libraryView === 'khazana') {
      source = khazanaSongs;
    } else {
      source = likedSongs;
    }

    let filtered = [...source];

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(
        (song) =>
          String(
            song.source_type || ''
          ).toLowerCase() ===
          selectedPlatform.toLowerCase()
      );
    }

    if (debouncedSearch.trim()) {
      const search =
        debouncedSearch
          .trim()
          .toLowerCase();

      filtered = filtered.filter(
        (song) =>
          String(song.title || '')
            .toLowerCase()
            .includes(search) ||
          String(song.artist || '')
            .toLowerCase()
            .includes(search)
      );
    }

    return filtered;
  }, [
    latestTenSongs,
    khazanaSongs,
    likedSongs,
    libraryView,
    selectedPlatform,
    debouncedSearch,
  ]);

  /* ==========================================================
     UPDATE DISPLAYED SONGS
  ========================================================== */

  useEffect(() => {
    setSongs(currentLibrarySongs);
  }, [currentLibrarySongs]);

  /* ==========================================================
     LIKE / UNLIKE
  ========================================================== */

  const handleLikeToggle = async (songId) => {
    try {
      const response = await api.post(
        `/likes/${songId}`
      );

      if (!response.data?.success) {
        return;
      }

      setAllSongs((previousSongs) =>
        previousSongs.map((song) => {
          if (
            String(song.id) !==
            String(songId)
          ) {
            return song;
          }

          const currentlyLiked =
            Boolean(song.is_liked);

          return {
            ...song,

            is_liked: !currentlyLiked,

            likes_count: currentlyLiked
              ? Math.max(
                  0,
                  Number(
                    song.likes_count || 0
                  ) - 1
                )
              : Number(
                  song.likes_count || 0
                ) + 1,
          };
        })
      );
    } catch (error) {
      console.error(
        'Failed to toggle like:',
        error
      );
    }
  };

  /* ==========================================================
     TOTAL LIKES
  ========================================================== */

  const totalLikes = useMemo(() => {
    return allSongs.reduce(
      (total, song) =>
        total +
        Number(
          song.likes_count || 0
        ),
      0
    );
  }, [allSongs]);

  /* ==========================================================
     LIKED SONGS COUNT
  ========================================================== */

  const likedSongsCount = useMemo(() => {
    return allSongs.filter(
      (song) =>
        Boolean(song.is_liked)
    ).length;
  }, [allSongs]);

  /* ==========================================================
     CURRENT PLATFORM LABEL
  ========================================================== */

  const currentPlatformLabel =
    PLATFORM_FILTERS.find(
      (filter) =>
        filter.id === selectedPlatform
    )?.label || 'Tracks';

  /* ==========================================================
     SEARCHING
  ========================================================== */

  const isSearching =
    searchTerm !== debouncedSearch;

  /* ==========================================================
     RESET FILTERS
  ========================================================== */

  const resetFilters = () => {
    setSearchTerm('');

    setSelectedPlatform('all');
  };

  /* ==========================================================
     LIBRARY CHANGE
  ========================================================== */

  const changeLibraryView = (view) => {
    setLibraryView(view);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* ==========================================================
     CURRENT COUNT
  ========================================================== */

  const currentLibraryCount =
    songs.length;

  /* ==========================================================
     SHOW TRENDING
  ========================================================== */

  const showPopular =
    !searchTerm.trim() &&
    selectedPlatform === 'all' &&
    libraryView !== 'liked' &&
    popularSongs.length > 0;

  /* ==========================================================
     QUICK ACCESS
  ========================================================== */

  const handleLikedClick = () => {
    setSearchTerm('');

    setSelectedPlatform('all');

    changeLibraryView('liked');
  };

  const handleLatestClick = () => {
    setSearchTerm('');

    setSelectedPlatform('all');

    changeLibraryView('latest');
  };

  const handleKhazanaClick = () => {
    setSearchTerm('');

    setSelectedPlatform('all');

    changeLibraryView('khazana');
  };

  const handleDiscoverClick = () => {
    setSearchTerm('');

    setSelectedPlatform('all');

    const element =
      document.getElementById(
        'discover-section'
      );

    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-slate-950
      "
    >
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -left-40
            -top-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-emerald-500/[0.07]
            blur-[120px]
            animate-[ambientFloat_10s_ease-in-out_infinite]
          "
        />

        <div
          className="
            absolute
            -right-40
            top-1/4
            h-[500px]
            w-[500px]
            rounded-full
            bg-cyan-500/[0.045]
            blur-[120px]
            animate-[ambientFloat_12s_ease-in-out_infinite_reverse]
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-1/3
            h-[400px]
            w-[400px]
            rounded-full
            bg-purple-500/[0.025]
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.018]
          "
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)',
            backgroundSize:
              '55px 55px',
          }}
        />
      </div>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-4
          py-5
          pb-40
          sm:px-6
          sm:py-7
          lg:px-8
        "
      >
        {/* ====================================================
            HERO
        ==================================================== */}

        <section
          className="
            group
            relative
            mb-7
            overflow-hidden
            rounded-[28px]
            border
            border-slate-800/80
            bg-gradient-to-br
            from-slate-900
            via-slate-900
            to-slate-950
            shadow-2xl
            shadow-black/20
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-32
              h-[380px]
              w-[380px]
              rounded-full
              bg-emerald-500/[0.09]
              blur-[90px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              bottom-[-180px]
              left-1/3
              h-[350px]
              w-[350px]
              rounded-full
              bg-cyan-500/[0.04]
              blur-[90px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              right-1/4
              top-1/2
              h-32
              w-32
              rounded-full
              bg-pink-500/[0.04]
              blur-3xl
            "
          />

          <div
            className="
              relative
              z-10
              p-5
              sm:p-7
              lg:p-9
            "
          >
            <div
              className="
                flex
                flex-col
                gap-8
                lg:flex-row
                lg:items-end
                lg:justify-between
              "
            >
              {/* LEFT */}

              <div className="max-w-2xl">
                <div
                  className="
                    mb-5
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span
                    className="
                      inline-flex
                      h-7
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-emerald-500/20
                      bg-emerald-500/[0.08]
                      px-3
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-emerald-400
                    "
                  >
                    <Waves className="h-3.5 w-3.5" />

                    Fackify Music
                  </span>

                  <span
                    className="
                      hidden
                      h-1
                      w-1
                      rounded-full
                      bg-slate-700
                      sm:block
                    "
                  />

                  <span
                    className="
                      hidden
                      text-[9px]
                      font-medium
                      text-slate-600
                      sm:block
                    "
                  >
                    Your personal music space
                  </span>
                </div>

                <h1
                  className="
                    text-[2.25rem]
                    font-black
                    leading-[1.04]
                    tracking-[-0.045em]
                    text-white
                    sm:text-5xl
                    lg:text-[3.7rem]
                  "
                >
                  Welcome to your

                  <span
                    className="
                      block
                      bg-gradient-to-r
                      from-emerald-400
                      via-teal-300
                      to-cyan-400
                      bg-clip-text
                      pb-1
                      text-transparent
                    "
                  >
                    music universe.
                  </span>
                </h1>

                <div
                  key={captionIndex}
                  className="
                    mt-5
                    min-h-[48px]
                    animate-[fadeCaption_0.6s_ease-out]
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-2.5
                      text-sm
                      leading-6
                      text-slate-400
                      sm:text-[15px]
                    "
                  >
                    <Heart
                      className="
                        mt-1
                        h-4
                        w-4
                        shrink-0
                        fill-pink-400/10
                        text-pink-400
                      "
                    />

                    <span>
                      {
                        ROMANTIC_CAPTIONS[
                          captionIndex
                        ]
                      }
                    </span>
                  </div>
                </div>

                <div
                  className="
                    mt-5
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-slate-800
                      bg-slate-950/60
                      px-3
                      py-1.5
                      text-[10px]
                      font-medium
                      text-slate-400
                      backdrop-blur-xl
                    "
                  >
                    <Headphones className="h-3.5 w-3.5 text-emerald-400" />

                    Personal listening
                  </div>

                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-slate-800
                      bg-slate-950/60
                      px-3
                      py-1.5
                      text-[10px]
                      font-medium
                      text-slate-400
                      backdrop-blur-xl
                    "
                  >
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />

                    Discover something new
                  </div>
                </div>
              </div>

              {/* STATS */}

              <div
                className="
                  grid
                  grid-cols-2
                  gap-2
                  sm:grid-cols-3
                  lg:min-w-[370px]
                "
              >
                <div
                  className="
                    group/stat
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-950/60
                    p-3.5
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-emerald-500/20
                    hover:bg-slate-950/80
                  "
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-emerald-500/10
                        text-emerald-400
                      "
                    >
                      <Library className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-lg font-bold text-white">
                        {allSongs.length}
                      </p>

                      <p className="text-[9px] uppercase tracking-wider text-slate-600">
                        Total tracks
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-950/60
                    p-3.5
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-rose-500/20
                    hover:bg-slate-950/80
                  "
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-rose-500/10
                        text-rose-400
                      "
                    >
                      <Heart className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-lg font-bold text-white">
                        {totalLikes}
                      </p>

                      <p className="text-[9px] uppercase tracking-wider text-slate-600">
                        Community likes
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    col-span-2
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-950/60
                    p-3.5
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-cyan-500/20
                    hover:bg-slate-950/80
                    sm:col-span-1
                  "
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-cyan-500/10
                        text-cyan-400
                      "
                    >
                      <TrendingUp className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-lg font-bold text-white">
                        {Math.min(
                          5,
                          allSongs.length
                        )}
                      </p>

                      <p className="text-[9px] uppercase tracking-wider text-slate-600">
                        Trending now
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    col-span-2
                    hidden
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-950/60
                    p-3.5
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    hover:border-pink-500/20
                    sm:block
                    sm:col-span-3
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
                        bg-pink-500/10
                        text-pink-400
                      "
                    >
                      <HeartHandshake className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">
                        Your liked tracks
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-600">
                        {likedSongsCount} tracks you've
                        connected with
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEARCH */}

            <div className="relative mt-8 max-w-3xl">
              <div className="group relative">
                <div
                  className="
                    pointer-events-none
                    absolute
                    -inset-0.5
                    rounded-2xl
                    bg-gradient-to-r
                    from-emerald-500/20
                    via-transparent
                    to-cyan-500/10
                    opacity-0
                    blur
                    transition-opacity
                    duration-300
                    group-focus-within:opacity-100
                  "
                />

                <div className="relative">
                  <Search
                    className="
                      absolute
                      left-4
                      top-1/2
                      h-5
                      w-5
                      -translate-y-1/2
                      text-slate-600
                      transition-all
                      duration-300
                      group-focus-within:scale-110
                      group-focus-within:text-emerald-400
                    "
                  />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    placeholder="Search songs, artists..."
                    aria-label="Search songs and artists"
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-slate-800
                      bg-slate-950/90
                      py-4
                      pl-12
                      pr-12
                      text-sm
                      text-white
                      outline-none
                      transition-all
                      duration-300
                      placeholder:text-slate-600
                      hover:border-slate-700
                      focus:border-emerald-500/40
                      focus:bg-slate-950
                      focus:ring-4
                      focus:ring-emerald-500/5
                    "
                  />

                  {isSearching && (
                    <Loader2
                      className="
                        absolute
                        right-4
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        animate-spin
                        text-emerald-400
                      "
                    />
                  )}

                  {!isSearching &&
                    searchTerm && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearchTerm('')
                        }
                        aria-label="Clear search"
                        className="
                          absolute
                          right-3
                          top-1/2
                          flex
                          h-8
                          w-8
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-lg
                          text-slate-500
                          transition
                          hover:bg-slate-800
                          hover:text-white
                        "
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                </div>
              </div>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-2
                  px-1
                  text-[9px]
                  text-slate-700
                "
              >
                <span className="h-1 w-1 rounded-full bg-emerald-500/60" />

                Search updates automatically
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            QUICK ACCESS
        ==================================================== */}

        <section className="mb-9">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-lg
                    bg-cyan-500/10
                  "
                >
                  <Compass className="h-3.5 w-3.5 text-cyan-400" />
                </span>

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-cyan-400
                  "
                >
                  Quick access
                </span>
              </div>

              <h2
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-white
                  sm:text-2xl
                "
              >
                Pick your vibe
              </h2>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            <QuickActionCard
              icon={Heart}
              title="Liked Songs"
              description={`${likedSongsCount} tracks you've liked`}
              accent="rose"
              active={libraryView === 'liked'}
              onClick={handleLikedClick}
            />

            <QuickActionCard
              icon={Clock3}
              title="Latest Uploads"
              description="Explore the newest tracks"
              accent="emerald"
              active={libraryView === 'latest'}
              onClick={handleLatestClick}
            />

            <QuickActionCard
              icon={Archive}
              title="Khazana"
              description={`${khazanaSongs.length} older tracks`}
              accent="cyan"
              active={libraryView === 'khazana'}
              onClick={handleKhazanaClick}
            />

            <QuickActionCard
              icon={Sparkles}
              title="Discover"
              description="Find something new"
              accent="purple"
              onClick={handleDiscoverClick}
            />
          </div>
        </section>

        {/* ====================================================
            PLATFORM FILTERS
        ==================================================== */}

        <section className="mb-9">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-lg
                  bg-slate-900
                  text-slate-500
                "
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </div>

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-slate-500
                "
              >
                Browse by platform
              </span>
            </div>

            <span
              className="
                text-[9px]
                font-medium
                text-slate-700
                sm:hidden
              "
            >
              Swipe →
            </span>
          </div>

          <div
            className="
              scrollbar-none
              flex
              gap-2
              overflow-x-auto
              pb-1
            "
          >
            {PLATFORM_FILTERS.map(
              (filter) => {
                const Icon = filter.icon;

                const isActive =
                  selectedPlatform ===
                  filter.id;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() =>
                      setSelectedPlatform(
                        filter.id
                      )
                    }
                    aria-pressed={isActive}
                    className={`
                      group
                      relative
                      flex
                      shrink-0
                      items-center
                      gap-2.5
                      overflow-hidden
                      rounded-xl
                      border
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      transition-all
                      duration-300
                      active:scale-95
                      ${
                        isActive
                          ? `
                            border-emerald-400/30
                            bg-emerald-500
                            text-slate-950
                            shadow-lg
                            shadow-emerald-500/10
                          `
                          : `
                            border-slate-800
                            bg-slate-900/70
                            text-slate-400
                            hover:border-slate-700
                            hover:bg-slate-800
                            hover:text-slate-200
                          `
                      }
                    `}
                  >
                    {isActive && (
                      <span
                        className="
                          absolute
                          inset-0
                          bg-gradient-to-r
                          from-white/10
                          to-transparent
                        "
                      />
                    )}

                    <Icon
                      className={`
                        relative
                        h-4
                        w-4
                        ${
                          isActive
                            ? 'text-slate-950'
                            : 'text-slate-500 group-hover:text-emerald-400'
                        }
                      `}
                    />

                    <span className="relative">
                      {filter.label}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* ====================================================
            TRENDING
        ==================================================== */}

        {showPopular && (
          <section className="mb-11">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className="
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center
                      rounded-lg
                      bg-orange-500/10
                    "
                  >
                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                  </span>

                  <span
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-orange-400
                    "
                  >
                    Trending now
                  </span>
                </div>

                <h2
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    text-white
                    sm:text-2xl
                  "
                >
                  Popular right now
                </h2>
              </div>

              <span
                className="
                  hidden
                  items-center
                  gap-1
                  text-[10px]
                  font-medium
                  text-slate-600
                  sm:flex
                "
              >
                Global top 5 most liked

                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                sm:gap-4
                md:grid-cols-4
                lg:grid-cols-5
              "
            >
              {popularSongs.map(
                (song, index) => (
                  <div
                    key={`popular-${song.id}`}
                    className="
                      relative
                      animate-[cardIn_0.45s_ease-out_both]
                    "
                    style={{
                      animationDelay: `${
                        index * 70
                      }ms`,
                    }}
                  >
                    <div
                      className="
                        pointer-events-none
                        absolute
                        left-2
                        top-2
                        z-20
                        flex
                        h-6
                        min-w-6
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-white/10
                        bg-slate-950/80
                        px-1.5
                        text-[9px]
                        font-black
                        text-orange-400
                        shadow-xl
                        backdrop-blur-xl
                      "
                    >
                      #{index + 1}
                    </div>

                    <SongCard
                      song={song}
                      onLikeToggle={
                        handleLikeToggle
                      }
                    />
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* ====================================================
            DISCOVER
        ==================================================== */}

        {!loading &&
          discoverySongs.length > 0 && (
            <section
              id="discover-section"
              className="mb-11 scroll-mt-6"
            >
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className="
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-lg
                        bg-purple-500/10
                      "
                    >
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    </span>

                    <span
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-purple-400
                      "
                    >
                      Discover
                    </span>
                  </div>

                  <h2
                    className="
                      text-xl
                      font-bold
                      tracking-tight
                      text-white
                      sm:text-2xl
                    "
                  >
                    You might like these
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-600">
                    A selection from Fackify's music
                    universe.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLatestClick}
                  className="
                    hidden
                    items-center
                    gap-1
                    rounded-lg
                    border
                    border-slate-800
                    bg-slate-900
                    px-3
                    py-2
                    text-[10px]
                    font-semibold
                    text-slate-500
                    transition
                    hover:border-slate-700
                    hover:text-white
                    sm:flex
                  "
                >
                  Explore library

                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  sm:grid-cols-3
                  sm:gap-4
                  md:grid-cols-4
                  lg:grid-cols-5
                "
              >
                {discoverySongs
                  .slice(0, 5)
                  .map((song, index) => (
                    <div
                      key={`discover-${song.id}`}
                      className="
                        animate-[cardIn_0.45s_ease-out_both]
                      "
                      style={{
                        animationDelay: `${
                          index * 70
                        }ms`,
                      }}
                    >
                      <SongCard
                        song={song}
                        onLikeToggle={
                          handleLikeToggle
                        }
                      />
                    </div>
                  ))}
              </div>
            </section>
          )}

        {/* ====================================================
            LIBRARY VIEW SWITCHER
        ==================================================== */}

        <section className="mb-6">
          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/70
              p-1.5
              shadow-xl
              shadow-black/10
            "
          >
            <div
              className="
                flex
                flex-col
                gap-1.5
                sm:flex-row
              "
            >
              {/* Latest */}

              <button
                type="button"
                onClick={() =>
                  changeLibraryView(
                    'latest'
                  )
                }
                className={`
                  group
                  relative
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-2.5
                  rounded-xl
                  px-4
                  py-3
                  text-xs
                  font-bold
                  transition-all
                  duration-300
                  ${
                    libraryView === 'latest'
                      ? `
                        bg-emerald-500
                        text-slate-950
                        shadow-lg
                        shadow-emerald-500/10
                      `
                      : `
                        text-slate-500
                        hover:bg-slate-800
                        hover:text-slate-200
                      `
                  }
                `}
              >
                <Clock3 className="h-4 w-4" />

                <span>
                  Latest 10
                </span>

                <span
                  className={`
                    rounded-full
                    px-2
                    py-0.5
                    text-[9px]
                    ${
                      libraryView ===
                      'latest'
                        ? 'bg-slate-950/10 text-slate-950'
                        : 'bg-slate-800 text-slate-600'
                    }
                  `}
                >
                  {Math.min(
                    10,
                    allSongs.length
                  )}
                </span>
              </button>

              {/* Khazana */}

              <button
                type="button"
                onClick={() =>
                  changeLibraryView(
                    'khazana'
                  )
                }
                className={`
                  group
                  relative
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-2.5
                  rounded-xl
                  px-4
                  py-3
                  text-xs
                  font-bold
                  transition-all
                  duration-300
                  ${
                    libraryView ===
                    'khazana'
                      ? `
                        bg-cyan-500
                        text-slate-950
                        shadow-lg
                        shadow-cyan-500/10
                      `
                      : `
                        text-slate-500
                        hover:bg-slate-800
                        hover:text-slate-200
                      `
                  }
                `}
              >
                <Archive className="h-4 w-4" />

                <span>
                  Khazana of Songs
                </span>

                <span
                  className={`
                    rounded-full
                    px-2
                    py-0.5
                    text-[9px]
                    ${
                      libraryView ===
                      'khazana'
                        ? 'bg-slate-950/10 text-slate-950'
                        : 'bg-slate-800 text-slate-600'
                    }
                  `}
                >
                  {khazanaSongs.length}
                </span>
              </button>

              {/* Liked */}

              <button
                type="button"
                onClick={() =>
                  changeLibraryView(
                    'liked'
                  )
                }
                className={`
                  group
                  relative
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-2.5
                  rounded-xl
                  px-4
                  py-3
                  text-xs
                  font-bold
                  transition-all
                  duration-300
                  ${
                    libraryView ===
                    'liked'
                      ? `
                        bg-rose-500
                        text-slate-950
                        shadow-lg
                        shadow-rose-500/10
                      `
                      : `
                        text-slate-500
                        hover:bg-slate-800
                        hover:text-slate-200
                      `
                  }
                `}
              >
                <Heart className="h-4 w-4" />

                <span>
                  Liked Songs
                </span>

                <span
                  className={`
                    rounded-full
                    px-2
                    py-0.5
                    text-[9px]
                    ${
                      libraryView ===
                      'liked'
                        ? 'bg-slate-950/10 text-slate-950'
                        : 'bg-slate-800 text-slate-600'
                    }
                  `}
                >
                  {likedSongsCount}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ====================================================
            LIBRARY DESCRIPTION
        ==================================================== */}

        <section className="mb-7">
          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              border
              border-slate-800/80
              bg-gradient-to-r
              from-slate-900
              via-slate-900/80
              to-slate-950
              px-4
              py-4
              sm:px-5
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                h-full
                w-40
                bg-gradient-to-l
                from-emerald-500/[0.04]
                to-transparent
              "
            />

            <div className="relative flex items-center gap-3">
              <div
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  ${
                    libraryView ===
                    'latest'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : libraryView ===
                        'khazana'
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }
                `}
              >
                {libraryView ===
                'latest' ? (
                  <Clock3 className="h-4 w-4" />
                ) : libraryView ===
                  'khazana' ? (
                  <Database className="h-4 w-4" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white">
                  {libraryView ===
                  'latest'
                    ? 'Latest uploads'
                    : libraryView ===
                      'khazana'
                    ? 'Khazana of Songs'
                    : 'Your Liked Songs'}
                </h3>

                <p className="mt-0.5 text-[10px] leading-5 text-slate-500">
                  {libraryView ===
                  'latest'
                    ? 'Your 10 newest uploaded tracks appear here.'
                    : libraryView ===
                      'khazana'
                    ? 'A collection of all songs older than the latest 10 uploads.'
                    : 'Every track you have liked is collected here.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            MUSIC LIBRARY
        ==================================================== */}

        <section>
          <div
            className="
              mb-5
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-lg
                    bg-emerald-500/10
                  "
                >
                  <Music2 className="h-3.5 w-3.5 text-emerald-400" />
                </span>

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-slate-600
                  "
                >
                  Music library
                </span>
              </div>

              <h2
                className="
                  truncate
                  text-xl
                  font-bold
                  tracking-tight
                  text-white
                  sm:text-2xl
                "
              >
                {searchTerm.trim()
                  ? `Results for "${searchTerm}"`
                  : libraryView ===
                      'liked'
                    ? selectedPlatform ===
                      'all'
                      ? 'Your Liked Songs'
                      : `Liked Songs • ${currentPlatformLabel}`
                    : libraryView ===
                        'latest'
                      ? selectedPlatform ===
                        'all'
                        ? 'Latest 10 tracks'
                        : `Latest 10 • ${currentPlatformLabel}`
                      : selectedPlatform ===
                          'all'
                        ? 'Khazana of Songs'
                        : `Khazana • ${currentPlatformLabel}`}
              </h2>
            </div>

            {!loading &&
              songs.length > 0 && (
                <div
                  className="
                    shrink-0
                    rounded-full
                    border
                    border-slate-800
                    bg-slate-900
                    px-3
                    py-1.5
                    text-[10px]
                    font-medium
                    text-slate-500
                  "
                >
                  {currentLibraryCount}{' '}
                  {currentLibraryCount ===
                  1
                    ? 'track'
                    : 'tracks'}
                </div>
              )}
          </div>

          {/* LOADING */}

          {loading ? (
            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                sm:gap-4
                md:grid-cols-4
                lg:grid-cols-5
              "
            >
              {Array.from({
                length: 10,
              }).map((_, index) => (
                <div
                  key={index}
                  className="
                    animate-[cardIn_0.4s_ease-out_both]
                  "
                  style={{
                    animationDelay: `${
                      index * 40
                    }ms`,
                  }}
                >
                  <SongSkeleton />
                </div>
              ))}
            </div>
          ) : songs.length === 0 ? (
            /* EMPTY STATE */

            <div
              className="
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-slate-800
                bg-slate-900/50
                px-6
                py-16
                text-center
                shadow-xl
                shadow-black/10
                sm:px-10
                sm:py-20
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-[-80px]
                  h-48
                  w-48
                  -translate-x-1/2
                  rounded-full
                  bg-emerald-500/[0.08]
                  blur-3xl
                "
              />

              <div
                className="
                  relative
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-slate-800
                  bg-slate-950
                  text-slate-600
                  shadow-2xl
                "
              >
                {searchTerm.trim() ? (
                  <Search className="h-7 w-7" />
                ) : libraryView ===
                  'khazana' ? (
                  <Archive className="h-7 w-7" />
                ) : libraryView ===
                  'liked' ? (
                  <Heart className="h-7 w-7" />
                ) : (
                  <Music2 className="h-7 w-7" />
                )}
              </div>

              <h3
                className="
                  relative
                  mt-5
                  text-base
                  font-bold
                  text-slate-200
                "
              >
                {searchTerm.trim()
                  ? 'Nothing found'
                  : libraryView ===
                    'khazana'
                  ? 'Khazana is waiting'
                  : libraryView ===
                    'liked'
                  ? 'No liked songs yet'
                  : 'No tracks available'}
              </h3>

              <p
                className="
                  relative
                  mx-auto
                  mt-2
                  max-w-md
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                {searchTerm.trim()
                  ? `We couldn't find anything matching "${searchTerm}" in this section. Try another search or switch sections.`
                  : libraryView ===
                    'khazana'
                  ? 'There are currently no songs older than the latest 10 uploads.'
                  : libraryView ===
                    'liked'
                  ? 'Like your favorite tracks and they will appear here automatically.'
                  : 'There are no tracks matching this filter right now.'}
              </p>

              {(searchTerm.trim() ||
                selectedPlatform !==
                  'all') && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    relative
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-800
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-slate-300
                    transition-all
                    hover:border-emerald-500/20
                    hover:bg-slate-700
                    hover:text-white
                    active:scale-95
                  "
                >
                  <X className="h-3.5 w-3.5" />

                  Reset filters
                </button>
              )}

              {libraryView ===
                'khazana' &&
                khazanaSongs.length ===
                  0 &&
                allSongs.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      changeLibraryView(
                        'latest'
                      )
                    }
                    className="
                      relative
                      mt-6
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-emerald-500/20
                      bg-emerald-500/10
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      text-emerald-400
                      transition-all
                      hover:bg-emerald-500/15
                      active:scale-95
                    "
                  >
                    <ArrowUp className="h-3.5 w-3.5" />

                    View latest uploads
                  </button>
                )}

              {libraryView ===
                'liked' &&
                likedSongsCount ===
                  0 &&
                allSongs.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      changeLibraryView(
                        'latest'
                      )
                    }
                    className="
                      relative
                      mt-6
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-rose-500/20
                      bg-rose-500/10
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      text-rose-400
                      transition-all
                      hover:bg-rose-500/15
                      active:scale-95
                    "
                  >
                    <Music2 className="h-3.5 w-3.5" />

                    Explore latest songs
                  </button>
                )}
            </div>
          ) : (
            /* SONG GRID */

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                sm:gap-4
                md:grid-cols-4
                lg:grid-cols-5
              "
            >
              {songs.map(
                (song, index) => (
                  <div
                    key={song.id}
                    className="
                      animate-[cardIn_0.45s_ease-out_both]
                    "
                    style={{
                      animationDelay: `${Math.min(
                        index * 35,
                        500
                      )}ms`,
                    }}
                  >
                    <SongCard
                      song={song}
                      onLikeToggle={
                        handleLikeToggle
                      }
                    />
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>

      {/* ======================================================
          ANIMATIONS
      ====================================================== */}

      <style>{`
        @keyframes fadeCaption {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardIn {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ambientFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(20px, 15px, 0);
          }
        }

        .scrollbar-none {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}