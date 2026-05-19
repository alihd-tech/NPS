import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { JwtPayload } from '../types/api';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  userId?: string;
  email?: string;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      throw new UnauthorizedError('Missing authorization header');
    }

    // Extract token from "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const token = parts[1];

    // Verify token
    const payload = verifyAccessToken(token);

    // Check token type
    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Attach user info to request
    req.user = payload;
    req.userId = payload.userId;
    req.email = payload.email;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid token');
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      const payload = verifyAccessToken(token);

      if (payload.type === 'access') {
        req.user = payload;
        req.userId = payload.userId;
        req.email = payload.email;
      }
    }

    next();
  } catch {
    // Silently fail for optional auth
    next();
  }
}
