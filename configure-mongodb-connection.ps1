# Configure MongoDB Connection for JamStockAnalytics Production
Write-Host "🗄️ Configuring MongoDB Connection for Production" -ForegroundColor Green

# Your MongoDB connection string
$connectionString = "mongodb+srv://jamstockanalytics_db_user:<db_password>@cluster0.2qebwwk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

Write-Host "`n📋 YOUR MONGODB CONNECTION STRING:" -ForegroundColor Cyan
Write-Host $connectionString -ForegroundColor Yellow

Write-Host "`n🔧 CONFIGURATION STEPS:" -ForegroundColor Cyan

Write-Host "`n1️⃣ UPDATE YOUR CONNECTION STRING:" -ForegroundColor Yellow
Write-Host "   • Replace <db_password> with your actual password" -ForegroundColor White
Write-Host "   • Add database name: /jamstockanalytics" -ForegroundColor White
Write-Host "   • Your final string should be:" -ForegroundColor White
Write-Host "     mongodb+srv://jamstockanalytics_db_user:YOUR_ACTUAL_PASSWORD@cluster0.2qebwwk.mongodb.net/jamstockanalytics?retryWrites=true&w=majority&appName=Cluster0" -ForegroundColor Green

Write-Host "`n2️⃣ ADD TO RENDER.COM ENVIRONMENT VARIABLES:" -ForegroundColor Yellow
Write-Host "   • Go to https://render.com" -ForegroundColor White
Write-Host "   • Select your JamStockAnalytics service" -ForegroundColor White
Write-Host "   • Go to 'Environment' tab" -ForegroundColor White
Write-Host "   • Add new environment variable:" -ForegroundColor White
Write-Host "     Key: MONGODB_URI" -ForegroundColor White
Write-Host "     Value: Your updated connection string" -ForegroundColor White

Write-Host "`n3️⃣ TEST YOUR CONNECTION:" -ForegroundColor Yellow
Write-Host "   • Deploy your app to Render.com" -ForegroundColor White
Write-Host "   • Visit: https://your-app.onrender.com/api/health" -ForegroundColor White
Write-Host "   • Check for database connection status" -ForegroundColor White

Write-Host "`n📊 DATABASE WILL AUTO-CREATE:" -ForegroundColor Cyan
Write-Host "   ✅ Database: jamstockanalytics" -ForegroundColor White
Write-Host "   ✅ Collection: users" -ForegroundColor White
Write-Host "   ✅ Collection: marketdata" -ForegroundColor White
Write-Host "   ✅ Collection: news" -ForegroundColor White
Write-Host "   ✅ Collection: portfolios" -ForegroundColor White

Write-Host "`n🔍 INDEXES WILL AUTO-CREATE:" -ForegroundColor Cyan
Write-Host "   ✅ Email uniqueness index" -ForegroundColor White
Write-Host "   ✅ Market data performance indexes" -ForegroundColor White
Write-Host "   ✅ News timestamp indexes" -ForegroundColor White
Write-Host "   ✅ Portfolio user indexes" -ForegroundColor White

Write-Host "`n🚨 SECURITY REMINDERS:" -ForegroundColor Red
Write-Host "   • Use a strong password for your database user" -ForegroundColor White
Write-Host "   • Never share your connection string publicly" -ForegroundColor White
Write-Host "   • Store password securely" -ForegroundColor White
Write-Host "   • Monitor access logs in MongoDB Atlas" -ForegroundColor White

Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Update your connection string with actual password" -ForegroundColor White
Write-Host "   2. Add MONGODB_URI to Render.com environment variables" -ForegroundColor White
Write-Host "   3. Deploy your app to Render.com" -ForegroundColor White
Write-Host "   4. Test connection via health check endpoint" -ForegroundColor White

Write-Host "`n✅ MONGODB CONFIGURATION READY!" -ForegroundColor Green
Write-Host "🌐 Your database will be connected when you deploy!" -ForegroundColor Green
