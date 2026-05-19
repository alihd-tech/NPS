import { Express, Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../types/api';

export function setupErrorHandler(app: Express): void {
  // 404 handler
  app.use((req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    res.status(404).json(response);
  });
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = (req as any).id || 'unknown';

  // Log error
  console.error('[ERROR]', {
    requestId,
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });

  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
    res.status(err.statusCode).json(response);
  } else {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
    res.status(500).json(response);
  }
}

// Async wrapper to catch errors in async route handlers
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
