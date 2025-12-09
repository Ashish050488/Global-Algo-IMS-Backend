# Frontend-Backend Connection Summary

## What Was Done

### 1. Backend Configuration Updates

#### ✅ Environment Variables (.env)
- Created `.env` file with proper configuration
- Added `FRONTEND_URL` variable for CORS configuration
- Set default port to 3001
- Configured MongoDB and Redis connection strings

#### ✅ CORS Configuration (src/server.ts)
Updated CORS settings to allow requests from:
- Frontend development server (http://localhost:5173)
- Alternative React/Vite ports (3000, 5174)
- Custom frontend URL from environment variable
- Proper credentials support for session cookies

#### ✅ Health Check Endpoint
Added `/api/health` endpoint for connection verification:
```bash
curl http://localhost:3001/api/health
```

### 2. Documentation

#### ✅ Updated README.md
- Added frontend connection section
- Included quick start instructions
- Listed all demo accounts

#### ✅ Created FRONTEND_CONNECTION.md
Comprehensive guide covering:
- Quick start for both backend and frontend
- Environment configuration examples
- API endpoint documentation
- CORS configuration details
- Demo account credentials
- Troubleshooting common issues
- Production deployment guidelines

#### ✅ Created setup-frontend.sh
Automated setup script that:
- Clones frontend repository if not present
- Creates frontend .env file with correct backend URL
- Installs frontend dependencies
- Provides clear next steps

### 3. Frontend Setup Instructions

To set up the frontend, you have two options:

#### Option A: Automated Setup (Recommended)
```bash
./setup-frontend.sh
```

#### Option B: Manual Setup
```bash
# Clone frontend
git clone https://github.com/itz-himanshu128/Global-Algo-IMS.git ../Global-Algo-IMS

# Navigate to frontend
cd ../Global-Algo-IMS

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env
echo "VITE_API_TIMEOUT=10000" >> .env

# Start frontend
npm run dev
```

## How to Run Both Applications

### Terminal 1 - Backend
```bash
cd /workspaces/Global-Algo-IMS-Backend

# Make sure dependencies are installed
npm install

# Start MongoDB (if not running)
# mongod

# Start Redis (if not running)
# redis-server

# Start backend
npm run dev
```

Backend runs on: **http://localhost:3001**

### Terminal 2 - Frontend
```bash
cd ../Global-Algo-IMS

# If not already installed
npm install

# Start frontend
npm run dev
```

Frontend runs on: **http://localhost:5173**

## Testing the Connection

### 1. Check Backend Health
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-09T...",
  "uptime": 123.45,
  "version": "1.1.0",
  "services": {
    "mongodb": "connected",
    "redis": "available"
  }
}
```

### 2. Test Frontend Connection
1. Open browser: http://localhost:5173
2. Open Developer Tools (F12)
3. Go to Network tab
4. Try logging in with demo account
5. Verify API calls to http://localhost:3001/api/auth/login

### 3. Demo Accounts

| Username | Password | Role | Frontend Route |
|----------|----------|------|----------------|
| admin.team | Root-Admin123 | Admin | /admin |
| owner | Root-Owner123 | Admin | /admin |
| tl01 | SetA-Temp123 | Team Lead | /teamlead |
| ag001 | SetB-Temp123 | Agent | /agent |

## API Endpoints Available

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### WhatsApp Campaigns
- `POST /api/whatsapp/campaigns` - Create campaign
- `GET /api/whatsapp/campaigns` - List campaigns
- `GET /api/whatsapp/campaigns/:id` - Get campaign details

### Health & Monitoring
- `GET /api/health` - Health check

## Key Files Modified

1. **/.env** (created)
   - Environment configuration with FRONTEND_URL

2. **/src/server.ts** (modified)
   - Updated CORS configuration
   - Added health check endpoint

3. **/README.md** (updated)
   - Added frontend connection section
   - Updated setup instructions

4. **/FRONTEND_CONNECTION.md** (created)
   - Comprehensive connection guide

5. **/setup-frontend.sh** (created)
   - Automated frontend setup script

## Troubleshooting

### CORS Issues
If you see "CORS policy" errors in browser console:
1. Verify backend is running on port 3001
2. Check `.env` file has correct `FRONTEND_URL`
3. Clear browser cache and cookies

### Connection Refused
If frontend can't connect:
1. Ensure backend is running: `curl http://localhost:3001/api/health`
2. Check `VITE_API_BASE_URL` in frontend `.env`
3. Verify ports are not blocked by firewall

### Login Issues
If authentication fails:
1. Check backend logs for errors
2. Verify username/password matches demo accounts
3. Clear browser localStorage
4. Check Network tab for 401/403 responses

## Next Steps

1. **Start both applications** using instructions above
2. **Test the connection** by logging in
3. **Explore features** using different role accounts
4. **Configure WhatsApp** (optional) - Add Twilio credentials to `.env`
5. **Set up MongoDB** if you want persistent data
6. **Set up Redis** if you want to use the message queue worker

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Update `FRONTEND_URL` to production domain
3. Use HTTPS for both frontend and backend
4. Use managed MongoDB (e.g., MongoDB Atlas)
5. Use managed Redis service
6. Change cookie secret in `server.ts`
7. Enable rate limiting
8. Set up proper logging and monitoring

## Support

- Backend Issues: https://github.com/itz-himanshu128/Global-Algo-IMS-Backend/issues
- Frontend Issues: https://github.com/itz-himanshu128/Global-Algo-IMS/issues
