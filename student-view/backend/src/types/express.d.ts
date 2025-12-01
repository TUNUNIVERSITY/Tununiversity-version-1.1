import 'express-serve-static-core';
import { AuthenticatedStudent } from './auth';

declare module 'express-serve-static-core' {
  interface Request {
    student?: AuthenticatedStudent;
  }
}
