import { Router } from 'express';
import { getMe } from '../controllers/studentController';
import { studentAuth } from '../middleware/studentAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/me', studentAuth, asyncHandler(getMe));

export default router;
