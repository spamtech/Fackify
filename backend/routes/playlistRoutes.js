import express from 'express';

import {
  getUserPlaylists,
  createPlaylist,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  togglePlaylistFavorite, // <--- 1. Add this import

  // Admin
  getAdminAllPlaylists,
  getAdminPlaylistById,
  updatePlaylistVisibility,
  makePlaylistPublic,
  makePlaylistPrivate,
} from '../controllers/playlistController.js';

import {
  protect,
  adminOnly,
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// ============================================================
// USER PLAYLISTS
// ============================================================

router.get('/', getUserPlaylists);
router.post('/', createPlaylist);

// ============================================================
// FAVORITE / VIP PLAYLIST (ADD THIS)
// ============================================================

router.post('/:id/favorite', togglePlaylistFavorite); // <--- 2. Add this route

// ============================================================
// ADMIN PLAYLIST MANAGEMENT
// ============================================================

router.get('/admin/all', adminOnly, getAdminAllPlaylists);
router.get('/admin/:id', adminOnly, getAdminPlaylistById);
router.put('/admin/:id/visibility', adminOnly, updatePlaylistVisibility);
router.put('/admin/:id/public', adminOnly, makePlaylistPublic);
router.put('/admin/:id/private', adminOnly, makePlaylistPrivate);

// ============================================================
// SINGLE PLAYLIST
// ============================================================

router.get('/:id', getPlaylistById);
router.put('/:id', updatePlaylist);
router.delete('/:id', deletePlaylist);

// ============================================================
// PLAYLIST SONGS
// ============================================================

router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id/songs/:songId', removeSongFromPlaylist);

export default router;