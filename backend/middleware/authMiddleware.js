import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ============================================================
// STRICT PROTECTION
// ============================================================

export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  // Optional Bearer token support
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no session token');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userResult = await query(
      `
      SELECT
        id,
        username,
        email,
        role,
        blocked
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      res.status(401);
      throw new Error('User no longer exists');
    }

    const user = userResult.rows[0];

    // Blocked users cannot access protected routes
    if (user.blocked === true) {
      res.status(403);
      throw new Error('Your account has been blocked');
    }

    req.user = user;

    next();
  } catch (error) {
    // Preserve intentional 403 blocked response
    if (error.statusCode === 403) {
      throw error;
    }

    res.status(401);
    throw new Error(
      'Not authorized, token invalid or expired'
    );
  }
});


// ============================================================
// ADMIN ONLY
// ============================================================

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  res.status(403);
  throw new Error(
    'Access denied: Admin privileges required'
  );
};


// ============================================================
// OPTIONAL AUTH
// Public routes can use this.
// Logged-in users get req.user.
// Guests get req.user = null.
// ============================================================

export const optionalAuth = asyncHandler(
  async (req, res, next) => {
    let token = req.cookies?.token;

    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const userResult = await query(
        `
        SELECT
          id,
          username,
          email,
          role,
          blocked
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [decoded.id]
      );

      if (userResult.rows.length === 0) {
        req.user = null;
        return next();
      }

      const user = userResult.rows[0];

      if (user.blocked === true) {
        req.user = null;
        return next();
      }

      req.user = user;

    } catch (error) {
      req.user = null;
    }

    next();
  }
);