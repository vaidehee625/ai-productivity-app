@echo off

REM AI Productivity Manager - Automated Setup Script for Windows
REM Run this script from the project root

echo ==========================================
echo AI Productivity Manager - Setup Script
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js 14+ and try again.
    pause
    exit /b 1
)

echo Node.js is installed
echo.

REM Setup Backend
echo ==========================================
echo Setting up Backend...
echo ==========================================
cd backend

echo Installing backend dependencies...
call npm install

echo.
echo Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env created. Please edit it with your credentials:
    echo - MONGODB_URI
    echo - JWT_SECRET
    echo - OPENAI_API_KEY
) else (
    echo .env already exists
)

cd ..
echo.

REM Setup Frontend
echo ==========================================
echo Setting up Frontend...
echo ==========================================
cd frontend

echo Installing frontend dependencies...
call npm install

cd ..
echo.

REM Summary
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo.
echo 1. Configure Backend:
echo    cd backend
echo    Edit .env with your MongoDB URI and OpenAI API Key
echo    npm run dev
echo.
echo 2. In another terminal, start Frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo For more details, see DEPLOYMENT_GUIDE.md
echo.
pause
