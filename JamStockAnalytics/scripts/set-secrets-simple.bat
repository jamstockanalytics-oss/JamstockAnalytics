@echo off
echo Setting up Supabase secrets...

REM Check if Supabase CLI is available
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Supabase CLI not found. Please install it first:
    echo npm install -g supabase
    pause
    exit /b 1
)

echo Supabase CLI found. Setting secrets...

REM Set secrets from environment file
supabase secrets set --env-file secrets.env

if %errorlevel% equ 0 (
    echo Successfully set Supabase secrets!
    echo.
    echo Verifying secrets...
    supabase secrets list
    echo.
    echo Secrets setup complete!
) else (
    echo Failed to set Supabase secrets
    pause
    exit /b 1
)

pause
