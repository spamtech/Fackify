import React, { useState, useEffect, useMemo } from 'react';
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
  Image as ImageIcon,
  Save,
  X,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

/* ============================================================
   PRESET THEMES & BANNER GRADIENTS
============================================================ */
const GLOW_PRESETS = [
  {
    id: 'emerald',
    name: 'Emerald',
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.28)',
    border: 'border-emerald-500/40',
    badge: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400',
    ring: 'ring-emerald-400/30',
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    primary: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.28)',
    border: 'border-cyan-500/40',
    badge: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400',
    ring: 'ring-cyan-400/30',
  },
  {
    id: 'purple',
    name: 'Neon Purple',
    primary: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.28)',
    border: 'border-purple-500/40',
    badge: 'border-purple-400/30 bg-purple-400/10 text-purple-400',
    ring: 'ring-purple-400/30',
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    primary: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.28)',
    border: 'border-amber-500/40',
    badge: 'border-amber-400/30 bg-amber-400/10 text-amber-400',
    ring: 'ring-amber-400/30',
  },
];

const BANNER_PRESETS = [
  {
    id: 'aurora',
    name: 'Aurora',
    gradient: 'from-emerald-950/60 via-slate-900 to-cyan-950/60',
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    gradient: 'from-purple-950/70 via-slate-900 to-rose-950/60',
  },
  {
    id: 'solar',
    name: 'Solar Flare',
    gradient: 'from-amber-950/70 via-slate-900 to-rose-950/60',
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    gradient: 'from-blue-950/70 via-slate-950 to-slate-900',
  },
];

