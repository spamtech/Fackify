import express from 'express';

import {
  getUserPlaylists,
  createPlaylist,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  getAdminAllPlaylists,
} from '../controllers/playlistController.js';

import {
  protect,
  adminOnly,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================
// ALL PLAYLIST ROUTES REQUIRE LOGIN
// ============================================================

router.use(protect);

// ============================================================
// USER PLAYLISTS
// ============================================================

router.get(
  '/',
  getUserPlaylists
);

router.post(
  '/',
  createPlaylist
);

// ============================================================
// ADMIN
// ============================================================

router.get(
  '/admin/all',
  adminOnly,
  getAdminAllPlaylists
);

// ============================================================
// SINGLE PLAYLIST
// ============================================================

router.get(
  '/:id',
  getPlaylistById
);

router.put(
  '/:id',
  updatePlaylist
);

router.delete(
  '/:id',
  deletePlaylist
);

// ============================================================
// PLAYLIST SONGS
// ============================================================

router.post(
  '/:id/songs',
  addSongToPlaylist
);

router.delete(
  '/:id/songs/:songId',
  removeSongFromPlaylist
);

export default router;