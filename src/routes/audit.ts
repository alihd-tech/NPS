import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { auditController } from '../controllers/auditController';

const router = Router();

/**
 * @route GET /api/v1/audit/my-logs
 * @desc Get current user's audit logs
 * @access Private
 */
router.get('/my-logs', requireAuth, auditController.getUserAuditLogs);

/**
 * @route GET /api/v1/audit/resource/:resourceType/:resourceId
 * @desc Get audit logs for a specific resource
 * @access Private
 */
router.get('/resource/:resourceType/:resourceId', requireAuth, auditController.getResourceAuditLogs);

/**
 * @route GET /api/v1/audit/all
 * @desc Get all audit logs (admin only)
 * @access Private (Admin)
 */
router.get('/all', requireAuth, auditController.getAllAuditLogs);

export default router;