export default function Profile() {
  const { user } = useAuth();

  // Share & Modal states
  const [copied, setCopied] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || '');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Metrics State
  const [likedCount, setLikedCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);

  // Customization States (Stored locally or synced via user preferences)
  const [selectedGlow, setSelectedGlow] = useState(() => {
    return localStorage.getItem('profile_glow') || 'emerald';
  });
  const [selectedBanner, setSelectedBanner] = useState(() => {
    return localStorage.getItem('profile_banner') || 'aurora';
  });

  // Current active theme objects
  const activeGlow = useMemo(() => {
    return GLOW_PRESETS.find((g) => g.id === selectedGlow) || GLOW_PRESETS[0];
  }, [selectedGlow]);

  const activeBanner = useMemo(() => {
    return (
      BANNER_PRESETS.find((b) => b.id === selectedBanner) || BANNER_PRESETS[0]
    );
  }, [selectedBanner]);

  // Sync bio when user data loads
  useEffect(() => {
    if (user?.bio !== undefined) {
      setBioText(user.bio || '');
    }
  }, [user]);

  // ============================================================
  // FETCH USER METRICS
  // ============================================================
  useEffect(() => {
    const fetchProfileMetrics = async () => {
      const currentUserId = user?.id || user?._id;
      if (!currentUserId) return;

      try {
        setDataLoading(true);

        const [likesRes, playlistsRes] = await Promise.allSettled([
          api.get('/songs/liked').catch(() => api.get('/likes')),
          api.get('/playlists').catch(() => api.get('/playlists/my-playlists')),
        ]);

        if (likesRes.status === 'fulfilled') {
          const lData = likesRes.value?.data;
          const songs =
            lData?.songs ||
            lData?.likedSongs ||
            lData?.rows ||
            lData?.data ||
            (Array.isArray(lData) ? lData : []);

          setLikedCount(
            typeof lData?.count === 'number'
              ? lData.count
              : typeof lData?.total === 'number'
              ? lData.total
              : Array.isArray(songs)
              ? songs.length
              : 0
          );
        }

        if (playlistsRes.status === 'fulfilled') {
          const pData = playlistsRes.value?.data;
          const list =
            pData?.playlists ||
            pData?.rows ||
            pData?.data ||
            (Array.isArray(pData) ? pData : []);

          const selfPlaylists = Array.isArray(list)
            ? list.filter(
                (p) => !p.user_id || String(p.user_id) === String(currentUserId)
              )
            : [];

          setPlaylistCount(selfPlaylists.length);
        }
      } catch (err) {
        console.warn('Failed to load metric counts:', err?.message);
      } finally {
        setDataLoading(false);
      }
    };

    fetchProfileMetrics();
  }, [user]);

  // Formatted date calculation
  const joinedDate = useMemo(() => {
    if (!user?.createdAt && !user?.created_at) return 'Member';
    const date = new Date(user.createdAt || user.created_at);
    return `Joined ${date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })}`;
  }, [user]);

  // Copy Profile Link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save Bio
  const handleSaveBio = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError('');

    try {
      const response = await api.put('/auth/profile', { bio: bioText });
      if (response.data?.success) {
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

  // Save Customization
  const handleSaveCustomization = (glowId, bannerId) => {
    setSelectedGlow(glowId);
    setSelectedBanner(bannerId);
    localStorage.setItem('profile_glow', glowId);
    localStorage.setItem('profile_banner', bannerId);
    setIsCustomizing(false);
  };

  const statItems = [
    {
      label: 'Liked Songs',
      value: dataLoading ? '—' : likedCount,
      icon: Heart,
      color: 'text-rose-400',
    },
    {
      label: 'Playlists Created',
      value: dataLoading ? '—' : playlistCount,
      icon: ListMusic,
      color: 'text-cyan-400',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-white font-sans selection:bg-white/20 flex flex-col items-center justify-start pb-12 relative overflow-hidden">
      {/* =====================================================
          CUSTOM PROFILE AMBIENT BANNER
      ====================================================== */}
      <div
        className={`relative h-56 sm:h-72 w-full overflow-hidden bg-gradient-to-r ${activeBanner.gradient} border-b border-white/10 transition-all duration-700`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

        {/* Ambient Dynamic Mesh Glow */}
        <div
          className="absolute -top-20 -left-20 h-96 w-96 rounded-full blur-[130px] pointer-events-none transition-all duration-700 opacity-60"
          style={{ background: activeGlow.primary }}
        />
        <div
          className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full blur-[130px] pointer-events-none transition-all duration-700 opacity-40"
          style={{ background: activeGlow.primary }}
        />
      </div>

      {/* =====================================================
          MAIN PROFILE CARD
      ====================================================== */}
      <div className="w-full max-w-4xl px-4 sm:px-8 -mt-20 sm:-mt-28 relative z-10">
        <div
          className={`rounded-3xl border border-white/10 bg-slate-900/85 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl transition-all duration-500`}
          style={{
            boxShadow: `0 20px 60px -15px ${activeGlow.glow}`,
          }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left flex-1">
              {/* Profile Avatar with Dynamic Border */}
              <div className="relative shrink-0">
                <div
                  className={`h-28 w-28 sm:h-36 sm:w-36 rounded-3xl border-2 bg-slate-950 p-1 shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-slate-950 transition-colors duration-500 ${activeGlow.border}`}
                >
                  {user?.avatar || user?.profilePic || user?.picture ? (
                    <img
                      src={user.avatar || user.profilePic || user.picture}
                      alt={user?.username || 'User'}
                      className="h-full w-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="h-full w-full rounded-2xl bg-white/[0.04] flex items-center justify-center">
                      <User
                        className="h-14 w-14 transition-colors duration-500"
                        style={{ color: activeGlow.primary }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Identity & Status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {user?.username || 'Fackify Listener'}
                  </h1>

                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-colors duration-500 ${activeGlow.badge}`}
                  >
                    <Sparkles className="h-3 w-3" />
                    {user?.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1.5 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  {user?.email || 'No email associated'}
                </p>

                {/* Bio Section with Quick Edit */}
                <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 sm:p-4 relative">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      About Me
                    </span>
                    {!isEditingBio && (
                      <button
                        type="button"
                        onClick={() => setIsEditingBio(true)}
                        className="flex items-center gap-1 text-[11px] font-semibold transition hover:opacity-80"
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
                        className="w-full rounded-xl border border-white/20 bg-slate-950/90 p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none transition"
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
                            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>

                          <button
                            type="submit"
                            disabled={saveLoading}
                            className="flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-bold text-slate-950 transition active:scale-95 disabled:opacity-50"
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
                          No bio added yet. Click &quot;Edit Bio&quot; to share
                          your vibe.
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="mt-3.5 flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 font-mono">
                  <Calendar className="h-3.5 w-3.5 text-slate-600" />
                  <span>{joinedDate}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Customize & Share) */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsCustomizing(true)}
                title="Customize Theme & Aesthetics"
                className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white active:scale-95 shadow-md"
              >
                <Palette className="h-4 w-4" style={{ color: activeGlow.primary }} />
                <span>Theme</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white active:scale-95 shadow-md"
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

          {/* =====================================================
              METRICS SECTION (LIKED SONGS & PLAYLISTS)
          ====================================================== */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-8">
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center transition-all duration-200 hover:border-white/10"
                >
                  <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                    <Icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================
          CUSTOMIZATION MODAL (GLOWS & BANNERS)
      ====================================================== */}
      {isCustomizing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-slate-300" />
                <h3 className="text-base font-bold text-white">
                  Customize Profile
                </h3>
              </div>
              <button
                onClick={() => setIsCustomizing(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 1. Pick Accent Glow */}
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
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                      selectedGlow === glow.id
                        ? 'border-white bg-white/10 shadow-lg'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full shadow-md shrink-0"
                      style={{ background: glow.primary }}
                    />
                    <span className="text-xs font-bold text-slate-200">
                      {glow.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Pick Ambient Banner */}
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
                    } flex flex-col justify-end transition-all ${
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

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSaveCustomization(selectedGlow, selectedBanner)
                }
                className="rounded-xl px-5 py-2 text-xs font-bold text-slate-950 transition active:scale-95"
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