import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import SongCard from '../components/SongCard';
import { ListMusic, Plus, FolderPlus, Trash2, ArrowLeft, Globe, Lock } from 'lucide-react';

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', isPublic: true });
  const [creating, setCreating] = useState(false);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await api.get('/playlists');
      if (res.data?.success) {
        setPlaylists(res.data.playlists || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylistDetails = async (id) => {
    try {
      const res = await api.get(`/playlists/${id}`);
      if (res.data?.success) {
        setActivePlaylist(res.data.playlist);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/playlists', form);
      if (res.data?.success) {
        setPlaylists((prev) => [res.data.playlist, ...prev]);
        setShowModal(false);
        setForm({ name: '', description: '', isPublic: true });
      }
    } catch (err) {
      alert('Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await api.delete(`/playlists/${id}`);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      if (activePlaylist?.id === id) setActivePlaylist(null);
    } catch (err) {
      alert('Failed to delete playlist');
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      await api.delete(`/playlists/${activePlaylist.id}/songs/${songId}`);
      setActivePlaylist((prev) => ({
        ...prev,
        songs: prev.songs.filter((s) => s.id !== songId),
      }));
      setPlaylists((prev) =>
        prev.map((p) => (p.id === activePlaylist.id ? { ...p, song_count: Math.max(0, p.song_count - 1) } : p))
      );
    } catch (err) {
      alert('Failed to remove track');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ListMusic className="w-6 h-6 text-emerald-400" />
            My Playlists
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Organize and curate your favorite soundscapes</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-semibold text-slate-950 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {/* Main Content Area */}
      {activePlaylist ? (
        <div>
          <button
            onClick={() => setActivePlaylist(null)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all playlists
          </button>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">{activePlaylist.name}</h2>
                {activePlaylist.is_public ? (
                  <Globe className="w-4 h-4 text-slate-400" title="Public" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-400" title="Private" />
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{activePlaylist.description || 'No description provided.'}</p>
              <p className="text-[11px] text-slate-500 mt-2">{activePlaylist.songs?.length || 0} tracks</p>
            </div>

            <button
              onClick={() => handleDeletePlaylist(activePlaylist.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-xs transition self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Playlist
            </button>
          </div>

          {activePlaylist.songs?.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
              No tracks in this playlist yet. Add songs from your Discover feed!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {activePlaylist.songs.map((song) => (
                <div key={song.id} className="relative group">
                  <SongCard song={song} songList={activePlaylist.songs} />
                  <button
                    onClick={() => handleRemoveSong(song.id)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-lg shadow opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Remove from playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => loadPlaylistDetails(pl.id)}
              className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 p-5 rounded-2xl transition hover:bg-slate-800/40 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  {pl.is_public ? (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">Public</span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">Private</span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-100 text-sm">{pl.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{pl.description || 'Custom playlist'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <span>{pl.song_count || 0} tracks</span>
                <span>{new Date(pl.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 mb-4">Create New Playlist</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Playlist Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gym Mix, Deep Focus..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="What's the vibe of this playlist?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={form.isPublic}
                  onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                  className="accent-emerald-500 rounded cursor-pointer"
                />
                <label htmlFor="isPublic" className="text-slate-300 cursor-pointer">Make playlist publicly visible</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-semibold text-slate-950 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}