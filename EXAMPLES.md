# VPS Management System - API Examples

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All endpoints (except login/register) require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Examples

### 1. User Authentication

#### Register

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

Response:

```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

#### Get Current User

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

### 2. Server Management

#### Create Server

```bash
curl -X POST http://localhost:3000/api/v1/servers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Production Server 1",
    "ipv4": "192.168.1.100",
    "provider": "digitalocean",
    "providerId": "123456",
    "specs": {
      "cpu": 4,
      "memory": 8,
      "disk": 100
    }
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Production Server 1",
    "ipv4": "192.168.1.100",
    "provider": "digitalocean",
    "status": "active",
    "specs": {
      "cpu": 4,
      "memory": 8,
      "disk": 100
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### List Servers

```bash
curl -X GET "http://localhost:3000/api/v1/servers?page=1&limit=50" \
  -H "Authorization: Bearer <token>"
```

#### Get Server Details

```bash
curl -X GET http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <token>"
```

#### Update Server

```bash
curl -X PATCH http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Updated Server Name"
  }'
```

#### Delete Server

```bash
curl -X DELETE http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <token>"
```

#### Get Server Resources

```bash
curl -X GET http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001/resources \
  -H "Authorization: Bearer <token>"
```

Response:

```json
{
  "success": true,
  "data": {
    "cpu": {
      "usage": 45.2,
      "cores": 4
    },
    "memory": {
      "used": 4096,
      "total": 8192,
      "percent": 50
    },
    "disk": {
      "used": 50,
      "total": 100,
      "percent": 50
    },
    "network": {
      "bytesIn": 1000000,
      "bytesOut": 500000
    }
  }
}
```

### 3. Application Management

#### Create Application

```bash
curl -X POST http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "My Web App",
    "type": "nodejs",
    "gitRepo": "https://github.com/user/repo.git",
    "gitBranch": "main",
    "deploymentStrategy": "rolling"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "serverId": "550e8400-e29b-41d4-a716-446655440001",
    "name": "My Web App",
    "type": "nodejs",
    "gitRepo": "https://github.com/user/repo.git",
    "gitBranch": "main",
    "deploymentStrategy": "rolling",
    "status": "stopped",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### List Applications

```bash
curl -X GET "http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001/applications" \
  -H "Authorization: Bearer <token>"
```

#### Deploy Application

```bash
curl -X POST http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001/applications/550e8400-e29b-41d4-a716-446655440002/deploy \
  -H "Authorization: Bearer <token>"
```

#### Rollback Application

```bash
curl -X POST http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001/applications/550e8400-e29b-41d4-a716-446655440002/rollback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "deploymentId": "550e8400-e29b-41d4-a716-446655440003"
  }'
```

### 4. Database Management

#### Create Database

```bash
curl -X POST http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001/databases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "app_db",
    "type": "postgresql",
    "version": "14"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "serverId": "550e8400-e29b-41d4-a716-446655440001",
    "name": "app_db",
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "version": "14",
    "size": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Create Database Backup

```bash
curl -X POST http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001/databases/550e8400-e29b-41d4-a716-446655440004/backup \
  -H "Authorization: Bearer <token>"
```

#### List Database Backups

```bash
curl -X GET "http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001/databases/550e8400-e29b-41d4-a716-446655440004/backups" \
  -H "Authorization: Bearer <token>"
```

#### Restore Database

```bash
curl -X POST http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001/databases/550e8400-e29b-41d4-a716-446655440004/restore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "backupId": "550e8400-e29b-41d4-a716-446655440005"
  }'
```

### 5. SSL Certificates

#### Create Certificate

```bash
curl -X POST http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001/certificates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "domain": "example.com",
    "issuer": "letsencrypt",
    "autoRenew": true
  }'
```

#### List Certificates

```bash
curl -X GET "http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001/certificates" \
  -H "Authorization: Bearer <token>"
```

#### Renew Certificate

```bash
curl -X POST http://localhost:3000/api/v1/servers/550e8400-e29b-41d4-a716-446655440001/certificates/550e8400-e29b-41d4-a716-446655440006/renew \
  -H "Authorization: Bearer <token>"
```

### 6. Audit Logs

#### Get User's Audit Logs

```bash
curl -X GET "http://localhost:3000/api/v1/audit/my-logs?page=1&limit=50" \
  -H "Authorization: Bearer <token>"
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "action": "CREATE",
      "resourceType": "server",
      "resourceId": "550e8400-e29b-41d4-a716-446655440001",
      "changes": {
        "name": "Production Server 1",
        "provider": "digitalocean"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "curl/7.85.0",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}
```

#### Get Resource Audit Logs

```bash
curl -X GET "http://localhost:3000/api/v1/audit/resource/server/550e8400-e29b-41d4-a716-446655440001?page=1" \
  -H "Authorization: Bearer <token>"
```

## JavaScript/Node.js Client Example

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

class VPSClient {
  constructor() {
    this.token = null;
  }

  async register(email, password, name) {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      email,
      password,
      name,
    });
    this.token = response.data.token;
    return response.data;
  }

  async login(email, password) {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    });
    this.token = response.data.token;
    return response.data;
  }

  async getCurrentUser() {
    return axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  async createServer(name, ipv4, provider, specs) {
    return axios.post(
      `${API_BASE}/servers`,
      { name, ipv4, provider, specs },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
  }

  async listServers(page = 1, limit = 50) {
    return axios.get(
      `${API_BASE}/servers?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
  }

  async getServerResources(serverId) {
    return axios.get(
      `${API_BASE}/servers/${serverId}/resources`,
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
  }
}

// Usage
const client = new VPSClient();
(async () => {
  try {
    const auth = await client.register('user@example.com', 'password123', 'John');
    console.log('Registered:', auth);

    const servers = await client.listServers();
    console.log('Servers:', servers.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
})();
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "statusCode": 400,
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials",
    "statusCode": 401
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Server not found",
    "statusCode": 404
  }
}
```

### 429 Too Many Requests

```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Rate limit exceeded. Try again in 45 seconds.",
    "statusCode": 429
  }
}
```

## Testing with cURL

### Set Variables

```bash
# After logging in, save the token
TOKEN="your-jwt-token-here"
SERVER_ID="550e8400-e29b-41d4-a716-446655440001"
```

### Reusable Commands

```bash
# Create a function for authenticated requests
function api_call() {
  local method=$1
  local endpoint=$2
  local data=$3
  
  if [ -z "$data" ]; then
    curl -X $method "http://localhost:3000/api/v1$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json"
  else
    curl -X $method "http://localhost:3000/api/v1$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data"
  fi
}

# Usage
api_call GET "/servers"
api_call POST "/servers" '{"name":"My Server","provider":"digitalocean"}'
```
