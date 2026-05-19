import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'crypto';

export interface RequestWithId extends Request {
  id: string;
}

export function requestLogger(
  req: RequestWithId,
  res: Response,
  next: NextFunction
): void {
  req.id = uuidv4();
  const startTime = Date.now();

  // Log request
  console.log('[REQ]', {
    id: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    const duration = Date.now() - startTime;
    console.log('[RES]', {
      id: req.id,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
    return originalJson(data);
  };

  next();
}

export function generateRequestId(): string {
  return uuidv4();
}
