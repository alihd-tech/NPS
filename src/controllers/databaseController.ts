import { Response } from 'express';
import { z } from 'zod';
import { databaseService } from '../services/databaseService';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError } from '../utils/errors';
import { DEFAULT_PAGINATION } from '../constants/index';

// Validation schemas
const createDatabaseSchema = z.object({
  name: z.string().min(1, 'Database name is required').max(255),
  type: z.enum(['postgresql', 'mysql', 'mongodb', 'redis']),
  username: z.string().min(1, 'Username is required').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  port: z.number().int().min(1).max(65535).optional(),
});

const updateDatabaseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  username: z.string().min(1).max(255).optional(),
  password: z.string().min(8).optional(),
});

const restoreSchema = z.object({
  backupId: z.string().min(1, 'Backup ID is required'),
});

export const databaseController = {
  createDatabase: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { serverId } = req.params;

    const validation = createDatabaseSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const database = await databaseService.createDatabase(
      serverId,
      req.userId,
      validation.data
    );

    const response: ApiResponse = {
      success: true,
      data: database,
      meta: { timestamp: new Date().toISOString() },
    };

    res.status(201).json(response);
  }),

  getDatabase: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    const database = await databaseService.getDatabaseById(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: database,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  listDatabases: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { serverId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGINATION.PAGE);
    const limit = Math.min(
      parseInt(req.query.limit as string) || DEFAULT_PAGINATION.LIMIT,
      DEFAULT_PAGINATION.MAX_LIMIT
    );
    const offset = (page - 1) * limit;

    const { databases, total } = await databaseService.listDatabases(
      serverId,
      req.userId,
      limit,
      offset
    );
    const pages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: {
        items: databases,
        total,
        page,
        limit,
        pages,
      } as PaginatedResponse<any>,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  updateDatabase: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;

    const validation = updateDatabaseSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const database = await databaseService.updateDatabase(id, req.userId, validation.data);

    const response: ApiResponse = {
      success: true,
      data: database,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  deleteDatabase: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    await databaseService.deleteDatabase(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: { message: 'Database deleted successfully' },
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  backupDatabase: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    const result = await databaseService.backupDatabase(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  restoreDatabase: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;

    const validation = restoreSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const result = await databaseService.restoreDatabase(
      id,
      req.userId,
      validation.data.backupId
    );

    const response: ApiResponse = {
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),
};
