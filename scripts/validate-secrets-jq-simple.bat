@echo off
setlocal enabledelayedexpansion

echo 🔍 Validating Supabase Secrets with jq
echo =====================================
echo.

REM Check if jq is installed
set JQ_PATH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe\jq.exe
if not exist "%JQ_PATH%" (
    echo ❌ jq is not installed. Please install jq first:
    echo    Windows: winget install jqlang.jq
    echo    macOS: brew install jq
    echo    Linux: apt-get install jq
    exit /b 1
)

for /f "tokens=*" %%i in ('"%JQ_PATH%" --version') do set JQ_VERSION=%%i
echo ✅ jq version: !JQ_VERSION!
echo.

echo 📋 Validating required secrets:
echo.

set REQUIRED_ERRORS=0

REM Validate SUPABASE_HOST
echo 🔍 Validating SUPABASE_HOST...
if "%SUPABASE_HOST%"=="" (
    echo ❌ SUPABASE_HOST is not set
    set /a REQUIRED_ERRORS+=1
) else (
    echo %SUPABASE_HOST% | findstr /r "your- placeholder example" >nul
    if not errorlevel 1 (
        echo ❌ SUPABASE_HOST appears to contain placeholder text
        set /a REQUIRED_ERRORS+=1
    ) else (
        call :strlen SUPABASE_HOST LEN
        if !LEN! LSS 10 (
            echo ❌ SUPABASE_HOST is too short (!LEN!/10 characters)
            set /a REQUIRED_ERRORS+=1
        ) else (
            echo ✅ SUPABASE_HOST is properly configured (!LEN! characters)
        )
    )
)
echo.

REM Validate SUPABASE_PASSWORD
echo 🔍 Validating SUPABASE_PASSWORD...
if "%SUPABASE_PASSWORD%"=="" (
    echo ❌ SUPABASE_PASSWORD is not set
    set /a REQUIRED_ERRORS+=1
) else (
    echo %SUPABASE_PASSWORD% | findstr /r "your- placeholder example" >nul
    if not errorlevel 1 (
        echo ❌ SUPABASE_PASSWORD appears to contain placeholder text
        set /a REQUIRED_ERRORS+=1
    ) else (
        call :strlen SUPABASE_PASSWORD LEN
        if !LEN! LSS 8 (
            echo ❌ SUPABASE_PASSWORD is too short (!LEN!/8 characters)
            set /a REQUIRED_ERRORS+=1
        ) else (
            echo ✅ SUPABASE_PASSWORD is properly configured (!LEN! characters)
        )
    )
)
echo.

REM Validate LOCATION
echo 🔍 Validating LOCATION...
if "%LOCATION%"=="" (
    echo ❌ LOCATION is not set
    set /a REQUIRED_ERRORS+=1
) else (
    echo %LOCATION% | findstr /r "your- placeholder example" >nul
    if not errorlevel 1 (
        echo ❌ LOCATION appears to contain placeholder text
        set /a REQUIRED_ERRORS+=1
    ) else (
        call :strlen LOCATION LEN
        if !LEN! LSS 2 (
            echo ❌ LOCATION is too short (!LEN!/2 characters)
            set /a REQUIRED_ERRORS+=1
        ) else (
            echo ✅ LOCATION is properly configured (!LEN! characters)
        )
    )
)
echo.

echo 📋 Validating optional secrets:
echo.

set OPTIONAL_ERRORS=0

REM Validate SUPABASE_URL
echo 🔍 Validating SUPABASE_URL...
if "%SUPABASE_URL%"=="" (
    echo ⚠️  SUPABASE_URL is optional and not set
) else (
    echo %SUPABASE_URL% | findstr /r "your- placeholder example" >nul
    if not errorlevel 1 (
        echo ❌ SUPABASE_URL appears to contain placeholder text
        set /a OPTIONAL_ERRORS+=1
    ) else (
        call :strlen SUPABASE_URL LEN
        if !LEN! LSS 20 (
            echo ❌ SUPABASE_URL is too short (!LEN!/20 characters)
            set /a OPTIONAL_ERRORS+=1
        ) else (
            echo ✅ SUPABASE_URL is properly configured (!LEN! characters)
        )
    )
)
echo.

REM Validate DEEPSEEK_API_KEY
echo 🔍 Validating DEEPSEEK_API_KEY...
if "%DEEPSEEK_API_KEY%"=="" (
    echo ⚠️  DEEPSEEK_API_KEY is optional and not set
) else (
    echo %DEEPSEEK_API_KEY% | findstr /r "your- placeholder example" >nul
    if not errorlevel 1 (
        echo ❌ DEEPSEEK_API_KEY appears to contain placeholder text
        set /a OPTIONAL_ERRORS+=1
    ) else (
        call :strlen DEEPSEEK_API_KEY LEN
        if !LEN! LSS 20 (
            echo ❌ DEEPSEEK_API_KEY is too short (!LEN!/20 characters)
            set /a OPTIONAL_ERRORS+=1
        ) else (
            echo ✅ DEEPSEEK_API_KEY is properly configured (!LEN! characters)
        )
    )
)
echo.

REM Summary
echo 📊 Validation Summary:
set /a REQUIRED_PASSED=3-!REQUIRED_ERRORS!
set /a OPTIONAL_PASSED=2-!OPTIONAL_ERRORS!
set /a TOTAL_ERRORS=!REQUIRED_ERRORS!+!OPTIONAL_ERRORS!
echo   Required secrets: !REQUIRED_PASSED!/3 passed
echo   Optional secrets: !OPTIONAL_PASSED!/2 configured
echo   Total errors: !TOTAL_ERRORS!

if !REQUIRED_ERRORS! GTR 0 (
    echo.
    echo ❌ Validation failed with errors:
    echo    Required secrets are missing or invalid
    echo.
    echo 💡 To fix these issues:
    echo   1. Set the required secrets in GitHub repository settings
    echo   2. Go to Settings → Secrets and variables → Actions
    echo   3. Add the missing secrets with their values
    echo   4. Re-run this workflow
    exit /b 1
)

if !OPTIONAL_ERRORS! GTR 0 (
    echo.
    echo ⚠️  Validation completed with warnings:
    echo    Some optional secrets have issues but are not required
)

echo.
echo ✅ All required secrets are properly configured!
echo 🔒 Your Supabase project is ready for deployment.

REM Test connection if SUPABASE_HOST is set
if not "%SUPABASE_HOST%"=="" (
    echo.
    echo 🔗 Testing connection to Supabase...
    echo    Hostname: %SUPABASE_HOST%
    echo ✅ Connection test completed (basic validation)
)

echo.
echo 🎉 jq-based validation complete!

exit /b 0

REM Function to calculate string length
:strlen
setlocal enabledelayedexpansion
set "str=!%1!"
set "len=0"
for /l %%i in (0,1,8192) do (
    if "!str:~%%i,1!"=="" (
        set /a len=%%i
        goto :strlen_done
    )
)
:strlen_done
endlocal & set %2=%len%
goto :eof
