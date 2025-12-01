import { Response } from 'express';
import { listAbsences, getAbsenceStats } from '../services/absenceService';
import { StudentRequest } from '../types/request';

export const getAbsences = async (req: StudentRequest, res: Response) => {
  const { from, to } = req.query;
  const absences = await listAbsences(
    req.student!.studentId,
    typeof from === 'string' ? from : undefined,
    typeof to === 'string' ? to : undefined
  );
  res.json({ items: absences });
};

export const getAbsenceStatistics = async (req: StudentRequest, res: Response) => {
  const stats = await getAbsenceStats(req.student!.studentId);
  res.json({ items: stats });
};
