import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('Admin', 'Principal', 'Teacher', 'Staff'), getStudents);
router.get('/:id', restrictTo('Admin', 'Principal', 'Teacher', 'Staff'), getStudentById);

router.post('/', restrictTo('Admin', 'Principal', 'Teacher'), createStudent);
router.put('/:id', restrictTo('Admin', 'Principal', 'Teacher'), updateStudent);
router.delete('/:id', restrictTo('Admin', 'Principal', 'Teacher'), deleteStudent);

export default router;
