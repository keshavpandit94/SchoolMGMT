import express from 'express';
import { getEvents, createEvent, deleteEvent } from '../controllers/eventController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getEvents);
router.post('/', protect, restrictTo('Admin', 'Principal'), createEvent);
router.delete('/:id', protect, restrictTo('Admin', 'Principal'), deleteEvent);

export default router;
