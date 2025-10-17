@echo off
echo ========================================
echo JamStockAnalytics Database Update
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found
    echo Please create a .env file with your Supabase credentials:
    echo    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    echo    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    pause
    exit /b 1
)

echo ✅ Node.js found
echo ✅ .env file found
echo.

echo 🚀 Starting database update...
echo.

REM Run the database update script
node scripts/setup-database.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database update completed successfully!
    echo.
    echo 🎉 Your JamStockAnalytics database is now ready!
    echo.
    echo New features available:
    echo   - Social Media Sharing System
    echo   - Chart Preferences and Data Caching  
    echo   - Enhanced User Profiles
    echo   - Analytics and Performance Tracking
    echo   - Row Level Security Policies
    echo   - Database Functions and Triggers
    echo   - Performance Indexes
) else (
    echo.
    echo ❌ Database update failed!
    echo Please check the error messages above and try again.
)

echo.
pause
