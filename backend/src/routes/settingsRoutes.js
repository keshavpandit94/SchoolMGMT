import express from 'express';
import {
  getAttendanceWindowSettings,
  updateAttendanceWindowSettings,
} from '../controllers/settingsController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/attendance-window', getAttendanceWindowSettings);
router.post('/attendance-window', protect, restrictTo('Admin', 'Principal'), updateAttendanceWindowSettings);

export default router;
