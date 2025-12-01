import { Response } from 'express';
import { StudentRequest } from '../types/request';
import { buildPublicUrl } from '../utils/uploader';

export const uploadSupportingFile = async (req: StudentRequest, res: Response) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ message: 'File is required' });
  }
  const url = buildPublicUrl(file.filename);
  res.status(201).json({ url, fileName: file.originalname });
};
