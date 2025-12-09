# System Architecture - Frontend-Backend Connection

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │     Frontend (React + TypeScript + Vite)              │  │
│  │     http://localhost:5173                             │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │ Login Page   │  │  Admin       │  │  Agent     │  │  │
│  │  │              │  │  Dashboard   │  │  Portal    │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │   API Service Layer (axios)                     │  │  │
│  │  │   - authService                                 │  │  │
│  │  │   - usersService                                │  │  │
│  │  │   - leadsService                                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └──────────────────────┬─────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          │ HTTP/HTTPS Requests
                          │ with Cookies (Credentials)
                          │
┌─────────────────────────▼────────────────────────────────────┐
│          Backend Server (Node.js + Fastify)                  │
│          http://localhost:3001                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 CORS Middleware                        │  │
│  │  Allowed Origins:                                      │  │
│  │  - http://localhost:5173 (frontend)                    │  │
│  │  - http://localhost:3000                               │  │
│  │  - http://localhost:5174                               │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              API Routes (/api/*)                       │  │
│  │                                                        │  │
│  │  Authentication:                                       │  │
│  │  POST   /api/auth/login                               │  │
│  │  POST   /api/auth/logout                              │  │
│  │  GET    /api/auth/me                                  │  │
│  │                                                        │  │
│  │  Users (Admin):                                        │  │
│  │  GET    /api/users                                    │  │
│  │  POST   /api/users                                    │  │
│  │  PUT    /api/users/:id                                │  │
│  │  DELETE /api/users/:id                                │  │
│  │                                                        │  │
│  │  WhatsApp Campaigns:                                   │  │
│  │  POST   /api/whatsapp/campaigns                       │  │
│  │  GET    /api/whatsapp/campaigns                       │  │
│  │  POST   /api/whatsapp/webhook                         │  │
│  │                                                        │  │
│  │  Health:                                               │  │
│  │  GET    /api/health                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Session Management                          │  │
│  │  - Cookie-based sessions                              │  │
│  │  - 8-hour session duration                            │  │
│  │  - Rate limiting (5 attempts)                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────┬────────────────────────┘
                      │               │
                      │               │
            ┌─────────▼─────┐  ┌─────▼──────┐
            │   MongoDB     │  │   Redis    │
            │   Port: 27017 │  │ Port: 6379 │
            │               │  │            │
            │  Collections: │  │  Message   │
            │  - users      │  │  Queue     │
            │  - campaigns  │  │            │
            │  - messages   │  │            │
            └───────────────┘  └────────────┘
```

## Data Flow Diagrams

### 1. User Login Flow

```
┌─────────┐                ┌──────────┐               ┌─────────┐
│ Browser │                │ Frontend │               │ Backend │
└────┬────┘                └────┬─────┘               └────┬────┘
     │                          │                          │
     │  1. Enter credentials    │                          │
     │─────────────────────────>│                          │
     │                          │                          │
     │                          │  2. POST /api/auth/login │
     │                          │─────────────────────────>│
     │                          │     { username, password }│
     │                          │                          │
     │                          │                          │─┐
     │                          │                          │ │ 3. Validate
     │                          │                          │ │    credentials
     │                          │                          │ │    Create session
     │                          │                          │<┘
     │                          │                          │
     │                          │  4. 200 OK + Set-Cookie │
     │                          │<─────────────────────────│
     │                          │     { sessionId, user }  │
     │                          │                          │
     │                          │─┐                        │
     │                          │ │ 5. Store user data    │
     │                          │ │    Save token         │
     │                          │<┘                        │
     │                          │                          │
     │  6. Redirect to dashboard│                          │
     │<─────────────────────────│                          │
     │                          │                          │
```

### 2. Authenticated API Request Flow

```
┌─────────┐                ┌──────────┐               ┌─────────┐
│ Browser │                │ Frontend │               │ Backend │
└────┬────┘                └────┬─────┘               └────┬────┘
     │                          │                          │
     │  1. Click "View Users"   │                          │
     │─────────────────────────>│                          │
     │                          │                          │
     │                          │  2. GET /api/users       │
     │                          │─────────────────────────>│
     │                          │     Cookie: sessionId    │
     │                          │     Authorization: Bearer│
     │                          │                          │
     │                          │                          │─┐
     │                          │                          │ │ 3. Verify session
     │                          │                          │ │    Check role
     │                          │                          │ │    Fetch data
     │                          │                          │<┘
     │                          │                          │
     │                          │  4. 200 OK               │
     │                          │<─────────────────────────│
     │                          │     { success, data }    │
     │                          │                          │
     │  5. Display users table  │                          │
     │<─────────────────────────│                          │
     │                          │                          │
