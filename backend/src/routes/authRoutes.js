import express from 'express';
import {
  setupAdmin,
  registerUser,
  login,
  verifyOTP,
  logout,
  getMe,
} from '../controllers/authController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/setup-admin', setupAdmin);
router.post('/register', protect, restrictTo('Admin', 'Principal'), registerUser);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
