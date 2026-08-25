import express from 'express';

import {
  getAllSongs,
  getTrendingSongs,
  getSongsByArtistId,
  addSong,
  updateSong,
  deleteSong,
} from '../controllers/songController.js';

import {
  protect,
  adminOnly,
  optionalAuth,
} from '../middleware/authMiddleware.js';


const router = express.Router();


// ============================================================
// PUBLIC / OPTIONAL AUTH
// ============================================================

router.get(
  '/trending',
  optionalAuth,
  getTrendingSongs
);

router.get(
  '/artist/:artistId',
  optionalAuth,
  getSongsByArtistId
);

router.get(
  '/',
  optionalAuth,
  getAllSongs
);


// ============================================================
// ADMIN ONLY
// ============================================================

router.post(
  '/',
  protect,
  adminOnly,
  addSong
);


router.put(
  '/:id',
  protect,
  adminOnly,
  updateSong
);


router.delete(
  '/:id',
  protect,
  adminOnly,
  deleteSong
);


export default router;