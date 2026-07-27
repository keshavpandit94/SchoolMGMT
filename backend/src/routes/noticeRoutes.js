import express from 'express';
import { getNotices, createNotice, deleteNotice } from '../controllers/noticeController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getNotices);
router.post('/', protect, restrictTo('Admin', 'Principal'), createNotice);
router.delete('/:id', protect, restrictTo('Admin', 'Principal'), deleteNotice);

export default router;
