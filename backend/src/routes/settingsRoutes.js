import express from 'express';
import {
  getAttendanceWindowSettings,
  updateAttendanceWindowSettings,
} from '../controllers/settingsController.js';

const router = express.Router();

router.get('/attendance-window', getAttendanceWindowSettings);
router.post('/attendance-window', updateAttendanceWindowSettings);

export default router;
