import { databaseQueries } from '../db/queries/databaseQueries';
import { serverQueries } from '../db/queries/serverQueries';
import { hashPassword, comparePassword } from '../utils/password';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { DatabaseWithoutPassword } from '../types/database';
import { CreateDatabaseRequest, UpdateDatabaseRequest } from '../types/api';
import { DATABASE_TYPES } from '../constants/index';

export const databaseService = {
  createDatabase: async (
    serverId: string,
    userId: string,
    req: CreateDatabaseRequest
  ): Promise<DatabaseWithoutPassword> => {
    // Verify server ownership
    const isOwner = await serverQueries.isOwnedBy(serverId, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this server');
    }

    // Validate database type
    if (!DATABASE_TYPES.includes(req.type)) {
      throw new ValidationError('Invalid database type', {
        validTypes: DATABASE_TYPES,
      });
    }

    // Validate port
    const port = req.port || this.getDefaultPort(req.type);
    if (port < 1 || port > 65535) {
      throw new ValidationError('Port must be between 1 and 65535');
    }

    // Validate credentials
    if (!req.username || !req.password) {
      throw new ValidationError('Username and password are required');
    }

    // Hash password
    const passwordHash = await hashPassword(req.password);

    // Create database
    const db = await databaseQueries.create(
      serverId,
      req.name,
      req.type,
      req.username,
      passwordHash,
      port
    );

    // Remove password from response
    const { password_hash, ...safeDb } = db as any;
    return safeDb;
  },

  getDatabaseById: async (
    databaseId: string,
    userId: string
  ): Promise<DatabaseWithoutPassword> => {
    const db = await databaseQueries.getByIdSafe(databaseId);

    if (!db) {
      throw new NotFoundError('Database');
    }

    // Verify access through server
    const isOwner = await serverQueries.isOwnedBy(db.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this database');
    }

    return db;
  },

  listDatabases: async (
    serverId: string,
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ databases: DatabaseWithoutPassword[]; total: number }> => {
    // Verify server ownership
    const isOwner = await serverQueries.isOwnedBy(serverId, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this server');
    }

    const [databases, total] = await Promise.all([
      databaseQueries.getByServerId(serverId, limit, offset),
      databaseQueries.countByServerId(serverId),
    ]);

    return { databases, total };
  },

  updateDatabase: async (
    databaseId: string,
    userId: string,
    req: UpdateDatabaseRequest
  ): Promise<DatabaseWithoutPassword> => {
    // Verify access
    const db = await databaseQueries.getByIdSafe(databaseId);
    if (!db) {
      throw new NotFoundError('Database');
    }

    const isOwner = await serverQueries.isOwnedBy(db.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this database');
    }

    // Validate updates
    if (req.username && !req.username.trim()) {
      throw new ValidationError('Username cannot be empty');
    }

    // Update password if provided
    if (req.password) {
      const passwordHash = await hashPassword(req.password);
      await databaseQueries.updatePassword(databaseId, passwordHash);
    }

    // Update other fields
    const updated = await databaseQueries.update(databaseId, {
      name: req.name,
      username: req.username,
    });

    if (!updated) {
      throw new NotFoundError('Database');
    }

    return updated;
  },

  deleteDatabase: async (
    databaseId: string,
    userId: string
  ): Promise<void> => {
    // Verify access
    const db = await databaseQueries.getByIdSafe(databaseId);
    if (!db) {
      throw new NotFoundError('Database');
    }

    const isOwner = await serverQueries.isOwnedBy(db.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this database');
    }

    // Delete database
    const deleted = await databaseQueries.delete(databaseId);
    if (!deleted) {
      throw new NotFoundError('Database');
    }
  },

  backupDatabase: async (
    databaseId: string,
    userId: string
  ): Promise<{ message: string }> => {
    // Verify access
    const db = await databaseQueries.getByIdSafe(databaseId);
    if (!db) {
      throw new NotFoundError('Database');
    }

    const isOwner = await serverQueries.isOwnedBy(db.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this database');
    }

    // TODO: Trigger backup through agent
    // - Create backup record
    // - Send backup command to server agent

    return { message: 'Backup initiated' };
  },

  restoreDatabase: async (
    databaseId: string,
    userId: string,
    backupId: string
  ): Promise<{ message: string }> => {
    // Verify access
    const db = await databaseQueries.getByIdSafe(databaseId);
    if (!db) {
      throw new NotFoundError('Database');
    }

    const isOwner = await serverQueries.isOwnedBy(db.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this database');
    }

    if (!backupId) {
      throw new ValidationError('Backup ID is required');
    }

    // TODO: Trigger restore through agent

    return { message: 'Restore initiated' };
  },

  private: {
    getDefaultPort: (type: string): number => {
      const ports: Record<string, number> = {
        postgresql: 5432,
        mysql: 3306,
        mongodb: 27017,
        redis: 6379,
      };
      return ports[type] || 5432;
    },
  },

  getDefaultPort(type: string): number {
    const ports: Record<string, number> = {
      postgresql: 5432,
      mysql: 3306,
      mongodb: 27017,
      redis: 6379,
    };
    return ports[type] || 5432;
  },
};
