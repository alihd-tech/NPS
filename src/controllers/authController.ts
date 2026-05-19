import { Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { ApiResponse } from '../types/api';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError } from '../utils/errors';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const authController = {
  register: asyncHandler(async (req, res: Response) => {
    // Validate request
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const { email, password, confirmPassword } = validation.data;

    // Register user
    const result = await authService.register(email, password, confirmPassword);

    const response: ApiResponse = {
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };

    res.status(201).json(response);
  }),

  login: asyncHandler(async (req, res: Response) => {
    // Validate request
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const { email, password } = validation.data;

    // Login user
    const result = await authService.login(email, password);

    const response: ApiResponse = {
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  refreshToken: asyncHandler(async (req, res: Response) => {
    // Validate request
    const validation = refreshTokenSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const { refreshToken } = validation.data;

    // Refresh tokens
    const result = await authService.refreshToken(refreshToken);

    const response: ApiResponse = {
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  changePassword: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) {
      throw new ValidationError('User ID not found');
    }

    // Validate request
    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const { oldPassword, newPassword, confirmPassword } = validation.data;

    // Change password
    await authService.changePassword(req.userId, oldPassword, newPassword, confirmPassword);

    const response: ApiResponse = {
      success: true,
      data: { message: 'Password changed successfully' },
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  getProfile: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) {
      throw new ValidationError('User ID not found');
    }

    // Get user profile
    const user = await authService.getProfile(req.userId);

    const response: ApiResponse = {
      success: true,
      data: user,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),
};
