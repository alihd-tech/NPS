export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};

export const SERVER_PROVIDERS = [
  'aws',
  'digitalocean',
  'linode',
  'hetzner',
  'custom',
] as const;

export const APPLICATION_TYPES = [
  'docker',
  'nodejs',
  'python',
  'go',
  'php',
  'static',
] as const;

export const DEPLOYMENT_STRATEGIES = [
  'rolling',
  'blue-green',
  'canary',
] as const;

export const DATABASE_TYPES = [
  'postgresql',
  'mysql',
  'mongodb',
  'redis',
] as const;

export const CERTIFICATE_ISSUERS = [
  'letsencrypt',
  'custom',
] as const;

export const SERVER_STATUSES = [
  'active',
  'inactive',
  'provisioning',
  'error',
] as const;

export const APPLICATION_STATUSES = [
  'running',
  'stopped',
  'deploying',
  'error',
] as const;

export const DEPLOYMENT_STATUSES = [
  'pending',
  'in_progress',
  'success',
  'failed',
  'rolled_back',
] as const;

export const DEFAULT_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
} as const;
