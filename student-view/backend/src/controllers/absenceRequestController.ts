import { Response } from 'express';
import { createAbsenceRequest, listAbsenceRequests } from '../services/absenceRequestService';
import { StudentRequest } from '../types/request';

export const postAbsenceRequest = async (req: StudentRequest, res: Response) => {
  const { absenceId, reason, fileUrl } = req.body;
  if (!absenceId || !reason) {
    return res.status(400).json({ message: 'absenceId and reason are required' });
  }
  const request = await createAbsenceRequest(req.student!.studentId, Number(absenceId), reason, fileUrl);
  if (!request) {
    return res.status(404).json({ message: 'Absence not found for student' });
  }
  res.status(201).json(request);
};

export const getAbsenceRequests = async (req: StudentRequest, res: Response) => {
  const requests = await listAbsenceRequests(req.student!.studentId);
  res.json({ items: requests });
};
