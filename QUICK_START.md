# Quick Reference - Frontend-Backend Connection

## 🚀 Quick Start (3 Commands)

```bash
# 1. Setup frontend (run once)
./setup-frontend.sh

# 2. Start backend
npm run dev

# 3. Start frontend (in new terminal)
cd ../Global-Algo-IMS && npm run dev
```

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 🔑 Demo Login

| Username | Password | Role |
|----------|----------|------|
| admin.team | Root-Admin123 | Admin |
| tl01 | SetA-Temp123 | Team Lead |
| ag001 | SetB-Temp123 | Agent |

## 📝 Configuration Files

### Backend `.env`
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=global_algo_whatsapp
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=10000
```

## 🔧 Test Connection

```bash
# Test backend health
curl http://localhost:3001/api/health

# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ag001","password":"SetB-Temp123"}'
```

## 📚 Documentation

- **FRONTEND_CONNECTION.md** - Complete setup guide
- **CONNECTION_SUMMARY.md** - Detailed changes summary
- **README.md** - General backend documentation

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Check FRONTEND_URL in backend .env |
| Connection refused | Verify backend is running on port 3001 |
| Login fails | Clear browser localStorage |
| MongoDB error | Start MongoDB: `mongod` |

## 🔄 Development Workflow

1. Make changes to backend code
2. Backend auto-reloads (TypeScript watch mode)
3. Test changes in frontend
4. Check backend logs in terminal
5. Check browser console for errors

## 📦 Project Structure

```
Global-Algo-IMS-Backend/          ← You are here
├── src/
│   ├── server.ts                 ← Main backend server
│   └── whatsapp/                 ← WhatsApp features
├── .env                          ← Backend config
└── setup-frontend.sh             ← Frontend setup script

Global-Algo-IMS/                  ← Frontend (sibling dir)
├── src/
│   ├── services/api.ts           ← API client
│   └── pages/                    ← Frontend pages
└── .env                          ← Frontend config
```

## 🎯 Key Features Connected

✅ User Authentication (login/logout)
✅ Role-based Access Control
✅ Session Management (cookies)
✅ CORS properly configured
✅ API health monitoring
✅ Mock data for development
✅ Auto-seeded demo accounts

## 🚀 Next Steps

1. ✅ Run `./setup-frontend.sh`
2. ✅ Start backend: `npm run dev`
3. ✅ Start frontend: `cd ../Global-Algo-IMS && npm run dev`
4. ✅ Open http://localhost:5173
5. ✅ Login with demo account
6. ✅ Explore features!
