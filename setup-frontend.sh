#!/bin/bash

# Setup script for connecting frontend to backend

echo "🚀 Global Algo IMS - Frontend Connection Setup"
echo "=============================================="
echo ""

# Check if frontend directory exists
FRONTEND_DIR="../Global-Algo-IMS"

if [ -d "$FRONTEND_DIR" ]; then
    echo "✅ Frontend directory found at $FRONTEND_DIR"
else
    echo "📦 Cloning frontend repository..."
    git clone https://github.com/itz-himanshu128/Global-Algo-IMS.git "$FRONTEND_DIR"
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to clone frontend repository"
        exit 1
    fi
    echo "✅ Frontend repository cloned successfully"
fi

echo ""
echo "📝 Setting up frontend environment..."

# Create .env file for frontend
cat > "$FRONTEND_DIR/.env" << EOF
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=10000
EOF

echo "✅ Frontend .env file created"

echo ""
echo "📦 Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"

echo ""
echo "=============================================="
echo "✅ Setup Complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (in this directory):"
echo "   npm run dev"
echo ""
echo "2. Start Frontend (in another terminal):"
echo "   cd $FRONTEND_DIR"
echo "   npm run dev"
echo ""
echo "3. Open browser:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001/api"
echo ""
echo "Demo Accounts:"
echo "   Admin: admin.team / Root-Admin123"
echo "   Team Lead: tl01 / SetA-Temp123"
echo "   Agent: ag001 / SetB-Temp123"
echo "=============================================="
