import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Public route to get settings
router.get('/', getSettings);

// Admin route to update settings
router.put('/', protect, authorize('admin', 'superadmin'), updateSettings);

export default router;
