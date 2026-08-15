import express from 'express';
import { getAllSongs, addSong, updateSong, deleteSong } from '../controllers/songController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getAllSongs);
router.post('/', protect, adminOnly, addSong);
router.put('/:id', protect, adminOnly, updateSong);
router.delete('/:id', protect, adminOnly, deleteSong);

export default router;