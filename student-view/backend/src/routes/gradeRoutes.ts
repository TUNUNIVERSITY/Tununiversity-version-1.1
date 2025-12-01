import { Router } from 'express';
import { getGrades, getGradesStats } from '../controllers/gradeController';
import { studentAuth } from '../middleware/studentAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', studentAuth, asyncHandler(getGrades));
router.get('/stats', studentAuth, asyncHandler(getGradesStats));

export default router;
