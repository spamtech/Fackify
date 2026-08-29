import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Activity,
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CopyCheck,
  Crown,
  Edit2,
  Eye,
  ExternalLink,
  Folder,
  Globe,
  Heart,
  KeyRound,
  ListMusic,
  Lock,
  Mail,
  MessageSquare,
  Mic2,
  Music2,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';

import api from '../api/axiosInstance';


// ============================================================
// DEFAULT IMAGES
// ============================================================

const defaultThumbnail =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80';

const defaultArtistImage =
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=500&q=80';


// ============================================================
// IST DATE / TIME HELPERS (UTC -> IST)
// ============================================================

const formatToIST = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';

  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDateIST = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};


// ============================================================
// ADMIN DASHBOARD
// ============================================================

const AdminDashboard = () => {

  const [activeTab, setActiveTab] = useState('songs');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [clearingMessages, setClearingMessages] = useState(false);

  const [stats, setStats] = useState({
    totalSongs: 0,
    totalUsers: 0,
    totalLikes: 0,
    totalPlaylists: 0,
    totalArtists: 0,
    totalMessages: 0,
  });

  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [users, setUsers] = useState([]);
  const [likesActivity, setLikesActivity] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');

  const [showSongModal, setShowSongModal] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [artistSearch, setArtistSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    sourceUrl: '',
    thumbnailUrl: '',
    artistIds: [],
  });

  const [showArtistModal, setShowArtistModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);

  const [artistFormData, setArtistFormData] = useState({
    name: '',
    imageUrl: '',
  });

  const [savingArtist, setSavingArtist] = useState(false);
  const [deletingArtistId, setDeletingArtistId] = useState(null);

  const [showArtistSongsModal, setShowArtistSongsModal] = useState(false);
  const [selectedArtistForSongs, setSelectedArtistForSongs] = useState(null);
  const [artistSongsList, setArtistSongsList] = useState([]);
  const [loadingArtistSongs, setLoadingArtistSongs] = useState(false);
  const [deletingModalSongId, setDeletingModalSongId] = useState(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [updatingPremiumUserId, setUpdatingPremiumUserId] = useState(null);

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [updatingPlaylistId, setUpdatingPlaylistId] = useState(null);

  const normalizeId = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim().toLowerCase();
  };

  const getArtistId = (artist) => {
    if (!artist) return '';
    if (typeof artist !== 'object') return artist;
    return artist.id ?? artist._id ?? artist.artist_id ?? artist.artistId ?? '';
  };

  const getArtistName = (artist) => {
    if (!artist) return 'Unknown Artist';
    if (typeof artist !== 'object') return String(artist);
    return artist.name ?? artist.artist_name ?? artist.artistName ?? artist.title ?? 'Unknown Artist';
  };

  const getArtistImage = (artist) => {
    if (!artist || typeof artist !== 'object') return defaultArtistImage;
    return (
      artist.image_url ??
      artist.imageUrl ??
      artist.artist_image_url ??
      artist.artistImageUrl ??
      artist.avatar_url ??
      artist.thumbnail_url ??
      defaultArtistImage
    );
  };

  const isUserPremium = (user) => {
    if (!user) return false;
    return Boolean(
      user.is_premium ??
      user.isPremium ??
      user.fackify_premium ??
      user.fackifyPremium ??
      user.fakeify_premium ??
      user.fakeifyPremium
    );
  };

  const getUserAvatar = (user) => {
    if (!user) return null;
    return (
      user.avatar_url ||
      user.avatar ||
      user.picture ||
      user.profilePic ||
      user.profile_pic ||
      null
    );
  };

  const getSongArtists = (song) => {
    if (!song) return [];
    if (Array.isArray(song.artists)) return song.artists;
    if (Array.isArray(song.song_artists)) return song.song_artists;
    if (Array.isArray(song.artist_list)) return song.artist_list;

    if (Array.isArray(song.artistIds)) {
      return song.artistIds.map((id) => {
        const found = artists.find(
          (artist) => normalizeId(getArtistId(artist)) === normalizeId(id)
        );
        return found || { id, name: 'Unknown Artist' };
      });
    }

    if (song.artist_id || song.artistId || song.artist?._id || song.artist?.id) {
      const id = song.artist_id ?? song.artistId ?? song.artist?._id ?? song.artist?.id;
      const found = artists.find(
        (artist) => normalizeId(getArtistId(artist)) === normalizeId(id)
      );
      return [found || { id, name: song.artist_name || song.artist?.name || song.artist || 'Unknown Artist' }];
    }

    if (song.artist_name || song.artist) {
      return [{ id: song.artist_name || song.artist, name: song.artist_name || song.artist }];
    }

    return [];
  };

  const getSongArtistNames = (song) => {
    const songArtists = getSongArtists(song);
    if (songArtists.length > 0) {
      return songArtists.map((artist) => getArtistName(artist));
    }
    if (song?.artist_name || song?.artist) {
      return [song.artist_name || song.artist];
    }
    return [];
  };

  const getCreatorName = (playlist) => {
    if (!playlist) return 'Unknown';
    return (
      playlist.creator_username ??
      playlist.username ??
      playlist.creator_name ??
      playlist.created_by_username ??
      'Unknown'
    );
  };

  const getPlaylistSongCount = (playlist) => {
    if (!playlist) return 0;
    return Number(
      playlist.song_count ??
      playlist.songs_count ??
      playlist.track_count ??
      (Array.isArray(playlist.songs) ? playlist.songs.length : 0)
    );
  };

  const getPlaylistSongs = (playlist) => {
    if (!playlist) return [];
    if (Array.isArray(playlist.songs)) return playlist.songs;
    if (Array.isArray(playlist.playlist_songs)) return playlist.playlist_songs;
    return [];
  };

  const getUserLastSeen = (user) => {
    if (!user) return null;
    return (
      user.last_active_at ??
      user.lastActiveAt ??
      user.last_seen ??
      user.last_seen_at ??
      user.lastSeen ??
      user.lastSeenAt ??
      user.updated_at ??
      null
    );
  };

  const getUserOnlineStatus = (user) => {
    const lastActive = getUserLastSeen(user);
    if (!lastActive) return false;

    const lastActiveTime = new Date(lastActive).getTime();
    if (Number.isNaN(lastActiveTime)) return false;

    const elapsed = Date.now() - lastActiveTime;
    return elapsed >= 0 && elapsed <= 2 * 60 * 1000;
  };

  const formatLastSeen = (value) => {
    if (!value) return 'Never';

    const time = new Date(value).getTime();
    if (Number.isNaN(time)) return 'Unknown';

    const diff = Date.now() - time;

    if (diff < 60 * 1000) return 'just now';
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    return formatDateIST(value);
  };

  const fetchAdminData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const results = await Promise.allSettled([
          api.get('/admin/stats'),
          api.get('/songs'),
          api.get('/admin/users'),
          api.get('/playlists/admin/all'),
          api.get('/admin/likes-activity'),
          api.get('/artists'),
          api.get('/contact/admin/messages'),
        ]);

        const [
          statsResult,
          songsResult,
          usersResult,
          playlistsResult,
          likesResult,
          artistsResult,
          messagesResult,
        ] = results;

        if (statsResult.status === 'fulfilled') {
          const data = statsResult.value?.data;

          setStats((prev) => ({
            ...prev,
            totalSongs: Number(
              data?.totalSongs ?? data?.stats?.totalSongs ?? data?.songs ?? 0
            ),
            totalUsers: Number(
              data?.totalUsers ?? data?.stats?.totalUsers ?? data?.users ?? 0
            ),
            totalLikes: Number(
              data?.totalLikes ?? data?.stats?.totalLikes ?? data?.likes ?? 0
            ),
            totalPlaylists: Number(
              data?.totalPlaylists ?? data?.stats?.totalPlaylists ?? data?.playlists ?? 0
            ),
            totalArtists: Number(
              data?.totalArtists ?? data?.stats?.totalArtists ?? data?.artists ?? 0
            ),
          }));
        }

        if (songsResult.status === 'fulfilled') {
          const data = songsResult.value?.data;
          const songList = Array.isArray(data)
            ? data
            : Array.isArray(data?.songs)
            ? data.songs
            : Array.isArray(data?.data)
            ? data.data
            : [];
          setSongs(songList);
        }

        if (usersResult.status === 'fulfilled') {
          const data = usersResult.value?.data;
          const userList = Array.isArray(data)
            ? data
            : Array.isArray(data?.users)
            ? data.users
            : Array.isArray(data?.data)
            ? data.data
            : [];
          setUsers(userList);
        }

        if (playlistsResult.status === 'fulfilled') {
          const data = playlistsResult.value?.data;
          const playlistList = Array.isArray(data)
            ? data
            : Array.isArray(data?.playlists)
            ? data.playlists
            : Array.isArray(data?.data)
            ? data.data
            : [];
          setPlaylists(playlistList);
        }

        if (likesResult.status === 'fulfilled') {
          const data = likesResult.value?.data;
          const likesList = Array.isArray(data)
            ? data
            : Array.isArray(data?.likes)
            ? data.likes
            : Array.isArray(data?.activity)
            ? data.activity
            : Array.isArray(data?.data)
            ? data.data
            : [];
          setLikesActivity(likesList);
        }

        if (artistsResult.status === 'fulfilled') {
          const data = artistsResult.value?.data;
          let artistList = [];

          if (Array.isArray(data)) {
            artistList = data;
          } else if (Array.isArray(data?.artists)) {
            artistList = data.artists;
          } else if (Array.isArray(data?.data)) {
            artistList = data.data;
          } else if (Array.isArray(data?.data?.artists)) {
            artistList = data.data.artists;
          }

          setArtists(artistList);
          setStats((prev) => ({
            ...prev,
            totalArtists: artistList.length,
          }));
        } else {
          setArtists([]);
        }

        if (messagesResult.status === 'fulfilled') {
          const mData = messagesResult.value?.data;
          const msgList = mData?.messages || (Array.isArray(mData) ? mData : []);
          setMessages(msgList);
          setUnreadCount(Number(mData?.unreadCount ?? msgList.filter((m) => !m.isRead).length));
          setStats((prev) => ({
            ...prev,
            totalMessages: msgList.length,
          }));
        }
      } catch (err) {
        console.error('Admin dashboard loading error:', err);
        setError(
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load admin dashboard data.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAdminData(true);
  }, [fetchAdminData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAdminData(false);
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchAdminData]);

  const [, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkMessageRead = async (messageId) => {
    try {
      await api.put(`/contact/admin/messages/${messageId}/read`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId || msg.id === messageId
            ? { ...msg, isRead: true }
            : msg
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark message as read:', err);
      alert('Failed to update message status.');
    }
  };

  // CLEAR ALL MESSAGES HANDLER
  const handleClearAllMessages = async () => {
    if (messages.length === 0) return;

    const confirmed = window.confirm(
      'Are you sure you want to permanently clear all messages? This cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setClearingMessages(true);
      await api.delete('/contact/admin/messages/clear');
      setMessages([]);
      setUnreadCount(0);
      setStats((prev) => ({
        ...prev,
        totalMessages: 0,
      }));
    } catch (err) {
      console.error('Failed to clear messages:', err);
      alert(err?.response?.data?.message || 'Failed to clear messages.');
    } finally {
      setClearingMessages(false);
    }
  };

  const filteredSongs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return songs;

    return songs.filter((song) => {
      const title = song.title || '';
      const artistsText = getSongArtistNames(song).join(' ');
      const source = song.source_url || song.sourceUrl || '';

      return (
        title.toLowerCase().includes(query) ||
        artistsText.toLowerCase().includes(query) ||
        source.toLowerCase().includes(query)
      );
    });
  }, [songs, searchTerm, artists]);

  const filteredArtists = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return artists;

    return artists.filter((artist) =>
      getArtistName(artist).toLowerCase().includes(query)
    );
  }, [artists, searchTerm]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      const username = user.username || '';
      const email = user.email || '';
      const role = user.role || '';

      return (
        username.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        role.toLowerCase().includes(query)
      );
    });
  }, [users, searchTerm]);

  const filteredLikes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return likesActivity;

    return likesActivity.filter((like) => {
      const username =
        like.username ||
        like.user_username ||
        like.user?.username ||
        '';

      const title =
        like.title ||
        like.song_title ||
        like.song?.title ||
        '';

      const artist =
        like.artist ||
        like.artist_name ||
        like.song?.artist ||
        '';

      return (
        username.toLowerCase().includes(query) ||
        title.toLowerCase().includes(query) ||
        artist.toLowerCase().includes(query)
      );
    });
  }, [likesActivity, searchTerm]);

  const filteredPlaylists = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return playlists;

    return playlists.filter((playlist) => {
      const name = playlist.name || '';
      const creator = getCreatorName(playlist);
      const description = playlist.description || '';

      return (
        name.toLowerCase().includes(query) ||
        creator.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query)
      );
    });
  }, [playlists, searchTerm]);

  const filteredMessages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return messages;

    return messages.filter((msg) => {
      const name = msg.name || '';
      const email = msg.email || '';
      const phone = msg.phone || '';
      const text = msg.message || '';

      return (
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query) ||
        text.toLowerCase().includes(query)
      );
    });
  }, [messages, searchTerm]);

  const filteredSongArtists = useMemo(() => {
    const query = artistSearch.trim().toLowerCase();
    const selectedIds = formData.artistIds.map(normalizeId);

    return artists.filter((artist) => {
      const id = normalizeId(getArtistId(artist));
      const name = getArtistName(artist).toLowerCase();

      if (selectedIds.includes(id)) return true;
      if (!query) return true;

      return name.includes(query);
    });
  }, [artists, artistSearch, formData.artistIds]);

  const selectedArtists = useMemo(() => {
    return formData.artistIds
      .map((id) =>
        artists.find(
          (artist) => normalizeId(getArtistId(artist)) === normalizeId(id)
        )
      )
      .filter(Boolean);
  }, [artists, formData.artistIds]);

  const duplicateTitleSet = useMemo(() => {
    const counts = {};
    artistSongsList.forEach((song) => {
      const normTitle = (song.title || '').trim().toLowerCase();
      if (normTitle) {
        counts[normTitle] = (counts[normTitle] || 0) + 1;
      }
    });

    const duplicates = new Set();
    Object.entries(counts).forEach(([title, count]) => {
      if (count > 1) duplicates.add(title);
    });

    return duplicates;
  }, [artistSongsList]);

  const tabs = useMemo(
    () => [
      { id: 'songs', label: 'Songs', icon: Music2 },
      { id: 'artists', label: 'Artists', icon: Mic2 },
      { id: 'likes', label: 'Likes', icon: Heart },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'playlists', label: 'Playlists', icon: ListMusic },
      {
        id: 'messages',
        label: 'Messages',
        icon: MessageSquare,
        badge: unreadCount,
      },
    ],
    [unreadCount]
  );

  const handleOpenAddSongModal = () => {
    setEditingSong(null);
    setFormData({
      title: '',
      sourceUrl: '',
      thumbnailUrl: '',
      artistIds: [],
    });
    setArtistSearch('');
    setShowSongModal(true);
  };

  const handleOpenEditModal = (song) => {
    const songArtists = getSongArtists(song);
    const artistIds = songArtists.map(getArtistId).filter(Boolean);

    setEditingSong(song);
    setFormData({
      title: song.title || '',
      sourceUrl: song.source_url || song.sourceUrl || '',
      thumbnailUrl: song.thumbnail_url || song.thumbnailUrl || '',
      artistIds,
    });
    setArtistSearch('');
    setShowSongModal(true);
  };

  const handleToggleSongArtist = (artistId) => {
    setFormData((prev) => {
      const exists = prev.artistIds.some(
        (id) => normalizeId(id) === normalizeId(artistId)
      );

      if (exists) {
        return {
          ...prev,
          artistIds: prev.artistIds.filter(
            (id) => normalizeId(id) !== normalizeId(artistId)
          ),
        };
      }

      return {
        ...prev,
        artistIds: [...prev.artistIds, artistId],
      };
    });
  };

  const handleRemoveSongArtist = (artistId) => {
    setFormData((prev) => ({
      ...prev,
      artistIds: prev.artistIds.filter(
        (id) => normalizeId(id) !== normalizeId(artistId)
      ),
    }));
  };

  const handleSaveSong = async (e) => {
    e.preventDefault();

    if (formData.artistIds.length === 0) {
      alert('Please select at least one artist.');
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        sourceUrl: formData.sourceUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim(),
        artistIds: formData.artistIds,
      };

      const songId = editingSong?.id || editingSong?._id;
      if (editingSong) {
        await api.put(`/songs/${songId}`, payload);
      } else {
        await api.post('/songs', payload);
      }

      setShowSongModal(false);
      setEditingSong(null);
      setArtistSearch('');
      await fetchAdminData(false);
    } catch (err) {
      console.error('Save song error:', err);
      alert(err?.response?.data?.message || 'Failed to save song.');
    }
  };

  const handleDeleteSong = async (songId) => {
    if (!songId) return;

    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this song?'
    );
    if (!confirmed) return;

    try {
      await api.delete(`/songs/${songId}`);
      await fetchAdminData(false);
    } catch (err) {
      console.error('Delete song error:', err);
      alert(err?.response?.data?.message || 'Failed to delete song.');
    }
  };

  const handleOpenArtistSongs = async (artist) => {
    const artistId = getArtistId(artist);
    if (!artistId) return;

    setSelectedArtistForSongs(artist);
    setShowArtistSongsModal(true);
    setLoadingArtistSongs(true);

    try {
      const res = await api.get(`/songs/artist/${artistId}`).catch(() => null);
      let list = [];

      if (res && res.data) {
        list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.songs)
          ? res.data.songs
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];
      } else {
        list = songs.filter((s) => {
          const currentArtists = getSongArtists(s);
          return currentArtists.some(
            (a) =>
              normalizeId(getArtistId(a)) === normalizeId(artistId) ||
              getArtistName(a).toLowerCase() === getArtistName(artist).toLowerCase()
          );
        });
      }

      setArtistSongsList(list);
    } catch (err) {
      console.error('Error fetching artist songs:', err);
      const fallbackList = songs.filter((s) => {
        const currentArtists = getSongArtists(s);
        return currentArtists.some(
          (a) =>
            normalizeId(getArtistId(a)) === normalizeId(artistId) ||
            getArtistName(a).toLowerCase() === getArtistName(artist).toLowerCase()
        );
      });
      setArtistSongsList(fallbackList);
    } finally {
      setLoadingArtistSongs(false);
    }
  };

  const handleDeleteArtistDuplicateSong = async (songId) => {
    if (!songId) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this duplicate song from the artist catalog?'
    );
    if (!confirmed) return;

    try {
      setDeletingModalSongId(songId);
      await api.delete(`/songs/${songId}`);

      setArtistSongsList((prev) =>
        prev.filter((s) => (s.id || s._id) !== songId)
      );

      await fetchAdminData(false);
    } catch (err) {
      console.error('Delete duplicate song error:', err);
      alert(err?.response?.data?.message || 'Failed to delete song.');
    } finally {
      setDeletingModalSongId(null);
    }
  };

  const closeArtistSongsModal = () => {
    setShowArtistSongsModal(false);
    setSelectedArtistForSongs(null);
    setArtistSongsList([]);
    setDeletingModalSongId(null);
  };

  const handleOpenAddArtistModal = () => {
    setEditingArtist(null);
    setArtistFormData({ name: '', imageUrl: '' });
    setShowArtistModal(true);
  };

  const handleOpenEditArtistModal = (artist) => {
    setEditingArtist(artist);
    setArtistFormData({
      name: getArtistName(artist),
      imageUrl: getArtistImage(artist),
    });
    setShowArtistModal(true);
  };

  const handleSaveArtist = async (e) => {
    e.preventDefault();

    if (!artistFormData.name.trim()) return;

    try {
      setSavingArtist(true);

      const payload = {
        name: artistFormData.name.trim(),
        imageUrl: artistFormData.imageUrl.trim(),
      };

      if (editingArtist) {
        const artistId = getArtistId(editingArtist);
        await api.put(`/artists/${artistId}`, payload);
      } else {
        await api.post('/artists', payload);
      }

      setShowArtistModal(false);
      setEditingArtist(null);
      setArtistFormData({ name: '', imageUrl: '' });
      await fetchAdminData(false);
    } catch (err) {
      console.error('Save artist error:', err);
      alert(err?.response?.data?.message || 'Failed to save artist.');
    } finally {
      setSavingArtist(false);
    }
  };

  const handleDeleteArtist = async (artist) => {
    const artistId = getArtistId(artist);
    if (!artistId) return;

    const artistName = getArtistName(artist);
    const confirmed = window.confirm(
      `Delete artist "${artistName}"? Existing song relationships may be affected.`
    );
    if (!confirmed) return;

    try {
      setDeletingArtistId(artistId);
      await api.delete(`/artists/${artistId}`);
      await fetchAdminData(false);
    } catch (err) {
      console.error('Delete artist error:', err);
      alert(err?.response?.data?.message || 'Failed to delete artist.');
    } finally {
      setDeletingArtistId(null);
    }
  };

  const handleInspectUser = async (userId) => {
    if (!userId) return;

    setShowUserModal(true);
    setLoadingUserDetail(true);
    setSelectedUserDetail(null);

    try {
      const response = await api.get(`/admin/users/${userId}/details`);
      setSelectedUserDetail(response.data?.data || response.data);
    } catch (err) {
      console.error('User details error:', err);
      alert(err?.response?.data?.message || 'Failed to load user details.');
      setShowUserModal(false);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const handleTogglePremium = async (user) => {
    if (!user?.id) return;

    const currentStatus = isUserPremium(user);
    const targetStatus = !currentStatus;
    const actionText = targetStatus ? 'Grant Fackify Premium to' : 'Revoke Fackify Premium from';

    const confirmed = window.confirm(
      `${actionText} "${user.username || 'this user'}"?`
    );
    if (!confirmed) return;

    try {
      setUpdatingPremiumUserId(user.id);

      await api.put(`/admin/users/${user.id}/premium`, {
        isPremium: targetStatus,
        is_premium: targetStatus,
      }).catch(async () => {
        await api.put(`/admin/users/${user.id}`, {
          is_premium: targetStatus,
        });
      });

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id
            ? {
                ...u,
                is_premium: targetStatus,
                isPremium: targetStatus,
                premium_requested: false,
              }
            : u
        )
      );

      setSelectedUserDetail((prev) => {
        if (!prev?.user || prev.user.id !== user.id) return prev;
        return {
          ...prev,
          user: {
            ...prev.user,
            is_premium: targetStatus,
            isPremium: targetStatus,
            premium_requested: false,
          },
        };
      });

      await fetchAdminData(false);
    } catch (err) {
      console.error('Failed to update premium status:', err);
      alert(err?.response?.data?.message || 'Failed to update premium subscription status.');
    } finally {
      setUpdatingPremiumUserId(null);
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    if (!userId) return;

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmed = window.confirm(`Change this user's role to ${newRole}?`);
    if (!confirmed) return;

    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      await fetchAdminData(false);
    } catch (err) {
      console.error('Toggle user role error:', err);
      alert(err?.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!user?.id) return;

    const confirmed = window.confirm(
      `Permanently delete user "${user.username}" and their data? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingUserId(user.id);
      await api.delete(`/admin/users/${user.id}`);
      await fetchAdminData(false);
    } catch (err) {
      console.error('Delete user error:', err);
      alert(err?.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleOpenPlaylist = async (playlist) => {
    if (!playlist?.id) return;

    setSelectedPlaylist(playlist);
    setShowPlaylistModal(true);
    setLoadingPlaylist(true);

    try {
      const response = await api.get(`/playlists/${playlist.id}`);
      const data = response.data?.data || response.data;
      setSelectedPlaylist(data?.playlist || data);
    } catch (err) {
      console.error('Playlist details error:', err);
      setSelectedPlaylist(playlist);
    } finally {
      setLoadingPlaylist(false);
    }
  };

  const closePlaylistModal = () => {
    setShowPlaylistModal(false);
    setSelectedPlaylist(null);
    setLoadingPlaylist(false);
  };

  const handleTogglePlaylistVisibility = async (playlist) => {
    if (!playlist?.id) return;

    const newVisibility = !Boolean(playlist.is_public);

    try {
      setUpdatingPlaylistId(playlist.id);

      await api.put(`/playlists/admin/${playlist.id}/visibility`, {
        isPublic: newVisibility,
      });

      setPlaylists((prev) =>
        prev.map((item) =>
          String(item.id) === String(playlist.id)
            ? { ...item, is_public: newVisibility }
            : item
        )
      );

      setSelectedPlaylist((prev) =>
        prev && String(prev.id) === String(playlist.id)
          ? { ...prev, is_public: newVisibility }
          : prev
      );

      await fetchAdminData(false);
    } catch (err) {
      console.error('Playlist visibility error:', err);
      alert(err?.response?.data?.message || 'Failed to update playlist visibility.');
    } finally {
      setUpdatingPlaylistId(null);
    }
  };

  const onlineUsers = useMemo(
    () => users.filter((user) => getUserOnlineStatus(user)).length,
    [users]
  );

  const offlineUsers = Math.max(users.length - onlineUsers, 0);

  const pendingPlaylists = playlists.filter(
    (playlist) => !Boolean(playlist.is_public)
  ).length;

  const publicPlaylists = playlists.filter(
    (playlist) => Boolean(playlist.is_public)
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-100">
                  Admin Dashboard
                </h1>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Manage songs, artists, users, subscriptions, likes, playlists, and user support inquiries.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-slate-400">Live Users</span>
              <span className="text-xs font-bold text-emerald-400">{onlineUsers}</span>
            </div>

            <button
              type="button"
              onClick={() => fetchAdminData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-300">Dashboard Error</p>
              <p className="text-[11px] text-rose-400/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            {
              label: 'Songs',
              value: stats.totalSongs,
              icon: Music2,
              color: 'text-teal-400',
              bg: 'bg-teal-500/10',
            },
            {
              label: 'Artists',
              value: stats.totalArtists,
              icon: Mic2,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
            },
            {
              label: 'Users',
              value: stats.totalUsers,
              icon: Users,
              color: 'text-sky-400',
              bg: 'bg-sky-500/10',
            },
            {
              label: 'Likes',
              value: stats.totalLikes,
              icon: Heart,
              color: 'text-rose-400',
              bg: 'bg-rose-500/10',
            },
            {
              label: 'Playlists',
              value: stats.totalPlaylists,
              icon: ListMusic,
              color: 'text-violet-400',
              bg: 'bg-violet-500/10',
            },
            {
              label: 'Inquiries',
              value: unreadCount > 0 ? `${unreadCount} new` : stats.totalMessages,
              icon: MessageSquare,
              color: unreadCount > 0 ? 'text-rose-400' : 'text-emerald-400',
              bg: unreadCount > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${item.bg}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                </div>

                <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold mt-3">
                  {item.label}
                </p>

                <p className="text-xl font-black text-slate-100 mt-0.5">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* TABS + SEARCH */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2 mb-5">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchTerm('');
                    }}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className="ml-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && !refreshing ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <RefreshCw className="w-7 h-7 text-amber-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-300">
              Loading admin dashboard...
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Fetching latest records.
            </p>
          </div>
        ) : (
          <>
            {/* SONGS TAB */}
            {activeTab === 'songs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-100">
                      Song Management
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Manage all uploaded tracks and artist relationships.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddSongModal}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Song
                  </button>
                </div>

                {filteredSongs.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 text-center">
                    <Music2 className="w-8 h-8 mx-auto text-slate-700 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-300">No songs found</h3>
                    <p className="text-xs text-slate-500 mt-1">Upload your first track to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSongs.map((song, index) => {
                      const songId = song.id || song._id;
                      return (
                        <div
                          key={songId || `${song.title}-${index}`}
                          className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 sm:p-4 transition"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={song.thumbnail_url || song.thumbnailUrl || defaultThumbnail}
                              alt=""
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-800 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-bold text-slate-100 truncate">
                                {song.title || 'Untitled Song'}
                              </h3>
                              <p className="text-[11px] text-slate-400 truncate mt-1">
                                {getSongArtistNames(song).join(', ') || 'Unknown Artist'}
                              </p>
                              <p className="text-[9px] text-slate-600 truncate mt-1">
                                {song.source_url || song.sourceUrl || 'No source'}
                              </p>
                            </div>

                            <div className="hidden md:flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(song)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition cursor-pointer"
                                title="Edit song"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSong(songId)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 transition cursor-pointer"
                                title="Delete song"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex md:hidden items-center justify-end gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(song)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-[10px] font-semibold cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSong(songId)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-[10px] font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ARTISTS TAB */}
            {activeTab === 'artists' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-100">Artist Management</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Manage artists, inspect their songs, and clean up duplicate tracks.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddArtistModal}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Artist
                  </button>
                </div>

                {filteredArtists.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 text-center">
                    <Mic2 className="w-8 h-8 mx-auto text-slate-700 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-300">No artists found</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredArtists.map((artist) => {
                      const artistId = getArtistId(artist);
                      const songCount = Number(
                        artist.song_count ??
                        artist.songs_count ??
                        artist.track_count ??
                        artist.songCount ??
                        0
                      );
                      const deleting = normalizeId(deletingArtistId) === normalizeId(artistId);

                      return (
                        <div
                          key={normalizeId(artistId)}
                          className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-3">
                              <img
                                src={getArtistImage(artist)}
                                alt=""
                                className="w-14 h-14 rounded-full object-cover border border-slate-700 shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = defaultArtistImage;
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-slate-100 truncate">
                                  {getArtistName(artist)}
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-1">{songCount} songs</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mt-4">
                            <button
                              type="button"
                              onClick={() => handleOpenArtistSongs(artist)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-bold transition cursor-pointer"
                            >
                              <ListMusic className="w-3.5 h-3.5" /> All Songs & Clean Duplicates
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditArtistModal(artist)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                type="button"
                                disabled={deleting}
                                onClick={() => handleDeleteArtist(artist)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                              >
                                {deleting ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LIKES TAB */}
            {activeTab === 'likes' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-rose-500/10 to-slate-900 border border-rose-500/10 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <Heart className="w-5 h-5 text-rose-400 fill-current" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-100">Likes Activity</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Monitor user song likes and activity.</p>
                    </div>
                  </div>
                </div>

                {filteredLikes.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 text-center">
                    <Heart className="w-8 h-8 mx-auto text-slate-700 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-300">No likes activity found</h3>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredLikes.map((like, index) => {
                      const username = like.username || like.user_username || like.user?.username || 'Unknown User';
                      const title = like.title || like.song_title || like.song?.title || 'Unknown Song';
                      const artist = like.artist || like.artist_name || like.song?.artist || 'Unknown Artist';
                      const thumbnail = like.thumbnail_url || like.song?.thumbnail_url || defaultThumbnail;
                      const likedAt = like.liked_at || like.created_at || like.createdAt;

                      return (
                        <div
                          key={like.id || `${username}-${title}-${index}`}
                          className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex items-center gap-3"
                        >
                          <img src={thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-100 truncate">{title}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{artist}</p>
                            <p className="text-[9px] text-sky-400 mt-1">@{username}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <Heart className="w-3.5 h-3.5 text-rose-400 fill-current ml-auto" />
                            <p className="text-[9px] text-slate-600 mt-1">{likedAt ? formatDateIST(likedAt) : ''}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">Online</span>
                    </div>
                    <p className="text-xl font-black text-emerald-400 mt-2">{onlineUsers}</p>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">Offline</span>
                    </div>
                    <p className="text-xl font-black text-slate-300 mt-2">{offlineUsers}</p>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-sky-400" />
                      <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">Total</span>
                    </div>
                    <p className="text-xl font-black text-slate-100 mt-2">{users.length}</p>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-emerald-400" />
                      <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">Premium</span>
                    </div>
                    <p className="text-xl font-black text-emerald-400 mt-2">
                      {users.filter((user) => isUserPremium(user)).length}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-slate-800">
                    <h2 className="text-base font-bold text-slate-100">User Activity & Membership</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Live online/offline status, account roles, and Fackify Premium approvals.
                    </p>
                  </div>

                  {filteredUsers.length === 0 ? (
                    <div className="py-16 text-center">
                      <Users className="w-8 h-8 mx-auto text-slate-700 mb-3" />
                      <h3 className="text-sm font-semibold text-slate-300">No users found</h3>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {filteredUsers.map((user) => {
                        const online = getUserOnlineStatus(user);
                        const lastSeen = getUserLastSeen(user);
                        const deleting = deletingUserId === user.id;
                        const premium = isUserPremium(user);
                        const isRequested = Boolean(user.premium_requested);
                        const updatingPremium = updatingPremiumUserId === user.id;
                        const isAdmin = user.role === 'admin';
                        const avatar = getUserAvatar(user);

                        return (
                          <div key={user.id} className="p-4 hover:bg-slate-950/50 transition">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="relative shrink-0">
                                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                                    {avatar ? (
                                      <img
                                        src={avatar}
                                        alt={user.username || 'User'}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            user.username || 'User'
                                          )}&background=1e293b&color=38bdf8&bold=true`;
                                        }}
                                      />
                                    ) : (
                                      <User className="w-5 h-5 text-slate-400" />
                                    )}
                                  </div>
                                  <span
                                    className={`absolute -right-0.5 -bottom-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                                      online ? 'bg-emerald-400' : 'bg-slate-600'
                                    }`}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-bold text-slate-100 truncate">
                                      @{user.username || 'Unknown'}
                                    </p>
                                    {!isAdmin && isRequested && !premium && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase tracking-wider animate-pulse">
                                        <Clock className="w-2.5 h-2.5" /> Request Pending
                                      </span>
                                    )}
                                    {premium && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                                        <Sparkles className="w-2.5 h-2.5" /> Fackify Premium
                                      </span>
                                    )}
                                    <div
                                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                                        online
                                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                          : 'bg-slate-800 border-slate-700 text-slate-500'
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                                        }`}
                                      />
                                      {online ? 'Online' : 'Offline'}
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-slate-500 truncate mt-1">
                                    {user.email || 'No email'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
                                  <p className="text-[8px] uppercase tracking-wider text-slate-600 font-bold">
                                    Last seen
                                  </p>
                                  <p
                                    className={`text-[10px] font-semibold mt-0.5 ${
                                      online ? 'text-emerald-400' : 'text-slate-400'
                                    }`}
                                  >
                                    {online ? 'Active now' : formatLastSeen(lastSeen)}
                                  </p>
                                </div>

                                <span
                                  className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-bold ${
                                    isAdmin
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                  }`}
                                >
                                  {user.role || 'user'}
                                </span>

                                {!isAdmin && (
                                  <button
                                    type="button"
                                    disabled={updatingPremium}
                                    onClick={() => handleTogglePremium(user)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                                      premium
                                        ? 'bg-emerald-500/15 hover:bg-rose-500/20 border border-emerald-500/30 hover:border-rose-500/40 text-emerald-300 hover:text-rose-300'
                                        : isRequested
                                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg ring-2 ring-amber-400/50 animate-pulse'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    }`}
                                  >
                                    {updatingPremium ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : premium ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : isRequested ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                                    ) : (
                                      <Sparkles className="w-3.5 h-3.5" />
                                    )}
                                    <span>
                                      {updatingPremium
                                        ? 'Updating...'
                                        : premium
                                        ? 'Premium Active'
                                        : isRequested
                                        ? 'Approve Request'
                                        : 'Approve Fackify Premium'}
                                    </span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleInspectUser(user.id)}
                                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-sky-400 transition cursor-pointer"
                                  title="Inspect user"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleUserRole(user.id, user.role)}
                                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition cursor-pointer"
                                  title="Change role"
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  disabled={deleting}
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 transition cursor-pointer disabled:opacity-50"
                                  title="Delete user"
                                >
                                  {deleting ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PLAYLIST MODERATION TAB */}
            {activeTab === 'playlists' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                        <ListMusic className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-100">Playlist Moderation</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Review user-created playlists before making them public.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500">Total</span>
                        <span className="ml-2 text-xs font-bold text-slate-200">{playlists.length}</span>
                      </div>
                      <div className="px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <span className="text-[10px] text-emerald-500/70">Public</span>
                        <span className="ml-2 text-xs font-bold text-emerald-400">{publicPlaylists}</span>
                      </div>
                      <div className="px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <span className="text-[10px] text-amber-500/70">Pending</span>
                        <span className="ml-2 text-xs font-bold text-amber-400">{pendingPlaylists}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {filteredPlaylists.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 text-center">
                    <div className="w-14 h-14 mx-auto bg-slate-800/60 rounded-2xl flex items-center justify-center mb-3">
                      <ListMusic className="w-7 h-7 text-slate-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-300">No playlists found</h3>
                    <p className="text-xs text-slate-500 mt-1">There are no playlists matching your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredPlaylists.map((playlist) => {
                      const creator = getCreatorName(playlist);
                      const songCount = getPlaylistSongCount(playlist);
                      const isPublic = Boolean(playlist.is_public);
                      const isUpdating = updatingPlaylistId === playlist.id;

                      return (
                        <div
                          key={playlist.id}
                          className="group bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition shadow-lg"
                        >
                          <div className={`h-1 ${isPublic ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-sky-500/10 border border-slate-700 flex items-center justify-center shrink-0">
                                  <ListMusic className="w-6 h-6 text-teal-400" />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-bold text-slate-100 text-sm truncate">
                                    {playlist.name || 'Untitled Playlist'}
                                  </h3>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <User className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="text-[11px] text-slate-400">Created by</span>
                                    <span className="text-[11px] font-semibold text-sky-400">@{creator}</span>
                                  </div>
                                </div>
                              </div>

                              <div
                                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                                  isPublic
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}
                              >
                                {isPublic ? (
                                  <>
                                    <Globe className="w-3.5 h-3.5" /> Public
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" /> Pending
                                  </>
                                )}
                              </div>
                            </div>

                            {playlist.description && (
                              <p className="text-[11px] text-slate-500 mt-3 line-clamp-2">
                                {playlist.description}
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-2 mt-4">
                              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                  <Music2 className="w-4 h-4 text-teal-400" />
                                  <div>
                                    <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">
                                      Songs
                                    </p>
                                    <p className="text-sm font-bold text-slate-200">{songCount}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                  {isPublic ? (
                                    <Globe className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-amber-400" />
                                  )}
                                  <div>
                                    <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">
                                      Visibility
                                    </p>
                                    <p className="text-sm font-bold text-slate-200">
                                      {isPublic ? 'Public' : 'Private'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                              <button
                                type="button"
                                onClick={() => handleOpenPlaylist(playlist)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> View All Songs
                              </button>

                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleTogglePlaylistVisibility(playlist)}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isPublic
                                    ? 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                }`}
                              >
                                {isUpdating ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : isPublic ? (
                                  <Lock className="w-3.5 h-3.5" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                {isUpdating ? 'Updating...' : isPublic ? 'Make Private' : 'Make Public'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MESSAGES TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900/60 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <MessageSquare className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-100">
                        User Inquiries & Support Messages
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Incoming contact form tickets submitted by users.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-xl text-slate-400">
                      Total: <strong className="text-white">{messages.length}</strong>
                    </span>
                    <span className="text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-1.5 rounded-xl font-bold">
                      Unread: {unreadCount}
                    </span>

                    {/* CLEAR ALL MESSAGES BUTTON */}
                    {messages.length > 0 && (
                      <button
                        type="button"
                        disabled={clearingMessages}
                        onClick={handleClearAllMessages}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        title="Delete all messages"
                      >
                        {clearingMessages ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>{clearingMessages ? 'Clearing...' : 'Clear All'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {filteredMessages.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 text-center">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-700 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-300">No messages found</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      No user inquiries match your search filter.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMessages.map((msg) => {
                      const msgId = msg._id || msg.id;
                      const isRead = Boolean(msg.isRead);

                      return (
                        <div
                          key={msgId}
                          className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                            isRead
                              ? 'bg-slate-900/50 border-slate-800 opacity-75'
                              : 'bg-slate-900 border-amber-500/40 shadow-lg'
                          }`}
                        >
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-slate-100">
                                {msg.name || 'Anonymous User'}
                              </span>
                              {!isRead && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/20 border border-rose-500/30 text-rose-300 animate-pulse">
                                  New Message
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 font-mono">
                                • {msg.createdAt || msg.created_at ? formatToIST(msg.createdAt || msg.created_at) : ''}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                                <a
                                  href={`mailto:${msg.email}`}
                                  className="hover:text-amber-400 underline"
                                >
                                  {msg.email}
                                </a>
                              </span>

                              {msg.phone && (
                                <span className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                                  <a
                                    href={`tel:${msg.phone}`}
                                    className="hover:text-amber-400"
                                  >
                                    {msg.phone}
                                  </a>
                                </span>
                              )}
                            </div>

                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                              {msg.message}
                            </div>
                          </div>

                          {!isRead && (
                            <button
                              type="button"
                              onClick={() => handleMarkMessageRead(msgId)}
                              className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 shrink-0 self-start cursor-pointer transition active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark as Read</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ARTIST SONGS MODAL */}
        {showArtistSongsModal && (
          <div className="fixed inset-0 z-[65] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-5 border-b border-slate-800 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getArtistImage(selectedArtistForSongs)}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border border-slate-700 shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = defaultArtistImage;
                      }}
                    />
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate">
                        {getArtistName(selectedArtistForSongs)}
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {artistSongsList.length} total songs found
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeArtistSongsModal}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {duplicateTitleSet.size > 0 && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      Potential duplicate songs detected with identical titles. You can safely remove extra entries below.
                    </span>
                  </div>
                )}
              </div>

              <div className="overflow-y-auto p-5 flex-1">
                {loadingArtistSongs ? (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <RefreshCw className="w-7 h-7 text-amber-400 animate-spin mb-3" />
                    <p className="text-sm font-semibold text-slate-300">Loading artist songs...</p>
                    <p className="text-xs text-slate-500 mt-1">Scanning song database for duplicates.</p>
                  </div>
                ) : artistSongsList.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-14 h-14 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
                      <Music2 className="w-7 h-7 text-slate-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-300">No songs found for this artist</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      No songs are currently associated with {getArtistName(selectedArtistForSongs)}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {artistSongsList.map((song, index) => {
                      const songId = song.id || song._id;
                      const normTitle = (song.title || '').trim().toLowerCase();
                      const isDuplicate = duplicateTitleSet.has(normTitle);
                      const isDeleting = deletingModalSongId === songId;

                      return (
                        <div
                          key={songId || index}
                          className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                            isDuplicate
                              ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={song.thumbnail_url || song.thumbnailUrl || defaultThumbnail}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-xs sm:text-sm text-slate-100 truncate">
                                  {song.title || 'Untitled Song'}
                                </p>
                                {isDuplicate && (
                                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-[9px] font-bold text-rose-400">
                                    <CopyCheck className="w-2.5 h-2.5" /> Duplicate
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {song.source_url || song.sourceUrl || 'No source URL'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {song.source_url && (
                              <a
                                href={song.source_url}
                                target="_blank"
                                rel="noreferrer"
                                title="Open source"
                                className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDeleteArtistDuplicateSong(songId)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold cursor-pointer disabled:opacity-50"
                            >
                              {isDeleting ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between gap-3 shrink-0">
                <div className="text-[10px] text-slate-500">
                  Deleting a track removes it completely from songs and playlists.
                </div>
                <button
                  type="button"
                  onClick={closeArtistSongsModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* USER INSPECTOR MODAL */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUserDetail(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-amber-400" />
                User Record & Activity Inspector
              </h3>

              {loadingUserDetail || !selectedUserDetail ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
                  <p className="text-xs text-slate-400">Loading user records...</p>
                </div>
              ) : (
                <div className="space-y-6 text-xs">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                      {getUserAvatar(selectedUserDetail.user) ? (
                        <img
                          src={getUserAvatar(selectedUserDetail.user)}
                          alt={selectedUserDetail.user?.username || 'User'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              selectedUserDetail.user?.username || 'User'
                            )}&background=1e293b&color=38bdf8&bold=true`;
                          }}
                        />
                      ) : (
                        <User className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-white truncate">
                        {selectedUserDetail.user?.username}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {selectedUserDetail.user?.email}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 uppercase">
                        {selectedUserDetail.user?.role || 'user'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold">Email:</span>
                        <span className="text-slate-100 break-all">
                          {selectedUserDetail.user?.email}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-300">
                        <Users className="w-4 h-4 text-sky-400" />
                        <span className="font-semibold">Username:</span>
                        <span className="text-slate-100">{selectedUserDetail.user?.username}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-300">
                        <Crown className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold">Membership:</span>
                        <span
                          className={`font-bold ${
                            isUserPremium(selectedUserDetail.user)
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {isUserPremium(selectedUserDetail.user)
                            ? 'Fackify Premium'
                            : 'Free Tier'}
                        </span>
                      </div>

                      {Boolean(selectedUserDetail.user?.premium_requested) &&
                        !isUserPremium(selectedUserDetail.user) && (
                          <div className="flex items-center gap-2 text-amber-400 font-semibold">
                            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                            <span>Fackify Premium Request Pending</span>
                          </div>
                        )}

                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold">Registered:</span>
                        <span className="text-slate-100">
                          {selectedUserDetail.user?.created_at
                            ? formatToIST(selectedUserDetail.user.created_at)
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div className="border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-4">
                      <div className="flex items-center gap-2 text-slate-300 mb-2">
                        <KeyRound className="w-4 h-4 text-rose-400" />
                        <span className="font-semibold">Password Security</span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded p-3 text-[10px] text-slate-500">
                        Password credentials are protected using a secure one-way password hash.
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-200 text-sm mb-2 flex items-center gap-1.5">
                      <Folder className="w-4 h-4 text-teal-400" />
                      Created Playlists ({selectedUserDetail.playlists?.length || 0})
                    </h4>
                    {selectedUserDetail.playlists?.length === 0 ? (
                      <p className="text-slate-500 italic bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        No playlists created by this user yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedUserDetail.playlists.map((playlist) => (
                          <div
                            key={playlist.id}
                            className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold text-slate-100">{playlist.name}</p>
                              <p className="text-[10px] text-slate-400">
                                {playlist.song_count || 0} songs · {playlist.is_public ? 'Public' : 'Private'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-200 text-sm mb-2 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-500 fill-current" />
                      Liked Songs ({selectedUserDetail.likedSongs?.length || 0})
                    </h4>
                    {selectedUserDetail.likedSongs?.length === 0 ? (
                      <p className="text-slate-500 italic bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        No liked songs in user history.
                      </p>
                    ) : (
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                        {selectedUserDetail.likedSongs.map((song) => (
                          <div
                            key={song.id}
                            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={song.thumbnail_url || defaultThumbnail}
                                alt=""
                                className="w-8 h-8 rounded object-cover"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-100 truncate">{song.title}</p>
                                <p className="text-[10px] text-slate-400 truncate">{song.artist}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {song.liked_at ? formatDateIST(song.liked_at) : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PLAYLIST INSPECTOR MODAL */}
        {showPlaylistModal && (
          <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-5 border-b border-slate-800 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                      <ListMusic className="w-6 h-6 text-teal-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate">
                        {selectedPlaylist?.name || 'Playlist'}
                      </h2>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[11px] text-slate-500">Created by</span>
                        <span className="text-[11px] font-semibold text-sky-400">
                          @{getCreatorName(selectedPlaylist)}
                        </span>
                        <span className="text-slate-700">•</span>
                        <span className="text-[11px] text-slate-500">
                          {getPlaylistSongCount(selectedPlaylist)} songs
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closePlaylistModal}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 mt-4">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${
                      selectedPlaylist?.is_public
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}
                  >
                    {selectedPlaylist?.is_public ? (
                      <>
                        <Globe className="w-3.5 h-3.5" /> Public Playlist
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Awaiting Admin Approval
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={updatingPlaylistId === selectedPlaylist?.id}
                    onClick={() => handleTogglePlaylistVisibility(selectedPlaylist)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                      selectedPlaylist?.is_public
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {updatingPlaylistId === selectedPlaylist?.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : selectedPlaylist?.is_public ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {selectedPlaylist?.is_public ? 'Make Private' : 'Make Public'}
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-5">
                {loadingPlaylist ? (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <RefreshCw className="w-7 h-7 text-teal-400 animate-spin mb-3" />
                    <p className="text-sm font-semibold text-slate-300">Loading playlist songs...</p>
                    <p className="text-xs text-slate-500 mt-1">Inspecting every track in this playlist.</p>
                  </div>
                ) : (() => {
                  const playlistSongs = getPlaylistSongs(selectedPlaylist);
                  if (playlistSongs.length === 0) {
                    return (
                      <div className="py-16 text-center">
                        <div className="w-14 h-14 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
                          <Music2 className="w-7 h-7 text-slate-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-300">No songs in this playlist</h3>
                        <p className="text-xs text-slate-500 mt-1">This playlist currently contains no tracks.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {playlistSongs.map((song, index) => {
                        const songData = song.song || song;
                        return (
                          <div
                            key={songData.id || `${selectedPlaylist?.id}-${index}`}
                            className="group bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 text-center shrink-0">
                                <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-400">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                              </div>
                              <img
                                src={songData.thumbnail_url || songData.thumbnailUrl || defaultThumbnail}
                                alt={songData.title || 'Song'}
                                className="w-11 h-11 rounded-lg object-cover border border-slate-800 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-100 text-xs sm:text-sm truncate">
                                  {songData.title || 'Untitled Song'}
                                </p>
                                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                                  {getSongArtistNames(songData).join(', ') ||
                                    songData.artist ||
                                    'Unknown Artist'}
                                </p>
                              </div>

                              <div className="hidden sm:block shrink-0">
                                <span className="capitalize px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] text-slate-500">
                                  {songData.source_type || 'direct'}
                                </span>
                              </div>

                              {songData.source_url && (
                                <a
                                  href={songData.source_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Open source"
                                  className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Review playlist songs before approving it.</span>
                </div>
                <button
                  type="button"
                  onClick={closePlaylistModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD / EDIT SONG MODAL */}
        {showSongModal && (
          <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => {
                  setShowSongModal(false);
                  setEditingSong(null);
                  setArtistSearch('');
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-100 mb-1">
                {editingSong ? 'Edit Track Details' : 'Add New Track'}
              </h3>
              <p className="text-[11px] text-slate-500 mb-5">
                Select one or more existing artists for this song.
              </p>

              <form onSubmit={handleSaveSong} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Song Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g. Tum Hi Ho"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-400 font-semibold">Artists *</label>
                    <span className="text-[10px] text-slate-600">
                      {formData.artistIds.length} selected
                    </span>
                  </div>

                  {selectedArtists.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedArtists.map((artist) => {
                        const artistId = getArtistId(artist);
                        return (
                          <div
                            key={normalizeId(artistId)}
                            className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl px-2 py-1"
                          >
                            <img
                              src={getArtistImage(artist)}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-[10px] font-semibold">{getArtistName(artist)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSongArtist(artistId)}
                              className="ml-0.5 text-amber-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={artistSearch}
                      onChange={(e) => setArtistSearch(e.target.value)}
                      placeholder="Search existing artists..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="mt-2 max-h-44 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl">
                    {filteredSongArtists.length === 0 ? (
                      <div className="p-4 text-center">
                        <Mic2 className="w-5 h-5 mx-auto text-slate-600 mb-2" />
                        <p className="text-[10px] text-slate-500">No artists found.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSongModal(false);
                            setShowArtistModal(true);
                            setEditingArtist(null);
                            setArtistFormData({
                              name: artistSearch,
                              imageUrl: '',
                            });
                          }}
                          className="mt-2 text-[10px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                        >
                          + Create Artist
                        </button>
                      </div>
                    ) : (
                      filteredSongArtists.map((artist) => {
                        const artistId = getArtistId(artist);
                        const normalizedId = normalizeId(artistId);
                        const selected = formData.artistIds.some(
                          (id) => normalizeId(id) === normalizedId
                        );

                        return (
                          <button
                            key={normalizedId}
                            type="button"
                            onClick={() => handleToggleSongArtist(artistId)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition cursor-pointer ${
                              selected ? 'bg-amber-500/10' : 'hover:bg-slate-900'
                            }`}
                          >
                            <img
                              src={getArtistImage(artist)}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-800 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-200 truncate">
                                {getArtistName(artist)}
                              </p>
                              <p className="text-[9px] text-slate-500">
                                {Number(
                                  artist.song_count ??
                                  artist.songs_count ??
                                  artist.track_count ??
                                  0
                                )}{' '}
                                songs
                              </p>
                            </div>
                            {selected && (
                              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {artists.length === 0 && (
                    <div className="mt-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                      <p className="text-[10px] text-amber-400">
                        No artists exist yet. Create an artist first.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSongModal(false);
                          handleOpenAddArtistModal();
                        }}
                        className="mt-2 text-[10px] font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                      >
                        + Add Artist
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Source URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.sourceUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sourceUrl: e.target.value,
                      })
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Thumbnail Artwork URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.thumbnailUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thumbnailUrl: e.target.value,
                      })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSongModal(false);
                      setEditingSong(null);
                      setArtistSearch('');
                    }}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={formData.artistIds.length === 0}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingSong ? 'Save Changes' : 'Publish Track'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD / EDIT ARTIST MODAL */}
        {showArtistModal && (
          <div className="fixed inset-0 z-[80] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => {
                  setShowArtistModal(false);
                  setEditingArtist(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Mic2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    {editingArtist ? 'Edit Artist' : 'Add Artist'}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Artist information will be reused across songs.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveArtist} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Artist Name *</label>
                  <input
                    type="text"
                    required
                    value={artistFormData.name}
                    onChange={(e) =>
                      setArtistFormData({
                        ...artistFormData,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Arijit Singh"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Artist Image URL *</label>
                  <input
                    type="url"
                    required
                    value={artistFormData.imageUrl}
                    onChange={(e) =>
                      setArtistFormData({
                        ...artistFormData,
                        imageUrl: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {artistFormData.imageUrl && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={artistFormData.imageUrl}
                        alt="Artist preview"
                        className="w-16 h-16 rounded-full object-cover border border-slate-800"
                        onError={(e) => {
                          e.currentTarget.src = defaultArtistImage;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">
                          Preview
                        </p>
                        <p className="text-sm font-bold text-slate-200 truncate">
                          {artistFormData.name || 'Artist Name'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowArtistModal(false);
                      setEditingArtist(null);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingArtist}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingArtist && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    {savingArtist ? 'Saving...' : editingArtist ? 'Save Changes' : 'Create Artist'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;