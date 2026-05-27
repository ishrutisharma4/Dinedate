#!/bin/bash
set -e

echo "🍽️  Setting up DineDate..."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "Node.js not found. Installing via Homebrew..."
  if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  brew install node
fi

echo "✅ Node.js $(node -v) found"
echo ""

# Install frontend deps
echo "📦 Installing frontend dependencies..."
cd "$(dirname "$0")/frontend"
npm install
echo "✅ Frontend ready"
echo ""

# Install backend deps
echo "📦 Installing backend dependencies..."
cd "$(dirname "$0")/backend"
npm install
echo "✅ Backend ready"
echo ""

echo "============================================"
echo "🚀 Setup complete! To start DineDate:"
echo ""
echo "  Terminal 1 (backend):"
echo "    cd ~/Documents/DineDate/backend"
echo "    npm run dev"
echo ""
echo "  Terminal 2 (frontend):"
echo "    cd ~/Documents/DineDate/frontend"
echo "    npm run dev"
echo ""
echo "  Then open: http://localhost:3000"
echo ""
echo "  Demo login: demo@dinedate.com / demo123"
echo "============================================"
