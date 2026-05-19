import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { healthCheck, closePool } from './config/database';
import { requestLogger } from './middleware/logger';
import { errorHandler, setupErrorHandler, asyncHandler } from './middleware/errorHandler';
import { ApiResponse } from './types/api';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', asyncHandler(async (req, res) => {
  const dbHealthy = await healthCheck();
  const health = {
    status: dbHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected',
  };

  const response: ApiResponse = {
    success: dbHealthy,
    data: health,
    meta: { timestamp: new Date().toISOString() },
  };

  res.status(dbHealthy ? 200 : 503).json(response);
}));

// API info endpoint
app.get('/', asyncHandler(async (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      name: 'VPS Management System API',
      version: env.apiVersion,
      status: 'running',
      apiPrefix: env.apiPrefix,
    },
    meta: { timestamp: new Date().toISOString() },
  };
  res.json(response);
}));

// API Routes
import authRoutes from './routes/auth';
import serverRoutes from './routes/servers';
import applicationRoutes from './routes/applications';
import databaseRoutes from './routes/databases';

app.use(`${env.apiPrefix}/auth`, authRoutes);
app.use(`${env.apiPrefix}/servers`, serverRoutes);
app.use(`${env.apiPrefix}/servers/:serverId/applications`, applicationRoutes);
app.use(`${env.apiPrefix}/servers/:serverId/databases`, databaseRoutes);

// TODO: Implement and add in Phase 5
// app.use(`${env.apiPrefix}/certificates`, certificateRoutes);
// app.use(`${env.apiPrefix}/metrics`, metricsRoutes);

// Error handling
setupErrorHandler(app);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  server.close(async () => {
    console.log('[SERVER] Server closed');
    await closePool();
    console.log('[DB] Database pool closed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('[ERROR] Forced shutdown');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(env.port, env.host, () => {
  console.log(`[SERVER] Running on http://${env.host}:${env.port}`);
  console.log(`[ENV] Node environment: ${env.nodeEnv}`);
  console.log(`[API] API prefix: ${env.apiPrefix}`);
});

export default app;
