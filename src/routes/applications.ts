import { Router } from 'express';
import { applicationController } from '../controllers/applicationController';
import { requireAuth } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Apply auth middleware to all routes
router.use(requireAuth);

/**
 * @route   POST /api/v1/servers/:serverId/applications
 * @desc    Create a new application
 * @access  Private
 */
router.post('/', applicationController.createApplication);

/**
 * @route   GET /api/v1/servers/:serverId/applications
 * @desc    List all applications on a server
 * @access  Private
 */
router.get('/', applicationController.listApplications);

/**
 * @route   GET /api/v1/servers/:serverId/applications/:id
 * @desc    Get application by ID
 * @access  Private
 */
router.get('/:id', applicationController.getApplication);

/**
 * @route   PATCH /api/v1/servers/:serverId/applications/:id
 * @desc    Update application
 * @access  Private
 */
router.patch('/:id', applicationController.updateApplication);

/**
 * @route   DELETE /api/v1/servers/:serverId/applications/:id
 * @desc    Delete application
 * @access  Private
 */
router.delete('/:id', applicationController.deleteApplication);

/**
 * @route   POST /api/v1/servers/:serverId/applications/:id/deploy
 * @desc    Deploy application
 * @access  Private
 */
router.post('/:id/deploy', applicationController.deployApplication);

/**
 * @route   POST /api/v1/servers/:serverId/applications/:id/start
 * @desc    Start application
 * @access  Private
 */
router.post('/:id/start', applicationController.startApplication);

/**
 * @route   POST /api/v1/servers/:serverId/applications/:id/stop
 * @desc    Stop application
 * @access  Private
 */
router.post('/:id/stop', applicationController.stopApplication);

export default router;
