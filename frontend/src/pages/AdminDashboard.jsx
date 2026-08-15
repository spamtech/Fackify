import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import SongCard from '../components/SongCard';
import {
  PlusCircle,
  ShieldCheck,
  Users,
  Heart,
  Music,
  Clock,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Activity,
  Database,
  UserCheck,
  TrendingUp,
  Upload,
  ChevronRight,
  Crown,
  Radio,
  ExternalLink,
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('library');
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [likeActivities, setLikeActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({
    title: '',
    artist: '',
    sourceUrl: '',
    thumbnailUrl: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({
    type: '',
    text: '',
  });

  // Edit Modal
  const [editingSong, setEditingSong] = useState(null);

  const [editForm, setEditForm] = useState({
    title: '',
    artist: '',
    sourceUrl: '',
    thumbnailUrl: '',
  });

  const [updating, setUpdating] = useState(false);

  const [librarySearch, setLibrarySearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [songsRes, activityRes] = await Promise.allSettled([
        api.get('/songs'),
        api.get('/admin/activity'),
      ]);

      if (
        songsRes.status === 'fulfilled' &&
        songsRes.value.data?.success
      ) {
        setSongs(songsRes.value.data.songs || []);
      }

      if (
        activityRes.status === 'fulfilled' &&
        activityRes.value.data?.success
      ) {
        setUsers(activityRes.value.data.users || []);
        setLikeActivities(
          activityRes.value.data.likeActivities || []
        );
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddSong = async (e) => {
    e.preventDefault();

    setStatusMsg({
      type: '',
      text: '',
    });

    setSubmitting(true);

    try {
      const res = await api.post('/songs', form);

      if (res.data.success) {
        setStatusMsg({
          type: 'success',
          text: 'Track published successfully!',
        });

        setForm({
          title: '',
          artist: '',
          sourceUrl: '',
          thumbnailUrl: '',
        });

        fetchDashboardData();
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Failed to add song',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (song) => {
    setEditingSong(song);

    setEditForm({
      title: song.title,
      artist: song.artist,
      sourceUrl: song.source_url,
      thumbnailUrl: song.thumbnail_url,
    });
  };

  const handleUpdateSong = async (e) => {
    e.preventDefault();

    setUpdating(true);

    try {
      const res = await api.put(
        `/songs/${editingSong.id}`,
        editForm
      );

      if (res.data.success) {
        setSongs((prev) =>
          prev.map((s) =>
            s.id === editingSong.id
              ? {
                  ...s,
                  ...res.data.song,
                }
              : s
          )
        );

        setEditingSong(null);
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to update song'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSong = async (songId) => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this track?'
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(
        `/songs/${songId}`
      );

      if (res.data.success) {
        setSongs((prev) =>
          prev.filter((s) => s.id !== songId)
        );
      }
    } catch (err) {
      alert('Failed to delete track');
    }
  };

  const filteredSongs = songs.filter((song) => {
    const query = librarySearch.toLowerCase();

    return (
      song.title?.toLowerCase().includes(query) ||
      song.artist?.toLowerCase().includes(query) ||
      song.source_type?.toLowerCase().includes(query)
    );
  });

  const filteredUsers = users.filter((user) => {
    const query = userSearch.toLowerCase();

    return (
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  const totalLikes = likeActivities.length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-36">

        {/* =====================================================
            ADMIN HEADER
        ====================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-2xl">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_35%)]" />

          <div className="relative p-5 sm:p-7 lg:p-8">

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

              <div className="flex items-start gap-4">

                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-xl" />

                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Admin Studio
                    </h1>

                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>

                  </div>

                  <p className="max-w-2xl text-sm leading-6 text-slate-400">
                    Manage your Fackify music catalogue, monitor
                    users and track engagement from one central
                    workspace.
                  </p>
                </div>
              </div>

              {/* System Status */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Activity className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    System Status
                  </p>

                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <span className="text-xs font-semibold text-emerald-400">
                      All Systems Operational
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Tabs */}

            <div className="mt-8 overflow-x-auto scrollbar-none">

              <div className="inline-flex min-w-full sm:min-w-0 rounded-2xl border border-slate-800 bg-slate-950/70 p-1.5">

                {[
                  {
                    id: 'library',
                    label: 'Catalogue',
                    icon: Music,
                    count: songs.length,
                  },
                  {
                    id: 'users',
                    label: 'Users',
                    icon: Users,
                    count: users.length,
                  },
                  {
                    id: 'activity',
                    label: 'Likes Audit',
                    icon: Heart,
                    count: totalLikes,
                  },
                ].map((tab) => {

                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(tab.id)
                      }
                      className={`group flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 text-xs font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />

                      {tab.label}

                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] ${
                          activeTab === tab.id
                            ? 'bg-slate-950/10'
                            : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}

              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STATISTICS
        ====================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">

          {/* Songs */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5">

            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/5 blur-2xl transition group-hover:bg-emerald-500/10" />

            <div className="relative flex items-start justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Tracks
                </p>

                <p className="mt-2 text-3xl font-black text-white">
                  {songs.length}
                </p>

                <p className="mt-1 text-[10px] text-emerald-400">
                  Catalogue library
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Music className="h-5 w-5" />
              </div>

            </div>
          </div>

          {/* Users */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5">

            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/5 blur-2xl" />

            <div className="relative flex items-start justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Registered Users
                </p>

                <p className="mt-2 text-3xl font-black text-white">
                  {users.length}
                </p>

                <p className="mt-1 text-[10px] text-blue-400">
                  Fackify community
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Users className="h-5 w-5" />
              </div>

            </div>
          </div>

          {/* Likes */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-xl hover:shadow-rose-500/5">

            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-500/5 blur-2xl" />

            <div className="relative flex items-start justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Likes
                </p>

                <p className="mt-2 text-3xl font-black text-white">
                  {totalLikes}
                </p>

                <p className="mt-1 text-[10px] text-rose-400">
                  User engagement
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                <Heart className="h-5 w-5" />
              </div>

            </div>
          </div>

          {/* Status */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30">

            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-purple-500/5 blur-2xl" />

            <div className="relative flex items-start justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Platform
                </p>

                <p className="mt-2 text-xl font-black text-white">
                  Fackify
                </p>

                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </div>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Database className="h-5 w-5" />
              </div>

            </div>
          </div>

        </section>

        {/* =====================================================
            LIBRARY
        ====================================================== */}

        {activeTab === 'library' && (
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* Add Track */}
            <div className="xl:col-span-4">

              <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl">

                <div className="relative border-b border-slate-800 p-5 sm:p-6">

                  <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-emerald-500/10 blur-3xl" />

                  <div className="relative flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Upload className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-white">
                        Publish New Track
                      </h2>

                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Add music to your catalogue
                      </p>
                    </div>

                  </div>
                </div>

                <div className="p-5 sm:p-6">

                  {statusMsg.text && (
                    <div
                      className={`mb-5 flex items-start gap-3 rounded-xl border p-3.5 text-xs ${
                        statusMsg.type === 'success'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {statusMsg.type === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      ) : (
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      )}

                      <span>{statusMsg.text}</span>
                    </div>
                  )}

                  <form
                    onSubmit={handleAddSong}
                    className="space-y-4"
                  >

                    {/* Title */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Song Title *
                      </label>

                      <input
                        type="text"
                        required
                        placeholder="Enter song title"
                        value={form.title}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            title: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>

                    {/* Artist */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Artist
                      </label>

                      <input
                        type="text"
                        placeholder="Artist name"
                        value={form.artist}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            artist: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>

                    {/* Source */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Source URL *
                      </label>

                      <input
                        type="url"
                        required
                        placeholder="YouTube / stream / MP3 URL"
                        value={form.sourceUrl}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            sourceUrl: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>

                    {/* Thumbnail */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Thumbnail URL *
                      </label>

                      <input
                        type="url"
                        required
                        placeholder="Cover image URL"
                        value={form.thumbnailUrl}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            thumbnailUrl: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <PlusCircle className="h-4 w-4 transition group-hover:rotate-90" />

                      {submitting
                        ? 'Publishing Track...'
                        : 'Publish Track'}
                    </button>

                  </form>
                </div>
              </div>
            </div>

            {/* Catalogue */}
            <div className="xl:col-span-8">

              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>
                  <h2 className="flex items-center gap-2 text-base font-bold text-white">
                    <Music className="h-4 w-4 text-emerald-400" />
                    Music Catalogue
                  </h2>

                  <p className="mt-1 text-[11px] text-slate-500">
                    {songs.length} tracks available in your library
                  </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">

                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                  <input
                    type="text"
                    value={librarySearch}
                    onChange={(e) =>
                      setLibrarySearch(e.target.value)
                    }
                    placeholder="Search catalogue..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/50"
                  />

                </div>

              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-3 animate-pulse"
                    >
                      <div className="aspect-square rounded-xl bg-slate-800" />

                      <div className="mt-3 h-3 w-3/4 rounded bg-slate-800" />

                      <div className="mt-2 h-2.5 w-1/2 rounded bg-slate-800" />
                    </div>
                  ))}

                </div>
              ) : filteredSongs.length === 0 ? (

                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/50 p-16 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-slate-600">
                    <Music className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-300">
                    No tracks found
                  </h3>

                  <p className="mt-1 text-xs text-slate-600">
                    Try changing your search or add a new track.
                  </p>

                </div>

              ) : (

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                  {filteredSongs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      songList={songs}
                      isAdmin={true}
                      onEdit={openEditModal}
                      onDelete={handleDeleteSong}
                    />
                  ))}

                </div>

              )}

            </div>
          </div>
        )}

        {/* =====================================================
            USERS
        ====================================================== */}

        {activeTab === 'users' && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 p-5">

              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Users className="h-4 w-4 text-blue-400" />
                  User Management
                </h2>

                <p className="mt-1 text-[10px] text-slate-500">
                  Monitor registered Fackify members
                </p>
              </div>

              <div className="relative w-full sm:w-72">

                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) =>
                    setUserSearch(e.target.value)
                  }
                  placeholder="Search users..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-blue-500/50"
                />

              </div>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left text-xs">

                <thead className="border-b border-slate-800 bg-slate-950/70">

                  <tr className="text-[10px] uppercase tracking-wider text-slate-500">

                    <th className="px-6 py-4">
                      User
                    </th>

                    <th className="px-6 py-4">
                      Email
                    </th>

                    <th className="px-6 py-4">
                      Role
                    </th>

                    <th className="px-6 py-4">
                      Likes
                    </th>

                    <th className="px-6 py-4">
                      Joined
                    </th>

                    <th className="px-6 py-4">
                      Last Active
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-800/60">

                  {filteredUsers.length === 0 ? (

                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-16 text-center text-xs text-slate-600"
                      >
                        No users found.
                      </td>
                    </tr>

                  ) : (

                    filteredUsers.map((u) => (

                      <tr
                        key={u.id}
                        className="group transition hover:bg-slate-800/30"
                      >

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 text-xs font-bold text-slate-300">
                              {u.username
                                ?.charAt(0)
                                ?.toUpperCase() || 'U'}
                            </div>

                            <div>
                              <div className="font-semibold text-slate-200">
                                {u.username}
                              </div>

                              <div className="mt-0.5 text-[9px] text-slate-600">
                                ID: {String(u.id).slice(0, 8)}
                              </div>
                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {u.email}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                : 'border-slate-700 bg-slate-800 text-slate-400'
                            }`}
                          >
                            {u.role === 'admin' ? (
                              <Crown className="h-3 w-3" />
                            ) : (
                              <UserCheck className="h-3 w-3" />
                            )}

                            {u.role}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <span className="inline-flex items-center gap-1.5 font-semibold text-rose-400">

                            <Heart className="h-3.5 w-3.5 fill-current" />

                            {u.liked_songs_count || 0}

                          </span>

                        </td>

                        <td className="px-6 py-4 text-slate-500">
                          {u.created_at
                            ? new Date(
                                u.created_at
                              ).toLocaleDateString()
                            : '-'}
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-1.5 text-slate-400">

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                u.last_login
                                  ? 'bg-emerald-400'
                                  : 'bg-slate-700'
                              }`}
                            />

                            {u.last_login
                              ? new Date(
                                  u.last_login
                                ).toLocaleString()
                              : 'Never'}

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>
          </div>
        )}

        {/* =====================================================
            LIKES AUDIT
        ====================================================== */}

        {activeTab === 'activity' && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl">

            <div className="border-b border-slate-800 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                  <Heart className="h-5 w-5 fill-current" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white">
                    Engagement Activity
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Monitor which users are interacting with your music
                  </p>
                </div>

              </div>

            </div>

            {likeActivities.length === 0 ? (

              <div className="p-20 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-slate-600">
                  <Heart className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-300">
                  No engagement yet
                </h3>

                <p className="mt-1 text-xs text-slate-600">
                  Likes will appear here when users interact with tracks.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[800px] text-left text-xs">

                  <thead className="border-b border-slate-800 bg-slate-950/70">

                    <tr className="text-[10px] uppercase tracking-wider text-slate-500">

                      <th className="px-6 py-4">
                        User
                      </th>

                      <th className="px-6 py-4">
                        Track
                      </th>

                      <th className="px-6 py-4">
                        Artist
                      </th>

                      <th className="px-6 py-4">
                        Platform
                      </th>

                      <th className="px-6 py-4">
                        Liked At
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-800/60">

                    {likeActivities.map(
                      (act, index) => (

                        <tr
                          key={`${act.user_id}-${act.song_id}-${index}`}
                          className="group transition hover:bg-slate-800/30"
                        >

                          {/* User */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                                <Heart className="h-4 w-4 fill-current" />
                              </div>

                              <div>

                                <div className="font-semibold text-slate-200">
                                  {act.username}
                                </div>

                                <div className="mt-0.5 text-[9px] text-slate-600">
                                  {act.email}
                                </div>

                              </div>

                            </div>

                          </td>

                          {/* Song */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <img
                                src={act.thumbnail_url}
                                alt=""
                                className="h-10 w-10 rounded-xl border border-slate-700 object-cover shadow-lg"
                              />

                              <div className="max-w-[250px]">

                                <div className="truncate font-semibold text-slate-200">
                                  {act.song_title}
                                </div>

                                <div className="mt-1 text-[9px] text-slate-600">
                                  Song ID: {String(
                                    act.song_id
                                  ).slice(0, 8)}
                                </div>

                              </div>

                            </div>

                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {act.song_artist}
                          </td>

                          <td className="px-6 py-4">

                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-[9px] font-semibold capitalize text-slate-300">

                              <Radio className="h-3 w-3 text-emerald-400" />

                              {act.source_type || 'direct'}

                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-2 text-slate-500">

                              <Clock className="h-3.5 w-3.5" />

                              {act.liked_at
                                ? new Date(
                                    act.liked_at
                                  ).toLocaleString()
                                : '-'}

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>
        )}

        {/* =====================================================
            EDIT MODAL
        ====================================================== */}

        {editingSong && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">

            <div
              className="absolute inset-0"
              onClick={() =>
                setEditingSong(null)
              }
            />

            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl">

              {/* Modal Header */}

              <div className="relative border-b border-slate-800 p-5 sm:p-6">

                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="relative flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Edit2 className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Edit Track
                      </h3>

                      <p className="mt-1 text-[10px] text-slate-500">
                        Update track metadata
                      </p>
                    </div>

                  </div>

                  <button
                    onClick={() =>
                      setEditingSong(null)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-800 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>
              </div>

              {/* Modal Body */}

              <form
                onSubmit={handleUpdateSong}
                className="space-y-5 p-5 sm:p-6"
              >

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Song Title *
                  </label>

                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-white outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Artist
                  </label>

                  <input
                    type="text"
                    value={editForm.artist}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        artist: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-white outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Source URL *
                  </label>

                  <input
                    type="url"
                    required
                    value={editForm.sourceUrl}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        sourceUrl: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-white outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Thumbnail URL *
                  </label>

                  <input
                    type="url"
                    required
                    value={editForm.thumbnailUrl}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        thumbnailUrl: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-white outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                {/* Buttons */}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-800">

                  <button
                    type="button"
                    onClick={() =>
                      setEditingSong(null)
                    }
                    className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50 cursor-pointer"
                  >
                    {updating ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}