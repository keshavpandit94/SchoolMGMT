import express from 'express';
import {
  getTeachers,
  getTeacherById,
  updateTeacher,
  updateTeacherStatus,
  deleteTeacher,
  approveTeacherStatusRequest,
} from '../controllers/teacherController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('Admin', 'Principal', 'Teacher', 'Staff'), getTeachers);
router.get('/:id', restrictTo('Admin', 'Principal', 'Teacher', 'Staff'), getTeacherById);

router.patch('/:id/status', restrictTo('Admin', 'Principal'), updateTeacherStatus);
router.patch('/:id/approve-status', restrictTo('Admin'), approveTeacherStatusRequest);
router.put('/:id', restrictTo('Admin', 'Principal'), updateTeacher);
router.delete('/:id', restrictTo('Admin', 'Principal'), deleteTeacher);

export default router;
