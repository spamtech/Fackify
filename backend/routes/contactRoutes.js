import express from 'express';
import {
  submitContact,
  getAdminMessages,
  markAsRead,
  clearAllMessages,
} from '../controllers/contactController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/admin/messages', protect, adminOnly, getAdminMessages);
router.put('/admin/messages/:id/read', protect, adminOnly, markAsRead);
router.delete('/admin/messages/clear', protect, adminOnly, clearAllMessages);

export default router;