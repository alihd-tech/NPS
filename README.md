# VPS Management System - Backend API

A production-ready Node.js/Express.js backend API for managing virtual private servers, applications, and databases.

## Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Server Management**: Create, update, delete, and manage VPS instances
- **Application Deployment**: Deploy and manage applications on servers
- **Database Management**: Manage databases (PostgreSQL, MySQL, MongoDB, Redis) with backups
- **RBAC**: Role-based access control for fine-grained permissions
- **Audit Logging**: Complete tracking of all operations
- **Type-Safe**: Built with TypeScript for type safety

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.18+
- **Language**: TypeScript 5.1+
- **Database**: PostgreSQL 14+
- **Authentication**: JWT with bcrypt
- **Validation**: Zod for runtime validation

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide (Docker, PM2, Kubernetes)
- **[EXAMPLES.md](./EXAMPLES.md)** - API usage examples with cURL and JavaScript
- **[API Documentation](./src/docs/openapi.yaml)** - OpenAPI/Swagger specification

## Quick Start

### Prerequisites

- Node.js 20+ installed
- PostgreSQL 14+ running and accessible
- npm or pnpm package manager

### Installation

1. **Install dependencies:**

```bash
cd server
npm install
# or
pnpm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

DATABASE_URL=postgresql://user:password@localhost:5432/vps_manager
DB_POOL_SIZE=20
DB_IDLE_TIMEOUT=30000

JWT_SECRET=your_secret_key_here
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRY=7d

CORS_ORIGIN=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
BCRYPT_ROUNDS=12
```

3. **Create database and run migrations:**

```bash
# Create database
createdb vps_manager

# Run migrations (via SQL client or manually)
psql vps_manager < src/db/migrations/001_initial_schema.sql
```

### Development

Start the development server:

```bash
npm run dev
```

Server will run on `http://localhost:3001`

### Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/change-password` - Change password (requires auth)
- `GET /api/v1/auth/profile` - Get user profile (requires auth)

### Servers

- `POST /api/v1/servers` - Create server
- `GET /api/v1/servers` - List user's servers
- `GET /api/v1/servers/:id` - Get server details
- `PATCH /api/v1/servers/:id` - Update server
- `DELETE /api/v1/servers/:id` - Delete server
- `POST /api/v1/servers/:id/reboot` - Reboot server
- `POST /api/v1/servers/:id/shutdown` - Shutdown server
- `GET /api/v1/servers/:id/stats` - Get server statistics

### Applications

- `POST /api/v1/servers/:serverId/applications` - Create application
- `GET /api/v1/servers/:serverId/applications` - List applications
- `GET /api/v1/servers/:serverId/applications/:id` - Get application
- `PATCH /api/v1/servers/:serverId/applications/:id` - Update application
- `DELETE /api/v1/servers/:serverId/applications/:id` - Delete application
- `POST /api/v1/servers/:serverId/applications/:id/deploy` - Deploy application
- `POST /api/v1/servers/:serverId/applications/:id/start` - Start application
- `POST /api/v1/servers/:serverId/applications/:id/stop` - Stop application

### Databases

- `POST /api/v1/servers/:serverId/databases` - Create database
- `GET /api/v1/servers/:serverId/databases` - List databases
- `GET /api/v1/servers/:serverId/databases/:id` - Get database
- `PATCH /api/v1/servers/:serverId/databases/:id` - Update database
- `DELETE /api/v1/servers/:serverId/databases/:id` - Delete database
- `POST /api/v1/servers/:serverId/databases/:id/backup` - Backup database
- `POST /api/v1/servers/:serverId/databases/:id/restore` - Restore database

## API Response Format

All responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {
      // Additional error details
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "request-id"
  }
}
```

## Authentication

All protected endpoints require the `Authorization` header with a Bearer token:

```
Authorization: Bearer <access_token>
```

Tokens expire after 15 minutes. Use the refresh token endpoint to get a new access token.

## Example Usage

### Register a new user

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

### Create a server

```bash
curl -X POST http://localhost:3001/api/v1/servers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Server 1",
    "provider": "digitalocean",
    "ipv4": "192.168.1.1",
    "specs": {
      "cpu": 4,
      "memory": 8,
      "disk": 100,
      "os": "Ubuntu 22.04",
      "region": "US-East"
    }
  }'
```

## Database Schema

The database includes the following main tables:

- `users` - User accounts
- `servers` - Managed VPS instances
- `applications` - Deployed applications
- `deployments` - Deployment history
- `databases` - Database instances
- `certificates` - SSL certificates
- `audit_logs` - Operation audit trail
- `roles` - RBAC roles
- `permissions` - Role permissions
- `user_roles` - User role assignments

## Security Considerations

1. **Password Security**:
   - Passwords hashed with bcrypt (cost factor: 12)
   - Minimum 8 characters with uppercase, lowercase, numbers, and special characters

2. **Token Security**:
   - JWT tokens signed with secrets
   - Access tokens expire after 15 minutes
   - Refresh tokens expire after 7 days

3. **Database Security**:
   - Prepared statements to prevent SQL injection
   - Connection pooling with idle timeout
   - Encrypted passwords stored in database

4. **API Security**:
   - CORS enabled with configurable origins
   - Helmet.js for security headers
   - Input validation with Zod
   - Rate limiting ready (to be implemented)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production) | development |
| PORT | Server port | 3001 |
| HOST | Server host | 0.0.0.0 |
| DATABASE_URL | PostgreSQL connection string | (required) |
| JWT_SECRET | JWT secret key | dev-secret |
| JWT_EXPIRY | Access token expiry | 15m |
| BCRYPT_ROUNDS | Password hash rounds | 12 |
| CORS_ORIGIN | Allowed CORS origins | localhost:3000 |

## Development

### Project Structure

```
server/
├── src/
│   ├── config/           # Configuration
│   ├── controllers/       # Route handlers
│   ├── db/               # Database utilities
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── index.ts          # Entry point
├── .env.example          # Environment template
└── tsconfig.json         # TypeScript config
```

### Adding New Endpoints

1. Create query file: `src/db/queries/resourceQueries.ts`
2. Create service: `src/services/resourceService.ts`
3. Create controller: `src/controllers/resourceController.ts`
4. Create routes: `src/routes/resources.ts`
5. Import routes in `src/index.ts`

## Testing

(To be implemented - Jest + Supertest)

```bash
npm test
```

## Performance

- Database connection pooling (max 20 connections)
- Request logging and monitoring
- Type-safe operations throughout
- Prepared statements for all queries
- Pagination support for list endpoints

## Known Limitations

- Agent integration not yet implemented
- Deployment pipeline placeholder
- Metrics collection pending
- WebSocket support for real-time updates pending
- Rate limiting not yet implemented

## Roadmap

- [ ] Phase 5: SSL Certificates & Advanced Features
- [ ] Message queue integration (RabbitMQ)
- [ ] Server agent communication
- [ ] WebSocket for real-time updates
- [ ] Advanced metrics and analytics
- [ ] Kubernetes support
- [ ] Terraform integration

## License

MIT

## Support

For issues and questions, please create an issue or contact the development team.
