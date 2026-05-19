import { pool } from '../connection';
import { AuditLog } from '../../types/database';

export const auditQueries = {
  /**
   * Create an audit log entry
   */
  async create(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    changes: Record<string, any>,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    const query = `
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, changes, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *;
    `;

    const result = await pool.query(query, [
      userId,
      action,
      resourceType,
      resourceId,
      JSON.stringify(changes),
      ipAddress,
      userAgent,
    ]);

    return result.rows[0];
  },

  /**
   * Get audit logs for a user
   */
  async getByUserId(userId: string, limit = 50, offset = 0): Promise<AuditLog[]> {
    const query = `
      SELECT * FROM audit_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3;
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  },

  /**
   * Get audit logs for a specific resource
   */
  async getByResource(
    resourceType: string,
    resourceId: string,
    limit = 50,
    offset = 0
  ): Promise<AuditLog[]> {
    const query = `
      SELECT * FROM audit_logs
      WHERE resource_type = $1 AND resource_id = $2
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4;
    `;

    const result = await pool.query(query, [resourceType, resourceId, limit, offset]);
    return result.rows;
  },

  /**
   * Get all audit logs (admin only)
   */
  async getAll(limit = 100, offset = 0): Promise<AuditLog[]> {
    const query = `
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  },

  /**
   * Get audit log count
   */
  async countByUserId(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM audit_logs WHERE user_id = $1;',
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  /**
   * Get total audit log count
   */
  async countAll(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) as count FROM audit_logs;');
    return parseInt(result.rows[0].count, 10);
  },
};
