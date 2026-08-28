import express from 'express';

import {
  getAdminStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  updateUserPremiumStatus,
  getAllLikesActivity,
  updateUserBlockStatus,
  deleteUser,
} from '../controllers/adminController.js';

import {
  protect,
  adminOnly,
} from '../middleware/authMiddleware.js';

const router = express.Router();


// All admin routes
router.use(protect, adminOnly);


// Dashboard
router.get('/stats', getAdminStats);


// Users
router.get('/users', getAllUsers);

router.get(
  '/users/:id/details',
  getUserDetails
);

router.put(
  '/users/:id/role',
  updateUserRole
);

// Fakeify Premium Approval / Revocation
router.put(
  '/users/:id/premium',
  updateUserPremiumStatus
);


// Block / Unblock
router.put(
  '/users/:id/block',
  updateUserBlockStatus
);


// Delete
router.delete(
  '/users/:id',
  deleteUser
);


// Likes
router.get(
  '/likes-activity',
  getAllLikesActivity
);


export default router;