# Environment Setup Script for JamStockAnalytics Chat Server
# This script helps you create and configure the .env file

Write-Host "🚀 JamStockAnalytics Environment Setup" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue
Write-Host ""

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit 0
    }
}

Write-Host "📝 Creating .env file from template..." -ForegroundColor Green

# Create .env file content
$envContent = @"
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Database URL for direct connections
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project-id.supabase.co:5432/postgres

# Server Configuration
PORT=8000
NODE_ENV=production

# Rate Limiting (optional overrides)
RATE_LIMIT=100
WINDOW_MS=60000
MAX_MESSAGES=100
CLEANUP_DAYS=30
"@

# Write the .env file
$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Next Steps:" -ForegroundColor Blue
Write-Host "1. Get your Supabase credentials:" -ForegroundColor White
Write-Host "   - Go to https://supabase.com" -ForegroundColor Gray
Write-Host "   - Open your project dashboard" -ForegroundColor Gray
Write-Host "   - Go to Settings → API" -ForegroundColor Gray
Write-Host "   - Copy Project URL and service_role key" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update your .env file:" -ForegroundColor White
Write-Host "   - Replace 'https://your-project-id.supabase.co' with your Project URL" -ForegroundColor Gray
Write-Host "   - Replace 'your_service_role_key_here' with your service_role key" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test the setup:" -ForegroundColor White
Write-Host "   deno task dev" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to open the file for editing
$openFile = Read-Host "Do you want to open .env file for editing now? (y/N)"
if ($openFile -eq "y" -or $openFile -eq "Y") {
    if (Get-Command notepad -ErrorAction SilentlyContinue) {
        notepad .env
    } elseif (Get-Command code -ErrorAction SilentlyContinue) {
        code .env
    } else {
        Write-Host "Please edit .env file manually with your preferred text editor." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📚 For detailed instructions, see ENVIRONMENT_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host "🎉 Environment setup complete!" -ForegroundColor Green
