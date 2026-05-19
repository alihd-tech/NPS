import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  dbPoolSize: parseInt(process.env.DB_POOL_SIZE || '20', 10),
  dbIdleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',

  // CORS
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // API
  apiVersion: process.env.API_VERSION || 'v1',
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // Derived
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Validate required environment variables
const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
const missing = requiredVars.filter(
  (varName) => !process.env[varName]
);

if (missing.length > 0 && !env.isDevelopment) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}
