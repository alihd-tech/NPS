import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

/**
 * @route GET /health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await pool.query('SELECT NOW()');

    res.json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /ready
 * @desc Readiness check endpoint (for k8s)
 * @access Public
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

export default router;
