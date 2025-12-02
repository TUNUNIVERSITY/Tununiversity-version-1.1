import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { env } from '../config/env';

if (!fs.existsSync(env.fileUploadDir)) {
  fs.mkdirSync(env.fileUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.fileUploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

export const upload = multer({ storage });

export const buildPublicUrl = (filename: string) => `${env.storageBaseUrl}/${filename}`;
