import { serverQueries } from '../db/queries/serverQueries';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { Server, ServerSpecs } from '../types/database';
import { CreateServerRequest, UpdateServerRequest } from '../types/api';
import { SERVER_PROVIDERS, SERVER_STATUSES } from '../constants/index';

export const serverService = {
  createServer: async (
    userId: string,
    req: CreateServerRequest
  ): Promise<Server> => {
    // Validate provider
    if (!SERVER_PROVIDERS.includes(req.provider)) {
      throw new ValidationError('Invalid provider', {
        validProviders: SERVER_PROVIDERS,
      });
    }

    // Validate specs
    if (req.specs.cpu <= 0 || req.specs.memory <= 0 || req.specs.disk <= 0) {
      throw new ValidationError('Server specs must be positive numbers');
    }

    if (!req.specs.os || !req.specs.region) {
      throw new ValidationError('OS and region are required');
    }

    // Validate IP addresses if provided
    if (req.ipv4) {
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipv4Regex.test(req.ipv4)) {
        throw new ValidationError('Invalid IPv4 address');
      }
    }

    if (req.ipv6) {
      const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
      if (!ipv6Regex.test(req.ipv6)) {
        throw new ValidationError('Invalid IPv6 address');
      }
    }

    // Create server
    return serverQueries.create(
      userId,
      req.name,
      req.provider,
      req.ipv4 || null,
      req.ipv6 || null,
      req.specs
    );
  },

  getServerById: async (serverId: string, userId: string): Promise<Server> => {
    const server = await serverQueries.getById(serverId);

    if (!server) {
      throw new NotFoundError('Server');
    }

    if (server.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this server');
    }

    return server;
  },

  listServers: async (
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ servers: Server[]; total: number }> => {
    const [servers, total] = await Promise.all([
      serverQueries.getByUserId(userId, limit, offset),
      serverQueries.countByUserId(userId),
    ]);

    return { servers, total };
  },

  updateServer: async (
    serverId: string,
    userId: string,
    req: UpdateServerRequest
  ): Promise<Server> => {
    // Check ownership
    const isOwner = await serverQueries.isOwnedBy(serverId, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this server');
    }

    // Validate updates
    if (req.ipv4) {
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipv4Regex.test(req.ipv4)) {
        throw new ValidationError('Invalid IPv4 address');
      }
    }

    if (req.ipv6) {
      const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
      if (!ipv6Regex.test(req.ipv6)) {
        throw new ValidationError('Invalid IPv6 address');
      }
    }

    // Update server
    const updated = await serverQueries.update(serverId, {
      name: req.name,
      ipv4: req.ipv4,
      ipv6: req.ipv6,
    });

    if (!updated) {
      throw new NotFoundError('Server');
    }

    return updated;
  },

  deleteServer: async (serverId: string, userId: string): Promise<void> => {
    // Check ownership
    const isOwner = await serverQueries.isOwnedBy(serverId, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this server');
    }

    // Delete server
    const deleted = await serverQueries.delete(serverId);
    if (!deleted) {
      throw new NotFoundError('Server');
    }
  },

  rebootServer: async (serverId: string, userId: string): Promise<Server> => {
    // Check ownership
    const server = await serverQueries.getById(serverId);
    if (!server) {
      throw new NotFoundError('Server');
    }

    if (server.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this server');
    }

    // Update status to indicate rebooting
    const updated = await serverQueries.updateStatus(serverId, 'provisioning');
    if (!updated) {
      throw new NotFoundError('Server');
    }

    // TODO: Send reboot command to server agent

    return updated;
  },

  shutdownServer: async (serverId: string, userId: string): Promise<Server> => {
    // Check ownership
    const server = await serverQueries.getById(serverId);
    if (!server) {
      throw new NotFoundError('Server');
    }

    if (server.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this server');
    }

    // Update status to inactive
    const updated = await serverQueries.updateStatus(serverId, 'inactive');
    if (!updated) {
      throw new NotFoundError('Server');
    }

    // TODO: Send shutdown command to server agent

    return updated;
  },

  getServerStats: async (serverId: string, userId: string): Promise<any> => {
    // Check ownership
    const server = await serverQueries.getById(serverId);
    if (!server) {
      throw new NotFoundError('Server');
    }

    if (server.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this server');
    }

    // TODO: Fetch stats from metrics service/database
    return {
      cpu_usage: 0,
      memory_usage: 0,
      disk_usage: 0,
      network_in: 0,
      network_out: 0,
    };
  },
};
