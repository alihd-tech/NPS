import { query, queryOne, queryAll } from '../../config/database';
import { Server, ServerSpecs } from '../../types/database';

export const serverQueries = {
  // Create server
  create: async (
    userId: string,
    name: string,
    provider: string,
    ipv4: string | null,
    ipv6: string | null,
    specs: ServerSpecs
  ): Promise<Server> => {
    const result = await queryOne<Server>(
      `INSERT INTO servers (user_id, name, provider, ipv4, ipv6, specs)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, name, provider, ipv4, ipv6, JSON.stringify(specs)]
    );
    if (!result) throw new Error('Failed to create server');
    return result;
  },

  // Get server by ID
  getById: async (id: string): Promise<Server | null> => {
    return queryOne<Server>(
      'SELECT * FROM servers WHERE id = $1',
      [id]
    );
  },

  // Get all servers for a user
  getByUserId: async (
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Server[]> => {
    return queryAll<Server>(
      `SELECT * FROM servers 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
  },

  // Get server count for user
  countByUserId: async (userId: string): Promise<number> => {
    const result = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM servers WHERE user_id = $1',
      [userId]
    );
    return parseInt(result?.count || '0', 10);
  },

  // Update server
  update: async (
    id: string,
    updates: Partial<{
      name: string;
      ipv4: string | null;
      ipv6: string | null;
      status: string;
      specs: ServerSpecs;
    }>
  ): Promise<Server | null> => {
    const fields: string[] = [];
    const values: any[] = [id];
    let paramCount = 2;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.ipv4 !== undefined) {
      fields.push(`ipv4 = $${paramCount++}`);
      values.push(updates.ipv4);
    }

    if (updates.ipv6 !== undefined) {
      fields.push(`ipv6 = $${paramCount++}`);
      values.push(updates.ipv6);
    }

    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }

    if (updates.specs !== undefined) {
      fields.push(`specs = $${paramCount++}`);
      values.push(JSON.stringify(updates.specs));
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 1) return null; // No updates

    const query_text = `UPDATE servers SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
    return queryOne<Server>(query_text, values);
  },

  // Delete server
  delete: async (id: string): Promise<boolean> => {
    const result = await query(
      'DELETE FROM servers WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  },

  // Check ownership
  isOwnedBy: async (serverId: string, userId: string): Promise<boolean> => {
    const result = await queryOne<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM servers WHERE id = $1 AND user_id = $2) as exists',
      [serverId, userId]
    );
    return result?.exists || false;
  },

  // Get servers by status
  getByStatus: async (
    userId: string,
    status: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Server[]> => {
    return queryAll<Server>(
      `SELECT * FROM servers 
       WHERE user_id = $1 AND status = $2 
       ORDER BY created_at DESC 
       LIMIT $3 OFFSET $4`,
      [userId, status, limit, offset]
    );
  },

  // Get servers by provider
  getByProvider: async (
    userId: string,
    provider: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Server[]> => {
    return queryAll<Server>(
      `SELECT * FROM servers 
       WHERE user_id = $1 AND provider = $2 
       ORDER BY created_at DESC 
       LIMIT $3 OFFSET $4`,
      [userId, provider, limit, offset]
    );
  },

  // Update server status
  updateStatus: async (id: string, status: string): Promise<Server | null> => {
    return queryOne<Server>(
      'UPDATE servers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
  },
};
