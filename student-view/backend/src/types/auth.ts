export interface AuthenticatedStudent {
  userId: number;
  studentId: number;
  role: string;
  email: string;
}

export interface RequestContext {
  traceId: string;
}
