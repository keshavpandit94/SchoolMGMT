import express from 'express';
import {
  getDailyAttendance,
  saveDailyAttendance,
  getKioskRoster,
  verifyKioskAttendance,
} from '../controllers/attendanceController.js';

const router = express.Router();

// Public Kiosk & Attendance Portal Endpoints
router.get('/kiosk/roster', getKioskRoster);
router.post('/kiosk/verify', verifyKioskAttendance);
router.get('/', getDailyAttendance);
router.post('/', saveDailyAttendance);

export default router;
