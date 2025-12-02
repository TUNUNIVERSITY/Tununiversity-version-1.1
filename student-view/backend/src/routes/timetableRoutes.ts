import { Router } from 'express';
import { getTimetable, exportTimetablePdf } from '../controllers/timetableController';
import { studentAuth } from '../middleware/studentAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', studentAuth, asyncHandler(getTimetable));
router.get('/export', studentAuth, asyncHandler(exportTimetablePdf));

export default router;
