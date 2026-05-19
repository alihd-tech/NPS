import { Response } from 'express';
import { z } from 'zod';
import { serverService } from '../services/serverService';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError } from '../utils/errors';
import { DEFAULT_PAGINATION } from '../constants/index';

// Validation schemas
const createServerSchema = z.object({
  name: z.string().min(1, 'Server name is required').max(255),
  provider: z.enum(['aws', 'digitalocean', 'linode', 'hetzner', 'custom']),
  ipv4: z.string().ip({ version: 4 }).optional().nullable(),
  ipv6: z.string().ip({ version: 6 }).optional().nullable(),
  specs: z.object({
    cpu: z.number().positive('CPU count must be positive'),
    memory: z.number().positive('Memory must be positive'),
    disk: z.number().positive('Disk size must be positive'),
    os: z.string().min(1, 'OS is required'),
    region: z.string().min(1, 'Region is required'),
  }),
});

const updateServerSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  ipv4: z.string().ip({ version: 4 }).optional().nullable(),
  ipv6: z.string().ip({ version: 6 }).optional().nullable(),
});

export const serverController = {
  createServer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const validation = createServerSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const server = await serverService.createServer(req.userId, validation.data);

    const response: ApiResponse = {
      success: true,
      data: server,
      meta: { timestamp: new Date().toISOString() },
    };

    res.status(201).json(response);
  }),

  getServer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    const server = await serverService.getServerById(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: server,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  listServers: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGINATION.PAGE);
    const limit = Math.min(
      parseInt(req.query.limit as string) || DEFAULT_PAGINATION.LIMIT,
      DEFAULT_PAGINATION.MAX_LIMIT
    );
    const offset = (page - 1) * limit;

    const { servers, total } = await serverService.listServers(req.userId, limit, offset);
    const pages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: {
        items: servers,
        total,
        page,
        limit,
        pages,
      } as PaginatedResponse<any>,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  updateServer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;

    const validation = updateServerSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const server = await serverService.updateServer(id, req.userId, validation.data);

    const response: ApiResponse = {
      success: true,
      data: server,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  deleteServer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    await serverService.deleteServer(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: { message: 'Server deleted successfully' },
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  rebootServer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    const server = await serverService.rebootServer(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: server,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  shutdownServer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    const server = await serverService.shutdownServer(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: server,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  getServerStats: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    const stats = await serverService.getServerStats(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: stats,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),
};
