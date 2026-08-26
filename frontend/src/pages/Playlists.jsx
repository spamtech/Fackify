import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Plus,
  Music2,
  Play,
  MoreHorizontal,
  Trash2,
  Pencil,
  X,
  Check,
  Heart,
  ListMusic,
  ChevronLeft,
  Search,
  Sparkles,
  Headphones,
  ShieldCheck,
  Lock,
  Globe2,
} from 'lucide-react';

import api from '../api/axiosInstance';
import SongCard from '../components/SongCard';
import { usePlayer } from '../context/PlayerContext';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80';

export default function Playlists() {
  const {
    playSong,
    currentSong,
    queue,
    isPlaying,
  } = usePlayer();

  // ============================================================
  // AUTH / USER
  // ============================================================

  const [currentUser, setCurrentUser] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const isAdmin =
    currentUser?.role === 'admin';

  // ============================================================
  // PLAYLIST STATE
  // ============================================================

  const [playlists, setPlaylists] =
    useState([]);

  const [selectedPlaylist, setSelectedPlaylist] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [songsLoading, setSongsLoading] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState('');

  // ============================================================
  // MODALS
  // ============================================================

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  // ============================================================
  // FORM
  // ============================================================

  const [playlistName, setPlaylistName] =
    useState('');

  const [playlistDescription, setPlaylistDescription] =
    useState('');

  const [playlistIsPublic, setPlaylistIsPublic] =
    useState(true);

  // ============================================================
  // OTHER STATE
  // ============================================================

  const [actionLoading, setActionLoading] =
    useState(false);

  const [openMenu, setOpenMenu] =
    useState(null);

  // ============================================================
  // CURRENT PLAYING PLAYLIST
  // ============================================================

  /*
   * This keeps track of the playlist that was explicitly
   * started from a playlist card.
   *
   * It does NOT change the player queue or playback logic.
   * It is only used for the visual playing animation.
   */
  const [activePlaylistId, setActivePlaylistId] =
    useState(null);

  // ============================================================
  // GET CURRENT USER
  // ============================================================

  const fetchCurrentUser = async () => {
    try {
      setAuthLoading(true);

      const response =
        await api.get('/auth/me');

      if (response.data?.success) {
        setCurrentUser(
          response.data.user ||
          response.data.data ||
          null
        );
      }
    } catch (error) {
      console.error(
        'Failed to load current user:',
        error
      );

      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  // ============================================================
  // FETCH PLAYLISTS
  // ============================================================

  const fetchPlaylists = async () => {
    try {
      setLoading(true);

      const response =
        await api.get('/playlists');

      if (response.data?.success) {
        setPlaylists(
          response.data.playlists || []
        );
      } else {
        setPlaylists([]);
      }
    } catch (error) {
      console.error(
        'Failed to load playlists:',
        error
      );

      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchCurrentUser();
    fetchPlaylists();
  }, []);

  // ============================================================
  // CLEAR PLAYLIST ANIMATION WHEN PLAYBACK STOPS
  // ============================================================

  useEffect(() => {
    if (!isPlaying) {
      setActivePlaylistId(null);
    }
  }, [isPlaying]);

  // ============================================================
  // FETCH SINGLE PLAYLIST
  // ============================================================

  const openPlaylist = async (playlist) => {
    try {
      setSongsLoading(true);
      setOpenMenu(null);

      const response =
        await api.get(
          `/playlists/${playlist.id}`
        );

      if (response.data?.success) {
        setSelectedPlaylist(
          response.data.playlist
        );
      } else {
        setSelectedPlaylist(playlist);
      }
    } catch (error) {
      console.error(
        'Failed to load playlist:',
        error
      );

      setSelectedPlaylist(playlist);
    } finally {
      setSongsLoading(false);
    }
  };

  // ============================================================
  // CREATE PLAYLIST
  // ============================================================

  const handleCreatePlaylist = async (event) => {
    event.preventDefault();

    if (!playlistName.trim()) {
      return;
    }

    try {
      setActionLoading(true);

      const payload = {
        name: playlistName.trim(),

        description:
          playlistDescription.trim(),

        /*
         * Only admin visibility is controlled
         * from this UI.
         */
        isPublic: isAdmin
          ? playlistIsPublic
          : true,
      };

      const response =
        await api.post(
          '/playlists',
          payload
        );

      if (response.data?.success) {
        const newPlaylist =
          response.data.playlist;

        setPlaylists((previous) => [
          newPlaylist,
          ...previous,
        ]);

        setPlaylistName('');
        setPlaylistDescription('');
        setPlaylistIsPublic(true);

        setShowCreateModal(false);

        /*
         * Open the newly-created playlist.
         */
        if (newPlaylist?.id) {
          setSelectedPlaylist(
            newPlaylist
          );
        }
      }
    } catch (error) {
      console.error(
        'Failed to create playlist:',
        error
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // EDIT PLAYLIST
  // ============================================================

  const handleEditPlaylist = async (event) => {
    event.preventDefault();

    if (
      !selectedPlaylist ||
      !playlistName.trim()
    ) {
      return;
    }

    try {
      setActionLoading(true);

      const payload = {
        name:
          playlistName.trim(),

        description:
          playlistDescription.trim(),

        /*
         * Admin can change visibility.
         *
         * For normal users we preserve
         * the existing visibility.
         */
        isPublic: isAdmin
          ? playlistIsPublic
          : Boolean(
              selectedPlaylist.is_public
            ),
      };

      const response =
        await api.put(
          `/playlists/${selectedPlaylist.id}`,
          payload
        );

      if (response.data?.success) {
        const updatedPlaylist =
          response.data.playlist;

        /*
         * Keep existing songs because
         * the update endpoint may return
         * an empty songs array.
         */
        const finalPlaylist = {
          ...selectedPlaylist,
          ...updatedPlaylist,
          songs:
            selectedPlaylist.songs ||
            updatedPlaylist.songs ||
            [],
        };

        setSelectedPlaylist(
          finalPlaylist
        );

        setPlaylists((previous) =>
          previous.map((playlist) =>
            playlist.id ===
            updatedPlaylist.id
              ? {
                  ...playlist,
                  ...updatedPlaylist,
                }
              : playlist
          )
        );

        setShowEditModal(false);
      }
    } catch (error) {
      console.error(
        'Failed to update playlist:',
        error
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // DELETE PLAYLIST
  // ============================================================

  const handleDeletePlaylist = async () => {
    if (!selectedPlaylist) {
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await api.delete(
          `/playlists/${selectedPlaylist.id}`
        );

      if (response.data?.success) {
        setPlaylists((previous) =>
          previous.filter(
            (playlist) =>
              playlist.id !==
              selectedPlaylist.id
          )
        );

        /*
         * If the deleted playlist was currently
         * showing the playing animation, clear it.
         */
        if (
          activePlaylistId ===
          selectedPlaylist.id
        ) {
          setActivePlaylistId(null);
        }

        setSelectedPlaylist(null);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error(
        'Failed to delete playlist:',
        error
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // REMOVE SONG
  // ============================================================

  const removeSongFromPlaylist =
    async (songId) => {
      if (!selectedPlaylist) {
        return;
      }

      try {
        await api.delete(
          `/playlists/${selectedPlaylist.id}/songs/${songId}`
        );

        await openPlaylist(
          selectedPlaylist
        );
      } catch (error) {
        console.error(
          'Failed to remove song:',
          error
        );
      }
    };

  // ============================================================
  // PLAY PLAYLIST
  // ============================================================

  const handlePlayPlaylist = () => {
    if (
      !selectedPlaylist ||
      !selectedPlaylist.songs?.length
    ) {
      return;
    }

    const songs =
      selectedPlaylist.songs;

    /*
     * Mark this playlist as the active
     * playlist for the visual animation.
     */
    setActivePlaylistId(
      selectedPlaylist.id
    );

    playSong(
      songs[0],
      songs
    );
  };

  // ============================================================
  // FILTER PLAYLISTS
  // ============================================================

  const filteredPlaylists =
    useMemo(() => {
      if (!searchTerm.trim()) {
        return playlists;
      }

      const query =
        searchTerm.toLowerCase();

      return playlists.filter(
        (playlist) =>
          playlist.name
            ?.toLowerCase()
            .includes(query) ||
          playlist.description
            ?.toLowerCase()
            .includes(query) ||
          playlist.creator_username
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      playlists,
      searchTerm,
    ]);

  // ============================================================
  // PLAYLIST COVER
  // ============================================================

  const getPlaylistCover = (
    playlist
  ) => {
    if (playlist.cover_url) {
      return playlist.cover_url;
    }

    if (playlist.thumbnail_url) {
      return playlist.thumbnail_url;
    }

    if (playlist.songs?.length) {
      return (
        playlist.songs[0]
          ?.thumbnail_url ||
        DEFAULT_COVER
      );
    }

    return DEFAULT_COVER;
  };

  // ============================================================
  // OPEN CREATE MODAL
  // ============================================================

  const openCreateModal = () => {
    setPlaylistName('');
    setPlaylistDescription('');

    /*
     * Admin playlists default to public.
     * Admin can change it before creating.
     */
    setPlaylistIsPublic(true);

    setShowCreateModal(true);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const openEditModal = (playlist = null) => {
    const target =
      playlist || selectedPlaylist;

    if (!target) {
      return;
    }

    setSelectedPlaylist(target);

    setPlaylistName(
      target.name || ''
    );

    setPlaylistDescription(
      target.description || ''
    );

    setPlaylistIsPublic(
      Boolean(target.is_public)
    );

    setShowEditModal(true);
    setOpenMenu(null);
  };

  // ============================================================
  // OPEN DELETE MODAL
  // ============================================================

  const openDeleteModal = (
    playlist = null
  ) => {
    const target =
      playlist || selectedPlaylist;

    if (!target) {
      return;
    }

    setSelectedPlaylist(target);
    setShowDeleteModal(true);
    setOpenMenu(null);
  };

  // ============================================================
  // PLAYLIST TYPE
  // ============================================================

  const isAdminPlaylist = (
    playlist
  ) => {
    return (
      playlist?.creator_role ===
        'admin' ||
      playlist?.role === 'admin'
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (
    loading &&
    !selectedPlaylist
  ) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <div className="h-8 w-48 animate-pulse rounded bg-slate-800" />

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

            {[...Array(10)].map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-3"
                >
                  <div className="aspect-square animate-pulse rounded-xl bg-slate-800" />

                  <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-800" />

                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-800" />
                </div>
              )
            )}

          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PLAYLIST DETAIL
  // ============================================================

  if (selectedPlaylist) {
    const songs =
      selectedPlaylist.songs || [];

    const adminPlaylist =
      isAdminPlaylist(
        selectedPlaylist
      );

    const publicPlaylist =
      Boolean(
        selectedPlaylist.is_public
      );

    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950">

        {/* Background */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />

        </div>

        <main className="relative mx-auto max-w-7xl px-4 py-6 pb-40 sm:px-6 lg:px-8">

          {/* Back */}

          <button
            type="button"
            onClick={() =>
              setSelectedPlaylist(null)
            }
            className="
              mb-6
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-slate-500
              transition
              hover:text-white
            "
          >
            <ChevronLeft className="h-4 w-4" />

            All Playlists
          </button>

          {/* Hero */}

          <section
            className="
              relative
              overflow-hidden
              rounded-3xl
              border
              border-slate-800
              bg-gradient-to-br
              from-slate-900
              via-slate-900
              to-slate-950
              p-6
              shadow-2xl
              sm:p-8
            "
          >

            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end">

              {/* Cover */}

              <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-800 shadow-2xl sm:h-56 sm:w-56">

                <img
                  src={getPlaylistCover(
                    selectedPlaylist
                  )}
                  alt={
                    selectedPlaylist.name
                  }
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              </div>

              {/* Info */}

              <div className="min-w-0 flex-1">

                <div className="mb-3 flex flex-wrap items-center gap-2">

                  <ListMusic className="h-4 w-4 text-emerald-400" />

                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                    Playlist
                  </span>

                  {/* ADMIN BADGE */}

                  {adminPlaylist && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-purple-400">

                      <ShieldCheck className="h-3 w-3" />

                      Admin
                    </span>
                  )}

                  {/* PUBLIC / PRIVATE */}

                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1
                      rounded-md
                      border
                      px-2
                      py-1
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wider
                      ${
                        publicPlaylist
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-700 bg-slate-800/80 text-slate-500'
                      }
                    `}
                  >
                    {publicPlaylist ? (
                      <>
                        <Globe2 className="h-3 w-3" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" />
                        Private
                      </>
                    )}
                  </span>

                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                  {selectedPlaylist.name}
                </h1>

                {selectedPlaylist.description && (
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                    {
                      selectedPlaylist.description
                    }
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">

                  <span className="flex items-center gap-1.5">
                    <Music2 className="h-3.5 w-3.5" />

                    {songs.length}{' '}

                    {songs.length === 1
                      ? 'song'
                      : 'songs'}
                  </span>

                  <span>•</span>

                  {selectedPlaylist.creator_username && (
                    <>
                      <span>
                        By{' '}
                        <span className="text-slate-400">
                          {
                            selectedPlaylist.creator_username
                          }
                        </span>
                      </span>

                      <span>•</span>
                    </>
                  )}

                  <span className="flex items-center gap-1.5">
                    <Headphones className="h-3.5 w-3.5" />

                    {adminPlaylist
                      ? 'Fackify Admin Collection'
                      : 'Your collection'}
                  </span>

                </div>

                {/* Actions */}

                <div className="mt-6 flex flex-wrap items-center gap-2">

                  <button
                    type="button"
                    onClick={
                      handlePlayPlaylist
                    }
                    disabled={
                      songs.length === 0
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-emerald-400
                      px-5
                      py-2.5
                      text-xs
                      font-bold
                      text-slate-950
                      shadow-lg
                      shadow-emerald-500/20
                      transition
                      hover:bg-emerald-300
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <Play className="h-4 w-4 fill-current" />

                    Play Playlist
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openEditModal()
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-700
                      bg-slate-900
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      text-slate-300
                      transition
                      hover:bg-slate-800
                      hover:text-white
                    "
                  >
                    <Pencil className="h-3.5 w-3.5" />

                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openDeleteModal()
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-rose-500/20
                      bg-rose-500/5
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      text-rose-400
                      transition
                      hover:bg-rose-500/10
                    "
                  >
                    <Trash2 className="h-3.5 w-3.5" />

                    Delete
                  </button>

                </div>

              </div>

            </div>
          </section>

          {/* Songs */}

          <section className="mt-10">

            <div className="mb-5 flex items-end justify-between">

              <div>

                <div className="mb-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Collection
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white">
                  Songs
                </h2>

              </div>

            </div>

            {songsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

                {[...Array(5)].map(
                  (_, index) => (
                    <div
                      key={index}
                      className="aspect-[0.82] animate-pulse rounded-2xl bg-slate-900"
                    />
                  )
                )}

              </div>
            ) : songs.length === 0 ? (

              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center sm:p-20">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-600">
                  <Music2 className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-base font-bold text-white">
                  This playlist is empty
                </h3>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                  Add songs from your music library to start building this playlist.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="group relative"
                  >

                    <SongCard
                      song={song}
                      songList={songs}
                    />

                    {/* Remove */}

                    <button
                      type="button"
                      onClick={() =>
                        removeSongFromPlaylist(
                          song.id
                        )
                      }
                      title="Remove from playlist"
                      className="
                        absolute
                        right-2
                        top-2
                        z-20
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-white/10
                        bg-slate-950/90
                        text-slate-400
                        opacity-0
                        shadow-xl
                        transition
                        group-hover:opacity-100
                        hover:text-rose-400
                      "
                    >
                      <X className="h-4 w-4" />
                    </button>

                  </div>
                ))}

              </div>

            )}

          </section>

        </main>

        {/* Edit modal */}

        {showEditModal && (
          <PlaylistModal
            title="Edit playlist"
            name={playlistName}
            description={playlistDescription}
            isPublic={playlistIsPublic}
            showVisibility={isAdmin}
            setName={setPlaylistName}
            setDescription={
              setPlaylistDescription
            }
            setIsPublic={
              setPlaylistIsPublic
            }
            onClose={() =>
              setShowEditModal(false)
            }
            onSubmit={
              handleEditPlaylist
            }
            loading={actionLoading}
            submitText="Save Changes"
          />
        )}

        {/* Delete modal */}

        {showDeleteModal && (
          <ConfirmModal
            title="Delete playlist?"
            description={`"${selectedPlaylist.name}" will be permanently removed.`}
            onClose={() =>
              setShowDeleteModal(false)
            }
            onConfirm={
              handleDeletePlaylist
            }
            loading={actionLoading}
          />
        )}

      </div>
    );
  }

  // ============================================================
  // PLAYLIST LIBRARY
  // ============================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />

      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-6 pb-40 sm:px-6 lg:px-8">

        {/* Header */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl sm:p-8">

          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <ListMusic className="h-4 w-4 text-emerald-400" />

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                  Your Library
                </span>

              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                Your Playlists
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Discover curated collections and create playlists for every mood, memory and moment.
              </p>

            </div>

            <button
              type="button"
              onClick={
                openCreateModal
              }
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-400
                px-5
                py-3
                text-xs
                font-bold
                text-slate-950
                shadow-lg
                shadow-emerald-500/20
                transition
                hover:bg-emerald-300
                active:scale-95
              "
            >
              <Plus className="h-4 w-4" />

              Create Playlist
            </button>

          </div>

          {/* Search */}

          <div className="relative mt-7 max-w-xl">

            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search your playlists..."
              className="
                w-full
                rounded-xl
                border
                border-slate-800
                bg-slate-950/70
                py-3
                pl-11
                pr-4
                text-sm
                text-white
                outline-none
                transition
                placeholder:text-slate-600
                focus:border-emerald-500/40
                focus:ring-4
                focus:ring-emerald-500/5
              "
            />

          </div>

        </section>

        {/* Stats */}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

          <StatCard
            icon={ListMusic}
            value={playlists.length}
            label="Playlists"
          />

          <StatCard
            icon={Music2}
            value={playlists.reduce(
              (total, playlist) =>
                total +
                Number(
                  playlist.song_count ||
                    playlist.songs_count ||
                    playlist.songs?.length ||
                    0
                ),
              0
            )}
            label="Songs saved"
          />

          <div className="hidden sm:block">
            <StatCard
              icon={Heart}
              value="∞"
              label="Memories"
            />
          </div>

        </div>

        {/* Playlist grid */}

        <section className="mt-10">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <div className="mb-1 flex items-center gap-2">

                <Sparkles className="h-4 w-4 text-emerald-400" />

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Collections
                </span>

              </div>

              <h2 className="text-2xl font-bold text-white">
                {searchTerm
                  ? 'Search results'
                  : 'All playlists'}
              </h2>

            </div>

            <span className="text-xs text-slate-600">
              {filteredPlaylists.length}{' '}
              {filteredPlaylists.length === 1
                ? 'playlist'
                : 'playlists'}
            </span>

          </div>

          {filteredPlaylists.length ===
          0 ? (

            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center sm:p-20">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-600">
                <ListMusic className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-base font-bold text-white">
                {searchTerm
                  ? 'No playlists found'
                  : 'Create your first playlist'}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                {searchTerm
                  ? `Nothing matches "${searchTerm}".`
                  : 'Organize your favorite songs into collections you can play anytime.'}
              </p>

              {!searchTerm && (
                <button
                  type="button"
                  onClick={
                    openCreateModal
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-300"
                >
                  <Plus className="h-4 w-4" />

                  Create Playlist
                </button>
              )}

            </div>

          ) : (

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

              {filteredPlaylists.map(
                (playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    cover={getPlaylistCover(
                      playlist
                    )}
                    isAdminPlaylist={isAdminPlaylist(
                      playlist
                    )}
                    openMenu={
                      openMenu
                    }
                    setOpenMenu={
                      setOpenMenu
                    }
                    onOpen={() =>
                      openPlaylist(
                        playlist
                      )
                    }
                    onPlay={() => {
                      const songs =
                        playlist.songs ||
                        [];

                      if (
                        songs.length
                      ) {
                        /*
                         * Start the visual animation
                         * for this playlist.
                         */
                        setActivePlaylistId(
                          playlist.id
                        );

                        playSong(
                          songs[0],
                          songs
                        );
                      } else {
                        openPlaylist(
                          playlist
                        );
                      }
                    }}
                    onEdit={() =>
                      openEditModal(
                        playlist
                      )
                    }
                    onDelete={() =>
                      openDeleteModal(
                        playlist
                      )
                    }
                    isPlaying={
                      isPlaying
                    }
                    currentSong={
                      currentSong
                    }
                    queue={queue}
                    activePlaylistId={
                      activePlaylistId
                    }
                  />
                )
              )}

            </div>

          )}

        </section>

      </main>

      {/* Create modal */}

      {showCreateModal && (
        <PlaylistModal
          title="Create playlist"
          name={playlistName}
          description={
            playlistDescription
          }
          isPublic={playlistIsPublic}
          showVisibility={isAdmin}
          setName={setPlaylistName}
          setDescription={
            setPlaylistDescription
          }
          setIsPublic={
            setPlaylistIsPublic
          }
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={
            handleCreatePlaylist
          }
          loading={actionLoading}
          submitText="Create Playlist"
        />
      )}

      {/* Delete modal */}

      {showDeleteModal &&
        selectedPlaylist && (
          <ConfirmModal
            title="Delete playlist?"
            description={`"${selectedPlaylist.name}" will be permanently removed.`}
            onClose={() =>
              setShowDeleteModal(
                false
              )
            }
            onConfirm={
              handleDeletePlaylist
            }
            loading={actionLoading}
          />
        )}

    </div>
  );
}

// ============================================================
// PLAYLIST CARD
// ============================================================

function PlaylistCard({
  playlist,
  cover,
  isAdminPlaylist,
  openMenu,
  setOpenMenu,
  onOpen,
  onPlay,
  onEdit,
  onDelete,
  isPlaying,
  currentSong,
  queue,
  activePlaylistId,
}) {
  const songCount =
    playlist.song_count ||
    playlist.songs_count ||
    playlist.songs?.length ||
    0;

  const isMenuOpen =
    openMenu === playlist.id;

  const isPublic =
    Boolean(
      playlist.is_public
    );

  // ==========================================================
  // DETECT IF THIS PLAYLIST IS CURRENTLY PLAYING
  // ==========================================================

  /*
   * First priority:
   * playlist explicitly started from this card.
   */
  const explicitlyActive =
    activePlaylistId ===
      playlist.id &&
    isPlaying;

  /*
   * Second priority:
   * If the playlist contains its songs,
   * compare the current player queue with
   * the playlist songs.
   *
   * This allows the animation to remain
   * correct when the current song changes
   * to the next song in the playlist.
   */
  const playlistSongIds = useMemo(
    () =>
      (playlist.songs || [])
        .map((song) => song?.id)
        .filter(Boolean),
    [playlist.songs]
  );

  const queueSongIds = useMemo(
    () =>
      (queue || [])
        .map((song) => song?.id)
        .filter(Boolean),
    [queue]
  );

  const currentSongIsInPlaylist =
    Boolean(
      currentSong?.id &&
      playlistSongIds.includes(
        currentSong.id
      )
    );

  const queueMatchesPlaylist =
    playlistSongIds.length > 0 &&
    queueSongIds.length > 0 &&
    playlistSongIds.length ===
      queueSongIds.length &&
    playlistSongIds.every((id) =>
      queueSongIds.includes(id)
    );

  const isPlaylistPlaying =
    isPlaying &&
    (
      explicitlyActive ||
      (
        currentSongIsInPlaylist &&
        queueMatchesPlaylist
      )
    );

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-800/80
        bg-slate-900/70
        p-3
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-slate-700
        hover:bg-slate-900
        hover:shadow-2xl
        hover:shadow-black/30
      "
    >

      {/* Cover */}

      <div className="relative block w-full overflow-hidden rounded-xl">

        <button
          type="button"
          onClick={onOpen}
          className="block w-full text-left"
        >

          <div className="aspect-square overflow-hidden rounded-xl bg-slate-800">

            <img
              src={cover}
              alt={playlist.name}
              className="
                h-full
                w-full
                object-cover
                transition
                duration-500
                group-hover:scale-105
              "
            />

          </div>

          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

        </button>

        {/* ====================================================
            PLAYING ANIMATION
            ==================================================== */}

        {isPlaylistPlaying && (
          <div
            className="
              absolute
              left-3
              top-3
              z-20
              flex
              items-end
              gap-[3px]
              rounded-lg
              border
              border-emerald-400/20
              bg-slate-950/85
              px-2.5
              py-2
              shadow-xl
              shadow-emerald-500/10
              backdrop-blur-md
            "
            aria-label="Playlist is playing"
          >

            <span
              className="
                h-2
                w-[3px]
                origin-bottom
                rounded-full
                bg-emerald-400
                animate-[playlistBar1_0.65s_ease-in-out_infinite]
              "
            />

            <span
              className="
                h-4
                w-[3px]
                origin-bottom
                rounded-full
                bg-emerald-400
                animate-[playlistBar2_0.8s_ease-in-out_infinite]
              "
            />

            <span
              className="
                h-3
                w-[3px]
                origin-bottom
                rounded-full
                bg-emerald-400
                animate-[playlistBar3_0.55s_ease-in-out_infinite]
              "
            />

            <span
              className="
                h-5
                w-[3px]
                origin-bottom
                rounded-full
                bg-emerald-400
                animate-[playlistBar4_0.75s_ease-in-out_infinite]
              "
            />

          </div>
        )}

        {/* Play */}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPlay();
          }}
          className={`
            absolute
            bottom-3
            right-3
            z-10
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-emerald-400
            text-slate-950
            shadow-xl
            shadow-black/40
            transition
            hover:bg-emerald-300
            ${
              isPlaylistPlaying
                ? 'translate-y-0 opacity-100'
                : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
            }
          `}
          aria-label={
            isPlaylistPlaying
              ? 'Playlist is playing'
              : 'Play playlist'
          }
        >
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        </button>

      </div>

      {/* Information */}

      <div className="px-1 pt-3">

        <div className="flex items-start justify-between gap-2">

          <button
            type="button"
            onClick={onOpen}
            className="min-w-0 flex-1 text-left"
          >

            <h3
              className={`
                truncate
                text-sm
                font-bold
                transition
                ${
                  isPlaylistPlaying
                    ? 'text-emerald-300'
                    : 'text-white'
                }
              `}
            >
              {playlist.name}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-1.5">

              <p className="text-[10px] text-slate-500">
                {songCount}{' '}
                {songCount === 1
                  ? 'song'
                  : 'songs'}
              </p>

              {/* PLAYING TEXT */}

              {isPlaylistPlaying && (
                <>
                  <span className="text-[9px] text-slate-700">
                    •
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Playing
                  </span>
                </>
              )}

              {/* ADMIN BADGE */}

              {isAdminPlaylist && (
                <>
                  <span className="text-[9px] text-slate-700">
                    •
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-purple-400">

                    <ShieldCheck className="h-2.5 w-2.5" />

                    Admin
                  </span>
                </>
              )}

              {/* PUBLIC BADGE */}

              {isAdminPlaylist &&
                isPublic && (
                  <>
                    <span className="text-[9px] text-slate-700">
                      •
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-400">

                      <Globe2 className="h-2.5 w-2.5" />

                      Public
                    </span>
                  </>
              )}

            </div>

          </button>

          {/* Menu */}

          <div className="relative">

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                setOpenMenu(
                  isMenuOpen
                    ? null
                    : playlist.id
                );
              }}
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                text-slate-600
                transition
                hover:bg-slate-800
                hover:text-white
              "
              aria-label="Playlist menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 top-8 z-40 w-36 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-2xl"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >

                <button
                  type="button"
                  onClick={onOpen}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-400 transition hover:bg-slate-900 hover:text-white"
                >
                  <ListMusic className="h-3.5 w-3.5" />

                  Open
                </button>

                <button
                  type="button"
                  onClick={onEdit}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-400 transition hover:bg-slate-900 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />

                  Edit
                </button>

                <button
                  type="button"
                  onClick={onDelete}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-400 transition hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />

                  Delete
                </button>

              </div>
            )}

          </div>

        </div>

      </div>

    </article>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <Icon className="h-4 w-4" />
        </div>

        <div>

          <p className="text-xl font-bold text-white">
            {value}
          </p>

          <p className="text-[10px] text-slate-600">
            {label}
          </p>

        </div>

      </div>

    </div>
  );
}

// ============================================================
// PLAYLIST MODAL
// ============================================================

function PlaylistModal({
  title,
  name,
  description,
  isPublic,
  showVisibility,
  setName,
  setDescription,
  setIsPublic,
  onClose,
  onSubmit,
  loading,
  submitText,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

          <div>

            <h2 className="text-base font-bold text-white">
              {title}
            </h2>

            <p className="mt-0.5 text-[10px] text-slate-600">
              Build your music collection.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-900 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        {/* Form */}

        <form
          onSubmit={onSubmit}
          className="space-y-4 p-5"
        >

          {/* Name */}

          <div>

            <label className="mb-2 block text-xs font-semibold text-slate-400">
              Playlist name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="e.g. Late Night Vibes"
              autoFocus
              className="
                w-full
                rounded-xl
                border
                border-slate-800
                bg-slate-900
                px-4
                py-3
                text-sm
                text-white
                outline-none
                placeholder:text-slate-600
                focus:border-emerald-500/40
                focus:ring-4
                focus:ring-emerald-500/5
              "
            />

          </div>

          {/* Description */}

          <div>

            <label className="mb-2 block text-xs font-semibold text-slate-400">
              Description

              <span className="ml-1 text-slate-700">
                optional
              </span>
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="What's this playlist about?"
              rows={3}
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-slate-800
                bg-slate-900
                px-4
                py-3
                text-sm
                text-white
                outline-none
                placeholder:text-slate-600
                focus:border-emerald-500/40
                focus:ring-4
                focus:ring-emerald-500/5
              "
            />

          </div>

          {/* ADMIN VISIBILITY */}

          {showVisibility && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    {isPublic ? (
                      <Globe2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-500" />
                    )}

                    <p className="text-xs font-semibold text-white">
                      Playlist visibility
                    </p>

                  </div>

                  <p className="mt-1 text-[10px] leading-5 text-slate-500">

                    {isPublic
                      ? 'Anyone can see this playlist.'
                      : 'Only admins can see this playlist.'}

                  </p>

                </div>

                {/* Toggle */}

                <button
                  type="button"
                  onClick={() =>
                    setIsPublic(
                      !isPublic
                    )
                  }
                  className={`
                    relative
                    h-6
                    w-11
                    shrink-0
                    rounded-full
                    transition
                    ${
                      isPublic
                        ? 'bg-emerald-400'
                        : 'bg-slate-700'
                    }
                  `}
                  aria-label="Toggle playlist visibility"
                  aria-pressed={isPublic}
                >

                  <span
                    className={`
                      absolute
                      top-1
                      h-4
                      w-4
                      rounded-full
                      bg-white
                      shadow
                      transition
                      ${
                        isPublic
                          ? 'left-6'
                          : 'left-1'
                      }
                    `}
                  />

                </button>

              </div>

              <div className="mt-3 flex items-center gap-2">

                <span
                  className={`
                    inline-flex
                    items-center
                    gap-1
                    rounded-md
                    px-2
                    py-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    ${
                      isPublic
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }
                  `}
                >
                  {isPublic ? (
                    <>
                      <Globe2 className="h-3 w-3" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" />
                      Private
                    </>
                  )}
                </span>

                <span className="text-[10px] text-slate-600">

                  {isPublic
                    ? 'Visible to all users'
                    : 'Hidden from normal users'}

                </span>

              </div>

            </div>
          )}

          {/* Buttons */}

          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-900 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                !name.trim()
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-emerald-400
                px-4
                py-2.5
                text-xs
                font-bold
                text-slate-950
                transition
                hover:bg-emerald-300
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />

                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />

                  {submitText}
                </>
              )}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

// ============================================================
// CONFIRM MODAL
// ============================================================

function ConfirmModal({
  title,
  description,
  onClose,
  onConfirm,
  loading,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
          <Trash2 className="h-5 w-5" />
        </div>

        <h2 className="mt-4 text-base font-bold text-white">
          {title}
        </h2>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-2">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-900 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-400 disabled:opacity-40"
          >
            {loading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}

            Delete
          </button>

        </div>

      </div>

    </div>
  );
}