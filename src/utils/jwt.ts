import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/api';

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([mhd])$/);
  if (!match) throw new Error('Invalid expiry format');

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error('Invalid expiry unit');
  }
}

export function generateAccessToken(userId: string, email: string): string {
  const payload: JwtPayload = {
    userId,
    email,
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + parseExpiry(env.jwtExpiry),
  };

  return jwt.sign(payload, env.jwtSecret);
}

export function generateRefreshToken(userId: string, email: string): string {
  const payload: JwtPayload = {
    userId,
    email,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + parseExpiry(env.jwtRefreshExpiry),
  };

  return jwt.sign(payload, env.jwtRefreshSecret);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}
