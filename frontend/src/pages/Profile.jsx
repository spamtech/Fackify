import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  Mail,
  Heart,
  ListMusic,
  Calendar,
  Sparkles,
  Share2,
  Check,
  Edit3,
  Palette,
  Save,
  X,
  Music2,
  Clock,
  Crown,
  Play,
  Pause,
  ChevronRight,
  Lock,
  Globe,
  Settings,
  KeyRound,
  Bell,
  LogOut,
  Disc3,
  Flame,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import api from '../api/axiosInstance';

/* ============================================================
   PRESET THEMES & BANNER GRADIENTS
============================================================ */
const GLOW_PRESETS = [
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.35)',
    border: 'border-emerald-500/40',
    badge: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400',
    ring: 'from-emerald-400 via-teal-500 to-cyan-500',
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    primary: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.35)',
    border: 'border-cyan-500/40',
    badge: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400',
    ring: 'from-cyan-400 via-sky-500 to-blue-600',
  },
  {
    id: 'purple',
    name: 'Neon Purple',
    primary: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.35)',
    border: 'border-purple-500/40',
    badge: 'border-purple-400/30 bg-purple-400/10 text-purple-400',
    ring: 'from-purple-400 via-fuchsia-500 to-pink-500',
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    primary: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.35)',
    border: 'border-amber-500/40',
    badge: 'border-amber-400/30 bg-amber-400/10 text-amber-400',
    ring: 'from-amber-400 via-orange-500 to-rose-500',
  },
];

const BANNER_PRESETS = [
  {
    id: 'aurora',
    name: 'Aurora',
    gradient: 'from-emerald-950/70 via-slate-950 to-cyan-950/60',
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    gradient: 'from-purple-950/80 via-slate-950 to-rose-950/70',
  },
  {
    id: 'solar',
    name: 'Solar Flare',
    gradient: 'from-amber-950/80 via-slate-950 to-rose-950/70',
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    gradient: 'from-blue-950/80 via-slate-950 to-slate-900',
  },
];

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80';

const ARTIST_STORAGE_KEY = 'fackify_premium_artist_ids';

