import { Router } from 'express';
import { serverController } from '../controllers/serverController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

/**
 * @route   POST /api/v1/servers
 * @desc    Create a new server
 * @access  Private
 */
router.post('/', serverController.createServer);

/**
 * @route   GET /api/v1/servers
 * @desc    List all user servers
 * @access  Private
 */
router.get('/', serverController.listServers);

/**
 * @route   GET /api/v1/servers/:id
 * @desc    Get server by ID
 * @access  Private
 */
router.get('/:id', serverController.getServer);

/**
 * @route   PATCH /api/v1/servers/:id
 * @desc    Update server
 * @access  Private
 */
router.patch('/:id', serverController.updateServer);

/**
 * @route   DELETE /api/v1/servers/:id
 * @desc    Delete server
 * @access  Private
 */
router.delete('/:id', serverController.deleteServer);

/**
 * @route   POST /api/v1/servers/:id/reboot
 * @desc    Reboot server
 * @access  Private
 */
router.post('/:id/reboot', serverController.rebootServer);

/**
 * @route   POST /api/v1/servers/:id/shutdown
 * @desc    Shutdown server
 * @access  Private
 */
router.post('/:id/shutdown', serverController.shutdownServer);

/**
 * @route   GET /api/v1/servers/:id/stats
 * @desc    Get server stats
 * @access  Private
 */
router.get('/:id/stats', serverController.getServerStats);

export default router;
