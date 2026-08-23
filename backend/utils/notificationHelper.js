import { query } from '../config/db.js';

// ============================================================
// CREATE NOTIFICATION FOR ONE USER
// ============================================================

export const createNotification = async ({
  userId,
  type = 'system',
  title,
  message,
  link = null,
}) => {
  if (!userId) {
    throw new Error(
      'userId is required to create notification'
    );
  }

  if (!title || !message) {
    throw new Error(
      'Notification title and message are required'
    );
  }

  const result = await query(
    `
    INSERT INTO notifications
    (
      user_id,
      type,
      title,
      message,
      link
    )

    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5
    )

    RETURNING *
    `,
    [
      userId,
      type,
      title,
      message,
      link,
    ]
  );

  return result.rows[0];
};


// ============================================================
// NOTIFY ALL USERS
// ============================================================

export const notifyAllUsers = async ({
  type = 'system',
  title,
  message,
  link = null,
}) => {
  if (!title || !message) {
    throw new Error(
      'Notification title and message are required'
    );
  }

  const result = await query(
    `
    INSERT INTO notifications
    (
      user_id,
      type,
      title,
      message,
      link
    )

    SELECT
      id,
      $1,
      $2,
      $3,
      $4

    FROM users

    WHERE role = 'user'

    RETURNING *
    `,
    [
      type,
      title,
      message,
      link,
    ]
  );

  return result.rows;
};


// ============================================================
// NOTIFY ALL USERS EXCEPT SPECIFIC USER
// Useful when ADMIN performs an action
// ============================================================

export const notifyAllUsersExcept = async ({
  excludeUserId,
  type = 'system',
  title,
  message,
  link = null,
}) => {
  if (!title || !message) {
    throw new Error(
      'Notification title and message are required'
    );
  }

  const result = await query(
    `
    INSERT INTO notifications
    (
      user_id,
      type,
      title,
      message,
      link
    )

    SELECT
      id,
      $1,
      $2,
      $3,
      $4

    FROM users

    WHERE role = 'user'
    AND id != $5

    RETURNING *
    `,
    [
      type,
      title,
      message,
      link,
      excludeUserId,
    ]
  );

  return result.rows;
};