# Deployment & Testing Checklist

## Pre-Deployment Testing

### Local Development Testing

- [ ] Clone repository
- [ ] Install dependencies: `npm install`
- [ ] Copy environment: `cp .env.example .env.local`
- [ ] Configure database settings
- [ ] Run migrations: `npm run db:migrate`
- [ ] Start dev server: `npm run dev`
- [ ] Server runs on port 3000
- [ ] Health check passes: `curl http://localhost:3000/health`

### Docker Testing

- [ ] Docker installed and running
- [ ] Build Docker image: `docker build -t vps-api:latest .`
- [ ] Image builds without errors
- [ ] Docker Compose runs: `docker-compose up`
- [ ] All services start (API, PostgreSQL, pgAdmin)
- [ ] API accessible on port 3000
- [ ] PostgreSQL accessible on port 5432
- [ ] pgAdmin accessible on port 5050

### API Testing

#### Authentication
- [ ] Register user: `POST /auth/register`
  - [ ] Valid data creates user
  - [ ] Duplicate email rejected (409)
  - [ ] Invalid password rejected (400)
  - [ ] Response includes JWT token
  - [ ] Token is valid JWT format

- [ ] Login user: `POST /auth/login`
  - [ ] Valid credentials return token
  - [ ] Invalid email rejected (401)
  - [ ] Invalid password rejected (401)
  - [ ] Token works for authenticated requests

- [ ] Get current user: `GET /auth/me`
  - [ ] No token returns 401
  - [ ] Expired token returns 401
  - [ ] Valid token returns user data
  - [ ] Returns correct user ID and email

#### Server Management
- [ ] Create server: `POST /servers`
  - [ ] Requires authentication
  - [ ] Validates input fields
  - [ ] Returns 201 status
  - [ ] Server ID generated
  - [ ] Appears in list

- [ ] List servers: `GET /servers?page=1&limit=50`
  - [ ] Returns paginated results
  - [ ] Pagination works correctly
  - [ ] Only user's servers returned
  - [ ] Sorting works

- [ ] Get server: `GET /servers/:id`
  - [ ] Returns complete server object
  - [ ] Wrong ID returns 404
  - [ ] Other user's server returns 403

- [ ] Update server: `PATCH /servers/:id`
  - [ ] Updates field successfully
  - [ ] Validates new values
  - [ ] Returns updated object
  - [ ] Audit log created

- [ ] Delete server: `DELETE /servers/:id`
  - [ ] Server deleted
  - [ ] Returns 204 or success message
  - [ ] Not found on subsequent GET
  - [ ] Audit log created

- [ ] Get resources: `GET /servers/:id/resources`
  - [ ] Returns resource metrics
  - [ ] Contains CPU, memory, disk info
  - [ ] Invalid server returns 404

#### Application Management
- [ ] Create application: `POST /servers/:serverId/applications`
  - [ ] Validates server exists
  - [ ] Validates input fields
  - [ ] Returns 201 status
  - [ ] Application linked to server

- [ ] List applications: `GET /servers/:serverId/applications`
  - [ ] Returns paginated results
  - [ ] Only for specified server
  - [ ] Filtering works

- [ ] Deploy application: `POST /servers/:serverId/applications/:id/deploy`
  - [ ] Status changes to "deploying"
  - [ ] Creates deployment record
  - [ ] Deployment history updated

- [ ] Rollback: `POST /servers/:serverId/applications/:id/rollback`
  - [ ] Previous deployment restored
  - [ ] Status changes back to running

#### Database Management
- [ ] Create database: `POST /servers/:serverId/databases`
  - [ ] Validates database type
  - [ ] Creates database record
  - [ ] Returns database connection info

- [ ] Create backup: `POST /servers/:serverId/databases/:id/backup`
  - [ ] Backup record created
  - [ ] Backup appears in list

- [ ] Restore database: `POST /servers/:serverId/databases/:id/restore`
  - [ ] Restore initiated
  - [ ] Status reflects restore in progress

#### Certificate Management
- [ ] Create certificate: `POST /servers/:serverId/certificates`
  - [ ] Validates domain
  - [ ] Certificate record created
  - [ ] Expiration date set

- [ ] Renew certificate: `POST /servers/:serverId/certificates/:id/renew`
  - [ ] Renewal initiated
  - [ ] Expiration date updated

