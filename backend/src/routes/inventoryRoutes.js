import express from 'express';
import {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
} from '../controllers/inventoryController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('Admin', 'Principal', 'Teacher', 'Staff'), getInventory);
router.get('/:id', restrictTo('Admin', 'Principal', 'Teacher', 'Staff'), getInventoryById);

router.post('/', restrictTo('Admin', 'Principal', 'Teacher', 'Staff'), createInventory);
router.put('/:id', restrictTo('Admin', 'Principal', 'Teacher', 'Staff'), updateInventory);
router.delete('/:id', restrictTo('Admin', 'Principal', 'Teacher', 'Staff'), deleteInventory);

export default router;
