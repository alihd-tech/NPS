import { Router } from 'express';
import { certificateController } from '../controllers/certificateController';
import { requireAuth } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Apply auth middleware to all routes
router.use(requireAuth);

/**
 * @route   POST /api/v1/servers/:serverId/certificates
 * @desc    Create a new SSL certificate
 * @access  Private
 */
router.post('/', certificateController.createCertificate);

/**
 * @route   GET /api/v1/servers/:serverId/certificates
 * @desc    List all certificates on a server
 * @access  Private
 */
router.get('/', certificateController.listCertificates);

/**
 * @route   GET /api/v1/servers/:serverId/certificates/:id
 * @desc    Get certificate by ID
 * @access  Private
 */
router.get('/:id', certificateController.getCertificate);

/**
 * @route   DELETE /api/v1/servers/:serverId/certificates/:id
 * @desc    Delete certificate
 * @access  Private
 */
router.delete('/:id', certificateController.deleteCertificate);

/**
 * @route   POST /api/v1/servers/:serverId/certificates/:id/renew
 * @desc    Renew certificate
 * @access  Private
 */
router.post('/:id/renew', certificateController.renewCertificate);

/**
 * @route   GET /api/v1/certificates/expiring
 * @desc    Get expiring certificates
 * @access  Private
 */
router.get('/expiring/list', certificateController.getExpiringCertificates);

export default router;
