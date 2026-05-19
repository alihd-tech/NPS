import { Router } from 'express';
import { databaseController } from '../controllers/databaseController';
import { requireAuth } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Apply auth middleware to all routes
router.use(requireAuth);

/**
 * @route   POST /api/v1/servers/:serverId/databases
 * @desc    Create a new database
 * @access  Private
 */
router.post('/', databaseController.createDatabase);

/**
 * @route   GET /api/v1/servers/:serverId/databases
 * @desc    List all databases on a server
 * @access  Private
 */
router.get('/', databaseController.listDatabases);

/**
 * @route   GET /api/v1/servers/:serverId/databases/:id
 * @desc    Get database by ID
 * @access  Private
 */
router.get('/:id', databaseController.getDatabase);

/**
 * @route   PATCH /api/v1/servers/:serverId/databases/:id
 * @desc    Update database
 * @access  Private
 */
router.patch('/:id', databaseController.updateDatabase);

/**
 * @route   DELETE /api/v1/servers/:serverId/databases/:id
 * @desc    Delete database
 * @access  Private
 */
router.delete('/:id', databaseController.deleteDatabase);

/**
 * @route   POST /api/v1/servers/:serverId/databases/:id/backup
 * @desc    Backup database
 * @access  Private
 */
router.post('/:id/backup', databaseController.backupDatabase);

/**
 * @route   POST /api/v1/servers/:serverId/databases/:id/restore
 * @desc    Restore database from backup
 * @access  Private
 */
router.post('/:id/restore', databaseController.restoreDatabase);

export default router;
