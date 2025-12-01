import { Router } from 'express';
import { getInbox, getSent, getMessageThread, postMessage, markMessage } from '../controllers/messageController';
import { studentAuth } from '../middleware/studentAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/inbox', studentAuth, asyncHandler(getInbox));
router.get('/sent', studentAuth, asyncHandler(getSent));
router.get('/thread/:id', studentAuth, asyncHandler(getMessageThread));
router.post('/', studentAuth, asyncHandler(postMessage));
router.patch('/:id/read', studentAuth, asyncHandler(markMessage));

export default router;
