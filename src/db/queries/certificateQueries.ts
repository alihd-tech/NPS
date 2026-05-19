import { query, queryOne, queryAll } from '../../config/database';
import { Certificate } from '../../types/database';

export const certificateQueries = {
  // Create certificate
  create: async (
    serverId: string,
    domain: string,
    issuer: string,
    autoRenew: boolean
  ): Promise<Certificate> => {
    const result = await queryOne<Certificate>(
      `INSERT INTO certificates (server_id, domain, issuer, auto_renew)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [serverId, domain, issuer, autoRenew]
    );
    if (!result) throw new Error('Failed to create certificate');
    return result;
  },

  // Get certificate by ID
  getById: async (id: string): Promise<Certificate | null> => {
    return queryOne<Certificate>(
      'SELECT * FROM certificates WHERE id = $1',
      [id]
    );
  },

  // Get certificates by server
  getByServerId: async (
    serverId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Certificate[]> => {
    return queryAll<Certificate>(
      `SELECT * FROM certificates 
       WHERE server_id = $1 
       ORDER BY expires_at ASC 
       LIMIT $2 OFFSET $3`,
      [serverId, limit, offset]
    );
  },

  // Count certificates by server
  countByServerId: async (serverId: string): Promise<number> => {
    const result = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM certificates WHERE server_id = $1',
      [serverId]
    );
    return parseInt(result?.count || '0', 10);
  },

  // Get certificate by domain
  getByDomain: async (serverId: string, domain: string): Promise<Certificate | null> => {
    return queryOne<Certificate>(
      'SELECT * FROM certificates WHERE server_id = $1 AND domain = $2',
      [serverId, domain]
    );
  },

  // Update certificate
  update: async (
    id: string,
    updates: Partial<{
      issued_at: Date;
      expires_at: Date;
      status: string;
    }>
  ): Promise<Certificate | null> => {
    const fields: string[] = [];
    const values: any[] = [id];
    let paramCount = 2;

    if (updates.issued_at !== undefined) {
      fields.push(`issued_at = $${paramCount++}`);
      values.push(updates.issued_at);
    }

    if (updates.expires_at !== undefined) {
      fields.push(`expires_at = $${paramCount++}`);
      values.push(updates.expires_at);
    }

    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 1) return null;

    const query_text = `UPDATE certificates SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
    return queryOne<Certificate>(query_text, values);
  },

  // Delete certificate
  delete: async (id: string): Promise<boolean> => {
    const result = await query(
      'DELETE FROM certificates WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  },

  // Get expiring certificates
  getExpiringCertificates: async (daysUntilExpiry: number): Promise<Certificate[]> => {
    return queryAll<Certificate>(
      `SELECT * FROM certificates 
       WHERE expires_at IS NOT NULL 
       AND expires_at <= NOW() + INTERVAL '${daysUntilExpiry} days'
       AND status != 'expired'
       ORDER BY expires_at ASC`,
      []
    );
  },

  // Get certificates with auto-renew enabled
  getAutoRenewCertificates: async (): Promise<Certificate[]> => {
    return queryAll<Certificate>(
      `SELECT * FROM certificates 
       WHERE auto_renew = TRUE 
       AND (status = 'expiring' OR (expires_at IS NOT NULL AND expires_at <= NOW() + INTERVAL '30 days'))
       ORDER BY expires_at ASC`,
      []
    );
  },

  // Update certificate status
  updateStatus: async (id: string, status: string): Promise<Certificate | null> => {
    return queryOne<Certificate>(
      'UPDATE certificates SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
  },
};
