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
} from 'lucide-react';

const PLATFORM_FILTERS = [
  { id: 'all', label: 'All Tracks', icon: Sparkles },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'spotify', label: 'Spotify', icon: Disc3 },
  { id: 'direct', label: 'Direct Audio', icon: Radio },
];

const ROMANTIC_CAPTIONS = [
  'Some songs sound better when you\'re in love. ❤️',
  'Every love story deserves its own soundtrack. 💕',
  'Maybe this is the song you were waiting for. ✨',
  'Late nights, soft music, beautiful memories. 🌙',
  'Press play and let the feelings begin. 🎧',
  'For every heartbeat, there\'s a song. ❤️',
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

export default function Dashboard() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  // Romantic hero caption
  const [captionIndex, setCaptionIndex] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 300);

  /*
   * ============================================================
   * ROMANTIC CAPTION ROTATION
   * Changes automatically every 3 seconds.
   * UI-only — does not affect music/player functionality.
   * ============================================================
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCaptionIndex((current) => {
        return (current + 1) % ROMANTIC_CAPTIONS.length;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /*
   * ============================================================
   * FETCH SONGS
   * ============================================================
   */
  const fetchSongs = async () => {
    try {
      setLoading(true);

      const params = {};

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (selectedPlatform !== 'all') {
        params.platform = selectedPlatform;
      }

      const res = await api.get('/songs', { params });

      if (res.data?.success) {
        setSongs(res.data.songs || []);
      }
    } catch (err) {
      console.error('Failed to load songs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [debouncedSearch, selectedPlatform]);

  /*
   * ============================================================
   * LIKE / UNLIKE
   * ============================================================
   */
  const handleLikeToggle = async (songId) => {
    try {
      const res = await api.post(`/likes/${songId}`);

      if (res.data?.success) {
        setSongs((prev) =>
          prev.map((s) =>
            s.id === songId
              ? {
                  ...s,
                  is_liked: !s.is_liked,
                  likes_count: s.is_liked
                    ? Math.max(0, (s.likes_count || 1) - 1)
                    : (s.likes_count || 0) + 1,
                }
              : s
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  /*
   * ============================================================
   * POPULAR SONGS
   * UI-only derived information.
   * ============================================================
   */
  const popularSongs = useMemo(() => {
    return [...songs]
      .sort(
        (a, b) =>
          (b.likes_count || 0) -
          (a.likes_count || 0)
      )
      .slice(0, 5);
  }, [songs]);

  const showPopular =
    !searchTerm &&
    selectedPlatform === 'all' &&
    popularSongs.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* ========================================================
          BACKGROUND ATMOSPHERE
      ======================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute top-72 -right-40 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />

        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 pb-36 sm:px-6 lg:px-8">

        {/* ========================================================
            HERO
        ======================================================== */}

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl shadow-black/20 sm:p-8">

          {/* Hero glow */}

          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-pink-500/5 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

            {/* Hero content */}

            <div className="max-w-2xl">

              {/* Badge */}

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">

                <Waves className="h-3.5 w-3.5" />

                Fackify Music

              </div>

              {/* Main heading */}

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">

                Discover your

                <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  next favorite song.
                </span>

              </h1>

              {/* ==================================================
                  ROMANTIC CAPTION
              ================================================== */}

              <div
                key={captionIndex}
                className="mt-4 min-h-[48px] max-w-xl animate-[fadeCaption_0.7s_ease-in-out] text-sm leading-6 text-slate-300 sm:text-base"
              >
                <div className="flex items-start gap-2">

                  <Heart className="mt-1 h-4 w-4 shrink-0 text-pink-400 fill-pink-400/20" />

                  <span>
                    {ROMANTIC_CAPTIONS[captionIndex]}
                  </span>

                </div>
              </div>

            </div>

            {/* ==================================================
                STATS CARD
            ================================================== */}

            <div className="hidden min-w-[180px] rounded-2xl border border-slate-800 bg-slate-950/60 p-4 backdrop-blur-md lg:block">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">

                  <Library className="h-5 w-5" />

                </div>

                <div>

                  <p className="text-2xl font-bold text-white">
                    {songs.length}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Tracks available
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              SEARCH
          ================================================== */}

          <div className="relative z-10 mt-7 max-w-2xl">

            <div className="group relative">

              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition group-focus-within:text-emerald-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search songs, artists..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 py-4 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:ring-4 focus:ring-emerald-500/5"
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

            </div>

          </div>

        </section>

        {/* ========================================================
            FILTERS
        ======================================================== */}

        <section className="mb-8">

          <div className="mb-3 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <SlidersHorizontal className="h-4 w-4 text-slate-500" />

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Browse by platform
              </span>

            </div>

          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">

            {PLATFORM_FILTERS.map((filter) => {

              const Icon = filter.icon;

              const isActive =
                selectedPlatform === filter.id;

              return (
                <button
                  key={filter.id}
                  onClick={() =>
                    setSelectedPlatform(filter.id)
                  }
                  type="button"
                  className={`group flex shrink-0 items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'border-emerald-400/30 bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >

                  <Icon
                    className={`h-4 w-4 ${
                      isActive
                        ? 'text-slate-950'
                        : 'text-slate-500 group-hover:text-emerald-400'
                    }`}
                  />

                  {filter.label}

                </button>
              );

            })}

          </div>

        </section>

        {/* ========================================================
            TRENDING
        ======================================================== */}

        {showPopular && (

          <section className="mb-10">

            <div className="mb-4 flex items-end justify-between">

              <div>

                <div className="mb-1 flex items-center gap-2">

                  <TrendingUp className="h-4 w-4 text-emerald-400" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                    Trending
                  </span>

                </div>

                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Popular right now
                </h2>

              </div>

              <span className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">

                Most liked tracks

                <ChevronRight className="h-3.5 w-3.5" />

              </span>

            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

              {popularSongs.map((song) => (

                <SongCard
                  key={`popular-${song.id}`}
                  song={song}
                  songList={songs}
                  onLikeToggle={handleLikeToggle}
                />

              ))}

            </div>

          </section>

        )}

        {/* ========================================================
            MAIN MUSIC LIBRARY
        ======================================================== */}

        <section>

          <div className="mb-5 flex items-end justify-between">

            <div>

              <div className="mb-1 flex items-center gap-2">

                <Music2 className="h-4 w-4 text-emerald-400" />

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Music library
                </span>

              </div>

              <h2 className="text-xl font-bold text-white sm:text-2xl">

                {searchTerm
                  ? `Results for "${searchTerm}"`
                  : selectedPlatform === 'all'
                    ? 'All tracks'
                    : `${
                        PLATFORM_FILTERS.find(
                          (item) =>
                            item.id === selectedPlatform
                        )?.label || 'Tracks'
                      }`}

              </h2>

            </div>

            {!loading && songs.length > 0 && (

              <div className="hidden rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-500 sm:block">

                {songs.length}{' '}
                {songs.length === 1
                  ? 'track'
                  : 'tracks'}

              </div>

            )}

          </div>

          {/* ====================================================
              LOADING
          ==================================================== */}

          {loading ? (

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

              {[...Array(10)].map((_, i) => (

                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-3.5"
                >

                  <div className="aspect-square animate-pulse rounded-xl bg-slate-800" />

                  <div className="mt-4 space-y-2">

                    <div className="h-3 w-3/4 animate-pulse rounded bg-slate-800" />

                    <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-800" />

                  </div>

                </div>

              ))}

            </div>

          ) : songs.length === 0 ? (

            /* ==================================================
               EMPTY STATE
            ================================================== */

            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center sm:p-20">

              <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-600 shadow-xl">

                <Music2 className="h-7 w-7" />

              </div>

              <h3 className="relative mt-5 text-base font-bold text-slate-200">
                No tracks found
              </h3>

              <p className="relative mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">

                {searchTerm
                  ? `We couldn't find anything matching "${searchTerm}". Try another search.`
                  : 'There are no tracks matching this filter right now.'}

              </p>

              {(searchTerm ||
                selectedPlatform !== 'all') && (

                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedPlatform('all');
                  }}
                  type="button"
                  className="relative mt-5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  Reset filters
                </button>

              )}

            </div>

          ) : (

            /* ==================================================
               SONG GRID
            ================================================== */

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

              {songs.map((song) => (

                <SongCard
                  key={song.id}
                  song={song}
                  songList={songs}
                  onLikeToggle={handleLikeToggle}
                />

              ))}

            </div>

          )}

        </section>

      </div>

      {/* ========================================================
          CAPTION ANIMATION
          ======================================================== */}

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
      `}</style>

    </div>
  );
}