import { Router } from 'express';
import { getAbsences, getAbsenceStatistics } from '../controllers/absenceController';
import { postAbsenceRequest, getAbsenceRequests } from '../controllers/absenceRequestController';
import { studentAuth } from '../middleware/studentAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', studentAuth, asyncHandler(getAbsences));
router.get('/stats', studentAuth, asyncHandler(getAbsenceStatistics));
router.post('/requests', studentAuth, asyncHandler(postAbsenceRequest));
router.get('/requests', studentAuth, asyncHandler(getAbsenceRequests));

export default router;
