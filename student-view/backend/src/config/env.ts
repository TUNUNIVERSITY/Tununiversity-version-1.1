import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const required = ['DATABASE_URL', 'JWT_SECRET'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Warning: environment variable ${key} is not set`);
  }
});

interface EnvConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  fileUploadDir: string;
  storageBaseUrl: string;
}

export const env: EnvConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'changeme',
  fileUploadDir: process.env.FILE_UPLOAD_DIR ?? path.resolve(process.cwd(), 'uploads'),
  storageBaseUrl: process.env.STORAGE_BASE_URL ?? 'http://localhost:4000/uploads'
};
