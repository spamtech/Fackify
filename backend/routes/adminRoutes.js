import express from 'express';
import { getAdminActivity, updateUserRole } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/activity', getAdminActivity);
router.patch('/users/:id/role', updateUserRole);

export default router;