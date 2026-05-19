import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from '../utils/errors';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * In production, use Redis for distributed rate limiting
 */
export const createRateLimiter = (windowMs: number, maxRequests: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    if (!store[key]) {
      store[key] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    if (now > store[key].resetTime) {
      store[key] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      res.set('Retry-After', retryAfter.toString());
      throw new TooManyRequestsError(
        `Rate limit exceeded. Try again in ${retryAfter} seconds.`
      );
    }

    res.set('X-RateLimit-Limit', maxRequests.toString());
    res.set('X-RateLimit-Remaining', (maxRequests - store[key].count).toString());
    res.set('X-RateLimit-Reset', store[key].resetTime.toString());

    next();
  };
};

/**
 * General API rate limiter: 100 requests per 15 minutes
 */
export const apiLimiter = createRateLimiter(15 * 60 * 1000, 100);

/**
 * Auth rate limiter: 5 requests per 15 minutes
 */
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5);

/**
 * Cleanup old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60 * 1000); // Cleanup every minute