#### Audit Logging
- [ ] Get user's logs: `GET /audit/my-logs`
  - [ ] Returns paginated results
  - [ ] Only user's actions shown
  - [ ] Includes all action types

- [ ] Get resource logs: `GET /audit/resource/server/:id`
  - [ ] Returns logs for specific resource
  - [ ] Includes all changes

### Error Handling Testing

- [ ] 400 Bad Request
  - [ ] Invalid JSON returns 400
  - [ ] Validation errors return 400
  - [ ] Error message is helpful

- [ ] 401 Unauthorized
  - [ ] Missing token returns 401
  - [ ] Invalid token returns 401
  - [ ] Expired token returns 401

- [ ] 403 Forbidden
  - [ ] Accessing other user's resource returns 403
  - [ ] Admin-only endpoint blocks non-admin

- [ ] 404 Not Found
  - [ ] Invalid ID returns 404
  - [ ] Deleted resource returns 404
  - [ ] Error message clear

- [ ] 429 Too Many Requests
  - [ ] Rate limit triggers after limit
  - [ ] Retry-After header present
  - [ ] Status resets after window

- [ ] 500 Internal Error
  - [ ] Database errors handled gracefully
  - [ ] Error logged to console
  - [ ] Generic message sent to client

### Performance Testing

- [ ] Response time < 100ms (average)
  - [ ] List endpoints with 50 items
  - [ ] Single item endpoints
  - [ ] Database queries optimized

- [ ] Database connection pool
  - [ ] Maintains 10-20 connections
  - [ ] No connection leaks
  - [ ] Timeouts handled

- [ ] Memory usage
  - [ ] Baseline ~ 150MB idle
  - [ ] No memory leaks over time
  - [ ] Stable under load

- [ ] Pagination works
  - [ ] Page 1: items 1-50
  - [ ] Page 2: items 51-100
  - [ ] Total count accurate

### Security Testing

- [ ] SQL Injection Prevention
  - [ ] Special characters escaped
  - [ ] Prepared statements used
  - [ ] Injection attempts fail gracefully

- [ ] XSS Prevention
  - [ ] Scripts in input sanitized
  - [ ] HTML entities encoded
  - [ ] Response headers set correctly

- [ ] CSRF Protection
  - [ ] State-based validation
  - [ ] Token validation working

- [ ] Rate Limiting
  - [ ] Auth endpoints: 5/15 min
  - [ ] General API: 100/15 min
  - [ ] Enforcement working

- [ ] Password Security
  - [ ] Passwords hashed with bcrypt
  - [ ] Salt rounds = 10
  - [ ] Never returned in responses

- [ ] JWT Security
  - [ ] Signed with HS256
  - [ ] Expiration enforced
  - [ ] Algorithm verified

- [ ] Audit Trail
  - [ ] All actions logged
  - [ ] IP addresses recorded
  - [ ] Changes tracked

## Production Deployment

### Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security audit completed
- [ ] Performance benchmarked
- [ ] Environment variables configured
- [ ] Database backups scheduled
- [ ] Monitoring configured
- [ ] Error tracking enabled (Sentry)

### Database Setup

- [ ] PostgreSQL 14+ installed
- [ ] Database created
- [ ] Migrations run
- [ ] Backup schedule configured
- [ ] Replication configured (optional)
- [ ] Connection limits set
- [ ] Slow query logging enabled

### Application Deployment

#### Docker Deployment
- [ ] Docker image built
- [ ] Image tagged correctly
- [ ] Image pushed to registry
- [ ] Container port mapped
- [ ] Volume mounts configured
- [ ] Environment variables set
- [ ] Health checks configured
- [ ] Restart policy set

#### PM2 Deployment
- [ ] PM2 installed globally
- [ ] Ecosystem file created
- [ ] Application started
- [ ] Process cluster mode enabled
- [ ] Log files rotating
- [ ] Startup script created
- [ ] Monitoring enabled

#### Kubernetes Deployment
- [ ] ConfigMaps created
- [ ] Secrets created
- [ ] Deployment YAML configured
- [ ] Service exposed
- [ ] Ingress configured
- [ ] Health probes configured
- [ ] Resource limits set
- [ ] Autoscaling configured

### Security Hardening

