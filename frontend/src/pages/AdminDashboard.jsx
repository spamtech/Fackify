import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosInstance';

import {
  Users,
  Music2,
  ListMusic,
  Plus,
  Edit2,
  Trash2,
  Search,
  Shield,
  RefreshCw,
  X,
  Eye,
  Heart,
  KeyRound,
  Mail,
  Calendar,
  Folder,
  Clock,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  User,
  ExternalLink,
  Mic2,
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('songs');

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSongs: 0,
    totalPlaylists: 0,
    totalLikes: 0,
  });

  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [likesActivity, setLikesActivity] = useState([]);
  const [artists, setArtists] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // ============================================================
  // USER INSPECTOR
  // ============================================================

  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // ============================================================
  // USER DELETE
  // ============================================================

  const [deletingUserId, setDeletingUserId] = useState(null);

  // ============================================================
  // SONG MODAL
  // ============================================================

  const [showSongModal, setShowSongModal] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    artistIds: [],
    sourceUrl: '',
    thumbnailUrl: '',
  });

  const [artistSearch, setArtistSearch] = useState('');

  // ============================================================
  // ARTIST MODAL
  // ============================================================

  const [showArtistModal, setShowArtistModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);

  const [artistFormData, setArtistFormData] = useState({
    name: '',
    imageUrl: '',
  });

  const [savingArtist, setSavingArtist] = useState(false);
  const [deletingArtistId, setDeletingArtistId] = useState(null);

  // ============================================================
  // PLAYLIST MODERATION
  // ============================================================

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [updatingPlaylistId, setUpdatingPlaylistId] = useState(null);

  // ============================================================
  // HELPERS
  // ============================================================

  const defaultThumbnail =
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';

  const defaultArtistImage =
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300';

  // ------------------------------------------------------------
  // Generic ID normalization
  // ------------------------------------------------------------

  const normalizeId = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    if (typeof value === 'object') {
      return normalizeId(
        value.id ??
          value.artist_id ??
          value.artistId
      );
    }

    return String(value);
  };

  // ------------------------------------------------------------
  // Playlist helpers
  // ------------------------------------------------------------

  const getPlaylistSongs = (playlist) => {
    if (!playlist) return [];

    if (Array.isArray(playlist.songs)) {
      return playlist.songs;
    }

    if (Array.isArray(playlist.playlist_songs)) {
      return playlist.playlist_songs;
    }

    if (Array.isArray(playlist.tracks)) {
      return playlist.tracks;
    }

    return [];
  };

  const getPlaylistSongCount = (playlist) => {
    const songsInside = getPlaylistSongs(playlist);

    if (songsInside.length > 0) {
      return songsInside.length;
    }

    return Number(
      playlist?.song_count ??
        playlist?.songs_count ??
        playlist?.track_count ??
        0
    );
  };

  const getCreatorName = (playlist) => {
    return (
      playlist?.creator_username ||
      playlist?.username ||
      playlist?.created_by_username ||
      playlist?.owner_username ||
      'User'
    );
  };

  // ============================================================
  // ARTIST HELPERS
  // ============================================================

  const getArtistId = (artist) => {
    if (
      artist === null ||
      artist === undefined
    ) {
      return null;
    }

    if (
      typeof artist === 'string' ||
      typeof artist === 'number'
    ) {
      return artist;
    }

    return (
      artist.id ??
      artist.artist_id ??
      artist.artistId ??
      null
    );
  };

  const getArtistName = (artist) => {
    if (
      artist === null ||
      artist === undefined
    ) {
      return 'Unknown Artist';
    }

    if (
      typeof artist === 'string' ||
      typeof artist === 'number'
    ) {
      return String(artist);
    }

    return (
      artist.name ||
      artist.artist_name ||
      artist.artistName ||
      'Unknown Artist'
    );
  };

  const getArtistImage = (artist) => {
    if (!artist || typeof artist !== 'object') {
      return defaultArtistImage;
    }

    return (
      artist.image_url ||
      artist.imageUrl ||
      artist.artist_image_url ||
      artist.artistImageUrl ||
      defaultArtistImage
    );
  };

  // ============================================================
  // SONG ARTIST HELPERS
  // ============================================================

  const getSongArtists = (song) => {
    if (!song) return [];

    if (Array.isArray(song.artists)) {
      return song.artists;
    }

    if (Array.isArray(song.song_artists)) {
      return song.song_artists;
    }

    if (Array.isArray(song.artist_list)) {
      return song.artist_list;
    }

    if (Array.isArray(song.artistList)) {
      return song.artistList;
    }

    return [];
  };

  const getSongArtistIds = (song) => {
    if (!song) return [];

    const songArtists = getSongArtists(song);

    if (songArtists.length > 0) {
      return songArtists
        .map((artist) =>
          normalizeId(getArtistId(artist))
        )
        .filter(Boolean);
    }

    const possibleIds = [
      song.artist_ids,
      song.artistIds,
    ];

    for (const ids of possibleIds) {
      if (Array.isArray(ids)) {
        const normalized = ids
          .map((id) => normalizeId(id))
          .filter(Boolean);

        if (normalized.length > 0) {
          return normalized;
        }
      }
    }

    if (song.artist_id !== undefined) {
      const id = normalizeId(song.artist_id);

      if (id) {
        return [id];
      }
    }

    if (song.artistId !== undefined) {
      const id = normalizeId(song.artistId);

      if (id) {
        return [id];
      }
    }

    return [];
  };

  const getSongArtistNames = (song) => {
    if (!song) return [];

    const songArtists = getSongArtists(song);

    if (songArtists.length > 0) {
      return songArtists
        .map((artist) =>
          getArtistName(artist)
        )
        .filter(Boolean);
    }

    if (Array.isArray(song.artist_names)) {
      return song.artist_names
        .map((name) => String(name))
        .filter(Boolean);
    }

    if (Array.isArray(song.artistNames)) {
      return song.artistNames
        .map((name) => String(name))
        .filter(Boolean);
    }

    if (song.artist) {
      return [song.artist];
    }

    // ----------------------------------------------------------
    // Fallback:
    // If backend returns only artist IDs, resolve them against
    // the loaded artist collection.
    // ----------------------------------------------------------

    const ids = getSongArtistIds(song);

    if (ids.length > 0) {
      return ids
        .map((id) => {
          const foundArtist = artists.find(
            (artist) =>
              normalizeId(
                getArtistId(artist)
              ) === normalizeId(id)
          );

          return foundArtist
            ? getArtistName(foundArtist)
            : null;
        })
        .filter(Boolean);
    }

    return [];
  };

  // ============================================================
  // FETCH ADMIN DATA
  // ============================================================

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [
        statsRes,
        songsRes,
        usersRes,
        playlistsRes,
        likesRes,
        artistsRes,
      ] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/songs'),
        api.get('/admin/users'),
        api.get('/playlists/admin/all'),
        api.get('/admin/likes-activity'),
        api.get('/artists'),
      ]);

      // -----------------------------
      // STATS
      // -----------------------------

      if (
        statsRes.status === 'fulfilled' &&
        statsRes.value?.data?.success
      ) {
        setStats(
          statsRes.value.data.stats || {
            totalUsers: 0,
            totalSongs: 0,
            totalPlaylists: 0,
            totalLikes: 0,
          }
        );
      }

      // -----------------------------
      // SONGS
      // -----------------------------

      if (
        songsRes.status === 'fulfilled' &&
        songsRes.value?.data?.success
      ) {
        setSongs(
          Array.isArray(
            songsRes.value.data.songs
          )
            ? songsRes.value.data.songs
            : []
        );
      }

      // -----------------------------
      // USERS
      // -----------------------------

      if (
        usersRes.status === 'fulfilled' &&
        usersRes.value?.data?.success
      ) {
        setUsers(
          Array.isArray(
            usersRes.value.data.users
          )
            ? usersRes.value.data.users
            : []
        );
      }

      // -----------------------------
      // PLAYLISTS
      // -----------------------------

      if (
        playlistsRes.status === 'fulfilled' &&
        playlistsRes.value?.data?.success
      ) {
        setPlaylists(
          Array.isArray(
            playlistsRes.value.data.playlists
          )
            ? playlistsRes.value.data.playlists
            : []
        );
      }

      // -----------------------------
      // LIKES
      // -----------------------------

      if (
        likesRes.status === 'fulfilled' &&
        likesRes.value?.data?.success
      ) {
        setLikesActivity(
          Array.isArray(
            likesRes.value.data.likes
          )
            ? likesRes.value.data.likes
            : []
        );
      }

      // -----------------------------
      // ARTISTS
      // -----------------------------

      if (
        artistsRes.status === 'fulfilled' &&
        artistsRes.value?.data?.success
      ) {
        setArtists(
          Array.isArray(
            artistsRes.value.data.artists
          )
            ? artistsRes.value.data.artists
            : []
        );
      }
    } catch (err) {
      console.error(
        'Failed to load admin data:',
        err
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // ============================================================
  // USER INSPECTOR
  // ============================================================

  const handleInspectUser = async (userId) => {
    try {
      setLoadingUserDetail(true);
      setSelectedUserDetail(null);
      setShowUserModal(true);

      const res = await api.get(
        `/admin/users/${userId}/details`
      );

      if (res.data?.success) {
        setSelectedUserDetail(res.data);
      }
    } catch (err) {
      console.error(
        'Failed to inspect user:',
        err
      );

      alert(
        err.response?.data?.message ||
          'Failed to load detailed user information'
      );

      setShowUserModal(false);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  // ============================================================
  // DELETE USER
  // ============================================================

  const handleDeleteUser = async (user) => {
    if (!user?.id) return;

    if (user.role === 'admin') {
      alert(
        'Admin accounts cannot be deleted from this dashboard.'
      );
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Delete "${user.username}" permanently?\n\n` +
        `This will delete:\n` +
        `• Their account\n` +
        `• Their playlists\n` +
        `• Songs inside their playlists\n` +
        `• Their likes\n\n` +
        `The actual platform songs will NOT be deleted.\n\n` +
        `This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingUserId(user.id);

      const res = await api.delete(
        `/admin/users/${user.id}`
      );

      if (!res.data?.success) {
        throw new Error(
          res.data?.message ||
            'Failed to delete user'
        );
      }

      setUsers((prev) =>
        prev.filter(
          (item) => item.id !== user.id
        )
      );

      if (
        selectedUserDetail?.user?.id === user.id
      ) {
        setShowUserModal(false);
        setSelectedUserDetail(null);
      }

      await fetchAdminData();

      alert(
        res.data.message ||
          `User "${user.username}" deleted successfully.`
      );
    } catch (err) {
      console.error(
        'Failed to delete user:',
        err
      );

      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to delete user'
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  // ============================================================
  // SONG MANAGEMENT
  // ============================================================

  const handleOpenAddModal = () => {
    setEditingSong(null);

    setFormData({
      title: '',
      artistIds: [],
      sourceUrl: '',
      thumbnailUrl: '',
    });

    setArtistSearch('');
    setShowSongModal(true);
  };

  const handleOpenEditModal = (song) => {
    const artistIds = getSongArtistIds(song);

    setEditingSong(song);

    setFormData({
      title: song.title || '',
      artistIds,
      sourceUrl:
        song.source_url ||
        song.sourceUrl ||
        '',
      thumbnailUrl:
        song.thumbnail_url ||
        song.thumbnailUrl ||
        '',
    });

    setArtistSearch('');
    setShowSongModal(true);
  };

  // ============================================================
  // IMPORTANT:
  // Always compare artist IDs as strings.
  // PostgreSQL may return integer IDs while React form values
  // may contain strings.
  // ============================================================

  const handleToggleSongArtist = (artistId) => {
    const normalizedId =
      normalizeId(artistId);

    if (!normalizedId) return;

    setFormData((prev) => {
      const currentIds = Array.isArray(
        prev.artistIds
      )
        ? prev.artistIds
            .map(normalizeId)
            .filter(Boolean)
        : [];

      const exists = currentIds.some(
        (id) =>
          normalizeId(id) === normalizedId
      );

      return {
        ...prev,
        artistIds: exists
          ? currentIds.filter(
              (id) =>
                normalizeId(id) !==
                normalizedId
            )
          : [...currentIds, normalizedId],
      };
    });
  };

  const handleRemoveSongArtist = (artistId) => {
    const normalizedId =
      normalizeId(artistId);

    setFormData((prev) => ({
      ...prev,
      artistIds: prev.artistIds.filter(
        (id) =>
          normalizeId(id) !== normalizedId
      ),
    }));
  };

  // ============================================================
  // SAVE SONG
  // ============================================================

  const handleSaveSong = async (e) => {
    e.preventDefault();

    const normalizedArtistIds = Array.isArray(
      formData.artistIds
    )
      ? formData.artistIds
          .map(normalizeId)
          .filter(Boolean)
      : [];

    if (normalizedArtistIds.length === 0) {
      alert(
        'Please select at least one artist.'
      );
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),

        // Primary expected field
        artistIds: normalizedArtistIds,

        // Keep source field names used by your
        // current backend.
        sourceUrl: formData.sourceUrl.trim(),
        thumbnailUrl:
          formData.thumbnailUrl.trim(),
      };

      console.log(
        'Saving song with artist IDs:',
        normalizedArtistIds
      );

      let savedSong = null;

      if (editingSong) {
        const res = await api.put(
          `/songs/${editingSong.id}`,
          payload
        );

        if (!res.data?.success) {
          throw new Error(
            res.data?.message ||
              'Failed to update song'
          );
        }

        savedSong =
          res.data.song ||
          res.data.data ||
          null;
      } else {
        const res = await api.post(
          '/songs',
          payload
        );

        if (!res.data?.success) {
          throw new Error(
            res.data?.message ||
              'Failed to create song'
          );
        }

        savedSong =
          res.data.song ||
          res.data.data ||
          null;
      }

      // --------------------------------------------------------
      // Close/reset modal
      // --------------------------------------------------------

      setShowSongModal(false);
      setEditingSong(null);

      setFormData({
        title: '',
        artistIds: [],
        sourceUrl: '',
        thumbnailUrl: '',
      });

      setArtistSearch('');

      // --------------------------------------------------------
      // IMPORTANT:
      // Reload songs + artists from backend.
      //
      // This prevents the UI from displaying a stale song
      // object that doesn't contain the artist relationship.
      // --------------------------------------------------------

      await fetchAdminData();
    } catch (err) {
      console.error(
        'Failed to save song:',
        err
      );

      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to save track'
      );
    }
  };

  // ============================================================
  // DELETE SONG
  // ============================================================

  const handleDeleteSong = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this track?'
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(
        `/songs/${id}`
      );

      if (res.data?.success === false) {
        throw new Error(
          res.data?.message ||
            'Failed to delete track'
        );
      }

      setSongs((prev) =>
        prev.filter(
          (song) => song.id !== id
        )
      );
    } catch (err) {
      console.error(
        'Failed to delete song:',
        err
      );

      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to delete track'
      );
    }
  };

  // ============================================================
  // ARTIST MANAGEMENT
  // ============================================================

  const handleOpenAddArtistModal = () => {
    setEditingArtist(null);

    setArtistFormData({
      name: '',
      imageUrl: '',
    });

    setShowArtistModal(true);
  };

  const handleOpenEditArtistModal = (artist) => {
    setEditingArtist(artist);

    setArtistFormData({
      name: getArtistName(artist),
      imageUrl:
        artist?.image_url ||
        artist?.imageUrl ||
        artist?.artist_image_url ||
        artist?.artistImageUrl ||
        '',
    });

    setShowArtistModal(true);
  };

  const handleSaveArtist = async (e) => {
    e.preventDefault();

    const name =
      artistFormData.name.trim();

    const imageUrl =
      artistFormData.imageUrl.trim();

    if (!name) {
      alert('Artist name is required.');
      return;
    }

    if (!imageUrl) {
      alert('Artist image URL is required.');
      return;
    }

    try {
      setSavingArtist(true);

      const payload = {
        name,
        imageUrl,
      };

      if (editingArtist) {
        const artistId =
          getArtistId(editingArtist);

        if (!artistId) {
          throw new Error(
            'Invalid artist ID.'
          );
        }

        const res = await api.put(
          `/artists/${artistId}`,
          payload
        );

        if (!res.data?.success) {
          throw new Error(
            res.data?.message ||
              'Failed to update artist'
          );
        }
      } else {
        const res = await api.post(
          '/artists',
          payload
        );

        if (!res.data?.success) {
          throw new Error(
            res.data?.message ||
              'Failed to create artist'
          );
        }
      }

      setShowArtistModal(false);
      setEditingArtist(null);

      setArtistFormData({
        name: '',
        imageUrl: '',
      });

      await fetchAdminData();
    } catch (err) {
      console.error(
        'Failed to save artist:',
        err
      );

      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to save artist'
      );
    } finally {
      setSavingArtist(false);
    }
  };

  // ============================================================
  // DELETE ARTIST
  // ============================================================

  const handleDeleteArtist = async (artist) => {
    const artistId =
      getArtistId(artist);

    if (!artistId) return;

    const normalizedArtistId =
      normalizeId(artistId);

    const artistName =
      getArtistName(artist);

    const songCount = Number(
      artist.song_count ??
        artist.songs_count ??
        artist.track_count ??
        0
    );

    if (songCount > 0) {
      alert(
        `"${artistName}" is currently connected to ${songCount} song(s).\n\n` +
          `Please remove the artist from those songs before deleting the artist.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete artist "${artistName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingArtistId(
        normalizedArtistId
      );

      const res = await api.delete(
        `/artists/${normalizedArtistId}`
      );

      if (!res.data?.success) {
        throw new Error(
          res.data?.message ||
            'Failed to delete artist'
        );
      }

      setArtists((prev) =>
        prev.filter(
          (artistItem) =>
            normalizeId(
              getArtistId(artistItem)
            ) !== normalizedArtistId
        )
      );

      await fetchAdminData();
    } catch (err) {
      console.error(
        'Failed to delete artist:',
        err
      );

      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to delete artist'
      );
    } finally {
      setDeletingArtistId(null);
    }
  };

  // ============================================================
  // USER ROLE
  // ============================================================

  const handleToggleUserRole = async (
    userId,
    currentRole
  ) => {
    const newRole =
      currentRole === 'admin'
        ? 'user'
        : 'admin';

    try {
      const res = await api.put(
        `/admin/users/${userId}/role`,
        {
          role: newRole,
        }
      );

      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  role: newRole,
                }
              : user
          )
        );
      }
    } catch (err) {
      console.error(
        'Failed to change role:',
        err
      );

      alert(
        err.response?.data?.message ||
          'Failed to change user role'
      );
    }
  };

  // ============================================================
  // PLAYLIST MODERATION
  // ============================================================

  const handleOpenPlaylist = async (
    playlist
  ) => {
    try {
      setShowPlaylistModal(true);
      setLoadingPlaylist(true);
      setSelectedPlaylist(playlist);

      const existingSongs =
        getPlaylistSongs(playlist);

      if (existingSongs.length > 0) {
        setLoadingPlaylist(false);
        return;
      }

      const res = await api.get(
        `/playlists/admin/${playlist.id}`
      );

      if (res.data?.success) {
        const detailedPlaylist =
          res.data.playlist ||
          res.data.data ||
          res.data;

        setSelectedPlaylist(
          detailedPlaylist
        );
      }
    } catch (err) {
      console.error(
        'Failed to load playlist details:',
        err
      );

      setSelectedPlaylist(playlist);

      if (err.response?.status !== 404) {
        alert(
          err.response?.data?.message ||
            'Failed to load playlist songs'
        );
      }
    } finally {
      setLoadingPlaylist(false);
    }
  };

  const closePlaylistModal = () => {
    setShowPlaylistModal(false);
    setSelectedPlaylist(null);
  };

  const handleTogglePlaylistVisibility =
    async (playlist) => {
      if (!playlist?.id) return;

      const currentVisibility =
        Boolean(playlist.is_public);

      const newVisibility =
        !currentVisibility;

      const actionText = newVisibility
        ? 'make this playlist public'
        : 'make this playlist private';

      if (
        !window.confirm(
          `Are you sure you want to ${actionText}?`
        )
      ) {
        return;
      }

      try {
        setUpdatingPlaylistId(
          playlist.id
        );

        const res = await api.put(
          `/playlists/admin/${playlist.id}/visibility`,
          {
            isPublic: newVisibility,
          }
        );

        if (!res.data?.success) {
          throw new Error(
            res.data?.message ||
              'Failed to update playlist visibility'
          );
        }

        setPlaylists((prev) =>
          prev.map((item) =>
            item.id === playlist.id
              ? {
                  ...item,
                  is_public:
                    newVisibility,
                }
              : item
          )
        );

        setSelectedPlaylist((prev) =>
          prev?.id === playlist.id
            ? {
                ...prev,
                is_public:
                  newVisibility,
              }
            : prev
        );
      } catch (err) {
        console.error(
          'Failed to update playlist visibility:',
          err
        );

        alert(
          err.response?.data?.message ||
            'Failed to update playlist visibility'
        );
      } finally {
        setUpdatingPlaylistId(null);
      }
    };

  // ============================================================
  // FILTERS
  // ============================================================

  const filteredSongs = useMemo(() => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    if (!query) return songs;

    return songs.filter((song) => {
      const title =
        song.title?.toLowerCase() || '';

      const artistNames =
        getSongArtistNames(song)
          .join(' ')
          .toLowerCase();

      const oldArtist =
        song.artist?.toLowerCase() || '';

      return (
        title.includes(query) ||
        artistNames.includes(query) ||
        oldArtist.includes(query)
      );
    });
  }, [songs, searchTerm, artists]);

  const filteredPlaylists = useMemo(() => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    if (!query) return playlists;

    return playlists.filter((playlist) => {
      const name =
        playlist.name?.toLowerCase() || '';

      const creator =
        getCreatorName(playlist)
          ?.toLowerCase() || '';

      return (
        name.includes(query) ||
        creator.includes(query)
      );
    });
  }, [playlists, searchTerm]);

  const filteredArtists = useMemo(() => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    if (!query) return artists;

    return artists.filter((artist) =>
      getArtistName(artist)
        .toLowerCase()
        .includes(query)
    );
  }, [artists, searchTerm]);

  const filteredSongArtists = useMemo(() => {
    const query = artistSearch
      .trim()
      .toLowerCase();

    if (!query) return artists;

    return artists.filter((artist) =>
      getArtistName(artist)
        .toLowerCase()
        .includes(query)
    );
  }, [artists, artistSearch]);

  const selectedArtists = useMemo(() => {
    return formData.artistIds
      .map((artistId) =>
        artists.find(
          (artist) =>
            normalizeId(
              getArtistId(artist)
            ) === normalizeId(artistId)
        )
      )
      .filter(Boolean);
  }, [formData.artistIds, artists]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 pb-32">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">

          <div className="flex items-center gap-3">

            <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400">
              <Shield className="w-6 h-6" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">
                Platform Admin Panel
              </h1>

              <p className="text-xs text-slate-400 mt-0.5">
                Manage users, songs, artists, playlists and platform activity
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={fetchAdminData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 transition cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                loading
                  ? 'animate-spin'
                  : ''
              }`}
            />

            <span>
              {loading
                ? 'Refreshing...'
                : 'Refresh Data'}
            </span>
          </button>

        </div>

        {/* ======================================================
            STAT CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">

            <div>
              <p className="text-xs text-slate-400 font-medium">
                Total Songs
              </p>

              <h3 className="text-2xl font-black text-slate-100 mt-1">
                {songs.length ||
                  stats.totalSongs ||
                  0}
              </h3>
            </div>

            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Music2 className="w-5 h-5" />
            </div>

          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">

            <div>
              <p className="text-xs text-slate-400 font-medium">
                Total Platform Likes
              </p>

              <h3 className="text-2xl font-black text-rose-400 mt-1">
                {likesActivity.length ||
                  stats.totalLikes ||
                  0}
              </h3>
            </div>

            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
              <Heart className="w-5 h-5 fill-current" />
            </div>

          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">

            <div>
              <p className="text-xs text-slate-400 font-medium">
                Registered Users
              </p>

              <h3 className="text-2xl font-black text-sky-400 mt-1">
                {users.length ||
                  stats.totalUsers ||
                  0}
              </h3>
            </div>

            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>

          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">

            <div>
              <p className="text-xs text-slate-400 font-medium">
                Playlists Created
              </p>

              <h3 className="text-2xl font-black text-teal-400 mt-1">
                {playlists.length ||
                  stats.totalPlaylists ||
                  0}
              </h3>
            </div>

            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
              <ListMusic className="w-5 h-5" />
            </div>

          </div>

        </div>

        {/* ======================================================
            TAB BAR
        ====================================================== */}

        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/80 p-2 rounded-2xl">

          <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto">

            <button
              type="button"
              onClick={() => {
                setActiveTab('songs');
                setSearchTerm('');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'songs'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Songs ({songs.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('artists');
                setSearchTerm('');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'artists'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span>
                Artists ({artists.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('likes');
                setSearchTerm('');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'likes'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />

              <span>
                Likes Ledger ({likesActivity.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('users');
                setSearchTerm('');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Users ({users.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('playlists');
                setSearchTerm('');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'playlists'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />

              <span>
                Playlists ({playlists.length})
              </span>
            </button>

          </div>

          {(activeTab === 'songs' ||
            activeTab === 'artists' ||
            activeTab === 'playlists') && (
            <div className="flex items-center gap-2 w-full lg:w-auto">

              <div className="relative w-full lg:w-72">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />

                <input
                  type="text"
                  placeholder={
                    activeTab === 'artists'
                      ? 'Search artists...'
                      : activeTab === 'playlists'
                      ? 'Search playlists or creators...'
                      : 'Filter tracks...'
                  }
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />

              </div>

              {activeTab === 'songs' && (
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs shadow-md transition whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Song</span>
                </button>
              )}

              {activeTab === 'artists' && (
                <button
                  type="button"
                  onClick={
                    handleOpenAddArtistModal
                  }
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs shadow-md transition whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Artist</span>
                </button>
              )}

            </div>
          )}

        </div>

        {/* ======================================================
            SONGS TAB
        ====================================================== */}

        {activeTab === 'songs' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs text-slate-300">

                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">

                  <tr>
                    <th className="py-3 px-4">
                      Track Details
                    </th>

                    <th className="py-3 px-4">
                      Artists
                    </th>

                    <th className="py-3 px-4">
                      Platform
                    </th>

                    <th className="py-3 px-4">
                      Source URL
                    </th>

                    <th className="py-3 px-4 text-right">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-800/60">

                  {filteredSongs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-12 text-center text-slate-500"
                      >
                        No songs found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredSongs.map((song) => {
                      const songArtists =
                        getSongArtists(song);

                      const artistNames =
                        getSongArtistNames(song);

                      return (
                        <tr
                          key={song.id}
                          className="hover:bg-slate-800/40 transition"
                        >

                          <td className="py-3 px-4">

                            <div className="flex items-center gap-3">

                              <img
                                src={
                                  song.thumbnail_url ||
                                  song.thumbnailUrl ||
                                  defaultThumbnail
                                }
                                alt={song.title}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                              />

                              <div className="min-w-0">

                                <p className="font-semibold text-slate-100 text-xs truncate max-w-xs">
                                  {song.title}
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="py-3 px-4">

                            {songArtists.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap max-w-xs">

                                {songArtists.map(
                                  (artist, index) => {
                                    const artistId =
                                      getArtistId(
                                        artist
                                      );

                                    const name =
                                      getArtistName(
                                        artist
                                      );

                                    return (
                                      <span
                                        key={
                                          normalizeId(
                                            artistId
                                          ) ||
                                          `${name}-${index}`
                                        }
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-slate-300"
                                      >
                                        {typeof artist ===
                                          'object' && (
                                          <img
                                            src={getArtistImage(
                                              artist
                                            )}
                                            alt=""
                                            className="w-4 h-4 rounded-full object-cover"
                                          />
                                        )}

                                        {name}
                                      </span>
                                    );
                                  }
                                )}

                              </div>
                            ) : (
                              <span className="text-slate-400">
                                {artistNames.join(
                                  ', '
                                ) ||
                                  'Unknown Artist'}
                              </span>
                            )}

                          </td>

                          <td className="py-3 px-4">

                            <span className="capitalize px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded font-medium text-[10px]">
                              {song.source_type ||
                                song.sourceType ||
                                'direct'}
                            </span>

                          </td>

                          <td className="py-3 px-4 max-w-xs">

                            <a
                              href={
                                song.source_url ||
                                song.sourceUrl ||
                                '#'
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="block truncate hover:underline text-emerald-400"
                            >
                              {song.source_url ||
                                song.sourceUrl ||
                                'No source'}
                            </a>

                          </td>

                          <td className="py-3 px-4 text-right">

                            <div className="flex items-center justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenEditModal(
                                    song
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                title="Edit song"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteSong(
                                    song.id
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                title="Delete song"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    })
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

        {/* ======================================================
            ARTISTS TAB
        ====================================================== */}

        {activeTab === 'artists' && (
          <div className="space-y-4">

            <div className="bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-5">

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <Mic2 className="w-5 h-5 text-amber-400" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-100">
                      Artist Management
                    </h2>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Manage artists and their existing song relationships.
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">

                    <span className="text-[10px] text-slate-500">
                      Artists
                    </span>

                    <span className="ml-2 text-xs font-bold text-slate-200">
                      {artists.length}
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleOpenAddArtistModal
                    }
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Artist
                  </button>

                </div>

              </div>

            </div>

            {filteredArtists.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 text-center">

                <div className="w-14 h-14 mx-auto bg-slate-800/60 rounded-2xl flex items-center justify-center mb-3">
                  <Mic2 className="w-7 h-7 text-slate-600" />
                </div>

                <h3 className="text-sm font-semibold text-slate-300">
                  No artists found
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Create your first artist to start assigning artists to songs.
                </p>

                <button
                  type="button"
                  onClick={
                    handleOpenAddArtistModal
                  }
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Artist
                </button>

              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                {filteredArtists.map(
                  (artist) => {
                    const artistId =
                      getArtistId(artist);

                    const artistName =
                      getArtistName(artist);

                    const songCount =
                      Number(
                        artist.song_count ??
                          artist.songs_count ??
                          artist.track_count ??
                          0
                      );

                    const isDeleting =
                      normalizeId(
                        deletingArtistId
                      ) ===
                      normalizeId(artistId);

                    return (
                      <div
                        key={
                          normalizeId(
                            artistId
                          )
                        }
                        className="group bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition shadow-lg"
                      >

                        <div className="aspect-square bg-slate-950 relative overflow-hidden">

                          <img
                            src={getArtistImage(
                              artist
                            )}
                            alt={artistName}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              e.currentTarget.src =
                                defaultArtistImage;
                            }}
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                          <div className="absolute bottom-3 left-3 right-3">

                            <h3 className="font-bold text-white text-sm truncate">
                              {artistName}
                            </h3>

                            <p className="text-[10px] text-slate-300 mt-0.5">
                              {songCount}{' '}
                              {songCount === 1
                                ? 'Song'
                                : 'Songs'}
                            </p>

                          </div>

                        </div>

                        <div className="p-3 flex items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEditArtistModal(
                                artist
                              )
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() =>
                              handleDeleteArtist(
                                artist
                              )
                            }
                            className="flex items-center justify-center p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete artist"
                          >
                            {isDeleting ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>
        )}

        {/* ======================================================
            LIKES TAB
        ====================================================== */}

        {activeTab === 'likes' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs text-slate-300">

                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">

                  <tr>
                    <th className="py-3 px-4">
                      Liked Track
                    </th>

                    <th className="py-3 px-4">
                      User
                    </th>

                    <th className="py-3 px-4">
                      User Email
                    </th>

                    <th className="py-3 px-4 text-right">
                      Timestamp
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-800/60">

                  {likesActivity.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-slate-500"
                      >
                        No like activity recorded yet.
                      </td>
                    </tr>
                  ) : (
                    likesActivity.map(
                      (item, idx) => (
                        <tr
                          key={`${item.user_id}-${item.song_id}-${idx}`}
                          className="hover:bg-slate-800/40 transition"
                        >

                          <td className="py-3 px-4">

                            <div className="flex items-center gap-3">

                              <img
                                src={
                                  item.thumbnail_url ||
                                  defaultThumbnail
                                }
                                alt=""
                                className="w-9 h-9 rounded-lg object-cover border border-slate-800"
                              />

                              <div>

                                <p className="font-semibold text-slate-100 text-xs">
                                  {item.song_title}
                                </p>

                                <p className="text-[10px] text-slate-400">
                                  {item.song_artist ||
                                    'Unknown'}
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-200">
                              {item.username}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-400">
                            {item.email}
                          </td>

                          <td className="py-3 px-4 text-right">

                            <div className="flex items-center justify-end gap-1.5 text-slate-400">

                              <Clock className="w-3 h-3 text-slate-500" />

                              <span>
                                {item.liked_at
                                  ? new Date(
                                      item.liked_at
                                    ).toLocaleString()
                                  : 'Unknown'}
                              </span>

                            </div>

                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

        {/* ======================================================
            USERS TAB
        ====================================================== */}

        {activeTab === 'users' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs text-slate-300">

                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">

                  <tr>
                    <th className="py-3 px-4">
                      User
                    </th>

                    <th className="py-3 px-4">
                      Email
                    </th>

                    <th className="py-3 px-4">
                      Role
                    </th>

                    <th className="py-3 px-4">
                      Joined Date
                    </th>

                    <th className="py-3 px-4 text-right">
                      User Data & Actions
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-800/60">

                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-12 text-center text-slate-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-800/40 transition"
                      >

                        <td className="py-3 px-4">

                          <div className="flex items-center gap-2">

                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                              <User className="w-4 h-4 text-slate-400" />
                            </div>

                            <span className="font-semibold text-slate-100">
                              {user.username}
                            </span>

                          </div>

                        </td>

                        <td className="py-3 px-4 text-slate-400">
                          {user.email}
                        </td>

                        <td className="py-3 px-4">

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              user.role ===
                              'admin'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {user.role}
                          </span>

                        </td>

                        <td className="py-3 px-4 text-slate-400">
                          {user.created_at
                            ? new Date(
                                user.created_at
                              ).toLocaleDateString()
                            : 'Unknown'}
                        </td>

                        <td className="py-3 px-4 text-right">

                          <div className="flex items-center justify-end gap-2 flex-wrap">

                            <button
                              type="button"
                              onClick={() =>
                                handleInspectUser(
                                  user.id
                                )
                              }
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />

                              <span>
                                View Data
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleUserRole(
                                  user.id,
                                  user.role
                                )
                              }
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
                            >
                              Make{' '}
                              {user.role ===
                              'admin'
                                ? 'User'
                                : 'Admin'}
                            </button>

                            {user.role !==
                              'admin' && (
                              <button
                                type="button"
                                disabled={
                                  deletingUserId ===
                                  user.id
                                }
                                onClick={() =>
                                  handleDeleteUser(
                                    user
                                  )
                                }
                                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg text-[11px] font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Permanently delete user"
                              >
                                {deletingUserId ===
                                user.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}

                                <span>
                                  {deletingUserId ===
                                  user.id
                                    ? 'Deleting...'
                                    : 'Delete'}
                                </span>
                              </button>
                            )}

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

        {/* ======================================================
            PLAYLIST MODERATION TAB
        ====================================================== */}

        {activeTab === 'playlists' && (
          <div className="space-y-4">

            <div className="bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-5">

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                      <ListMusic className="w-5 h-5 text-teal-400" />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-100">
                        Playlist Moderation
                      </h2>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Review user-created playlists before making them public.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">

                    <span className="text-[10px] text-slate-500">
                      Total
                    </span>

                    <span className="ml-2 text-xs font-bold text-slate-200">
                      {playlists.length}
                    </span>

                  </div>

                  <div className="px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20">

                    <span className="text-[10px] text-emerald-500/70">
                      Public
                    </span>

                    <span className="ml-2 text-xs font-bold text-emerald-400">
                      {
                        playlists.filter(
                          (p) => p.is_public
                        ).length
                      }
                    </span>

                  </div>

                  <div className="px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/20">

                    <span className="text-[10px] text-amber-500/70">
                      Pending
                    </span>

                    <span className="ml-2 text-xs font-bold text-amber-400">
                      {
                        playlists.filter(
                          (p) => !p.is_public
                        ).length
                      }
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {filteredPlaylists.length ===
            0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 text-center">

                <div className="w-14 h-14 mx-auto bg-slate-800/60 rounded-2xl flex items-center justify-center mb-3">
                  <ListMusic className="w-7 h-7 text-slate-600" />
                </div>

                <h3 className="text-sm font-semibold text-slate-300">
                  No playlists found
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  There are no playlists matching your search.
                </p>

              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                {filteredPlaylists.map(
                  (playlist) => {
                    const creator =
                      getCreatorName(
                        playlist
                      );

                    const songCount =
                      getPlaylistSongCount(
                        playlist
                      );

                    const isPublic =
                      Boolean(
                        playlist.is_public
                      );

                    const isUpdating =
                      updatingPlaylistId ===
                      playlist.id;

                    return (
                      <div
                        key={playlist.id}
                        className="group bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition shadow-lg"
                      >

                        <div
                          className={`h-1 ${
                            isPublic
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                        />

                        <div className="p-5">

                          <div className="flex items-start justify-between gap-3">

                            <div className="flex items-center gap-3 min-w-0">

                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-sky-500/10 border border-slate-700 flex items-center justify-center shrink-0">

                                <ListMusic className="w-6 h-6 text-teal-400" />

                              </div>

                              <div className="min-w-0">

                                <h3 className="font-bold text-slate-100 text-sm truncate">
                                  {playlist.name ||
                                    'Untitled Playlist'}
                                </h3>

                                <div className="flex items-center gap-1.5 mt-1">

                                  <User className="w-3 h-3 text-slate-500" />

                                  <span className="text-[11px] text-slate-400">
                                    Created by
                                  </span>

                                  <span className="text-[11px] font-semibold text-sky-400">
                                    @{creator}
                                  </span>

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
                                  <Globe className="w-3 h-3" />
                                  Public
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3" />
                                  Pending
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

                                  <p className="text-sm font-bold text-slate-200">
                                    {songCount}
                                  </p>
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
                                    {isPublic
                                      ? 'Public'
                                      : 'Private'}
                                  </p>
                                </div>

                              </div>

                            </div>

                          </div>

                          <div className="flex items-center gap-2 mt-4">

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenPlaylist(
                                  playlist
                                )
                              }
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View All Songs
                            </button>

                            <button
                              type="button"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleTogglePlaylistVisibility(
                                  playlist
                                )
                              }
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

                              {isUpdating
                                ? 'Updating...'
                                : isPublic
                                ? 'Make Private'
                                : 'Make Public'}

                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>
        )}

      </div>

      {/* ========================================================
          USER INSPECTOR MODAL
      ======================================================== */}

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

            {loadingUserDetail ||
            !selectedUserDetail ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">

                <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />

                <p className="text-xs text-slate-400">
                  Loading user records...
                </p>

              </div>
            ) : (
              <div className="space-y-6 text-xs">

                {/* Profile */}

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="space-y-3">

                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-emerald-400" />

                      <span className="font-semibold">
                        Email:
                      </span>

                      <span className="text-slate-100 break-all">
                        {selectedUserDetail.user?.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-4 h-4 text-sky-400" />

                      <span className="font-semibold">
                        Username:
                      </span>

                      <span className="text-slate-100">
                        {selectedUserDetail.user?.username}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-amber-400" />

                      <span className="font-semibold">
                        Registered:
                      </span>

                      <span className="text-slate-100">
                        {selectedUserDetail.user
                          ?.created_at
                          ? new Date(
                              selectedUserDetail.user.created_at
                            ).toLocaleString()
                          : 'Unknown'}
                      </span>
                    </div>

                  </div>

                  <div className="border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-4">

                    <div className="flex items-center gap-2 text-slate-300 mb-2">
                      <KeyRound className="w-4 h-4 text-rose-400" />

                      <span className="font-semibold">
                        Password Security
                      </span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded p-3 text-[10px] text-slate-500">
                      Password credentials are protected using a secure one-way password hash.
                    </div>

                  </div>

                </div>

                {/* User playlists */}

                <div>

                  <h4 className="font-bold text-slate-200 text-sm mb-2 flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-teal-400" />

                    Created Playlists (
                    {selectedUserDetail.playlists
                      ?.length || 0}
                    )
                  </h4>

                  {selectedUserDetail.playlists
                    ?.length === 0 ? (
                    <p className="text-slate-500 italic bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      No playlists created by this user yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                      {selectedUserDetail.playlists.map(
                        (playlist) => (
                          <div
                            key={playlist.id}
                            className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                          >

                            <div>
                              <p className="font-semibold text-slate-100">
                                {playlist.name}
                              </p>

                              <p className="text-[10px] text-slate-400">
                                {playlist.song_count ||
                                  0}{' '}
                                songs ·{' '}
                                {playlist.is_public
                                  ? 'Public'
                                  : 'Private'}
                              </p>
                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>

                {/* Liked songs */}

                <div>

                  <h4 className="font-bold text-slate-200 text-sm mb-2 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-current" />

                    Liked Songs (
                    {selectedUserDetail.likedSongs
                      ?.length || 0}
                    )
                  </h4>

                  {selectedUserDetail.likedSongs
                    ?.length === 0 ? (
                    <p className="text-slate-500 italic bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      No liked songs in user history.
                    </p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">

                      {selectedUserDetail.likedSongs.map(
                        (song) => (
                          <div
                            key={song.id}
                            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3"
                          >

                            <div className="flex items-center gap-2.5 min-w-0">

                              <img
                                src={
                                  song.thumbnail_url ||
                                  defaultThumbnail
                                }
                                alt=""
                                className="w-8 h-8 rounded object-cover"
                              />

                              <div className="min-w-0">

                                <p className="font-semibold text-slate-100 truncate">
                                  {song.title}
                                </p>

                                <p className="text-[10px] text-slate-400 truncate">
                                  {song.artist}
                                </p>

                              </div>

                            </div>

                            <span className="text-[10px] text-slate-500 shrink-0">
                              {song.liked_at
                                ? new Date(
                                    song.liked_at
                                  ).toLocaleDateString()
                                : ''}
                            </span>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================
          PLAYLIST SONG INSPECTOR MODAL
      ======================================================== */}

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
                      {selectedPlaylist?.name ||
                        'Playlist'}
                    </h2>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1">

                      <span className="text-[11px] text-slate-500">
                        Created by
                      </span>

                      <span className="text-[11px] font-semibold text-sky-400">
                        @{getCreatorName(
                          selectedPlaylist
                        )}
                      </span>

                      <span className="text-slate-700">
                        •
                      </span>

                      <span className="text-[11px] text-slate-500">
                        {getPlaylistSongCount(
                          selectedPlaylist
                        )}{' '}
                        songs
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
                      <Globe className="w-3.5 h-3.5" />
                      Public Playlist
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Awaiting Admin Approval
                    </>
                  )}

                </div>

                <button
                  type="button"
                  disabled={
                    updatingPlaylistId ===
                    selectedPlaylist?.id
                  }
                  onClick={() =>
                    handleTogglePlaylistVisibility(
                      selectedPlaylist
                    )
                  }
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                    selectedPlaylist?.is_public
                      ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >

                  {updatingPlaylistId ===
                  selectedPlaylist?.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : selectedPlaylist?.is_public ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}

                  {selectedPlaylist?.is_public
                    ? 'Make Private'
                    : 'Make Public'}

                </button>

              </div>

            </div>

            <div className="overflow-y-auto p-5">

              {loadingPlaylist ? (
                <div className="py-16 flex flex-col items-center justify-center">

                  <RefreshCw className="w-7 h-7 text-teal-400 animate-spin mb-3" />

                  <p className="text-sm font-semibold text-slate-300">
                    Loading playlist songs...
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Inspecting every track in this playlist.
                  </p>

                </div>
              ) : (
                (() => {
                  const playlistSongs =
                    getPlaylistSongs(
                      selectedPlaylist
                    );

                  if (
                    playlistSongs.length ===
                    0
                  ) {
                    return (
                      <div className="py-16 text-center">

                        <div className="w-14 h-14 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-3">

                          <Music2 className="w-7 h-7 text-slate-600" />

                        </div>

                        <h3 className="text-sm font-semibold text-slate-300">
                          No songs in this playlist
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          This playlist currently contains no tracks.
                        </p>

                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">

                      {playlistSongs.map(
                        (song, index) => {
                          const songData =
                            song.song ||
                            song;

                          return (
                            <div
                              key={
                                songData.id ||
                                `${selectedPlaylist?.id}-${index}`
                              }
                              className="group bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 transition"
                            >

                              <div className="flex items-center gap-3">

                                <div className="w-7 text-center shrink-0">

                                  <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-400">
                                    {String(
                                      index + 1
                                    ).padStart(
                                      2,
                                      '0'
                                    )}
                                  </span>

                                </div>

                                <img
                                  src={
                                    songData.thumbnail_url ||
                                    songData.thumbnailUrl ||
                                    defaultThumbnail
                                  }
                                  alt={
                                    songData.title ||
                                    'Song'
                                  }
                                  className="w-11 h-11 rounded-lg object-cover border border-slate-800 shrink-0"
                                />

                                <div className="min-w-0 flex-1">

                                  <p className="font-semibold text-slate-100 text-xs sm:text-sm truncate">
                                    {songData.title ||
                                      'Untitled Song'}
                                  </p>

                                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                                    {getSongArtistNames(
                                      songData
                                    ).join(
                                      ', '
                                    ) ||
                                      songData.artist ||
                                      'Unknown Artist'}
                                  </p>

                                </div>

                                <div className="hidden sm:block shrink-0">

                                  <span className="capitalize px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] text-slate-500">
                                    {songData.source_type ||
                                      'direct'}
                                  </span>

                                </div>

                                {songData.source_url && (
                                  <a
                                    href={
                                      songData.source_url
                                    }
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
                        }
                      )}

                    </div>
                  );
                })()
              )}

            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">

              <div className="flex items-center gap-2 text-[10px] text-slate-500">

                <AlertCircle className="w-3.5 h-3.5" />

                <span>
                  Review playlist songs before approving it.
                </span>

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

      {/* ========================================================
          ADD / EDIT SONG MODAL
      ======================================================== */}

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
              {editingSong
                ? 'Edit Track Details'
                : 'Add New Track'}
            </h3>

            <p className="text-[11px] text-slate-500 mb-5">
              Select one or more existing artists for this song.
            </p>

            <form
              onSubmit={handleSaveSong}
              className="space-y-4 text-xs"
            >

              {/* SONG TITLE */}

              <div>

                <label className="block text-slate-400 font-semibold mb-1.5">
                  Song Title *
                </label>

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

              {/* ARTISTS */}

              <div>

                <div className="flex items-center justify-between mb-1.5">

                  <label className="block text-slate-400 font-semibold">
                    Artists *
                  </label>

                  <span className="text-[10px] text-slate-600">
                    {formData.artistIds.length}{' '}
                    selected
                  </span>

                </div>

                {/* SELECTED ARTISTS */}

                {selectedArtists.length >
                  0 && (
                  <div className="flex flex-wrap gap-2 mb-2">

                    {selectedArtists.map(
                      (artist) => {
                        const artistId =
                          getArtistId(
                            artist
                          );

                        return (
                          <div
                            key={normalizeId(
                              artistId
                            )}
                            className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl px-2 py-1"
                          >

                            <img
                              src={getArtistImage(
                                artist
                              )}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover"
                            />

                            <span className="text-[10px] font-semibold">
                              {getArtistName(
                                artist
                              )}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveSongArtist(
                                  artistId
                                )
                              }
                              className="ml-0.5 text-amber-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

                {/* ARTIST SEARCH */}

                <div className="relative">

                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />

                  <input
                    type="text"
                    value={artistSearch}
                    onChange={(e) =>
                      setArtistSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search existing artists..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />

                </div>

                {/* ARTIST LIST */}

                <div className="mt-2 max-h-44 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl">

                  {filteredSongArtists.length ===
                  0 ? (
                    <div className="p-4 text-center">

                      <Mic2 className="w-5 h-5 mx-auto text-slate-600 mb-2" />

                      <p className="text-[10px] text-slate-500">
                        No artists found.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setShowSongModal(
                            false
                          );
                          setShowArtistModal(
                            true
                          );
                          setEditingArtist(
                            null
                          );
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
                    filteredSongArtists.map(
                      (artist) => {
                        const artistId =
                          getArtistId(
                            artist
                          );

                        const normalizedId =
                          normalizeId(
                            artistId
                          );

                        const selected =
                          formData.artistIds.some(
                            (id) =>
                              normalizeId(
                                id
                              ) ===
                              normalizedId
                          );

                        return (
                          <button
                            key={
                              normalizedId
                            }
                            type="button"
                            onClick={() =>
                              handleToggleSongArtist(
                                artistId
                              )
                            }
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition cursor-pointer ${
                              selected
                                ? 'bg-amber-500/10'
                                : 'hover:bg-slate-900'
                            }`}
                          >

                            <img
                              src={getArtistImage(
                                artist
                              )}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-800 shrink-0"
                            />

                            <div className="min-w-0 flex-1">

                              <p className="text-xs font-semibold text-slate-200 truncate">
                                {getArtistName(
                                  artist
                                )}
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
                      }
                    )
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
                        setShowSongModal(
                          false
                        );
                        handleOpenAddArtistModal();
                      }}
                      className="mt-2 text-[10px] font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                    >
                      + Add Artist
                    </button>

                  </div>
                )}

              </div>

              {/* SOURCE URL */}

              <div>

                <label className="block text-slate-400 font-semibold mb-1.5">
                  Source URL *
                </label>

                <input
                  type="url"
                  required
                  value={formData.sourceUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sourceUrl:
                        e.target.value,
                    })
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />

              </div>

              {/* THUMBNAIL */}

              <div>

                <label className="block text-slate-400 font-semibold mb-1.5">
                  Thumbnail Artwork URL *
                </label>

                <input
                  type="url"
                  required
                  value={formData.thumbnailUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      thumbnailUrl:
                        e.target.value,
                    })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex items-center justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => {
                    setShowSongModal(
                      false
                    );
                    setEditingSong(null);
                    setArtistSearch('');
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    formData.artistIds
                      .length === 0
                  }
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingSong
                    ? 'Save Changes'
                    : 'Publish Track'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ========================================================
          ADD / EDIT ARTIST MODAL
      ======================================================== */}

      {showArtistModal && (
        <div className="fixed inset-0 z-[80] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">

            <button
              type="button"
              onClick={() => {
                setShowArtistModal(
                  false
                );
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
                  {editingArtist
                    ? 'Edit Artist'
                    : 'Add Artist'}
                </h3>

                <p className="text-[10px] text-slate-500 mt-0.5">
                  Artist information will be reused across songs.
                </p>

              </div>

            </div>

            <form
              onSubmit={handleSaveArtist}
              className="space-y-4 text-xs"
            >

              <div>

                <label className="block text-slate-400 font-semibold mb-1.5">
                  Artist Name *
                </label>

                <input
                  type="text"
                  required
                  value={
                    artistFormData.name
                  }
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

                <label className="block text-slate-400 font-semibold mb-1.5">
                  Artist Image URL *
                </label>

                <input
                  type="url"
                  required
                  value={
                    artistFormData.imageUrl
                  }
                  onChange={(e) =>
                    setArtistFormData({
                      ...artistFormData,
                      imageUrl:
                        e.target.value,
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
                      src={
                        artistFormData.imageUrl
                      }
                      alt="Artist preview"
                      className="w-16 h-16 rounded-full object-cover border border-slate-800"
                      onError={(e) => {
                        e.currentTarget.src =
                          defaultArtistImage;
                      }}
                    />

                    <div className="min-w-0">

                      <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">
                        Preview
                      </p>

                      <p className="text-sm font-bold text-slate-200 truncate">
                        {artistFormData.name ||
                          'Artist Name'}
                      </p>

                    </div>

                  </div>

                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => {
                    setShowArtistModal(
                      false
                    );
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

                  {savingArtist && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  )}

                  {savingArtist
                    ? 'Saving...'
                    : editingArtist
                    ? 'Save Changes'
                    : 'Create Artist'}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}