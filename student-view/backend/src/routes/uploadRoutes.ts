import { Router } from 'express';
import { upload } from '../utils/uploader';
import { uploadSupportingFile } from '../controllers/uploadController';
import { studentAuth } from '../middleware/studentAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/absence-proof', studentAuth, upload.single('file'), asyncHandler(uploadSupportingFile));

export default router;
