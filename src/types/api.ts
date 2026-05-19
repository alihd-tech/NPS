// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Auth Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Auth Response Types
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

// Server Request Types
export interface CreateServerRequest {
  name: string;
  provider: 'aws' | 'digitalocean' | 'linode' | 'hetzner' | 'custom';
  ipv4?: string;
  ipv6?: string;
  specs: {
    cpu: number;
    memory: number;
    disk: number;
    os: string;
    region: string;
  };
}

export interface UpdateServerRequest {
  name?: string;
  ipv4?: string;
  ipv6?: string;
}

// Application Request Types
export interface CreateApplicationRequest {
  name: string;
  type: 'docker' | 'nodejs' | 'python' | 'go' | 'php' | 'static';
  git_repo?: string;
  git_branch?: string;
  deployment_strategy?: 'rolling' | 'blue-green' | 'canary';
}

export interface UpdateApplicationRequest {
  name?: string;
  git_repo?: string;
  git_branch?: string;
  deployment_strategy?: 'rolling' | 'blue-green' | 'canary';
}

export interface DeployApplicationRequest {
  version: string;
}

// Database Request Types
export interface CreateDatabaseRequest {
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  username: string;
  password: string;
  port?: number;
}

export interface UpdateDatabaseRequest {
  name?: string;
  username?: string;
  password?: string;
}

// Certificate Request Types
export interface CreateCertificateRequest {
  domain: string;
  auto_renew?: boolean;
  issuer?: 'letsencrypt' | 'custom';
}

export interface RenewCertificateRequest {
  force?: boolean;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

// Error Response
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
