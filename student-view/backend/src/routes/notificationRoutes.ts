import { Router } from 'express';
import { getNotifications, markNotification } from '../controllers/notificationController';
import { studentAuth } from '../middleware/studentAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', studentAuth, asyncHandler(getNotifications));
router.patch('/:id/read', studentAuth, asyncHandler(markNotification));

export default router;
