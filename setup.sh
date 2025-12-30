#!/bin/bash

# AI Productivity Manager - Automated Setup Script
# Run this script from the project root to set up both backend and frontend

set -e

echo "=========================================="
echo "AI Productivity Manager - Setup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ and try again."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Setup Backend
echo "=========================================="
echo "Setting up Backend..."
echo "=========================================="
cd backend

echo "📦 Installing backend dependencies..."
npm install

echo ""
echo "📝 Creating .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env created. Please edit it with your credentials:"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
    echo "   - OPENAI_API_KEY"
else
    echo "✅ .env already exists"
fi

cd ..
echo ""

# Setup Frontend
echo "=========================================="
echo "Setting up Frontend..."
echo "=========================================="
cd frontend

echo "📦 Installing frontend dependencies..."
npm install

cd ..
echo ""

# Summary
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Backend:"
echo "   $ cd backend"
echo "   $ Edit .env with your MongoDB URI and OpenAI API Key"
echo "   $ npm run dev"
echo ""
echo "2. In another terminal, start Frontend:"
echo "   $ cd frontend"
echo "   $ npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For more details, see DEPLOYMENT_GUIDE.md"
echo ""
