# System Architecture

## Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  (Web Frontend, Mobile, CLI, External Services)         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   API Gateway Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │
│  │   Routes    │  │ Middleware  │  │ Error Handler│   │
│  │  (7 files)  │  │  (5 files)  │  │  Validation  │   │
│  └─────────────┘  └─────────────┘  └──────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               Controller Layer                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │   Auth   │ │ Server   │ │   App    │  Request      │
│  │   Ctrl   │ │  Ctrl    │ │  Ctrl    │  Handling    │
│  └──────────┘ └──────────┘ └──────────┘               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │   DB     │ │   Cert   │ │  Audit   │  6 Total     │
│  │   Ctrl   │ │  Ctrl    │ │  Ctrl    │  Controllers │
│  └──────────┘ └──────────┘ └──────────┘               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                Service Layer                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ AuthSvc  │ │ServerSvc │ │AppSvc    │  Business    │
│  └──────────┘ └──────────┘ └──────────┘  Logic &     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ DBSvc    │ │ CertSvc  │ │AuditSvc  │  Validation  │
│  └──────────┘ └──────────┘ └──────────┘               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Database Access Layer                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │UserQuery │ │ServerQry │ │AppQuery  │  Prepared    │
│  └──────────┘ └──────────┘ └──────────┘  Statements  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │DBQuery   │ │CertQuery │ │AuditQry  │  SQL Safe    │
│  └──────────┘ └──────────┘ └──────────┘               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            PostgreSQL Database                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │  Users   │ │ Servers  │ │   Apps   │  8 Tables    │
│  └──────────┘ └──────────┘ └──────────┘               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │Databases │ │Certs     │ │AuditLogs │  Full RBAC   │
│  └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘
```

## Request Flow

```
HTTP Request
    │
    ▼
┌───────────────────────────────────┐
│     Express App (index.ts)        │
│  - Route initialization           │
│  - Middleware setup               │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│    CORS & Security Middleware     │
│  - helmet (security headers)      │
│  - cors (cross-origin)            │
│  - body parser (JSON)             │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│      Logger Middleware            │
│  - Request logging                │
│  - Performance tracking           │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│     Route Dispatcher              │
│  - /api/v1/auth                   │
│  - /api/v1/servers                │
│  - /api/v1/applications           │
│  - /api/v1/databases              │
│  - /api/v1/certificates           │
│  - /api/v1/audit                  │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│   Authentication Middleware       │
│  - JWT verification               │
│  - User extraction                │
│  - Permission checks              │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│   Validation Middleware           │
│  - Input validation (Zod)         │
│  - Parameter validation           │
│  - Query validation               │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│      Rate Limiter Middleware      │
│  - Request counting               │
│  - Limit enforcement              │
│  - Response headers               │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│        Controller Handler         │
│  - Request parsing                │
│  - Service invocation             │
│  - Response formatting            │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│       Business Logic Layer        │
│  - Service (authService, etc)     │
│  - Validation logic               │
│  - Data transformation            │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│    Database Query Layer           │
│  - Prepared statements            │
│  - Parameter binding              │
│  - Result mapping                 │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│   Connection Pool (pg)            │
│  - Idle: 10 connections           │
│  - Max: 20 connections            │
│  - Timeout: 30 seconds            │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│      PostgreSQL Database          │
│  - Execute query                  │
│  - Return results                 │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│    Audit Log Middleware           │
│  - Log action                     │
│  - Track changes                  │
│  - Store in database              │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│    Error Handler Middleware       │
│  - Catch errors                   │
│  - Format error response          │
│  - Set HTTP status                │
└───────────┬───────────────────────┘
            │
            ▼
HTTP Response (JSON)
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   HTTP Client                           │
│              (Browser, Mobile, API)                      │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTP/REST
                    ▼
        ┌───────────────────────────┐
        │     Express Server        │
        │      (Port 3000)          │
        └───────────┬───────────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
      ▼             ▼             ▼
  ┌────────┐   ┌────────┐   ┌────────┐
  │ Routes │   │Middleware│ │ Controllers
  ├────────┤   ├────────┤   ├────────┤
  │Auth    │   │Auth    │   │Auth
  │Server  │   │Validate│   │Server
  │App     │   │Logger  │   │App
  │DB      │   │Rate    │   │DB
  │Cert    │   │Error   │   │Cert
  │Audit   │   │CORS    │   │Audit
  │Health  │   └────────┘   └────────┘
  └────────┘        │             │
      │             │             │
      └─────────────┼─────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │      Services Layer       │
        │  (Business Logic)         │
        ├───────────────────────────┤
        │Auth → User validation     │
        │Server → CRUD ops         │
        │App → Deploy logic       │
        │DB → Backup logic        │
        │Cert → Renewal logic     │
        │Audit → Log creation     │
        └───────────┬───────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │   Database Queries Layer  │
        │  (SQL Prepared Stmts)     │
        ├───────────────────────────┤
        │userQueries                │
        │serverQueries              │
        │applicationQueries         │
        │databaseQueries            │
        │certificateQueries         │
        │auditQueries               │
        └───────────┬───────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │  PostgreSQL Connection    │
        │      (pg package)         │
        │  Pool: 10-20 conns        │
        └───────────┬───────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │    PostgreSQL Database    │
        │                           │
        │  ┌─────────────────────┐  │
        │  │ users               │  │
        │  │ servers             │  │
        │  │ applications        │  │
        │  │ databases           │  │
        │  │ certificates        │  │
        │  │ audit_logs          │  │
        │  │ roles               │  │
        │  │ permissions         │  │
        │  └─────────────────────┘  │
        └───────────────────────────┘
