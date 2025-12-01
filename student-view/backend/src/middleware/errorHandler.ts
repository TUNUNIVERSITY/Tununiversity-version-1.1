import { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? 500;
  const body = {
    type: 'about:blank',
    title: err.title ?? 'Error',
    status,
    detail: err.message ?? 'Internal server error',
  };
  console.error(err);
  res.status(status).json(body);
};
