# Quick Start Guide

Get the VPS Management System API running in 5 minutes.

## Option 1: Using Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Steps

1. **Start the services:**

```bash
cd server
docker-compose up
```

This will:
- Start PostgreSQL database
- Start the API server
- Create pgAdmin for database management

2. **Wait for the API to be ready:**

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 5.234
}
```

3. **Access the API:**
   - API: http://localhost:3000/api/v1
   - pgAdmin: http://localhost:5050 (admin@vpsmanager.local / admin)

4. **Stop the services:**

```bash
docker-compose down
```

## Option 2: Local Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm or pnpm (i use pnpm)

### Steps

1. **Install dependencies:**

```bash
cd server
npm install
```

2. **Set up the database:**

```bash
# Create database
createdb nps

# Run migrations
npm run db:migrate
```

3. **Configure environment:**

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nps
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=dev-secret-key
```

4. **Start the development server:**

```bash
npm run dev
```

Server will run at `http://localhost:3000/api/v1`

## First Steps

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "name": "Test User"
  }'
```

Save the `token` from the response.

### 2. Get Current User

```bash
TOKEN="your_token_from_previous_step"

curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Create a Server

```bash
curl -X POST http://localhost:3000/api/v1/servers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My First Server",
    "ipv4": "192.168.1.100",
    "provider": "digitalocean",
    "specs": {
      "cpu": 2,
      "memory": 4,
      "disk": 50
    }
  }'
```

### 4. List Servers

```bash
curl -X GET http://localhost:3000/api/v1/servers \
  -H "Authorization: Bearer $TOKEN"
```

## Available Commands

### Development
```bash
npm run dev          # Start development server with auto-reload
```

### Building
```bash
npm run build        # Compile TypeScript to JavaScript
npm run start        # Run compiled application
```

### Database
```bash
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database (development only)
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
npm run format       # Format code with Prettier
```

### Testing (Future)
```bash
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | Environment mode |
| PORT | 3000 | Server port |
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | nps | Database name |
| DB_USER | postgres | Database user |
| DB_PASSWORD | - | Database password |
| JWT_SECRET | - | JWT signing secret (set for production) |
| JWT_EXPIRY | 24h | Token expiration time |

## API Overview

### Core Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh token

#### Servers
- `GET /servers` - List servers (paginated)
- `POST /servers` - Create server
- `GET /servers/:id` - Get server details
- `PATCH /servers/:id` - Update server
- `DELETE /servers/:id` - Delete server
- `GET /servers/:id/resources` - Get resource metrics

#### Applications
- `GET /servers/:id/applications` - List applications
- `POST /servers/:id/applications` - Create application
- `POST /servers/:id/applications/:appId/deploy` - Deploy application
- `POST /servers/:id/applications/:appId/rollback` - Rollback deployment

#### Databases
- `GET /servers/:id/databases` - List databases
- `POST /servers/:id/databases` - Create database
- `POST /servers/:id/databases/:dbId/backup` - Create backup
- `GET /servers/:id/databases/:dbId/backups` - List backups

#### Certificates
- `GET /servers/:id/certificates` - List certificates
- `POST /servers/:id/certificates` - Create certificate
- `POST /servers/:id/certificates/:certId/renew` - Renew certificate

#### Audit
- `GET /audit/my-logs` - Get user's audit logs
- `GET /audit/resource/:type/:id` - Get resource audit logs

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT NOW();"

# Check database exists
psql -l
```

### Reset Everything (Docker)

```bash
docker-compose down -v
docker-compose up
```

### Reset Everything (Local)

```bash
# Drop and recreate database
dropdb nps
createdb nps
npm run db:migrate
```

## Next Steps

1. **Read the Full Documentation**
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
   - [EXAMPLES.md](./EXAMPLES.md) - Detailed API examples
   - [openapi.yaml](./src/docs/openapi.yaml) - Complete API specification

2. **Implement Frontend**
   - The parent project includes a Next.js frontend
   - Connect to this API using the environment variables

3. **Customize for Your Needs**
   - Add database migrations for custom fields
   - Extend service layer with business logic
   - Integrate with external services (cloud providers, email, etc.)

4. **Deploy to Production**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
   - Use Docker for containerization
   - Configure environment variables securely

## Support

For detailed information, see:
- [API Examples](./EXAMPLES.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [OpenAPI Specification](./src/docs/openapi.yaml)

Happy deploying!
