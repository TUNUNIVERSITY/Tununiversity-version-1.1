import { AuthenticatedStudent } from './auth';
import { Request } from 'express';

export interface StudentRequest extends Request {
  student?: AuthenticatedStudent;
  traceId?: string;
}
