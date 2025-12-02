import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import studentRoutes from './routes/studentRoutes';
import timetableRoutes from './routes/timetableRoutes';
import notificationRoutes from './routes/notificationRoutes';
import absenceRoutes from './routes/absenceRoutes';
import gradeRoutes from './routes/gradeRoutes';
import messageRoutes from './routes/messageRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('tiny'));
app.use('/uploads', express.static(path.resolve(env.fileUploadDir)));

// Consolidate all routes under /api/students for API Gateway
app.use('/api/students', studentRoutes);
app.use('/api/students/timetable', timetableRoutes);
app.use('/api/students/notifications', notificationRoutes);
app.use('/api/students/absences', absenceRoutes);
app.use('/api/students/grades', gradeRoutes);
app.use('/api/students/messages', messageRoutes);
app.use('/api/students/uploads', uploadRoutes);

app.use(errorHandler);

export default app;
