@echo off
echo.
echo ========================================
echo   JAMSTOCKANALYTICS GITHUB UPLOAD
echo ========================================
echo.
echo Opening file explorer to upload location...
echo.

REM Open file explorer to the project directory
start explorer "C:\Users\junio\OneDrive\Documents\JamStockAnalytics\JamStockAnalytics"

echo.
echo ========================================
echo   UPLOAD INSTRUCTIONS:
echo ========================================
echo.
echo 1. GitHub repository: https://github.com/junior876/JamStockAnalytics
echo 2. Click "Add file" → "Upload files"
echo 3. Select ALL files from the opened folder
echo 4. Drag and drop into GitHub
echo 5. Add commit message (see IMMEDIATE_GITHUB_UPLOAD.md)
echo 6. Click "Commit changes"
echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo After upload:
echo 1. Configure GitHub secrets (see guide)
echo 2. Test automated build system
echo 3. Monitor build progress
echo.
echo Press any key to open GitHub repository...
pause >nul

REM Open GitHub repository
start https://github.com/junior876/JamStockAnalytics

echo.
echo ========================================
echo   UPLOAD PROCESS COMPLETE!
echo ========================================
echo.
echo Check the IMMEDIATE_GITHUB_UPLOAD.md file
echo for detailed instructions.
echo.
pause
