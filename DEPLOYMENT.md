# VPS Management System - Deployment Guide

## Prerequisites

- Node.js 18+ or 20+
- PostgreSQL 14+
- npm or yarn
- Docker (optional, for containerized deployment)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env.local
```

Configure your `.env.local`:

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nps
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# API
API_RATE_LIMIT_WINDOW=900000
API_RATE_LIMIT_MAX_REQUESTS=100

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
```

### 3. Database Setup

Create the PostgreSQL database:

```bash
createdb nps
```

Run migrations:

```bash
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/v1`

## Production Deployment

### Using Docker

#### Build Image

```bash
docker build -t vps-management-api:latest .
```

#### Run Container

```bash
docker run -d \
  --name vps-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=postgres-host \
  -e DB_USER=postgres \
  -e DB_PASSWORD=secure-password \
  -e JWT_SECRET=very-secure-random-key \
  vps-management-api:latest
```

### Using Docker Compose

```bash
docker-compose up -d
```

### Using PM2 (Process Manager)

```bash
npm install -g pm2

pm2 start dist/index.js --name "vps-api" --instances max --exec-mode cluster

pm2 save
pm2 startup
```

Monitor:

```bash
pm2 monit
```

### Using Kubernetes

```bash
# Apply ConfigMap
kubectl apply -f k8s/configmap.yaml

# Apply Secrets
kubectl apply -f k8s/secrets.yaml

# Deploy
kubectl apply -f k8s/deployment.yaml

# Expose Service
kubectl apply -f k8s/service.yaml
```

## Environment Variables Reference

| Variable | Type | Description |
|----------|------|-------------|
| NODE_ENV | string | Environment (development, production, test) |
| PORT | number | Server port (default: 3000) |
| DB_HOST | string | PostgreSQL host |
| DB_PORT | number | PostgreSQL port (default: 5432) |
| DB_NAME | string | Database name |
| DB_USER | string | Database user |
| DB_PASSWORD | string | Database password |
| JWT_SECRET | string | JWT signing secret |
| JWT_EXPIRY | string | JWT expiry time (e.g., "24h") |
| API_RATE_LIMIT_WINDOW | number | Rate limit window in milliseconds |
| API_RATE_LIMIT_MAX_REQUESTS | number | Max requests per window |

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

### Readiness Check (Kubernetes)

```bash
curl http://localhost:3000/ready
```

### Logs

Development:

```bash
npm run dev
```

Production (PM2):

```bash
pm2 logs
```

Docker:

```bash
docker logs vps-api
```

## Scaling

### Horizontal Scaling

1. **Load Balancer Setup**: Configure Nginx or HAProxy to distribute traffic
2. **Session Management**: Use Redis for session storage (not currently included)
3. **Database Connection Pooling**: Already implemented with pg
4. **Database Replication**: Set up PostgreSQL streaming replication

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries (indexing)
- Enable caching (Redis)
- Use CDN for static assets

## Security Checklist

- [ ] Change `JWT_SECRET` in production
- [ ] Use strong database password
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Enable audit logging
- [ ] Use environment variables for all secrets
- [ ] Update dependencies regularly
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerting

## Backup Strategy

### Database Backup

```bash
pg_dump nps > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Automated Backup (cron)

```bash
# Add to crontab
0 2 * * * pg_dump nps | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

## Troubleshooting

### Database Connection Failed

1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Check database exists: `psql -l`
4. Check connection: `psql -h $DB_HOST -U $DB_USER -d $DB_NAME`

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### JWT Verification Errors

1. Ensure `JWT_SECRET` matches across instances
2. Check token expiry
3. Verify Authorization header format: `Bearer <token>`

### High Memory Usage

1. Check for memory leaks: `node --inspect`
2. Restart server
3. Check database connection pool settings

## Performance Optimization

### Database

- Enable query logging: `log_statement = 'all'`
- Monitor slow queries: `log_min_duration_statement = 1000`
- Add indexes for frequently queried fields

### Application

- Enable compression: Already done with helmet
- Use connection pooling: Already configured
- Implement caching: Use Redis (future enhancement)

### Deployment

- Use CDN for static content
- Enable gzip compression
- Set up HTTP/2
- Configure caching headers

## Rollback Procedure

### Docker

```bash
docker rollback [service-name]
```

### PM2

```bash
pm2 restart vps-api
```

### Kubernetes

```bash
kubectl rollout undo deployment/vps-api
```

## Support

For issues and support, please open an issue in the repository or contact the development team.
