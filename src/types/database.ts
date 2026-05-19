// User Types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  mfa_enabled: boolean;
}

export interface UserWithoutPassword extends Omit<User, 'password_hash'> {}

// Server Types
export interface Server {
  id: string;
  user_id: string;
  name: string;
  ipv4: string | null;
  ipv6: string | null;
  provider: 'aws' | 'digitalocean' | 'linode' | 'hetzner' | 'custom';
  provider_id: string | null;
  status: 'active' | 'inactive' | 'provisioning' | 'error';
  specs: ServerSpecs;
  created_at: Date;
  updated_at: Date;
}

export interface ServerSpecs {
  cpu: number;
  memory: number; // in GB
  disk: number; // in GB
  os: string;
  region: string;
}

// Application Types
export interface Application {
  id: string;
  server_id: string;
  name: string;
  type: 'docker' | 'nodejs' | 'python' | 'go' | 'php' | 'static';
  git_repo: string | null;
  git_branch: string;
  deployment_strategy: 'rolling' | 'blue-green' | 'canary';
  status: 'running' | 'stopped' | 'deploying' | 'error';
  created_at: Date;
  updated_at: Date;
}

// Database Types
export interface Database {
  id: string;
  server_id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  username: string;
  password_hash: string;
  port: number;
  status: 'active' | 'inactive' | 'error';
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseWithoutPassword extends Omit<Database, 'password_hash'> {}

// SSL Certificate Types
export interface Certificate {
  id: string;
  server_id: string;
  domain: string;
  issuer: 'letsencrypt' | 'custom';
  issued_at: Date | null;
  expires_at: Date | null;
  auto_renew: boolean;
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  created_at: Date;
  updated_at: Date;
}

// Deployment Types
export interface Deployment {
  id: string;
  application_id: string;
  version: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'rolled_back';
  started_at: Date;
  completed_at: Date | null;
  logs: string | null;
  created_at: Date;
  updated_at: Date;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

// RBAC Types
export interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
}

export interface Permission {
  id: string;
  role_id: string;
  resource: string;
  action: string;
  created_at: Date;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  team_id: string | null;
  created_at: Date;
}
