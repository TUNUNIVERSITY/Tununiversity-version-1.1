import { Response } from 'express';
import { getStudentProfile } from '../services/studentService';
import { getStudentStats } from '../services/studentStatsService';
import { StudentRequest } from '../types/request';

export const getMe = async (req: StudentRequest, res: Response) => {
  const studentId = req.student!.studentId;
  const profile = await getStudentProfile(studentId);
  if (!profile) {
    return res.status(404).json({ message: 'Student not found' });
  }
  const stats = await getStudentStats(studentId);
  res.json({ profile, stats });
};
