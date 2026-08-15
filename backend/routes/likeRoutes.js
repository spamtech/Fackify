import express from 'express';
// Note: If you renamed your controller file to fix the typo, change 'likeCotroller.js' to 'likeController.js'
import { toggleLike, getLikedSongs } from '../controllers/likeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply JWT authentication guard to all like routes
router.use(protect);

// @route   GET /api/likes -> Fetch all songs liked by the logged-in user
router.get('/', getLikedSongs);

// @route   POST /api/likes/:songId -> Toggle like / unlike for a specific song
router.post('/:songId', toggleLike);

export default router;