- [ ] HTTPS/TLS enabled
- [ ] SSL certificate valid
- [ ] Security headers set (helmet)
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Firewall rules configured
- [ ] Database credentials secured
- [ ] JWT secret strong and unique
- [ ] Environment variables protected
- [ ] Secrets not in code repository
- [ ] Regular security updates scheduled

### Monitoring & Logging

- [ ] Log aggregation setup
- [ ] Application logs
- [ ] Database logs
- [ ] Access logs
- [ ] Error tracking (Sentry)
- [ ] APM monitoring (optional)
- [ ] Alerting configured
- [ ] Dashboard created
- [ ] On-call rotation setup

### Backup & Disaster Recovery

- [ ] Database backups automated
- [ ] Backup retention policy set
- [ ] Backup encryption enabled
- [ ] Backup tested (restore test)
- [ ] RPO defined and achieved
- [ ] RTO defined and achievable
- [ ] Disaster recovery plan documented
- [ ] Failover procedures tested

### Network Configuration

- [ ] Load balancer configured
- [ ] DNS records pointing correctly
- [ ] SSL certificate installed
- [ ] Firewall rules configured
- [ ] VPC/network isolation
- [ ] Database not publicly accessible
- [ ] SSH key access only
- [ ] IP whitelisting configured

### Scaling Setup

- [ ] Horizontal scaling configured
- [ ] Load balancer distributes traffic
- [ ] Sticky sessions configured (if needed)
- [ ] Database connection pooling
- [ ] Cache layer (optional)
- [ ] Auto-scaling triggers defined
- [ ] Scaling tested under load

### Documentation

- [ ] Deployment guide created
- [ ] Runbook for common tasks
- [ ] Troubleshooting guide
- [ ] Architecture diagram
- [ ] Team trained on deployment
- [ ] Access credentials distributed securely
- [ ] Configuration documented

## Post-Deployment

### Smoke Tests

- [ ] API responding on all endpoints
- [ ] Database connected
- [ ] Health check passing
- [ ] Metrics collecting
- [ ] Logs flowing
- [ ] Alerts working
- [ ] Backups running

### Functionality Tests

- [ ] User registration works
- [ ] User login works
- [ ] Create server works
- [ ] List servers works
- [ ] Create application works
- [ ] Deploy application works
- [ ] Create database works
- [ ] Create backup works

### Performance Verification

- [ ] Response times acceptable
- [ ] Database queries fast
- [ ] No memory leaks
- [ ] Disk usage normal
- [ ] Network bandwidth OK
- [ ] CPU usage acceptable

### Security Verification

- [ ] HTTPS working
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] No sensitive data in logs
- [ ] Audit logs recording
- [ ] No known vulnerabilities

### Monitoring Verification

- [ ] Dashboards updated
- [ ] Alerts firing correctly
- [ ] Logs readable and organized
- [ ] Error tracking working
- [ ] Performance metrics collected

## Rollback Plan

If deployment fails:

- [ ] Identify issue
- [ ] Check logs and error tracking
- [ ] Document the issue
- [ ] Revert to previous version
- [ ] Verify rollback successful
- [ ] Restore from backup if needed
- [ ] Notify team
- [ ] Plan fix for next deployment

### Rollback Commands

**Docker:**
```bash
docker stop <container-id>
docker run <previous-image>
```

**PM2:**
```bash
pm2 restart vps-api
pm2 rollback vps-api
```

**Kubernetes:**
```bash
kubectl rollout undo deployment/vps-api
```

## Continuous Monitoring

After deployment, monitor:

- [ ] Error rates
- [ ] Response times
- [ ] Database performance
- [ ] Memory usage
- [ ] CPU usage
- [ ] Disk space
- [ ] Network traffic
- [ ] User growth
- [ ] API usage patterns

## Monthly Maintenance

- [ ] Review logs for errors
- [ ] Update dependencies
- [ ] Run security scans
- [ ] Test disaster recovery
- [ ] Review and optimize queries
- [ ] Verify backups
- [ ] Update documentation
- [ ] Team training/knowledge sharing

## Quarterly Review

- [ ] Architecture review
- [ ] Security audit
- [ ] Performance analysis
- [ ] Capacity planning
- [ ] Cost optimization
- [ ] Team feedback

---

**Note:** Customize this checklist based on your specific infrastructure and requirements.
