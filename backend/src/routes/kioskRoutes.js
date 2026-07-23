import express from 'express';
import {
  registerStaffFace,
  verifyPinStep,
  verifyFaceAttendance,
  getKioskLogs,
} from '../controllers/kioskController.js';

const router = express.Router();

// Public Kiosk & Biometric Registration Endpoints
router.post('/verify-pin', verifyPinStep);
router.post('/verify-face-attendance', verifyFaceAttendance);
router.post('/register-face', registerStaffFace);
router.get('/logs', getKioskLogs);

export default router;
