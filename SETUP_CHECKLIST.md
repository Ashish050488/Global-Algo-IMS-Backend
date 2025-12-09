# Connection Setup Checklist

Use this checklist to verify your frontend-backend connection is properly configured.

## ✅ Backend Setup Checklist

- [ ] Backend repository cloned and in correct directory
- [ ] Node.js dependencies installed (`npm install`)
- [ ] `.env` file created with required variables
  - [ ] PORT=3001
  - [ ] FRONTEND_URL=http://localhost:5173
  - [ ] MongoDB URI configured
  - [ ] Redis configuration present
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Backend starts successfully (`npm run dev`)
- [ ] Backend runs on http://localhost:3001
- [ ] Health endpoint responds: `curl http://localhost:3001/api/health`
- [ ] MongoDB is running (if using local MongoDB)
- [ ] Redis is running (if using message queue)

## ✅ Frontend Setup Checklist

- [ ] Frontend repository cloned (or setup script run)
- [ ] Frontend in correct directory (../Global-Algo-IMS)
- [ ] Node.js dependencies installed
- [ ] `.env` file created in frontend directory
  - [ ] VITE_API_BASE_URL=http://localhost:3001/api
  - [ ] VITE_API_TIMEOUT=10000
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Frontend runs on http://localhost:5173
- [ ] No CORS errors in browser console

## ✅ Connection Verification

- [ ] Can access frontend in browser: http://localhost:5173
- [ ] Login page loads correctly
- [ ] Demo account buttons are visible
- [ ] Open browser DevTools (F12)
- [ ] Network tab shows requests to http://localhost:3001/api
- [ ] Can login with demo account (admin.team / Root-Admin123)
- [ ] After login, redirected to appropriate dashboard
- [ ] Session cookie is set (check Application tab in DevTools)
- [ ] No 401/403 errors in Network tab
- [ ] No CORS errors in Console tab
- [ ] User info loads correctly
- [ ] Can navigate between different pages
- [ ] Logout works correctly

## ✅ API Endpoints Test

Test these endpoints manually:

### Health Check
```bash
curl http://localhost:3001/api/health
```
- [ ] Returns 200 OK
- [ ] JSON response with status: "ok"

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ag001","password":"SetB-Temp123"}'
```
- [ ] Returns 200 OK
- [ ] Response includes sessionId
- [ ] Set-Cookie header present

### Get Current User (requires session)
- [ ] Login via frontend first
- [ ] Check API calls in Network tab
- [ ] `/api/auth/me` returns user data

## ✅ Role-Based Access

Test different user roles:

### Admin (admin.team / Root-Admin123)
- [ ] Login successful
- [ ] Redirected to /admin
- [ ] Can access Users page
- [ ] Can access Upload Excel page
- [ ] Can access all admin features

### Team Lead (tl01 / SetA-Temp123)
- [ ] Login successful
- [ ] Redirected to /teamlead
- [ ] Can see dashboard stats
- [ ] Can access review queue
- [ ] Can assign leads

### Agent (ag001 / SetB-Temp123)
- [ ] Login successful
- [ ] Redirected to /agent
- [ ] Can see leads list
- [ ] Can log calls
- [ ] Can access WhatsApp connector

## ✅ CORS Configuration

- [ ] Frontend can make requests to backend
- [ ] Credentials (cookies) are sent with requests
- [ ] Preflight OPTIONS requests succeed
- [ ] No "blocked by CORS policy" errors
- [ ] Multiple localhost ports allowed (5173, 3000, 5174)

## ✅ Session Management

- [ ] Login creates session
- [ ] Session cookie is HTTP-only
- [ ] Session persists across page refreshes
- [ ] Logout clears session
- [ ] Expired sessions redirect to login
- [ ] Multiple tabs share same session

## ✅ Error Handling

- [ ] Invalid credentials show error message
- [ ] Network errors handled gracefully
- [ ] Backend errors show in console (but don't crash)
- [ ] 401 errors redirect to login page
- [ ] Rate limiting works (after 5 failed attempts)

## 🐛 Common Issues Checklist

If something isn't working, check:

### Backend Not Starting
- [ ] Port 3001 not already in use: `lsof -i :3001`
- [ ] MongoDB running: `mongosh` or `mongo`
- [ ] Node version compatible (v14+): `node -v`
- [ ] Dependencies installed: `rm -rf node_modules && npm install`

### Frontend Not Connecting
- [ ] Backend is running
- [ ] .env file exists in frontend root
- [ ] API URL correct: http://localhost:3001/api (no trailing slash)
- [ ] Clear browser cache and localStorage
- [ ] Try incognito/private browsing mode

### CORS Errors
- [ ] FRONTEND_URL matches frontend URL exactly
- [ ] Backend restarted after .env changes
- [ ] Credentials: true in CORS config
- [ ] Origin header sent by browser matches allowed origins

### Authentication Issues
- [ ] Username/password exactly match demo accounts
- [ ] Check backend logs for authentication errors
- [ ] Session cookies enabled in browser
- [ ] No ad blockers interfering
- [ ] Clear all cookies for localhost

### MongoDB Issues
- [ ] MongoDB service running
- [ ] Connection string correct
- [ ] Database name matches config
- [ ] MongoDB port 27017 available
- [ ] Check MongoDB logs: `tail -f /var/log/mongodb/mongod.log`

### Redis Issues (for WhatsApp features)
- [ ] Redis service running: `redis-cli ping`
- [ ] Redis host and port correct
- [ ] ENABLE_WORKER set appropriately
- [ ] Check Redis logs

## 📊 Success Criteria

Your setup is complete when:

✅ Backend runs without errors
✅ Frontend loads without CORS issues
✅ Can login with any demo account
✅ Dashboard loads for logged-in user
✅ Navigation between pages works
✅ Logout works correctly
✅ Session persists across refreshes
✅ Role-based routing works (admin sees admin pages, etc.)

## 🎉 All Done?

If all checks pass, you're ready to develop! 

### Next Steps:
1. Explore the different role dashboards
2. Try the WhatsApp campaign features (requires Twilio setup)
3. Test lead management features
4. Customize the application for your needs
5. Review API documentation in FRONTEND_CONNECTION.md

## 📞 Need Help?

If issues persist after checking all items:

1. Check backend logs for errors
2. Check browser console for frontend errors
3. Review FRONTEND_CONNECTION.md troubleshooting section
4. Open an issue on GitHub with:
   - Which checklist items failed
   - Error messages from logs
   - Browser console errors
   - Steps to reproduce

---

**Last Updated**: December 9, 2025
**Backend Version**: 1.1.0
**Frontend Repository**: https://github.com/itz-himanshu128/Global-Algo-IMS
