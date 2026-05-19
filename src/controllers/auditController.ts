import { Response } from 'express';
import { z } from 'zod';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError } from '../utils/errors';
import { DEFAULT_PAGINATION } from '../constants/index';

const getPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export const auditController = {
  /**
   * Get user's audit logs
   */
  getUserAuditLogs: asyncHandler(
    async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
      const validation = getPaginationSchema.safeParse(req.query);
      if (!validation.success) {
        throw new ValidationError('Invalid pagination parameters', validation.error.errors);
      }

      const { page, limit } = validation.data;
      const result = await auditService.getUserAuditLogs(req.user!.id, page, limit);

      res.json({
        success: true,
        data: result.logs,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: result.pages,
        },
      });
    }
  ),

  /**
   * Get resource audit logs
   */
  getResourceAuditLogs: asyncHandler(
    async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
      const { resourceType, resourceId } = req.params;
      const validation = getPaginationSchema.safeParse(req.query);
      if (!validation.success) {
        throw new ValidationError('Invalid pagination parameters', validation.error.errors);
      }

      const { page, limit } = validation.data;
      const result = await auditService.getResourceAuditLogs(
        resourceType,
        resourceId,
        page,
        limit
      );

      res.json({
        success: true,
        data: result.logs,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      });
    }
  ),

  /**
   * Get all audit logs (admin only)
   */
  getAllAuditLogs: asyncHandler(
    async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
      const validation = getPaginationSchema.safeParse(req.query);
      if (!validation.success) {
        throw new ValidationError('Invalid pagination parameters', validation.error.errors);
      }

      const { page, limit } = validation.data;
      const result = await auditService.getAllAuditLogs(page, limit);

      res.json({
        success: true,
        data: result.logs,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: result.pages,
        },
      });
    }
  ),
};
