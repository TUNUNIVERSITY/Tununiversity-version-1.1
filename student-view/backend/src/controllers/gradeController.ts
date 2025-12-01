import { Response } from 'express';
import { listGrades, getGradeStats } from '../services/gradeService';
import { StudentRequest } from '../types/request';

export const getGrades = async (req: StudentRequest, res: Response) => {
  const { semester, subjectId } = req.query;
  const grades = await listGrades(
    req.student!.studentId,
    semester ? Number(semester) : undefined,
    subjectId ? Number(subjectId) : undefined
  );
  res.json({ items: grades });
};

export const getGradesStats = async (req: StudentRequest, res: Response) => {
  const stats = await getGradeStats(req.student!.studentId);
  res.json({ items: stats });
};
