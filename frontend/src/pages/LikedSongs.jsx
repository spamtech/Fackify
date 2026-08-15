import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import SongCard from '../components/SongCard';
import { Heart, Loader2 } from 'lucide-react';

export default function LikedSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiked = async () => {
    try {
      const res = await api.get('/likes');
      if (res.data.success) {
        setSongs(res.data.songs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiked();
  }, []);

  const handleLikeToggle = async (songId) => {
    try {
      const res = await api.post(`/likes/${songId}`);
      if (res.data.success && !res.data.liked) {
        setSongs((prev) => prev.filter((s) => s.id !== songId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Liked Songs</h1>
          <p className="text-xs text-slate-400 mt-0.5">{songs.length} saved songs</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          You haven't liked any songs yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} onLikeToggle={handleLikeToggle} />
          ))}
        </div>
      )}
    </div>
  );
}