const formatListeningTime = (totalSeconds = 0) => {
  const seconds = Number(totalSeconds) || 0;
  if (seconds <= 0) return '0s';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs > 0 ? `${secs}s` : ''}`.trim();
  }
  return `${secs}s`;
};

export default function Profile() {
  const auth = useAuth() || {};
  const user = auth.user || null;
  const logout = auth.logout || (() => {});

  const { playSong, currentSong, isPlaying } = usePlayer();

  const [copied, setCopied] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || '');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [favTab, setFavTab] = useState('artists');

  const [likedSongs, setLikedSongs] = useState([]);
  const [allCatalogSongs, setAllCatalogSongs] = useState([]);
  const [premiumArtists, setPremiumArtists] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [catalogCount, setCatalogCount] = useState(0);
  const [listeningSeconds, setListeningSeconds] = useState(0);

  const [selectedGlow, setSelectedGlow] = useState(() => {
    return localStorage.getItem('profile_glow') || 'emerald';
  });
  const [selectedBanner, setSelectedBanner] = useState(() => {
    return localStorage.getItem('profile_banner') || 'aurora';
  });

  const activeGlow = useMemo(() => {
    return GLOW_PRESETS.find((g) => g.id === selectedGlow) || GLOW_PRESETS[0];
  }, [selectedGlow]);

  const activeBanner = useMemo(() => {
    return (
      BANNER_PRESETS.find((b) => b.id === selectedBanner) || BANNER_PRESETS[0]
    );
  }, [selectedBanner]);

  useEffect(() => {
    if (user?.bio !== undefined) {
      setBioText(user.bio || '');
    }
  }, [user]);

  const getPlaylistCover = (playlist) => {
    if (playlist?.cover_url) return playlist.cover_url;
    if (playlist?.thumbnail_url) return playlist.thumbnail_url;
    if (playlist?.songs && Array.isArray(playlist.songs) && playlist.songs.length > 0) {
      return playlist.songs[0]?.thumbnail_url || DEFAULT_COVER;
    }
    return DEFAULT_COVER;
  };

  // ============================================================
  // LOAD LIVE PROFILE DATA FROM BACKEND
  // ============================================================
  const fetchProfileData = useCallback(async () => {
    try {
      setDataLoading(true);

      const [summaryRes, profileRes, likesRes, playlistsRes, allSongsRes, artistsRes] =
        await Promise.allSettled([
          api.get('/users/profile/summary'),
          api.get('/users/profile'),
          api.get('/songs/liked').catch(() => api.get('/likes')),
          api.get('/playlists').catch(() => api.get('/playlists/my-playlists')),
          api.get('/songs'),
          api.get('/artists').catch(() => api.get('/artists/premium')),
        ]);

      // 1. EXTRACT REAL LISTENING TIME FROM DATABASE
      let dbSeconds = 0;

      if (summaryRes.status === 'fulfilled') {
        const sData = summaryRes.value?.data?.data || summaryRes.value?.data;
        if (sData?.stats?.totalListeningSeconds !== undefined) {
          dbSeconds = Number(sData.stats.totalListeningSeconds);
        } else if (sData?.user?.total_listening_seconds !== undefined) {
          dbSeconds = Number(sData.user.total_listening_seconds);
        }
      }

      if (!dbSeconds && profileRes.status === 'fulfilled') {
        const pData = profileRes.value?.data?.profile || profileRes.value?.data?.user || profileRes.value?.data;
        if (pData?.total_listening_seconds !== undefined) {
          dbSeconds = Number(pData.total_listening_seconds);
        }
      }

      setListeningSeconds(dbSeconds);

      // 2. EXTRACT TOTAL CATALOG COUNT
      let catalog = [];
      let totalSongsCount = 0;

      if (allSongsRes.status === 'fulfilled') {
        const sData = allSongsRes.value?.data;
        catalog = Array.isArray(sData)
          ? sData
          : Array.isArray(sData?.songs)
          ? sData.songs
          : Array.isArray(sData?.data)
          ? sData.data
          : [];

        totalSongsCount =
          sData?.totalSongs ||
          sData?.totalCount ||
          sData?.total ||
          sData?.count ||
          catalog.length;

        setAllCatalogSongs(catalog);
        setCatalogCount(totalSongsCount);
      }

      if (!totalSongsCount && summaryRes.status === 'fulfilled') {
        const sData = summaryRes.value?.data?.data || summaryRes.value?.data;
        if (sData?.stats?.totalCatalogSongs) {
          setCatalogCount(Number(sData.stats.totalCatalogSongs));
        }
      }

      // 3. LIKED SONGS
      let fetchedLiked = [];
      if (likesRes.status === 'fulfilled') {
        const lData = likesRes.value?.data;
        const songs =
          lData?.songs ||
          lData?.likedSongs ||
          lData?.rows ||
          lData?.data ||
          (Array.isArray(lData) ? lData : []);
        fetchedLiked = Array.isArray(songs) ? songs : [];
      } else if (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.data?.likedSongs) {
        fetchedLiked = summaryRes.value.data.data.likedSongs;
      }
      setLikedSongs(fetchedLiked);

      // 4. PLAYLISTS
      let fetchedPlaylists = [];
      const currentUserId = user?.id || user?._id;
      if (playlistsRes.status === 'fulfilled') {
        const pData = playlistsRes.value?.data;
        const list =
          pData?.playlists ||
          pData?.rows ||
          pData?.data ||
          (Array.isArray(pData) ? pData : []);

        fetchedPlaylists = Array.isArray(list)
          ? list.filter((p) => {
              const owner = p.user_id || p.userId || p.user?._id || p.user;
              return !owner || !currentUserId || String(owner) === String(currentUserId);
            })
          : [];
      } else if (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.data?.playlists) {
        fetchedPlaylists = summaryRes.value.data.data.playlists;
      }
      setUserPlaylists(fetchedPlaylists);

      // 5. RECENTLY PLAYED
      if (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.data?.recentlyPlayed?.length > 0) {
        setRecentlyPlayed(summaryRes.value.data.data.recentlyPlayed);
      } else if (catalog.length > 0) {
        setRecentlyPlayed(catalog.slice(0, 5));
      }

      // 6. PREMIUM ARTISTS
      let storedPremiumArtistIds = [];
      try {
        const rawStored =
          localStorage.getItem(ARTIST_STORAGE_KEY) ||
          localStorage.getItem('premium_artists') ||
          localStorage.getItem('fackify_premium_artists');
        storedPremiumArtistIds = rawStored ? JSON.parse(rawStored) : [];
      } catch {
        storedPremiumArtistIds = [];
      }

      let rawArtists = [];
      if (artistsRes.status === 'fulfilled') {
        const aData = artistsRes.value?.data;
        rawArtists =
          aData?.artists ||
          aData?.rows ||
          aData?.data ||
          (Array.isArray(aData) ? aData : []);
      } else if (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.data?.favoriteArtists) {
        rawArtists = summaryRes.value.data.data.favoriteArtists;
      }

      let finalPremiumArtists = rawArtists.filter((art) => {
        const idMatch = storedPremiumArtistIds.some(
          (id) => String(id) === String(art.id || art._id)
        );
        return idMatch || art.is_premium || art.is_favorite || art.isPremium;
      });

      if (finalPremiumArtists.length === 0 && (storedPremiumArtistIds.length > 0 || catalog.length > 0)) {
        const artistMap = {};
        [...catalog, ...fetchedLiked].forEach((s) => {
          const aName = s.artist || s.artists?.join(', ');
          if (aName) {
            const matchedId =
              s.artist_id || s.artistId || String(aName).toLowerCase().replace(/\s+/g, '-');
            const isMarkedInStorage =
              storedPremiumArtistIds.includes(String(matchedId)) ||
              storedPremiumArtistIds.includes(String(aName));

            if (isMarkedInStorage || s.is_premium || s.isPremium) {
              if (!artistMap[aName]) {
                artistMap[aName] = {
                  id: matchedId,
                  name: aName,
                  image_url:
                    s.artist_image ||
                    s.artist_avatar ||
                    s.thumbnail_url ||
                    s.thumbnailUrl ||
                    DEFAULT_COVER,
                  is_premium: true,
                };
              }
            }
          }
        });
        finalPremiumArtists = Object.values(artistMap);
      }

      if (finalPremiumArtists.length === 0 && fetchedLiked.length > 0) {
        const artistMap = {};
        fetchedLiked.forEach((s) => {
          const aName = s.artist || s.artists?.join(', ');
          if (aName && !artistMap[aName]) {
            artistMap[aName] = {
              id: s.artist_id || s.artist || aName,
              name: aName,
              image_url: s.thumbnail_url || s.thumbnailUrl || DEFAULT_COVER,
              is_premium: true,
            };
          }
        });
        finalPremiumArtists = Object.values(artistMap).slice(0, 6);
      }

      setPremiumArtists(finalPremiumArtists);
    } catch (err) {
      console.warn('Failed to load profile details:', err?.message);
    } finally {
      setDataLoading(false);
    }
  }, [user?.id, user?._id]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Live counter progression while actively listening on the profile page
  useEffect(() => {
    let refreshTimer = null;
    if (isPlaying) {
      refreshTimer = setInterval(() => {
        setListeningSeconds((prev) => prev + 5);
      }, 5000);
    }
    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [isPlaying]);

  const joinedDate = useMemo(() => {
    if (!user?.createdAt && !user?.created_at) return 'Member since 2024';
    const date = new Date(user.createdAt || user.created_at);
    if (Number.isNaN(date.getTime())) return 'Member';
    return `Member since ${date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })}`;
  }, [user]);

  const userInitials = useMemo(() => {
    if (!user?.username) return 'U';
    const parts = user.username.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  }, [user]);

  const handlePlaySong = (song, songList = []) => {
    if (!song) return;
    const list = songList.length > 0 ? songList : [song];
    if (typeof playSong === 'function') {
      playSong(song, list);
    }
  };

  const handlePlayArtist = async (artist) => {
    const artistName = (artist.name || '').trim().toLowerCase();
    const combinedPool = [...allCatalogSongs, ...likedSongs];
    const matchingTracks = combinedPool.filter((s) => {
      const sArtist = (s.artist || s.artists?.join(', ') || '').toLowerCase();
      return sArtist.includes(artistName);
    });

    if (matchingTracks.length > 0) {
      handlePlaySong(matchingTracks[0], matchingTracks);
      return;
    }

    try {
      const res = await api.get(`/artists/${artist.id}/songs`).catch(() => null);
      const songs = res?.data?.songs || res?.data?.data || [];
      if (songs.length > 0) {
        handlePlaySong(songs[0], songs);
      } else {
        alert(`No available tracks found for ${artist.name}`);
      }
    } catch {
      alert(`Playing tracks for ${artist.name}`);
    }
  };

  const handlePlayPlaylist = async (playlist) => {
    if (playlist.songs && playlist.songs.length > 0) {
      handlePlaySong(playlist.songs[0], playlist.songs);
      return;
    }

    try {
      const res = await api.get(`/playlists/${playlist.id}`);
      const songs = res.data?.playlist?.songs || res.data?.songs || [];
      if (songs.length > 0) {
        handlePlaySong(songs[0], songs);
      } else {
        alert('This playlist is empty.');
      }
    } catch (err) {
      console.error('Failed to play playlist mix:', err);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveBio = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError('');

    try {
      const response = await api.put('/users/profile', { bio: bioText });
      if (response.data?.success || response.status === 200) {
        if (user) user.bio = bioText;
        setIsEditingBio(false);
      } else {
        setSaveError(response.data?.message || 'Failed to update bio.');
      }
    } catch (err) {
      setSaveError(
        err?.response?.data?.message || 'Error updating bio. Please try again.'
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveCustomization = (glowId, bannerId) => {
    setSelectedGlow(glowId);
    setSelectedBanner(bannerId);
    localStorage.setItem('profile_glow', glowId);
    localStorage.setItem('profile_banner', bannerId);
    setIsCustomizing(false);
  };

  const isUserPremium = Boolean(
    user?.is_premium || user?.isPremium || user?.role === 'admin'
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-white/20 pb-20 overflow-x-hidden">
      <div
        className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 opacity-25"
        style={{ background: activeGlow.primary }}
      />
      <div
        className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none transition-all duration-1000 opacity-20"
        style={{ background: activeGlow.primary }}
      />

      <div
        className={`relative h-60 sm:h-72 w-full overflow-hidden bg-gradient-to-r ${activeBanner.gradient} border-b border-white/10 transition-all duration-700`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 -mt-24 sm:-mt-32 relative z-10 space-y-8">
        <div
          className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl transition-all duration-500"
          style={{
            boxShadow: `0 20px 60px -15px ${activeGlow.glow}`,
          }}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left flex-1 min-w-0">
              <div className="relative shrink-0 group">
                <div
                  className={`absolute -inset-1 rounded-full bg-gradient-to-r ${activeGlow.ring} blur-md opacity-80 group-hover:opacity-100 transition duration-500 animate-pulse`}
                />
                <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 border-slate-950 bg-slate-950 p-1 flex items-center justify-center overflow-hidden shadow-2xl">
                  {user?.avatar || user?.profilePic || user?.picture || user?.profile_pic ? (
                    <img
                      src={user.avatar || user.profilePic || user.picture || user.profile_pic}
                      alt={user?.username || 'User'}
                      className="h-full w-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_COVER;
                      }}
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <span
                        className="text-2xl sm:text-3xl font-black tracking-wider"
                        style={{ color: activeGlow.primary }}
                      >
                        {userInitials}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white truncate">
                    {user?.username || 'Fackify Listener'}
                  </h1>

                  <span
                    className={`rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-colors duration-500 ${activeGlow.badge}`}
                  >
                    <Sparkles className="h-3 w-3" />
                    {user?.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  @{user?.username?.toLowerCase().replace(/\s+/g, '') || 'listener'}
                </p>

                <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{user?.email || 'No email associated'}</span>
                </p>

                <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 sm:p-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      About Me
                    </span>
                    {!isEditingBio && (
                      <button
                        type="button"
                        onClick={() => setIsEditingBio(true)}
                        className="flex items-center gap-1 text-[11px] font-semibold transition hover:opacity-80 cursor-pointer"
                        style={{ color: activeGlow.primary }}
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit Bio</span>
                      </button>
                    )}
                  </div>

                  {isEditingBio ? (
                    <form onSubmit={handleSaveBio} className="space-y-3 mt-2">
                      <textarea
                        rows={3}
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        placeholder="Tell others about your music taste..."
                        maxLength={250}
                        className="w-full rounded-xl border border-white/20 bg-slate-950/90 p-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none transition"
                        style={{ borderColor: activeGlow.primary }}
                        autoFocus
                      />

                      {saveError && (
                        <p className="text-[11px] text-rose-400 font-medium">
                          {saveError}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {bioText.length}/250
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingBio(false);
                              setBioText(user?.bio || '');
                              setSaveError('');
                            }}
                            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>

                          <button
                            type="submit"
                            disabled={saveLoading}
                            className="flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-bold text-slate-950 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                            style={{ background: activeGlow.primary }}
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>{saveLoading ? 'Saving...' : 'Save'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {user?.bio?.trim() || (
                        <span className="text-slate-500 italic">
                          No bio added yet. Click &quot;Edit Bio&quot; to share your music vibe.
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 font-mono">
                  <Calendar className="h-3.5 w-3.5 text-slate-600" />
                  <span>{joinedDate}</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsCustomizing(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white active:scale-95 shadow-md cursor-pointer"
              >
                <Palette className="h-4 w-4" style={{ color: activeGlow.primary }} />
                <span>Theme</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white active:scale-95 shadow-md cursor-pointer"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            2. 📊 YOUR MUSIC STATS
        ====================================================== */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Your Music Stats
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {[
              {
                label: 'Songs In Catalog',
                value: dataLoading && !catalogCount ? '—' : catalogCount,
                icon: Music2,
                color: 'text-teal-400',
                bg: 'bg-teal-500/10',
              },
              {
                label: 'Liked Songs',
                value: dataLoading && !likedSongs.length ? '—' : likedSongs.length,
                icon: Heart,
                color: 'text-rose-400',
                bg: 'bg-rose-500/10',
              },
              {
                label: 'Playlists',
                value: dataLoading && !userPlaylists.length ? '—' : userPlaylists.length,
                icon: ListMusic,
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10',
              },
              {
                label: 'Listening Time',
                value: formatListeningTime(listeningSeconds),
                icon: Clock,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl p-5 text-center transition-all duration-300 hover:border-white/15 hover:-translate-y-1 hover:shadow-xl group"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className={`p-2 rounded-xl ${item.bg}`}>
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-1 group-hover:scale-105 transition-transform">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium Banner */}
        {isUserPremium ? (
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-amber-950/30 p-6 sm:p-7 backdrop-blur-2xl shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Crown className="w-40 h-40 text-amber-400" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-black uppercase tracking-wider text-amber-300">
                    FACKIFY PREMIUM
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Unlimited music • Premium playlists • Ad-free listening • Exclusive high-bitrate content
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold shrink-0 self-start sm:self-auto">
                <Check className="w-4 h-4" />
                <span>ACTIVE</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-7 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Upgrade to Fackify Premium</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Enjoy ad-free audio, unlimited song downloads, and high-fidelity lossless sound.
              </p>
            </div>

            <button
              type="button"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer shrink-0"
            >
              Get Premium
            </button>
          </div>
        )}

        {/* Recently Played & Favorites */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Disc3 className="w-5 h-5 text-teal-400" />
                  Recently Played
                </span>
                <span className="text-xs text-slate-500 font-normal">Last 5 Tracks</span>
              </h2>

              {recentlyPlayed.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs italic">
                  No recently played tracks available yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentlyPlayed.map((song, idx) => {
                    const isCurrentPlaying =
                      isPlaying &&
                      (currentSong?.id === song.id || currentSong?.id === song._id);

                    return (
                      <div
                        key={song.id || song._id || idx}
                        onClick={() => handlePlaySong(song, recentlyPlayed)}
                        className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10">
                            <img
                              src={song.thumbnail_url || song.thumbnailUrl || DEFAULT_COVER}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_COVER;
                              }}
                            />
                            {isCurrentPlaying && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="flex items-end gap-0.5 h-3">
                                  <span className="w-1 bg-emerald-400 h-full animate-bounce" />
                                  <span className="w-1 bg-emerald-400 h-2/3 animate-bounce [animation-delay:0.2s]" />
                                  <span className="w-1 bg-emerald-400 h-4/5 animate-bounce [animation-delay:0.4s]" />
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`text-xs font-bold truncate ${
                                isCurrentPlaying ? 'text-emerald-400' : 'text-slate-200'
                              }`}
                            >
                              {song.title || song.name || 'Untitled Track'}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {song.artist || 'Unknown Artist'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="p-2 rounded-xl bg-white/[0.04] text-slate-300 group-hover:text-white group-hover:bg-white/10 transition"
                        >
                          {isCurrentPlaying ? (
                            <Pause className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-current" />
                  Your Favorites
                </h2>

                <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setFavTab('artists')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      favTab === 'artists'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Crown className="w-3 h-3 text-amber-400" />
                    Premium Artists ({premiumArtists.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFavTab('tracks')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      favTab === 'tracks'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tracks ({likedSongs.length})
                  </button>
                </div>
              </div>

              {favTab === 'artists' && (
                premiumArtists.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs italic">
                    No premium artists selected yet. Pin or mark artists as Premium in the Artists tab!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {premiumArtists.map((artist, idx) => (
                      <div
                        key={artist.id || artist._id || idx}
                        className="group relative p-3 rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-900 border border-amber-400/30 hover:border-amber-400/60 transition flex flex-col items-center text-center shadow-lg hover:-translate-y-1 hover:shadow-amber-500/10"
                      >
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-2.5 border-2 border-amber-400/50 p-0.5 bg-slate-950">
                          <img
                            src={artist.image_url || artist.avatar || artist.imageUrl || DEFAULT_COVER}
                            alt={artist.name}
                            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_COVER;
                            }}
                          />
                          
                          <div 
                            onClick={() => handlePlayArtist(artist)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                          >
                            <div className="p-2.5 rounded-full bg-emerald-400 text-slate-950 shadow-xl hover:scale-110 active:scale-90 transition">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>

                          <div className="absolute bottom-0 right-0 p-1 bg-slate-950 rounded-full border border-amber-400/60 shadow-md">
                            <Crown className="w-3 h-3 text-amber-400" />
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-100 truncate w-full">
                          {artist.name}
                        </h4>
                        <span className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                          VIP Artist
                        </span>

                        <button
                          type="button"
                          onClick={() => handlePlayArtist(artist)}
                          className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-[11px] font-semibold border border-amber-400/30 transition active:scale-95 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Play Songs</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}

              {favTab === 'tracks' && (
                likedSongs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs italic">
                    No liked favorites yet. Click the heart icon on songs you love!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {likedSongs.slice(0, 6).map((song, idx) => (
                      <div
                        key={song.id || song._id || idx}
                        onClick={() => handlePlaySong(song, likedSongs)}
                        className="group p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition flex flex-col cursor-pointer"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden mb-2 border border-white/10">
                          <img
                            src={song.thumbnail_url || song.thumbnailUrl || DEFAULT_COVER}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_COVER;
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <div className="p-2.5 rounded-full bg-white text-slate-950 shadow-xl">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>

                        <p className="text-xs font-bold text-slate-200 truncate">
                          {song.title || 'Untitled Track'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {song.artist || 'Unknown Artist'}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Playlists */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-violet-400" />
            Your Playlists ({userPlaylists.length})
          </h2>

          {userPlaylists.length === 0 ? (
            <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-12 text-center text-slate-500 text-xs italic">
              You have not created any custom playlists yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {userPlaylists.map((pl) => {
                const coverImage = getPlaylistCover(pl);
                const trackCount =
                  pl.song_count ||
                  pl.songs_count ||
                  (Array.isArray(pl.songs) ? pl.songs.length : 0);

                const isPublic = Boolean(pl.is_public);

                return (
                  <div
                    key={pl.id || pl._id}
                    className="group rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-xl p-4 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 border border-white/10 bg-slate-950">
                        <img
                          src={coverImage}
                          alt={pl.name || 'Playlist cover'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_COVER;
                          }}
                        />

                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase flex items-center gap-1 text-slate-300">
                          {isPublic ? (
                            <>
                              <Globe className="w-3 h-3 text-emerald-400" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-amber-400" />
                              Private
                            </>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white truncate">
                        {pl.name || 'Untitled Playlist'}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {trackCount} Songs
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlayPlaylist(pl)}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 transition cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Mix</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            Account Settings
          </h2>

          <div className="divide-y divide-white/5">
            {[
              {
                icon: User,
                title: 'Edit Profile Information',
                desc: 'Update your display name, username, and public avatar.',
                action: () => setIsEditingBio(true),
              },
              {
                icon: KeyRound,
                title: 'Change Password & Security',
                desc: 'Manage your password credentials and multi-factor setup.',
                action: () => alert('Password reset instructions sent to your email.'),
              },
              {
                icon: Bell,
                title: 'Notification Settings',
                desc: 'Configure email alerts for new playlist releases and track likes.',
                action: () => alert('Notification practical settings opened.'),
              },
              {
                icon: Palette,
                title: 'Appearance & Themes',
                desc: 'Switch custom accent glow rings and profile mesh banners.',
                action: () => setIsCustomizing(true),
              },
              {
                icon: LogOut,
                title: 'Log Out Session',
                desc: 'Sign out of your Fackify account across this device.',
                action: logout,
                danger: true,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={item.action}
                  className="py-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] px-2 rounded-2xl transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl border border-white/5 ${
                        item.danger ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-bold truncate ${
                          item.danger ? 'text-rose-400' : 'text-slate-100 group-hover:text-amber-400 transition-colors'
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isCustomizing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-slate-300" />
                <h3 className="text-base font-bold text-white">Customize Profile</h3>
              </div>
              <button
                onClick={() => setIsCustomizing(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Dynamic Accent Glow
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {GLOW_PRESETS.map((glow) => (
                  <button
                    key={glow.id}
                    type="button"
                    onClick={() => setSelectedGlow(glow.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                      selectedGlow === glow.id
                        ? 'border-white bg-white/10 shadow-lg'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full shadow-md shrink-0"
                      style={{ background: glow.primary }}
                    />
                    <span className="text-xs font-bold text-slate-200">{glow.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Ambient Cover Banner
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {BANNER_PRESETS.map((banner) => (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => setSelectedBanner(banner.id)}
                    className={`h-16 rounded-2xl border p-2 text-left bg-gradient-to-r ${
                      banner.gradient
                    } flex flex-col justify-end transition-all cursor-pointer ${
                      selectedBanner === banner.id
                        ? 'border-white ring-2 ring-white/20 scale-[1.02]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-white drop-shadow-md">
                      {banner.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveCustomization(selectedGlow, selectedBanner)}
                className="rounded-xl px-5 py-2 text-xs font-bold text-slate-950 transition active:scale-95 cursor-pointer"
                style={{ background: activeGlow.primary }}
              >
                Apply Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}