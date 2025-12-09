# API Testing with curl

This document provides curl commands to test the backend API endpoints.

## Prerequisites

- Backend running on http://localhost:3001
- curl installed (`curl --version`)

## Health Check

Test if backend is running:

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

## Authentication

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ag001",
    "password": "SetB-Temp123"
  }' \
  -c cookies.txt \
  -v
```

**Note**: `-c cookies.txt` saves the session cookie for subsequent requests.

Expected response:
```json
{
  "sessionId": "...",
  "user": {
    "id": "...",
    "username": "ag001",
    "role": "Agent"
  }
}
```

### Get Current User

Use saved cookies from login:

```bash
curl http://localhost:3001/api/auth/me \
  -b cookies.txt
```

Expected response:
```json
{
  "id": "...",
  "username": "ag001",
  "role": "Agent"
}
```

### Logout

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

Expected response:
```json
{
  "message": "Logged out"
}
```

## User Management (Admin Only)

### Login as Admin First

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin.team",
    "password": "Root-Admin123"
  }' \
  -c cookies.txt
```

### List All Users

```bash
curl http://localhost:3001/api/users \
  -b cookies.txt
```

### Get Specific User

```bash
curl http://localhost:3001/api/users/USER_ID \
  -b cookies.txt
```

### Create User

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "username": "newagent",
    "password": "TempPass123",
    "role": "Agent"
  }'
```

### Update User

```bash
curl -X PUT http://localhost:3001/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "username": "updateduser",
    "role": "Team Lead"
  }'
```

### Delete User

```bash
curl -X DELETE http://localhost:3001/api/users/USER_ID \
  -b cookies.txt
```

## WhatsApp Campaigns

### Create Campaign

```bash
curl -X POST http://localhost:3001/api/whatsapp/campaigns \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Campaign",
    "recipients": [
      {
        "phone": "+919876543210",
        "name": "Test User"
      }
    ],
    "template": "Hello {{name}}, this is a test message.",
    "scheduledAt": "2025-12-10T10:00:00Z"
  }'
```

### List Campaigns

```bash
curl http://localhost:3001/api/whatsapp/campaigns \
  -b cookies.txt
```

### Get Campaign Details

```bash
curl http://localhost:3001/api/whatsapp/campaigns/CAMPAIGN_ID \
  -b cookies.txt
```

## Testing Different User Roles

### Admin User
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin.team",
    "password": "Root-Admin123"
  }' \
  -c admin-cookies.txt
```

### Team Lead
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tl01",
    "password": "SetA-Temp123"
  }' \
  -c teamlead-cookies.txt
```

### Agent
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ag001",
    "password": "SetB-Temp123"
  }' \
  -c agent-cookies.txt
```

## Error Testing

### Invalid Credentials
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "invalid",
    "password": "wrong"
  }' \
  -v
```

Expected: 401 Unauthorized

### Missing Credentials
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin.team"
  }' \
  -v
```

Expected: 400 Bad Request

### Unauthorized Access
```bash
# Try to access admin endpoint without login
curl http://localhost:3001/api/users \
  -v
```

Expected: 401 Unauthorized

### Rate Limiting Test
```bash
# Try multiple failed login attempts
for i in {1..6}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "username": "admin.team",
      "password": "wrongpassword"
    }'
  echo ""
  sleep 1
done
```

Expected: After 5 attempts, account should be locked

## CORS Testing

### Check CORS Headers
```bash
curl -X OPTIONS http://localhost:3001/api/health \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

Expected headers:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### Test with Different Origin
```bash
curl http://localhost:3001/api/health \
  -H "Origin: http://example.com" \
  -v
```

Expected: CORS error or blocked

## Advanced Testing

### Test with jq (JSON parsing)

Install jq: `sudo apt-get install jq` or `brew install jq`

```bash
# Login and extract sessionId
SESSION_ID=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ag001","password":"SetB-Temp123"}' \
  | jq -r '.sessionId')

echo "Session ID: $SESSION_ID"
```

### Automated Test Script

Create `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "Testing Global Algo IMS Backend API"
echo "==================================="

# Test 1: Health Check
echo -n "1. Health Check... "
RESPONSE=$(curl -s $BASE_URL/health)
if echo $RESPONSE | grep -q '"status":"ok"'; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# Test 2: Login
echo -n "2. Login... "
RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"ag001","password":"SetB-Temp123"}' \
    -c test-cookies.txt)
if echo $RESPONSE | grep -q 'sessionId'; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# Test 3: Get Current User
echo -n "3. Get Current User... "
RESPONSE=$(curl -s $BASE_URL/auth/me -b test-cookies.txt)
if echo $RESPONSE | grep -q 'username'; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# Test 4: Logout
echo -n "4. Logout... "
RESPONSE=$(curl -s -X POST $BASE_URL/auth/logout -b test-cookies.txt)
if echo $RESPONSE | grep -q 'Logged out'; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# Cleanup
rm -f test-cookies.txt

echo "==================================="
echo "Tests completed!"
```

Make executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Performance Testing

### Simple Load Test with Apache Bench

```bash
# Install ab: sudo apt-get install apache2-utils

# Test health endpoint
ab -n 1000 -c 10 http://localhost:3001/api/health

# Test login endpoint (requires file with POST data)
echo '{"username":"ag001","password":"SetB-Temp123"}' > post-data.json
ab -n 100 -c 5 -p post-data.json -T application/json \
  http://localhost:3001/api/auth/login
```

## Debugging Tips

### View Full Request/Response
```bash
curl http://localhost:3001/api/health -v
```

### Save Response to File
```bash
curl http://localhost:3001/api/health -o response.json
```

### Include Response Headers
```bash
curl http://localhost:3001/api/health -i
```

### Follow Redirects
```bash
curl http://localhost:3001/api/auth/me -L -b cookies.txt
```

### Set Timeout
```bash
curl http://localhost:3001/api/health --max-time 5
```

## Cookie Management

### Save Cookies
```bash
curl ... -c cookies.txt
```

### Use Saved Cookies
```bash
curl ... -b cookies.txt
```

### View Cookie File
```bash
cat cookies.txt
```

### Manual Cookie Header
```bash
curl http://localhost:3001/api/auth/me \
  -H "Cookie: sessionId=YOUR_SESSION_ID"
```

## Common Issues

### "Connection refused"
- Backend not running
- Wrong port number
- Firewall blocking

### "CORS error"
- Origin header missing
- Origin not in allowlist
- Backend CORS config issue

### "401 Unauthorized"
- Not logged in
- Session expired
- Invalid cookie

### "400 Bad Request"
- Missing required fields
- Invalid JSON format
- Wrong Content-Type header

## Tips

1. **Save cookies** with `-c cookies.txt` after login
2. **Use saved cookies** with `-b cookies.txt` for authenticated requests
3. **Use jq** to parse JSON responses: `curl ... | jq`
4. **Add `-v`** flag to see full request/response details
5. **Create test scripts** for repetitive testing
6. **Use variables** for base URL and common headers

---

**Happy Testing! 🧪**

For more information, see [FRONTEND_CONNECTION.md](FRONTEND_CONNECTION.md)
