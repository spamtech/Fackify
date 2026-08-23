import express from 'express';

import {
  registerUser,
  loginUser,
  googleLogin,
  logoutUser,
  getMe,
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();


// Normal authentication
router.post('/register', registerUser);
router.post('/login', loginUser);


// Google authentication
router.post('/google', googleLogin);


// Logout
router.post('/logout', logoutUser);


// Current authenticated user
router.get('/me', protect, getMe);


export default router;