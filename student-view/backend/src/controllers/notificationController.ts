import { Response } from 'express';
import { listNotifications, markNotificationRead } from '../services/notificationService';
import { StudentRequest } from '../types/request';

export const getNotifications = async (req: StudentRequest, res: Response) => {
  const { type, limit = '20', offset = '0' } = req.query;
  const notifications = await listNotifications(
    req.student!.userId,
    typeof type === 'string' ? type : undefined,
    Number(limit),
    Number(offset)
  );
  res.json({ items: notifications });
};

export const markNotification = async (req: StudentRequest, res: Response) => {
  const { id } = req.params;
  const notification = await markNotificationRead(Number(id), req.student!.userId);
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  res.json(notification);
};
