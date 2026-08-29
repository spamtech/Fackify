import { pool } from '../config/db.js';

// POST /api/contact - Submit Inquiry
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const userId = req.user?.id || req.user?._id || null;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, phone, message) are required.',
      });
    }

    const query = `
      INSERT INTO contact_messages (user_id, name, email, phone, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [userId, name, email, phone, message]);

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been recorded successfully.',
      data: rows[0],
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process inquiry submission.',
    });
  }
};

// GET /api/contact/admin/messages - Fetch messages & unread count
export const getAdminMessages = async (req, res) => {
  try {
    const messagesQuery = `
      SELECT * FROM contact_messages
      ORDER BY created_at DESC;
    `;
    const countQuery = `
      SELECT COUNT(*) AS unread_count 
      FROM contact_messages 
      WHERE is_read = false;
    `;

    const [messagesResult, countResult] = await Promise.all([
      pool.query(messagesQuery),
      pool.query(countQuery),
    ]);

    return res.status(200).json({
      success: true,
      unreadCount: parseInt(countResult.rows[0].unread_count, 10) || 0,
      messages: messagesResult.rows,
    });
  } catch (error) {
    console.error('Fetch admin messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages.',
    });
  }
};

// PUT /api/contact/admin/messages/:id/read - Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE contact_messages
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    return res.status(200).json({
      success: true,
      message: rows[0],
    });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update message status.',
    });
  }
};

// DELETE /api/contact/admin/messages/clear - Delete all messages
export const clearAllMessages = async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_messages;');
    return res.status(200).json({
      success: true,
      message: 'All support messages have been purged.',
    });
  } catch (error) {
    console.error('Clear messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear messages from database.',
    });
  }
};