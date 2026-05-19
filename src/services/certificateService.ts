import { certificateQueries } from '../db/queries/certificateQueries';
import { serverQueries } from '../db/queries/serverQueries';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { Certificate } from '../types/database';
import { CreateCertificateRequest, RenewCertificateRequest } from '../types/api';
import { CERTIFICATE_ISSUERS } from '../constants/index';

export const certificateService = {
  createCertificate: async (
    serverId: string,
    userId: string,
    req: CreateCertificateRequest
  ): Promise<Certificate> => {
    // Verify server ownership
    const isOwner = await serverQueries.isOwnedBy(serverId, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this server');
    }

    // Validate domain
    if (!req.domain || !this.isValidDomain(req.domain)) {
      throw new ValidationError('Invalid domain format');
    }

    // Validate issuer
    const issuer = req.issuer || 'letsencrypt';
    if (!CERTIFICATE_ISSUERS.includes(issuer)) {
      throw new ValidationError('Invalid issuer', {
        validIssuers: CERTIFICATE_ISSUERS,
      });
    }

    // Check if certificate already exists for domain
    const existing = await certificateQueries.getByDomain(serverId, req.domain);
    if (existing) {
      throw new ValidationError('Certificate for this domain already exists');
    }

    // Create certificate
    const cert = await certificateQueries.create(
      serverId,
      req.domain,
      issuer,
      req.auto_renew !== false
    );

    // TODO: Trigger certificate generation through agent
    // - For Let's Encrypt: initiate ACME challenge
    // - For custom: store certificate

    return cert;
  },

  getCertificateById: async (
    certificateId: string,
    userId: string
  ): Promise<Certificate> => {
    const cert = await certificateQueries.getById(certificateId);

    if (!cert) {
      throw new NotFoundError('Certificate');
    }

    // Verify access through server
    const isOwner = await serverQueries.isOwnedBy(cert.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this certificate');
    }

    return cert;
  },

  listCertificates: async (
    serverId: string,
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ certificates: Certificate[]; total: number }> => {
    // Verify server ownership
    const isOwner = await serverQueries.isOwnedBy(serverId, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this server');
    }

    const [certificates, total] = await Promise.all([
      certificateQueries.getByServerId(serverId, limit, offset),
      certificateQueries.countByServerId(serverId),
    ]);

    return { certificates, total };
  },

  deleteCertificate: async (
    certificateId: string,
    userId: string
  ): Promise<void> => {
    // Verify access
    const cert = await certificateQueries.getById(certificateId);
    if (!cert) {
      throw new NotFoundError('Certificate');
    }

    const isOwner = await serverQueries.isOwnedBy(cert.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this certificate');
    }

    // Delete certificate
    const deleted = await certificateQueries.delete(certificateId);
    if (!deleted) {
      throw new NotFoundError('Certificate');
    }
  },

  renewCertificate: async (
    certificateId: string,
    userId: string,
    req: RenewCertificateRequest
  ): Promise<Certificate> => {
    // Verify access
    const cert = await certificateQueries.getById(certificateId);
    if (!cert) {
      throw new NotFoundError('Certificate');
    }

    const isOwner = await serverQueries.isOwnedBy(cert.server_id, userId);
    if (!isOwner) {
      throw new ForbiddenError('You do not have access to this certificate');
    }

    // Update status to pending renewal
    const updated = await certificateQueries.updateStatus(certificateId, 'pending');
    if (!updated) {
      throw new NotFoundError('Certificate');
    }

    // TODO: Trigger renewal through agent
    // - For Let's Encrypt: initiate ACME renewal
    // - Monitor renewal progress
    // - Update status when complete

    return updated;
  },

  getExpiringCertificates: async (userId: string): Promise<Certificate[]> => {
    // TODO: Add user verification to ensure only own servers' certs are returned
    return certificateQueries.getExpiringCertificates(30);
  },

  private: {
    isValidDomain(domain: string): boolean {
      // Basic domain validation regex
      const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
      return domainRegex.test(domain);
    },
  },

  isValidDomain(domain: string): boolean {
    // Basic domain validation regex
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    return domainRegex.test(domain);
  },
};
