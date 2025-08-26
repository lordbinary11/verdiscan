@echo off
echo 🌱 Starting Plant Disease Detection API...
echo ==========================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose is not installed. Please install it first.
    pause
    exit /b 1
)

echo ✅ Docker environment ready

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check health
echo 🏥 Checking API health...
curl -f http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API is healthy and running!
    echo.
    echo 🌐 Access your API at:
    echo    - API: http://localhost:8000
    echo    - Docs: http://localhost:8000/docs
    echo    - Health: http://localhost:8000/health
    echo.
    echo 📱 Test with:
    echo    curl http://localhost:8000/health
    echo.
    echo 🛑 To stop services: docker-compose down
) else (
    echo ❌ API health check failed
    echo 📋 Check logs with: docker-compose logs plant-disease-api
    pause
    exit /b 1
)

pause