```

## Data Flow Example: Create Server

```
1. Client Request
   POST /api/v1/servers
   {
     "name": "My Server",
     "ipv4": "192.168.1.1",
     "provider": "digitalocean"
   }
   │
   ▼
2. Route Handler (servers.ts)
   - Route matches
   - Middleware pipeline executes
   │
   ▼
3. Auth Middleware
   - Extract JWT from header
   - Verify signature
   - Get user ID
   │
   ▼
4. Validation Middleware
   - Parse body with Zod
   - Validate field formats
   - Return errors if invalid
   │
   ▼
5. Controller (serverController.ts)
   - Call serverService.createServer()
   │
   ▼
6. Service (serverService.ts)
   - Additional validation
   - Check for duplicate names
   - Call database query
   │
   ▼
7. Database Query (serverQueries.ts)
   - Prepared statement: INSERT INTO servers (...)
   - Bind parameters safely
   - Execute query
   │
   ▼
8. PostgreSQL
   - Insert record
   - Generate UUID
   - Return inserted row
   │
   ▼
9. Audit Middleware
   - Log action: CREATE
   - Log resource_type: server
   - Log changes: { name, ipv4, provider }
   │
   ▼
10. Response Formatting
    - Serialize data
    - Add success flag
    - Set HTTP status: 201
   │
   ▼
11. Client Response
    {
      "success": true,
      "data": {
        "id": "550e8400-...",
        "userId": "...",
        "name": "My Server",
        ...
      }
    }
```

## Authentication Flow

```
┌─────────────────────────────────────────┐
│         Registration/Login              │
│    POST /auth/register or /login        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Validate input      │
        │  (email, password)   │
        └──────────┬───────────┘
                   │
                   ├─ Check email exists? (login)
                   │  Check email not exists? (register)
                   │
                   ▼
        ┌──────────────────────┐
        │ Hash Password        │
        │ (bcrypt, 10 rounds)  │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Create/Update User   │
        │ in Database          │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Generate JWT Token   │
        │ Payload:             │
        │ - user_id            │
        │ - email              │
        │ - role               │
        │ - exp: 24h           │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Return Token to      │
        │ Client               │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Client stores token  │
        │ (localStorage, cookie)
        └──────────────────────┘

Subsequent Requests:
        ┌──────────────────────┐
        │ Include Token in     │
        │ Authorization Header │
        │ Bearer <token>       │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Auth Middleware      │
        │ - Verify signature   │
        │ - Check expiration   │
        │ - Extract payload    │
        └──────────┬───────────┘
                   │
        ┌─────────────────────────┐
        │      Token Valid?       │
        └──┬──────────────────┬──┘
           │ Yes              │ No
           ▼                  ▼
    ┌────────────┐      ┌──────────┐
    │ Continue   │      │ Reject   │
    │ Request    │      │ 401 Error│
    └────────────┘      └──────────┘
```

## Type System Architecture

```
Request Type
    │
    ▼
┌─────────────────────────────────┐
│  API Types (api.ts)             │
│  - ApiResponse<T>               │
│  - PaginatedResponse<T>         │
│  - AuthenticatedRequest         │
│  - Error types                  │
└────────────────────┬────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Database Types        │
        │  (database.ts)         │
        │  - User, Server, etc   │
        │  - Raw DB models       │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Zod Schemas           │
        │  (Runtime Validation)  │
        │  - CreateServerSchema  │
        │  - UpdateServerSchema  │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Service Logic         │
        │  Type-safe operations  │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Response to Client    │
        │  (JSON serialized)     │
        └────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│           Development (docker-compose)      │
├─────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────────┐ │
│  │ VPS API      │  │ PostgreSQL 16       │ │
│  │ (hot reload) │  │ (with data volume)  │ │
│  └──────────────┘  └─────────────────────┘ │
│  ┌─────────────────────────────────────┐   │
│  │ pgAdmin (database management)       │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│      Production (Docker + Swarm/K8s)        │
├─────────────────────────────────────────────┤
│  Load Balancer                              │
│     │                                       │
│  ┌──┴──────────────────────────┐           │
│  │                             │           │
│  ▼                             ▼           │
│ API-1 (replica)           API-2 (replica) │
│                                             │
│ PostgreSQL (with replication)              │
│  ├─ Master (write)                         │
│  └─ Replicas (read)                        │
│                                             │
│ Backups (S3/Cloud storage)                 │
└─────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│           Client Request                │
└──────────────┬──────────────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  HTTPS/TLS Encryption    │
    │  (in production)         │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  Helmet Security Headers │
    │  - X-Content-Type-Options│
    │  - X-Frame-Options       │
    │  - CSP headers           │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  Rate Limiting           │
    │  - Track by IP           │
    │  - Enforce limits        │
    │  - Return 429 if exceeded│
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  Input Validation        │
    │  - Zod schemas           │
    │  - SQL injection prevent │
    │  - XSS prevention        │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  JWT Verification        │
    │  - Signature check       │
    │  - Expiration check      │
    │  - User extraction       │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  RBAC Check              │
    │  - Role verification     │
    │  - Permission check      │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  Database Security       │
    │  - Prepared statements   │
    │  - Parameter binding     │
    │  - Connection pooling    │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  Audit Logging           │
    │  - Action tracking       │
    │  - Change tracking       │
    │  - IP logging            │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  Successful Response     │
    │  (or Error if failed)    │
    └──────────────────────────┘
```

This architecture provides a secure, scalable, and maintainable foundation for the VPS management system.
