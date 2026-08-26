import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import {
  Search,
  Music2,
  Users,
  ChevronRight,
  Play,
  Pause,
  Diamond,
  Disc3,
  Sparkles,
  Headphones,
  AudioLines,
  X,
  SlidersHorizontal,
  Share2,
  Check,
  Flame,
} from 'lucide-react';

import api from '../api/axiosInstance';
import { usePlayer } from '../context/PlayerContext';

/* ============================================================
   PREMIUM ARTIST FALLBACK & STORAGE
============================================================ */

const PREMIUM_ARTIST_IDS = [
  // 'PUT-ARTIST-UUID-HERE',
];

const LOCAL_STORAGE_KEY = 'fackify_premium_artist_ids';

export default function Artists() {
  /* ==========================================================
     PLAYER
  ========================================================== */

  const {
    playSong,
    currentSong,
    isPlaying,
  } = usePlayer();

  /* ==========================================================
     STATE
  ========================================================== */

  const [artistsData, setArtistsData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playingArtistId, setPlayingArtistId] = useState(null);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState(null);

  // Additional Feature States
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('best_first');
  const [copiedArtistId, setCopiedArtistId] = useState(null);

  // Persistent local storage state
  const [storedFavoriteIds, setStoredFavoriteIds] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  /* ==========================================================
     FETCH ARTISTS
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const artistsResponse = await api.get('/artists');

        if (!mounted) {
          return;
        }

        const fetchedArtists = Array.isArray(artistsResponse.data?.artists)
          ? artistsResponse.data.artists
          : [];

        setArtistsData(fetchedArtists);
      } catch (err) {
        console.error('Failed to fetch artists:', err);

        if (!mounted) {
          return;
        }

        setError(
          err.response?.data?.message || 'Unable to load artists'
        );

        setArtistsData([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     TOGGLE FAVORITE / PREMIUM ARTIST
  ========================================================== */

  const handleToggleFavorite = async (event, artistId) => {
    event.preventDefault();
    event.stopPropagation();

    const idStr = String(artistId);
    const isCurrentlyFavorite =
      storedFavoriteIds.includes(idStr) ||
      Boolean(artistsData.find((a) => String(a.id) === idStr)?.is_favorite);

    const updatedFavoriteIds = isCurrentlyFavorite
      ? storedFavoriteIds.filter((id) => id !== idStr)
      : [...storedFavoriteIds, idStr];

    setStoredFavoriteIds(updatedFavoriteIds);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFavoriteIds));
    } catch (storageErr) {
      console.error('Failed to sync with localStorage:', storageErr);
    }

    setArtistsData((prev) =>
      prev.map((artist) => {
        if (String(artist.id) === idStr) {
          return {
            ...artist,
            is_favorite: !isCurrentlyFavorite,
            is_premium: !isCurrentlyFavorite,
          };
        }
        return artist;
      })
    );

    try {
      setTogglingFavoriteId(artistId);
      await api.post(`/artists/${artistId}/favorite`, {
        is_favorite: !isCurrentlyFavorite,
        is_premium: !isCurrentlyFavorite,
      });
    } catch (err) {
      console.error('Failed to toggle favorite artist on backend:', err);
    } finally {
      setTogglingFavoriteId(null);
    }
  };

  /* ==========================================================
     SHARE / COPY ARTIST LINK
  ========================================================== */

  const handleCopyShareLink = (event, artistId) => {
    event.preventDefault();
    event.stopPropagation();

    const shareUrl = `${window.location.origin}/artists/${artistId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedArtistId(artistId);
      setTimeout(() => setCopiedArtistId(null), 2000);
    });
  };

  /* ==========================================================
     CREATE SORTED & FILTERED ARTIST LIST
  ========================================================== */

  const artists = useMemo(() => {
    return artistsData
      .filter((artist) => artist?.id)
      .map((artist) => {
        const songCount = Number(artist.song_count) || 0;
        const idStr = String(artist.id);

        const isStored = storedFavoriteIds.includes(idStr);
        const isFavorite = Boolean(artist.is_favorite || isStored);
        const isPremium = Boolean(
          artist.is_premium ||
            isStored ||
            PREMIUM_ARTIST_IDS.some((premiumId) => String(premiumId) === idStr)
        );

        return {
          id: artist.id,
          name: artist.name || 'Unknown Artist',
          image: artist.image_url || null,
          isPremium,
          isFavorite,
          songCount,
        };
      })
      .sort((a, b) => {
        if (sortBy === 'most_songs') {
          return b.songCount - a.songCount;
        }
        if (sortBy === 'alpha_asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'alpha_desc') {
          return b.name.localeCompare(a.name);
        }
        if (a.isFavorite === b.isFavorite) {
          return a.name.localeCompare(b.name);
        }
        return a.isFavorite ? -1 : 1;
      });
  }, [artistsData, storedFavoriteIds, sortBy]);

  /* ==========================================================
     SEARCH & TAB FILTERING
  ========================================================== */

  const filteredArtists = useMemo(() => {
    const value = search.trim().toLowerCase();

    return artists.filter((artist) => {
      const matchesSearch = !value || artist.name.toLowerCase().includes(value);

      if (!matchesSearch) return false;

      if (activeFilter === 'favorites') {
        return artist.isFavorite;
      }
      if (activeFilter === 'has_songs') {
        return artist.songCount > 0;
      }

      return true;
    });
  }, [artists, search, activeFilter]);

  /* ==========================================================
     PREMIUM ARTIST CHECK
  ========================================================== */

  const isPremiumArtist = (artist) => Boolean(artist?.isPremium);

  /* ==========================================================
     PLAY ARTIST
  ========================================================== */

  const handlePlayArtist = async (event, artist) => {
    event.preventDefault();
    event.stopPropagation();

    if (artist.songCount === 0) {
      return;
    }

    try {
      setPlayingArtistId(artist.id);

      const response = await api.get(`/songs/artist/${artist.id}`);
      const artistSongs = Array.isArray(response.data?.songs)
        ? response.data.songs
        : [];

      if (artistSongs.length > 0) {
        playSong(artistSongs[0], artistSongs);
      }
    } catch (err) {
      console.error('Failed to load artist songs for playback:', err);
    } finally {
      setPlayingArtistId(null);
    }
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-[70vh] px-4 py-10 sm:px-6 lg:px-8 bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="h-5 w-36 animate-pulse rounded-full bg-slate-800" />
            <div className="mt-4 h-11 w-64 animate-pulse rounded-xl bg-slate-800" />
            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-900" />
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-5
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
            "
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="
                  rounded-[30px]
                  border
                  border-slate-800/60
                  bg-slate-900/40
                  p-5
                "
              >
                <div
                  className="
                    mx-auto
                    aspect-square
                    w-full
                    max-w-44
                    animate-pulse
                    rounded-full
                    bg-slate-800
                  "
                />
                <div
                  className="
                    mx-auto
                    mt-6
                    h-4
                    w-28
                    animate-pulse
                    rounded
                    bg-slate-800
                  "
                />
                <div
                  className="
                    mx-auto
                    mt-3
                    h-3
                    w-20
                    animate-pulse
                    rounded
                    bg-slate-900
                  "
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="min-h-[70vh] px-4 py-10 sm:px-6 lg:px-8 bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div
            className="
              rounded-[30px]
              border
              border-rose-500/20
              bg-gradient-to-br
              from-rose-500/[0.08]
              via-slate-950/60
              to-transparent
              p-10
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-rose-400/20
                bg-rose-500/10
              "
            >
              <Users className="h-7 w-7 text-rose-400" />
            </div>

            <p className="mt-5 text-sm font-bold text-rose-400">
              {error}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Please refresh the page and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <div
      className="
        relative
        min-h-[70vh]
        overflow-hidden
        bg-slate-950
        pb-24
      "
    >
      {/* ======================================================
          TOP HEADER SEAMLESS BLEND MASK
      ======================================================= */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-10
          h-28
          bg-gradient-to-b
          from-slate-950
          via-slate-950/70
          to-transparent
        "
      />

      {/* ======================================================
          PREMIUM AMBIENT LIGHTS (Pushed down slightly)
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-16
          h-[420px]
          w-[420px]
          rounded-full
          bg-emerald-500/[0.06]
          blur-[140px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-100px]
          top-28
          h-[380px]
          w-[380px]
          rounded-full
          bg-cyan-500/[0.05]
          blur-[140px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[650px]
          h-[350px]
          w-[350px]
          -translate-x-1/2
          rounded-full
          bg-violet-500/[0.03]
          blur-[130px]
        "
      />

      <div
        className="
          relative
          z-20
          mx-auto
          max-w-7xl
          px-4
          py-8
          sm:px-6
          sm:py-10
          lg:px-8
        "
      >
        {/* ====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            gap-7
            md:flex-row
            md:items-end
            md:justify-between
          "
        >
          <div>
            <div
              className="
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-400/20
                bg-gradient-to-r
                from-emerald-400/[0.10]
                to-cyan-400/[0.05]
                px-3.5
                py-1.5
                shadow-lg
                shadow-emerald-500/[0.04]
              "
            >
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.24em]
                  text-emerald-400
                "
              >
                Fackify Artists
              </span>
            </div>

            <h1
              className="
                text-3xl
                font-black
                tracking-[-0.04em]
                text-white
                sm:text-4xl
                lg:text-5xl
              "
            >
              Discover Artists
            </h1>

            <p
              className="
                mt-3
                max-w-xl
                text-sm
                leading-6
                text-slate-500
              "
            >
              Explore your favourite artists and click the diamond to set your Best Artists at the top.
            </p>
          </div>

          {/* ==================================================
              SEARCH WITH QUICK CLEAR
          =================================================== */}

          <div className="relative w-full md:w-80">
            <Search
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-600
              "
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search artists..."
              className="
                w-full
                rounded-2xl
                border
                border-slate-800/80
                bg-slate-900/60
                py-3.5
                pl-11
                pr-10
                text-sm
                font-medium
                text-white
                outline-none
                placeholder:text-slate-600
                backdrop-blur-2xl
                transition-all
                duration-300
                focus:border-emerald-400/30
                focus:bg-slate-900/90
                focus:ring-4
                focus:ring-emerald-400/[0.05]
              "
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ====================================================
            CONTROLS: FILTER TABS & SORT DROPDOWN
        ===================================================== */}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`rounded-xl px-3.5 py-1.5 text-[11px] font-bold transition-all ${
                activeFilter === 'all'
                  ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-md shadow-emerald-500/10'
                  : 'border border-slate-800/80 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              All Creators ({artists.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('favorites')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[11px] font-bold transition-all ${
                activeFilter === 'favorites'
                  ? 'border border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'border border-slate-800/80 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Diamond className="h-3 w-3 fill-amber-300 text-amber-300" />
              VIP Best Artists ({artists.filter((a) => a.isFavorite).length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('has_songs')}
              className={`rounded-xl px-3.5 py-1.5 text-[11px] font-bold transition-all ${
                activeFilter === 'has_songs'
                  ? 'border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 shadow-md shadow-cyan-500/10'
                  : 'border border-slate-800/80 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              With Tracks ({artists.filter((a) => a.songCount > 0).length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-slate-300 outline-none backdrop-blur-md transition focus:border-emerald-400/40"
            >
              <option value="best_first">Sort: VIP & Best First</option>
              <option value="most_songs">Sort: Most Tracks</option>
              <option value="alpha_asc">Sort: Name (A-Z)</option>
              <option value="alpha_desc">Sort: Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* ====================================================
            STATS & ACTIVE SEARCH INDICATION
        ===================================================== */}

        <div
          className="
            mt-6
            flex
            flex-wrap
            items-center
            gap-3
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-slate-800/80
              bg-slate-900/60
              px-3.5
              py-1.5
              shadow-lg
              shadow-black/10
              backdrop-blur-xl
            "
          >
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span
              className="
                text-[10px]
                font-bold
                text-slate-400
              "
            >
              {filteredArtists.length}{' '}
              {filteredArtists.length === 1
                ? 'Artist displayed'
                : 'Artists displayed'}
            </span>
          </div>

          {search && (
            <div
              className="
                rounded-full
                border
                border-cyan-400/10
                bg-cyan-400/[0.05]
                px-3.5
                py-1.5
                text-[10px]
                font-semibold
                text-cyan-400
              "
            >
              Results for "{search}"
            </div>
          )}
        </div>

        {/* ====================================================
            ARTIST GRID
        ===================================================== */}

        {filteredArtists.length > 0 ? (
          <div
            className="
              mt-8
              grid
              grid-cols-2
              gap-4
              sm:grid-cols-3
              sm:gap-5
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
            "
          >
            {filteredArtists.map((artist) => {
              const premium = isPremiumArtist(artist);
              const isCurrentArtist =
                String(currentSong?.artist_id) === String(artist.id) ||
                (Array.isArray(currentSong?.artists) &&
                  currentSong.artists.some((a) => String(a.id) === String(artist.id)));

              const isCurrentArtistPlaying = isCurrentArtist && isPlaying;

              return (
                <Link
                  key={String(artist.id)}
                  to={`/artists/${artist.id}`}
                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-[30px]
                    border
                    bg-gradient-to-b
                    from-slate-900/90
                    via-slate-900/75
                    to-slate-950/90
                    p-4
                    shadow-xl
                    shadow-black/20
                    backdrop-blur-2xl
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:shadow-2xl
                    sm:p-5
                    ${
                      artist.isFavorite
                        ? 'border-amber-400/30 hover:border-amber-400/50 hover:shadow-amber-500/[0.10]'
                        : premium
                          ? 'border-cyan-400/20 hover:border-cyan-300/35 hover:shadow-cyan-500/[0.08]'
                          : 'border-slate-800/70 hover:border-emerald-400/20 hover:shadow-emerald-500/[0.08]'
                    }
                  `}
                >
                  {/* Top Shine */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-x-0
                      top-0
                      h-px
                      bg-gradient-to-r
                      from-transparent
                      via-white/20
                      to-transparent
                      opacity-50
                    "
                  />

                  {/* Hover Glow */}
                  <div
                    className={`
                      pointer-events-none
                      absolute
                      -right-16
                      -top-16
                      h-40
                      w-40
                      rounded-full
                      blur-[70px]
                      opacity-0
                      transition-all
                      duration-700
                      group-hover:opacity-100
                      ${
                        artist.isFavorite
                          ? 'bg-amber-400/20'
                          : premium
                            ? 'bg-cyan-400/20'
                            : 'bg-emerald-400/15'
                      }
                    `}
                  />

                  <div
                    className="
                      pointer-events-none
                      absolute
                      -bottom-20
                      -left-10
                      h-36
                      w-36
                      rounded-full
                      bg-violet-500/[0.08]
                      blur-[70px]
                      opacity-0
                      transition-opacity
                      duration-700
                      group-hover:opacity-100
                    "
                  />

                  {/* Quick Action Buttons */}
                  <div className="absolute right-2 top-2 z-20 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(event) => handleCopyShareLink(event, artist.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-950/80 text-slate-400 backdrop-blur-md opacity-0 transition-all duration-300 hover:border-emerald-400/40 hover:text-emerald-400 group-hover:opacity-100"
                      title="Copy artist link"
                    >
                      {copiedArtistId === artist.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(event) => handleToggleFavorite(event, artist.id)}
                      disabled={togglingFavoriteId === artist.id}
                      className={`
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        border
                        backdrop-blur-xl
                        transition-all
                        duration-300
                        hover:scale-110
                        active:scale-90
                        disabled:opacity-50
                        ${
                          artist.isFavorite
                            ? 'border-amber-300/50 bg-amber-400/20 text-amber-300 shadow-xl shadow-amber-500/20'
                            : 'border-slate-700/60 bg-slate-950/80 text-slate-500 hover:border-amber-300/40 hover:text-amber-300'
                        }
                      `}
                      title={
                        artist.isFavorite
                          ? 'Remove from Best & Premium Artists'
                          : 'Set as Best & Premium Artist'
                      }
                    >
                      <Diamond
                        className={`
                          h-3.5
                          w-3.5
                          transition-transform
                          ${artist.isFavorite ? 'fill-amber-300 scale-105' : 'fill-transparent'}
                        `}
                      />
                    </button>
                  </div>

                  {/* Image & Action Controls */}
                  <div className="relative mx-auto w-full max-w-48 pt-1">
                    {/* Vinyl Disc Behind Avatar */}
                    <div
                      className={`pointer-events-none absolute inset-0 m-auto aspect-square w-36 rounded-full border border-slate-700/40 bg-gradient-to-tr from-slate-950 via-slate-800 to-slate-950 transition-all duration-700 ${
                        isCurrentArtistPlaying
                          ? 'translate-x-5 rotate-[360deg] animate-[spin_5s_linear_infinite] opacity-90'
                          : 'opacity-0 group-hover:translate-x-4 group-hover:opacity-75'
                      }`}
                    >
                      <div className="absolute inset-2 rounded-full border border-slate-700/20" />
                      <div className="absolute inset-5 rounded-full border border-slate-700/20" />
                    </div>

                    {/* Image Glow */}
                    <div
                      className={`
                        pointer-events-none
                        absolute
                        inset-5
                        rounded-full
                        blur-3xl
                        transition-all
                        duration-700
                        ${
                          isCurrentArtistPlaying
                            ? 'bg-emerald-400/25 opacity-100 scale-110'
                            : artist.isFavorite
                              ? 'bg-amber-400/15 opacity-70 group-hover:opacity-100 group-hover:scale-110'
                              : premium
                                ? 'bg-cyan-400/10 opacity-60 group-hover:opacity-100 group-hover:scale-110'
                                : 'bg-emerald-400/10 opacity-0 group-hover:opacity-100 group-hover:scale-110'
                        }
                      `}
                    />

                    {/* Outer Ring */}
                    <div
                      className={`
                        relative
                        aspect-square
                        rounded-full
                        p-[3px]
                        transition-all
                        duration-700
                        ${
                          artist.isFavorite
                            ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 shadow-lg shadow-amber-500/25'
                            : isCurrentArtistPlaying
                              ? 'bg-gradient-to-br from-emerald-300 via-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/30'
                              : premium
                                ? 'bg-gradient-to-br from-cyan-300/60 via-cyan-400/20 to-violet-400/40 group-hover:from-cyan-300 group-hover:via-cyan-400/50 group-hover:to-violet-400'
                                : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-700 group-hover:from-emerald-400/60 group-hover:via-emerald-400/20 group-hover:to-cyan-400/50'
                        }
                      `}
                    >
                      <div
                        className="
                          relative
                          h-full
                          w-full
                          overflow-hidden
                          rounded-full
                          border
                          border-black/40
                          bg-slate-950
                          shadow-2xl
                        "
                      >
                        {artist.image ? (
                          <img
                            src={artist.image}
                            alt={artist.name}
                            className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-700
                              group-hover:scale-110
                            "
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className="
                              flex
                              h-full
                              w-full
                              items-center
                              justify-center
                              bg-gradient-to-br
                              from-emerald-500/20
                              via-slate-900
                              to-cyan-500/10
                            "
                          >
                            <Music2 className="h-14 w-14 text-emerald-400 transition-transform duration-700 group-hover:scale-110" />
                          </div>
                        )}

                        <div
                          className="
                            pointer-events-none
                            absolute
                            inset-0
                            rounded-full
                            bg-gradient-to-t
                            from-black/40
                            via-transparent
                            to-white/[0.08]
                          "
                        />
                      </div>
                    </div>

                    {/* Play Button */}
                    <button
                      type="button"
                      onClick={(event) => handlePlayArtist(event, artist)}
                      disabled={artist.songCount === 0 || playingArtistId === artist.id}
                      className={`
                        absolute
                        bottom-1
                        right-1
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/20
                        text-slate-950
                        shadow-2xl
                        backdrop-blur-xl
                        transition-all
                        duration-300
                        hover:scale-110
                        active:scale-95
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                        ${
                          isCurrentArtistPlaying
                            ? 'bg-white shadow-white/20'
                            : 'bg-emerald-400 shadow-emerald-500/30 hover:bg-emerald-300'
                        }
                      `}
                      title={
                        artist.songCount === 0
                          ? 'No songs available'
                          : isCurrentArtistPlaying
                            ? `Playing ${artist.name}`
                            : `Play ${artist.name}`
                      }
                    >
                      {isCurrentArtistPlaying ? (
                        <Pause className="h-4 w-4 fill-current" />
                      ) : (
                        <Play className="ml-0.5 h-4 w-4 fill-current" />
                      )}
                    </button>

                    {/* Playing Equalizer Indicator */}
                    {isCurrentArtistPlaying && (
                      <div
                        className="
                          absolute
                          bottom-0
                          left-1
                          flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          border-emerald-400/20
                          bg-slate-950/90
                          px-2.5
                          py-1.5
                          shadow-xl
                          shadow-emerald-500/10
                          backdrop-blur-xl
                        "
                      >
                        <div className="flex h-3 items-end gap-[2px]">
                          <span className="h-1 w-[2px] animate-pulse rounded-full bg-emerald-400" />
                          <span className="h-2.5 w-[2px] animate-pulse rounded-full bg-emerald-400" />
                          <span className="h-1.5 w-[2px] animate-pulse rounded-full bg-emerald-400" />
                          <span className="h-2 w-[2px] animate-pulse rounded-full bg-emerald-400" />
                        </div>
                        <span
                          className="
                            text-[7px]
                            font-black
                            uppercase
                            tracking-[0.15em]
                            text-emerald-400
                          "
                        >
                          Playing
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Artist Information */}
                  <div className="relative mt-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <h2
                        className="
                          max-w-[85%]
                          truncate
                          text-sm
                          font-black
                          tracking-tight
                          text-white
                          transition-colors
                          duration-300
                          group-hover:text-emerald-400
                        "
                      >
                        {artist.name}
                      </h2>
                    </div>

                    <div className="mt-2.5 flex items-center justify-center gap-1.5">
                      <Disc3 className="h-3 w-3 text-slate-600" />
                      <p className="text-[10px] font-semibold text-slate-600">
                        {artist.songCount}{' '}
                        {artist.songCount === 1 ? 'song' : 'songs'}
                      </p>
                    </div>

                    {artist.isFavorite && (
                      <div
                        className="
                          mt-3
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          border-amber-400/20
                          bg-amber-400/10
                          px-2.5
                          py-1
                        "
                      >
                        <Flame className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                        <span
                          className="
                            text-[7px]
                            font-black
                            uppercase
                            tracking-[0.16em]
                            text-amber-300
                          "
                        >
                          Best Artist
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Playing Song Banner */}
                  {isCurrentArtist && (
                    <div
                      className="
                        mt-4
                        rounded-2xl
                        border
                        border-emerald-400/10
                        bg-emerald-400/[0.04]
                        px-3
                        py-2
                        text-center
                      "
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <AudioLines className="h-3 w-3 text-emerald-400" />
                        <span
                          className="
                            max-w-[85%]
                            truncate
                            text-[8px]
                            font-bold
                            text-emerald-400
                          "
                        >
                          {isPlaying
                            ? `Playing ${currentSong?.title || 'music'}`
                            : 'Paused'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Explore Button */}
                  <div
                    className="
                      relative
                      mt-4
                      flex
                      items-center
                      justify-center
                      gap-1.5
                      rounded-xl
                      border
                      border-transparent
                      py-2
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.18em]
                      text-slate-600
                      transition-all
                      duration-300
                      group-hover:border-emerald-400/10
                      group-hover:bg-emerald-400/[0.04]
                      group-hover:text-emerald-400
                    "
                  >
                    Explore Artist
                    <ChevronRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>

                  {/* Active Bottom Line */}
                  <div
                    className={`
                      absolute
                      bottom-0
                      left-1/2
                      h-[2px]
                      -translate-x-1/2
                      rounded-full
                      bg-gradient-to-r
                      from-emerald-400
                      via-cyan-400
                      to-violet-400
                      transition-all
                      duration-500
                      ${
                        isCurrentArtistPlaying
                          ? 'w-20 opacity-100'
                          : 'w-0 opacity-0 group-hover:w-12 group-hover:opacity-100'
                      }
                    `}
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div
            className="
              mt-10
              rounded-[30px]
              border
              border-slate-800/70
              bg-gradient-to-br
              from-slate-900/70
              via-slate-950/70
              to-slate-950/50
              px-6
              py-20
              text-center
              shadow-2xl
              shadow-black/20
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
                shadow-xl
              "
            >
              <Headphones className="h-7 w-7 text-slate-600" />
            </div>

            <h2 className="mt-6 text-base font-black text-white">
              No artists found
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-600">
              {search || activeFilter !== 'all'
                ? 'Try adjusting your search keywords or filter settings.'
                : 'No artists have been added to Fackify yet.'}
            </p>

            {(search || activeFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveFilter('all');
                }}
                className="
                  mt-6
                  rounded-xl
                  border
                  border-emerald-400/20
                  bg-emerald-400/10
                  px-4
                  py-2.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-emerald-400
                  transition
                  hover:bg-emerald-400/15
                "
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}