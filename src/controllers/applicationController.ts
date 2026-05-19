import { Response } from 'express';
import { z } from 'zod';
import { applicationService } from '../services/applicationService';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError } from '../utils/errors';
import { DEFAULT_PAGINATION } from '../constants/index';

// Validation schemas
const createApplicationSchema = z.object({
  name: z.string().min(1, 'Application name is required').max(255),
  type: z.enum(['docker', 'nodejs', 'python', 'go', 'php', 'static']),
  git_repo: z.string().url('Invalid Git repository URL').optional().nullable(),
  git_branch: z.string().default('main'),
  deployment_strategy: z.enum(['rolling', 'blue-green', 'canary']).default('rolling'),
});

const updateApplicationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  git_repo: z.string().url().optional().nullable(),
  git_branch: z.string().optional(),
  deployment_strategy: z.enum(['rolling', 'blue-green', 'canary']).optional(),
});

const deploySchema = z.object({
  version: z.string().min(1, 'Deployment version is required'),
});

export const applicationController = {
  createApplication: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { serverId } = req.params;

    const validation = createApplicationSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const app = await applicationService.createApplication(
      serverId,
      req.userId,
      validation.data
    );

    const response: ApiResponse = {
      success: true,
      data: app,
      meta: { timestamp: new Date().toISOString() },
    };

    res.status(201).json(response);
  }),

  getApplication: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    const app = await applicationService.getApplicationById(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: app,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  listApplications: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { serverId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGINATION.PAGE);
    const limit = Math.min(
      parseInt(req.query.limit as string) || DEFAULT_PAGINATION.LIMIT,
      DEFAULT_PAGINATION.MAX_LIMIT
    );
    const offset = (page - 1) * limit;

    const { applications, total } = await applicationService.listApplications(
      serverId,
      req.userId,
      limit,
      offset
    );
    const pages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: {
        items: applications,
        total,
        page,
        limit,
        pages,
      } as PaginatedResponse<any>,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  updateApplication: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;

    const validation = updateApplicationSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const app = await applicationService.updateApplication(id, req.userId, validation.data);

    const response: ApiResponse = {
      success: true,
      data: app,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  deleteApplication: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    await applicationService.deleteApplication(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: { message: 'Application deleted successfully' },
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  deployApplication: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;

    const validation = deploySchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const app = await applicationService.deployApplication(
      id,
      req.userId,
      validation.data.version
    );

    const response: ApiResponse = {
      success: true,
      data: app,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  stopApplication: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    const app = await applicationService.stopApplication(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: app,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  startApplication: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    const app = await applicationService.startApplication(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: app,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),
};
