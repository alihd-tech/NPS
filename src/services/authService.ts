import { userQueries } from '../db/queries/userQueries';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors';
import { AuthResponse } from '../types/api';
import { User } from '../types/database';

export const authService = {
  register: async (email: string, password: string, confirmPassword: string): Promise<AuthResponse> => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new ValidationError('Password does not meet requirements', {
        errors: passwordValidation.errors,
      });
    }

    // Check if email already exists
    const existingUser = await userQueries.getByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userQueries.create(email, passwordHash);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Find user by email
    const user = await userQueries.getByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await userQueries.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Get user
      const user = await userQueries.getById(payload.userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      if (!user.is_active) {
        throw new UnauthorizedError('Account is deactivated');
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(user.id, user.email);
      const newRefreshToken = generateRefreshToken(user.id, user.email);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  },

  changePassword: async (
    userId: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    // Get user
    const user = await userQueries.getById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify old password
    const isValidPassword = await comparePassword(oldPassword, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Validate new passwords match
    if (newPassword !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new ValidationError('Password does not meet requirements', {
        errors: passwordValidation.errors,
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await userQueries.updatePassword(userId, newPasswordHash);
  },

  getProfile: async (userId: string) => {
    const user = await userQueries.getByIdSafe(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  },
};
