import express from 'express';

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../controllers/notificationController.js';

import {
  protect,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================
// ALL NOTIFICATION ROUTES REQUIRE LOGIN
// ============================================================

router.use(protect);

// ============================================================
// GET ALL NOTIFICATIONS
// GET /api/notifications
// ============================================================

router.get(
  '/',
  getNotifications
);

// ============================================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// ============================================================

router.get(
  '/unread-count',
  getUnreadNotificationCount
);

// ============================================================
// MARK ALL AS READ
// IMPORTANT: KEEP BEFORE /:id/read
// ============================================================

router.put(
  '/read-all',
  markAllNotificationsAsRead
);

// ============================================================
// CLEAR ALL NOTIFICATIONS
// IMPORTANT: KEEP BEFORE /:id
// ============================================================

router.delete(
  '/clear-all',
  clearAllNotifications
);

// ============================================================
// MARK ONE AS READ
// PUT /api/notifications/:id/read
// ============================================================

router.put(
  '/:id/read',
  markNotificationAsRead
);

// ============================================================
// DELETE ONE NOTIFICATION
// DELETE /api/notifications/:id
// ============================================================

router.delete(
  '/:id',
  deleteNotification
);

export default router;