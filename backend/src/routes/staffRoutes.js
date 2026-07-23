import express from 'express';
import {
  getStaff,
  getStaffById,
  updateStaff,
  updateStaffStatus,
  deleteStaff,
} from '../controllers/staffController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('Admin', 'Principal', 'Teacher', 'Staff'), getStaff);
router.get('/:id', restrictTo('Admin', 'Principal', 'Teacher', 'Staff'), getStaffById);

router.patch('/:id/status', restrictTo('Admin', 'Principal'), updateStaffStatus);
router.put('/:id', restrictTo('Admin', 'Principal'), updateStaff);
router.delete('/:id', restrictTo('Admin', 'Principal'), deleteStaff);

export default router;
