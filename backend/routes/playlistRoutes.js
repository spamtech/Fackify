import express from 'express';

import {
  getUserPlaylists,
  createPlaylist,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
  updatePlaylist,

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
// ADMIN PLAYLIST MANAGEMENT
// ============================================================

// Get ALL playlists
router.get(
  '/admin/all',
  adminOnly,
  getAdminAllPlaylists
);


// Get ONE playlist + all songs
router.get(
  '/admin/:id',
  adminOnly,
  getAdminPlaylistById
);


// ============================================================
// ADMIN PLAYLIST VISIBILITY
// ============================================================

// Generic visibility endpoint
// Body:
// {
//   "isPublic": true
// }
//
// or
//
// {
//   "isPublic": false
// }

router.put(
  '/admin/:id/visibility',
  adminOnly,
  updatePlaylistVisibility
);


// ============================================================
// OPTIONAL EXPLICIT PUBLIC / PRIVATE ENDPOINTS
// ============================================================

// Make playlist public
router.put(
  '/admin/:id/public',
  adminOnly,
  makePlaylistPublic
);


// Make playlist private
router.put(
  '/admin/:id/private',
  adminOnly,
  makePlaylistPrivate
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