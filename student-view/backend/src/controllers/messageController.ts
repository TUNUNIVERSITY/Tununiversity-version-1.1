import { Response } from 'express';
import {
  listInboxMessages,
  listSentMessages,
  getThread,
  sendMessage,
  markMessageRead,
  getUserIdByEmail,
} from '../services/messageService';
import { StudentRequest } from '../types/request';

export const getInbox = async (req: StudentRequest, res: Response) => {
  const { page = '1', pageSize = '20' } = req.query;
  const limit = Number(pageSize);
  const offset = (Number(page) - 1) * limit;
  const items = await listInboxMessages(req.student!.userId, limit, offset);
  res.json({ items });
};

export const getSent = async (req: StudentRequest, res: Response) => {
  const { page = '1', pageSize = '20' } = req.query;
  const limit = Number(pageSize);
  const offset = (Number(page) - 1) * limit;
  const items = await listSentMessages(req.student!.userId, limit, offset);
  res.json({ items });
};

export const getMessageThread = async (req: StudentRequest, res: Response) => {
  const { id } = req.params;
  const thread = await getThread(Number(id), req.student!.userId);
  if (!thread.length) {
    return res.status(404).json({ message: 'Thread not found' });
  }
  res.json({ items: thread });
};

export const postMessage = async (req: StudentRequest, res: Response) => {
  const { recipientEmail, subject, content, parentMessageId } = req.body;
  
  console.log('Received message post request:', { recipientEmail, subject, content, parentMessageId });
  
  if (!recipientEmail || !content) {
    console.log('Validation failed:', { recipientEmail: !!recipientEmail, content: !!content });
    return res.status(400).json({ message: 'recipientEmail and content are required' });
  }

  const recipientId = await getUserIdByEmail(recipientEmail);
  if (!recipientId) {
    console.log('Recipient not found for email:', recipientEmail);
    return res.status(404).json({ message: 'Recipient not found' });
  }

  const message = await sendMessage(
    req.student!.userId,
    recipientId,
    subject ?? '',
    content,
    parentMessageId ? Number(parentMessageId) : undefined
  );
  console.log('Message sent successfully:', message.id);
  res.status(201).json(message);
};

export const markMessage = async (req: StudentRequest, res: Response) => {
  const { id } = req.params;
  const message = await markMessageRead(Number(id), req.student!.userId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }
  res.json(message);
};
