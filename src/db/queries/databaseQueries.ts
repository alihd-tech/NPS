import { query, queryOne, queryAll } from '../../config/database';
import { Database, DatabaseWithoutPassword } from '../../types/database';

export const databaseQueries = {
  // Create database
  create: async (
    serverId: string,
    name: string,
    type: string,
    username: string,
    passwordHash: string,
    port: number
  ): Promise<Database> => {
    const result = await queryOne<Database>(
      `INSERT INTO databases (server_id, name, type, username, password_hash, port)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [serverId, name, type, username, passwordHash, port]
    );
    if (!result) throw new Error('Failed to create database');
    return result;
  },

  // Get database by ID
  getById: async (id: string): Promise<Database | null> => {
    return queryOne<Database>(
      'SELECT * FROM databases WHERE id = $1',
      [id]
    );
  },

  // Get database by ID without password
  getByIdSafe: async (id: string): Promise<DatabaseWithoutPassword | null> => {
    return queryOne<DatabaseWithoutPassword>(
      `SELECT id, server_id, name, type, username, port, status, created_at, updated_at 
       FROM databases WHERE id = $1`,
      [id]
    );
  },

  // Get databases by server
  getByServerId: async (
    serverId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<DatabaseWithoutPassword[]> => {
    return queryAll<DatabaseWithoutPassword>(
      `SELECT id, server_id, name, type, username, port, status, created_at, updated_at
       FROM databases 
       WHERE server_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [serverId, limit, offset]
    );
  },

  // Count databases by server
  countByServerId: async (serverId: string): Promise<number> => {
    const result = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM databases WHERE server_id = $1',
      [serverId]
    );
    return parseInt(result?.count || '0', 10);
  },

  // Update database
  update: async (
    id: string,
    updates: Partial<{
      name: string;
      username: string;
      port: number;
      status: string;
    }>
  ): Promise<DatabaseWithoutPassword | null> => {
    const fields: string[] = [];
    const values: any[] = [id];
    let paramCount = 2;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.username !== undefined) {
      fields.push(`username = $${paramCount++}`);
      values.push(updates.username);
    }

    if (updates.port !== undefined) {
      fields.push(`port = $${paramCount++}`);
      values.push(updates.port);
    }

    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 1) return null;

    const query_text = `UPDATE databases SET ${fields.join(', ')} WHERE id = $1 RETURNING id, server_id, name, type, username, port, status, created_at, updated_at`;
    return queryOne<DatabaseWithoutPassword>(query_text, values);
  },

  // Update database password
  updatePassword: async (
    id: string,
    passwordHash: string
  ): Promise<void> => {
    await query(
      'UPDATE databases SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, id]
    );
  },

  // Delete database
  delete: async (id: string): Promise<boolean> => {
    const result = await query(
      'DELETE FROM databases WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  },

  // Update database status
  updateStatus: async (id: string, status: string): Promise<DatabaseWithoutPassword | null> => {
    return queryOne<DatabaseWithoutPassword>(
      `UPDATE databases SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 
       RETURNING id, server_id, name, type, username, port, status, created_at, updated_at`,
      [status, id]
    );
  },

  // Get databases by type
  getByType: async (
    serverId: string,
    type: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<DatabaseWithoutPassword[]> => {
    return queryAll<DatabaseWithoutPassword>(
      `SELECT id, server_id, name, type, username, port, status, created_at, updated_at
       FROM databases 
       WHERE server_id = $1 AND type = $2 
       ORDER BY created_at DESC 
       LIMIT $3 OFFSET $4`,
      [serverId, type, limit, offset]
    );
  },
};