```

### 3. WhatsApp Campaign Creation Flow

```
┌──────┐    ┌─────────┐    ┌─────────┐    ┌───────┐    ┌────────┐
│Agent │    │Frontend │    │ Backend │    │MongoDB│    │ Redis  │
└──┬───┘    └────┬────┘    └────┬────┘    └───┬───┘    └───┬────┘
   │             │              │              │            │
   │ 1. Create   │              │              │            │
   │  Campaign   │              │              │            │
   │────────────>│              │              │            │
   │             │              │              │            │
   │             │ 2. POST      │              │            │
   │             │  /api/whatsapp│              │            │
   │             │  /campaigns  │              │            │
   │             │─────────────>│              │            │
   │             │              │              │            │
   │             │              │ 3. Save      │            │
   │             │              │  Campaign    │            │
   │             │              │─────────────>│            │
   │             │              │              │            │
   │             │              │ 4. Queue     │            │
   │             │              │  Messages    │            │
   │             │              │──────────────────────────>│
   │             │              │              │            │
   │             │ 5. Success   │              │            │
   │             │<─────────────│              │            │
   │             │              │              │            │
   │ 6. Show     │              │              │            │
   │  Confirmation│             │              │            │
   │<────────────│              │              │            │
   │             │              │              │            │
```

## Environment Configuration

### Backend (.env)
```
PORT=3001
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=global_algo_whatsapp
REDIS_HOST=localhost
REDIS_PORT=6379
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+...
ENABLE_WORKER=false
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=10000
```

## Security Features

```
┌─────────────────────────────────────────────────────┐
│              Security Layers                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. CORS Protection                                 │
│     ✓ Whitelist specific origins                   │
│     ✓ Credentials support enabled                  │
│     ✓ Preflight request handling                   │
│                                                     │
│  2. Session Management                              │
│     ✓ HTTP-only cookies                            │
│     ✓ 8-hour session timeout                       │
│     ✓ Secure cookie flag (production)              │
│                                                     │
│  3. Authentication                                  │
│     ✓ Bcrypt password hashing (10 rounds)          │
│     ✓ Rate limiting (5 attempts)                   │
│     ✓ Account lockout (1 hour)                     │
│                                                     │
│  4. Authorization                                   │
│     ✓ Role-based access control                    │
│     ✓ Route protection                             │
│     ✓ Session validation                           │
│                                                     │
│  5. Audit Logging                                   │
│     ✓ Login attempts tracked                       │
│     ✓ User actions logged                          │
│     ✓ JSONL format for analysis                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Icons**: React Bootstrap Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Fastify
- **Language**: TypeScript
- **Session**: @fastify/cookie
- **CORS**: @fastify/cors
- **Password**: bcryptjs
- **Database**: MongoDB
- **Queue**: Redis (ioredis)
- **WhatsApp**: Twilio SDK

## Port Allocation

```
┌──────────────────┬───────┬─────────────────────┐
│ Service          │ Port  │ Purpose             │
├──────────────────┼───────┼─────────────────────┤
│ Frontend         │ 5173  │ Vite dev server     │
│ Backend API      │ 3001  │ Fastify server      │
│ MongoDB          │ 27017 │ Database            │
│ Redis            │ 6379  │ Message queue       │
└──────────────────┴───────┴─────────────────────┘
```

## Request/Response Format

### Authentication Request
```json
POST /api/auth/login
Content-Type: application/json

{
  "username": "ag001",
  "password": "SetB-Temp123"
}
```

### Authentication Response
```json
200 OK
Set-Cookie: sessionId=abc123...

{
  "sessionId": "abc123...",
  "user": {
    "id": "uuid",
    "username": "ag001",
    "role": "Agent"
  }
}
```

### API Response Format (Standard)
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Deployment Architecture (Production)

```
┌────────────────────────────────────────────────────┐
│                   Internet                         │
└──────────────────┬────────────────┬────────────────┘
                   │                │
         ┌─────────▼──────┐  ┌─────▼──────────┐
         │  CDN / Static  │  │  API Gateway   │
         │  (Frontend)    │  │  (Backend)     │
         │  Vercel/       │  │  AWS/         │
         │  Netlify       │  │  Railway       │
         └────────────────┘  └────┬───────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────▼────┐  ┌────▼─────┐  ┌───▼────┐
              │ MongoDB  │  │  Redis   │  │ Twilio │
              │ Atlas    │  │ Cloud    │  │  API   │
              └──────────┘  └──────────┘  └────────┘
```

---

**Architecture Version**: 1.0
**Last Updated**: December 9, 2025
