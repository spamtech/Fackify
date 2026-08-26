import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ============================================================
// GET USER NOTIFICATIONS
// GET /api/notifications
// Private
// ============================================================

export const getNotifications = asyncHandler(async (req, res) => {
  const result = await query(
    `
    SELECT
      id,
      type,
      title,
      message,
      link,
      is_read,
      created_at
    FROM notifications
    WHERE user_id = $1::uuid
    ORDER BY created_at DESC
    LIMIT 50
    `,
    [req.user.id]
  );

  const unreadResult = await query(
    `
    SELECT COUNT(*)::int AS count
    FROM notifications
    WHERE user_id = $1::uuid
      AND is_read = false
    `,
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    notifications: result.rows,
    unreadCount: unreadResult.rows[0]?.count || 0,
  });
});

// ============================================================
// MARK ONE NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// Private
// ============================================================

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `
    UPDATE notifications
    SET is_read = true
    WHERE id = $1
      AND user_id = $2::uuid
    RETURNING *
    `,
    [id, req.user.id]
  );

  if (result.rowCount === 0) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    notification: result.rows[0],
  });
});

// ============================================================
// MARK ALL AS READ
// PUT /api/notifications/read-all
// Private
// ============================================================

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await query(
    `
    UPDATE notifications
    SET is_read = true
    WHERE user_id = $1::uuid
      AND is_read = false
    `,
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// ============================================================
// DELETE SINGLE NOTIFICATION
// DELETE /api/notifications/:id
// Private
// ============================================================

export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `
    DELETE FROM notifications
    WHERE id = $1
      AND user_id = $2::uuid
    RETURNING id
    `,
    [id, req.user.id]
  );

  if (result.rowCount === 0) {
    res.status(404);
    throw new Error('Notification not found or already removed');
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted permanently',
  });
});

// ============================================================
// CLEAR ALL NOTIFICATIONS (NEW)
// DELETE /api/notifications/clear-all
// Private
// ============================================================

export const clearAllNotifications = asyncHandler(async (req, res) => {
  const result = await query(
    `
    DELETE FROM notifications
    WHERE user_id = $1::uuid
    RETURNING id
    `,
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    message: 'All notifications cleared successfully',
    deletedCount: result.rowCount,
  });
});

// ============================================================
// GET UNREAD NOTIFICATION COUNT
// GET /api/notifications/unread-count
// Private
// ============================================================

export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const result = await query(
    `
    SELECT COUNT(*)::int AS count
    FROM notifications
    WHERE user_id = $1::uuid
      AND is_read = false
    `,
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    count: result.rows[0]?.count || 0,
  });
});