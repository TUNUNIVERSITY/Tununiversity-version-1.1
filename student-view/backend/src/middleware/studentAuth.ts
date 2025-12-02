import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedStudent } from '../types/auth';
import { pool } from '../db/pool';

export const studentAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Try to get token from URL parameters first (for cross-service navigation)
  let token = req.query.token as string | undefined;
  
  // Fallback to Authorization header
  if (!token) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing authorization header' });
    }
    token = header.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Invalid authorization' });
  }

  try {
    const { jwtSecret } = env;
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }
    const decoded = jwt.verify(token, jwtSecret as jwt.Secret) as jwt.JwtPayload & Partial<AuthenticatedStudent>;
    
    // Check role
    if (decoded.role !== 'student') {
      return res.status(403).json({ message: 'Forbidden: invalid role' });
    }
    
    // Map the token fields to our expected format
    // The login service provides: id, cin, role, email
    const userId = decoded.userId ?? decoded.id;
    
    if (userId === undefined) {
      return res.status(403).json({ message: 'Forbidden: missing user id' });
    }
    
    // Look up the actual student_id from the students table
    const studentQuery = await pool.query('SELECT id FROM students WHERE user_id = $1', [userId]);
    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    const studentId = studentQuery.rows[0].id;
    
    const studentPayload: AuthenticatedStudent = {
      userId: Number(userId),
      studentId: Number(studentId),
      role: 'student',
      email: String(decoded.email ?? ''),
    };
    (req as any).student = studentPayload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
