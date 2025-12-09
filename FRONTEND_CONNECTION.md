# Frontend-Backend Connection Guide

This guide explains how to connect the [Global-Algo-IMS Frontend](https://github.com/itz-himanshu128/Global-Algo-IMS) with this backend.

## Quick Start

### 1. Backend Setup (This Repository)

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start MongoDB (if not running)
# MacOS/Linux: mongod
# Windows: net start MongoDB

# Start Redis (if not running)
# MacOS/Linux: redis-server
# Windows: redis-server.exe

# Run backend
npm run dev
```

Backend will run on: `http://localhost:3001`

### 2. Frontend Setup

```bash
# Clone frontend repository
git clone https://github.com/itz-himanshu128/Global-Algo-IMS.git
cd Global-Algo-IMS

# Install dependencies
npm install

# Create .env file with backend URL
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=10000
EOF

# Start frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Environment Configuration

### Backend (.env)

```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=global_algo_whatsapp

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Twilio WhatsApp Configuration (optional for initial testing)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Worker Configuration
ENABLE_WORKER=false
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=10000
```

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (default Vite port)
- `http://localhost:3000` (alternate React port)
- `http://localhost:5174` (alternate Vite port)
- Any URL specified in `FRONTEND_URL` environment variable

## API Endpoints

The frontend communicates with these backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh access token

### Users (Admin)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### WhatsApp Campaigns
- `POST /api/whatsapp/campaigns` - Create campaign
- `GET /api/whatsapp/campaigns` - List campaigns
- `GET /api/whatsapp/campaigns/:id` - Get campaign details

### WhatsApp Webhooks
- `POST /api/whatsapp/webhook` - Receive Twilio webhooks

## Testing the Connection

### 1. Start Both Servers

Ensure both backend and frontend are running:
```bash
# Terminal 1 - Backend
cd Global-Algo-IMS-Backend
npm run dev

# Terminal 2 - Frontend
cd Global-Algo-IMS
npm run dev
```

### 2. Check Backend Health

```bash
curl http://localhost:3001/api/health
```

### 3. Test Login from Frontend

1. Open `http://localhost:5173` in your browser
2. Click on any demo account to login
3. You should be redirected to the appropriate dashboard

### 4. Check Browser Console

Open Developer Tools (F12) and check:
- Network tab: Verify API calls to `http://localhost:3001/api`
- Console: No CORS errors should appear

## Demo Accounts

The backend has pre-seeded users matching the frontend:

| Username | Password | Role |
|----------|----------|------|
| admin.team | Root-Admin123 | Admin |
| owner | Root-Owner123 | Admin |
| bm01 | SetC-Temp123 | Branch Manager |
| tl01 | SetA-Temp123 | Team Lead |
| ag001 | SetB-Temp123 | Agent |

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
2. Check that backend is running on the correct port
3. Ensure credentials are enabled in CORS config

### Connection Refused

If frontend can't connect to backend:

1. Verify backend is running: `curl http://localhost:3001/api/health`
2. Check `VITE_API_BASE_URL` in frontend `.env`
3. Ensure no firewall is blocking the ports

### Authentication Issues

If login fails:

1. Check backend logs for authentication errors
2. Verify user credentials match seeded users
3. Clear browser localStorage and cookies

### MongoDB Connection Issues

If backend fails to start:

1. Ensure MongoDB is running: `mongosh` or `mongo`
2. Check `MONGODB_URI` in `.env`
3. Verify MongoDB port (default: 27017) is not blocked

## Production Deployment

### Backend

```bash
# Build
npm run build

# Set production environment variables
export PORT=3001
export FRONTEND_URL=https://your-frontend-domain.com
export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
export REDIS_HOST=redis.example.com

# Start
npm start
```

### Frontend

```bash
# Update .env for production
VITE_API_BASE_URL=https://your-backend-domain.com/api

# Build
npm run build

# Deploy dist/ folder to hosting service
```

### Important Production Considerations

1. **HTTPS**: Use HTTPS for both frontend and backend
2. **Environment Variables**: Use secure secrets management
3. **CORS**: Restrict CORS to specific production domain
4. **Database**: Use managed MongoDB service (MongoDB Atlas)
5. **Redis**: Use managed Redis service or cluster
6. **Session Secrets**: Change cookie secret from default
7. **Rate Limiting**: Implement rate limiting for API endpoints

## API Documentation

For detailed API documentation, see:
- Backend endpoints: Check `src/server.ts`
- WhatsApp APIs: Check `src/whatsapp/api/`

## Support

For issues related to:
- **Backend**: Open issue in [Global-Algo-IMS-Backend](https://github.com/itz-himanshu128/Global-Algo-IMS-Backend)
- **Frontend**: Open issue in [Global-Algo-IMS](https://github.com/itz-himanshu128/Global-Algo-IMS)
