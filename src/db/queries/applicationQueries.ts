import { query, queryOne, queryAll } from '../../config/database';
import { Application } from '../../types/database';

export const applicationQueries = {
  // Create application
  create: async (
    serverId: string,
    name: string,
    type: string,
    gitRepo: string | null,
    gitBranch: string,
    deploymentStrategy: string
  ): Promise<Application> => {
    const result = await queryOne<Application>(
      `INSERT INTO applications (server_id, name, type, git_repo, git_branch, deployment_strategy)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [serverId, name, type, gitRepo, gitBranch, deploymentStrategy]
    );
    if (!result) throw new Error('Failed to create application');
    return result;
  },

  // Get application by ID
  getById: async (id: string): Promise<Application | null> => {
    return queryOne<Application>(
      'SELECT * FROM applications WHERE id = $1',
      [id]
    );
  },

  // Get applications by server
  getByServerId: async (
    serverId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Application[]> => {
    return queryAll<Application>(
      `SELECT * FROM applications 
       WHERE server_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [serverId, limit, offset]
    );
  },

  // Count applications by server
  countByServerId: async (serverId: string): Promise<number> => {
    const result = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM applications WHERE server_id = $1',
      [serverId]
    );
    return parseInt(result?.count || '0', 10);
  },

  // Update application
  update: async (
    id: string,
    updates: Partial<{
      name: string;
      git_repo: string | null;
      git_branch: string;
      deployment_strategy: string;
      status: string;
    }>
  ): Promise<Application | null> => {
    const fields: string[] = [];
    const values: any[] = [id];
    let paramCount = 2;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.git_repo !== undefined) {
      fields.push(`git_repo = $${paramCount++}`);
      values.push(updates.git_repo);
    }

    if (updates.git_branch !== undefined) {
      fields.push(`git_branch = $${paramCount++}`);
      values.push(updates.git_branch);
    }

    if (updates.deployment_strategy !== undefined) {
      fields.push(`deployment_strategy = $${paramCount++}`);
      values.push(updates.deployment_strategy);
    }

    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 1) return null;

    const query_text = `UPDATE applications SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
    return queryOne<Application>(query_text, values);
  },

  // Delete application
  delete: async (id: string): Promise<boolean> => {
    const result = await query(
      'DELETE FROM applications WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  },

  // Update application status
  updateStatus: async (id: string, status: string): Promise<Application | null> => {
    return queryOne<Application>(
      'UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
  },

  // Get applications by status
  getByStatus: async (
    serverId: string,
    status: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Application[]> => {
    return queryAll<Application>(
      `SELECT * FROM applications 
       WHERE server_id = $1 AND status = $2 
       ORDER BY created_at DESC 
       LIMIT $3 OFFSET $4`,
      [serverId, status, limit, offset]
    );
  },
};
