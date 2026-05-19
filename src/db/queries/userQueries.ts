import { query, queryOne, queryAll } from '../../config/database';
import { User, UserWithoutPassword } from '../../types/database';

export const userQueries = {
  // Create new user
  create: async (
    email: string,
    passwordHash: string
  ): Promise<User> => {
    const result = await queryOne<User>(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING *`,
      [email, passwordHash]
    );
    if (!result) throw new Error('Failed to create user');
    return result;
  },

  // Get user by email
  getByEmail: async (email: string): Promise<User | null> => {
    return queryOne<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
  },

  // Get user by ID
  getById: async (id: string): Promise<User | null> => {
    return queryOne<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
  },

  // Get user by ID without password
  getByIdSafe: async (id: string): Promise<UserWithoutPassword | null> => {
    return queryOne<UserWithoutPassword>(
      'SELECT id, email, created_at, updated_at, mfa_enabled FROM users WHERE id = $1',
      [id]
    );
  },

  // Check if email exists
  emailExists: async (email: string): Promise<boolean> => {
    const result = await queryOne<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists',
      [email]
    );
    return result?.exists || false;
  },

  // Update last login
  updateLastLogin: async (userId: string): Promise<void> => {
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  },

  // Update password
  updatePassword: async (
    userId: string,
    passwordHash: string
  ): Promise<void> => {
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, userId]
    );
  },

  // Deactivate user
  deactivate: async (userId: string): Promise<void> => {
    await query(
      'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  },

  // Get all users (with pagination)
  getAll: async (limit: number = 20, offset: number = 0): Promise<UserWithoutPassword[]> => {
    return queryAll<UserWithoutPassword>(
      `SELECT id, email, created_at, updated_at, mfa_enabled 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
  },

  // Get total user count
  count: async (): Promise<number> => {
    const result = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM users'
    );
    return parseInt(result?.count || '0', 10);
  },
};
