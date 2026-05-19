import { auditQueries } from '../db/queries/auditQueries';
import { AuditLog } from '../types/database';

export const auditService = {
  /**
   * Log an action to the audit trail
   */
  async logAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    changes: Record<string, any>,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    return auditQueries.create(userId, action, resourceType, resourceId, changes, ipAddress, userAgent);
  },

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(
    userId: string,
    page = 1,
    limit = 50
  ): Promise<{ logs: AuditLog[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;
    const logs = await auditQueries.getByUserId(userId, limit, offset);
    const total = await auditQueries.countByUserId(userId);
    const pages = Math.ceil(total / limit);

    return { logs, total, pages };
  },

  /**
   * Get audit logs for a specific resource
   */
  async getResourceAuditLogs(
    resourceType: string,
    resourceId: string,
    page = 1,
    limit = 50
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const offset = (page - 1) * limit;
    const logs = await auditQueries.getByResource(resourceType, resourceId, limit, offset);

    return { logs, total: logs.length };
  },

  /**
   * Get all audit logs (admin only)
   */
  async getAllAuditLogs(
    page = 1,
    limit = 100
  ): Promise<{ logs: AuditLog[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;
    const logs = await auditQueries.getAll(limit, offset);
    const total = await auditQueries.countAll();
    const pages = Math.ceil(total / limit);

    return { logs, total, pages };
  },
};
