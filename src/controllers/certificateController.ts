import { Response } from 'express';
import { z } from 'zod';
import { certificateService } from '../services/certificateService';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError } from '../utils/errors';
import { DEFAULT_PAGINATION } from '../constants/index';

// Validation schemas
const createCertificateSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  auto_renew: z.boolean().default(true),
  issuer: z.enum(['letsencrypt', 'custom']).default('letsencrypt'),
});

const renewCertificateSchema = z.object({
  force: z.boolean().default(false),
});

export const certificateController = {
  createCertificate: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { serverId } = req.params;

    const validation = createCertificateSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const cert = await certificateService.createCertificate(
      serverId,
      req.userId,
      validation.data
    );

    const response: ApiResponse = {
      success: true,
      data: cert,
      meta: { timestamp: new Date().toISOString() },
    };

    res.status(201).json(response);
  }),

  getCertificate: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    const cert = await certificateService.getCertificateById(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: cert,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  listCertificates: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { serverId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGINATION.PAGE);
    const limit = Math.min(
      parseInt(req.query.limit as string) || DEFAULT_PAGINATION.LIMIT,
      DEFAULT_PAGINATION.MAX_LIMIT
    );
    const offset = (page - 1) * limit;

    const { certificates, total } = await certificateService.listCertificates(
      serverId,
      req.userId,
      limit,
      offset
    );
    const pages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: {
        items: certificates,
        total,
        page,
        limit,
        pages,
      } as PaginatedResponse<any>,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  deleteCertificate: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;
    await certificateService.deleteCertificate(id, req.userId);

    const response: ApiResponse = {
      success: true,
      data: { message: 'Certificate deleted successfully' },
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  renewCertificate: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const { id } = req.params;

    const validation = renewCertificateSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      throw new ValidationError('Validation failed', errors);
    }

    const cert = await certificateService.renewCertificate(id, req.userId, validation.data);

    const response: ApiResponse = {
      success: true,
      data: cert,
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),

  getExpiringCertificates: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new ValidationError('User ID not found');

    const certs = await certificateService.getExpiringCertificates(req.userId);

    const response: ApiResponse = {
      success: true,
      data: {
        items: certs,
        count: certs.length,
      },
      meta: { timestamp: new Date().toISOString() },
    };

    res.json(response);
  }),
};
