import { applicationQueries } from '../db/queries/applicationQueries';
import { serverQueries } from '../db/queries/serverQueries';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { Application } from '../types/database';
import { CreateApplicationRequest, UpdateApplicationRequest } from '../types/api';
import { APPLICATION_TYPES, DEPLOYMENT_STRATEGIES } from '../constants/index';

export const applicationService = {
  createApplication: async (
    serverId: string,
    userId: string,
    req: CreateApplicationRequest
  ): Promise<Application> => {
    // Verify server ownership
    const isOwner = await serverQueries.isOwnedBy(serverId, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this server');
    }

    // Validate application type
    if (!APPLICATION_TYPES.includes(req.type)) {
      throw new ValidationError('Invalid application type', {
        validTypes: APPLICATION_TYPES,
      });
    }

    // Validate deployment strategy
    const strategy = req.deployment_strategy || 'rolling';
    if (!DEPLOYMENT_STRATEGIES.includes(strategy)) {
      throw new ValidationError('Invalid deployment strategy', {
        validStrategies: DEPLOYMENT_STRATEGIES,
      });
    }

    // For git-based deployments, git_repo is required
    if (req.type !== 'static' && !req.git_repo) {
      throw new ValidationError('Git repository URL is required for this application type');
    }

    // Create application
    return applicationQueries.create(
      serverId,
      req.name,
      req.type,
      req.git_repo || null,
      req.git_branch || 'main',
      strategy
    );
  },

  getApplicationById: async (
    applicationId: string,
    userId: string
  ): Promise<Application> => {
    const app = await applicationQueries.getById(applicationId);

    if (!app) {
      throw new NotFoundError('Application');
    }

    // Verify access through server
    const isOwner = await serverQueries.isOwnedBy(app.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this application');
    }

    return app;
  },

  listApplications: async (
    serverId: string,
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ applications: Application[]; total: number }> => {
    // Verify server ownership
    const isOwner = await serverQueries.isOwnedBy(serverId, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this server');
    }

    const [applications, total] = await Promise.all([
      applicationQueries.getByServerId(serverId, limit, offset),
      applicationQueries.countByServerId(serverId),
    ]);

    return { applications, total };
  },

  updateApplication: async (
    applicationId: string,
    userId: string,
    req: UpdateApplicationRequest
  ): Promise<Application> => {
    // Verify access
    const app = await applicationQueries.getById(applicationId);
    if (!app) {
      throw new NotFoundError('Application');
    }

    const isOwner = await serverQueries.isOwnedBy(app.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // Validate updates
    if (req.deployment_strategy && !DEPLOYMENT_STRATEGIES.includes(req.deployment_strategy)) {
      throw new ValidationError('Invalid deployment strategy', {
        validStrategies: DEPLOYMENT_STRATEGIES,
      });
    }

    // Update application
    const updated = await applicationQueries.update(applicationId, {
      name: req.name,
      git_repo: req.git_repo,
      git_branch: req.git_branch,
      deployment_strategy: req.deployment_strategy,
    });

    if (!updated) {
      throw new NotFoundError('Application');
    }

    return updated;
  },

  deleteApplication: async (
    applicationId: string,
    userId: string
  ): Promise<void> => {
    // Verify access
    const app = await applicationQueries.getById(applicationId);
    if (!app) {
      throw new NotFoundError('Application');
    }

    const isOwner = await serverQueries.isOwnedBy(app.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // Delete application
    const deleted = await applicationQueries.delete(applicationId);
    if (!deleted) {
      throw new NotFoundError('Application');
    }
  },

  deployApplication: async (
    applicationId: string,
    userId: string,
    version: string
  ): Promise<Application> => {
    // Verify access
    const app = await applicationQueries.getById(applicationId);
    if (!app) {
      throw new NotFoundError('Application');
    }

    const isOwner = await serverQueries.isOwnedBy(app.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this application');
    }

    if (!version) {
      throw new ValidationError('Deployment version is required');
    }

    // Update status to deploying
    const updated = await applicationQueries.updateStatus(applicationId, 'deploying');
    if (!updated) {
      throw new NotFoundError('Application');
    }

    // TODO: Trigger deployment through agent
    // - Create deployment record
    // - Send deploy command to server agent
    // - Monitor deployment progress

    return updated;
  },

  stopApplication: async (
    applicationId: string,
    userId: string
  ): Promise<Application> => {
    // Verify access
    const app = await applicationQueries.getById(applicationId);
    if (!app) {
      throw new NotFoundError('Application');
    }

    const isOwner = await serverQueries.isOwnedBy(app.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // Update status to stopped
    const updated = await applicationQueries.updateStatus(applicationId, 'stopped');
    if (!updated) {
      throw new NotFoundError('Application');
    }

    // TODO: Send stop command to server agent

    return updated;
  },

  startApplication: async (
    applicationId: string,
    userId: string
  ): Promise<Application> => {
    // Verify access
    const app = await applicationQueries.getById(applicationId);
    if (!app) {
      throw new NotFoundError('Application');
    }

    const isOwner = await serverQueries.isOwnedBy(app.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this application');
    }

    // Update status to running
    const updated = await applicationQueries.updateStatus(applicationId, 'running');
    if (!updated) {
      throw new NotFoundError('Application');
    }

    // TODO: Send start command to server agent

    return updated;
  },
};
