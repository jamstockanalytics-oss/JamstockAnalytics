# MongoDB Setup Script for JamStockAnalytics Production
Write-Host "🗄️ MongoDB Setup for JamStockAnalytics Production" -ForegroundColor Green

Write-Host "`n📋 STEP-BY-STEP MONGODB SETUP:" -ForegroundColor Cyan

Write-Host "`n1️⃣ CREATE MONGODB ATLAS ACCOUNT:" -ForegroundColor Yellow
Write-Host "   • Go to: https://cloud.mongodb.com" -ForegroundColor White
Write-Host "   • Sign up with email or Google" -ForegroundColor White
Write-Host "   • Choose FREE tier (M0 Sandbox)" -ForegroundColor White

Write-Host "`n2️⃣ CREATE YOUR CLUSTER:" -ForegroundColor Yellow
Write-Host "   • Click 'Build a Database'" -ForegroundColor White
Write-Host "   • Select 'M0 Sandbox' (FREE)" -ForegroundColor White
Write-Host "   • Choose AWS (recommended)" -ForegroundColor White
Write-Host "   • Select closest region" -ForegroundColor White
Write-Host "   • Name: jamstockanalytics-cluster" -ForegroundColor White
Write-Host "   • Click 'Create'" -ForegroundColor White

Write-Host "`n3️⃣ SET UP DATABASE USER:" -ForegroundColor Yellow
Write-Host "   • Go to 'Database Access'" -ForegroundColor White
Write-Host "   • Click 'Add New Database User'" -ForegroundColor White
Write-Host "   • Username: jamstockanalytics-user" -ForegroundColor White
Write-Host "   • Password: Generate secure password (SAVE IT!)" -ForegroundColor White
Write-Host "   • Privileges: 'Read and write to any database'" -ForegroundColor White
Write-Host "   • Click 'Add User'" -ForegroundColor White

Write-Host "`n4️⃣ CONFIGURE NETWORK ACCESS:" -ForegroundColor Yellow
Write-Host "   • Go to 'Network Access'" -ForegroundColor White
Write-Host "   • Click 'Add IP Address'" -ForegroundColor White
Write-Host "   • Click 'Allow Access from Anywhere' (0.0.0.0/0)" -ForegroundColor White
Write-Host "   • Click 'Confirm'" -ForegroundColor White

Write-Host "`n5️⃣ GET CONNECTION STRING:" -ForegroundColor Yellow
Write-Host "   • Go to 'Database'" -ForegroundColor White
Write-Host "   • Click 'Connect' on your cluster" -ForegroundColor White
Write-Host "   • Choose 'Connect your application'" -ForegroundColor White
Write-Host "   • Driver: Node.js" -ForegroundColor White
Write-Host "   • Version: 4.1 or later" -ForegroundColor White
Write-Host "   • Copy the connection string" -ForegroundColor White

Write-Host "`n6️⃣ UPDATE CONNECTION STRING:" -ForegroundColor Yellow
Write-Host "   • Replace <password> with your actual password" -ForegroundColor White
Write-Host "   • Replace <dbname> with 'jamstockanalytics'" -ForegroundColor White
Write-Host "   • Your final string should look like:" -ForegroundColor White
Write-Host "     mongodb+srv://jamstockanalytics-user:YOUR_PASSWORD@jamstockanalytics-cluster.xxxxx.mongodb.net/jamstockanalytics?retryWrites=true&w=majority" -ForegroundColor Green

Write-Host "`n7️⃣ ADD TO RENDER.COM:" -ForegroundColor Yellow
Write-Host "   • Go to your Render.com dashboard" -ForegroundColor White
Write-Host "   • Select your JamStockAnalytics service" -ForegroundColor White
Write-Host "   • Go to 'Environment' tab" -ForegroundColor White
Write-Host "   • Add new variable:" -ForegroundColor White
Write-Host "     Key: MONGODB_URI" -ForegroundColor White
Write-Host "     Value: Your connection string" -ForegroundColor White

Write-Host "`n🔍 TEST YOUR CONNECTION:" -ForegroundColor Yellow
Write-Host "   • Deploy your app to Render.com" -ForegroundColor White
Write-Host "   • Visit: https://your-app.onrender.com/api/health" -ForegroundColor White
Write-Host "   • Check for database connection status" -ForegroundColor White

Write-Host "`n📊 DATABASE COLLECTIONS (Auto-Created):" -ForegroundColor Cyan
Write-Host "   ✅ users - User accounts and profiles" -ForegroundColor White
Write-Host "   ✅ marketdata - Stock market data" -ForegroundColor White
Write-Host "   ✅ news - Financial news articles" -ForegroundColor White
Write-Host "   ✅ portfolios - User investment portfolios" -ForegroundColor White

Write-Host "`n🔧 DATABASE INDEXES (Auto-Created):" -ForegroundColor Cyan
Write-Host "   ✅ Email uniqueness index" -ForegroundColor White
Write-Host "   ✅ Market data performance indexes" -ForegroundColor White
Write-Host "   ✅ News timestamp indexes" -ForegroundColor White
Write-Host "   ✅ Portfolio user indexes" -ForegroundColor White

Write-Host "`n🚨 IMPORTANT SECURITY NOTES:" -ForegroundColor Red
Write-Host "   • Use a strong, unique password" -ForegroundColor White
Write-Host "   • Store password securely" -ForegroundColor White
Write-Host "   • Never share connection string publicly" -ForegroundColor White
Write-Host "   • Use environment variables in production" -ForegroundColor White

Write-Host "`n🎯 PRODUCTION CHECKLIST:" -ForegroundColor Cyan
Write-Host "   ☐ MongoDB Atlas account created" -ForegroundColor White
Write-Host "   ☐ Cluster created and running" -ForegroundColor White
Write-Host "   ☐ Database user created" -ForegroundColor White
Write-Host "   ☐ Network access configured" -ForegroundColor White
Write-Host "   ☐ Connection string obtained" -ForegroundColor White
Write-Host "   ☐ Environment variable set in Render" -ForegroundColor White
Write-Host "   ☐ Connection tested via health check" -ForegroundColor White

Write-Host "`n✅ MONGODB SETUP COMPLETE!" -ForegroundColor Green
Write-Host "🌐 Your database will be ready for production deployment!" -ForegroundColor Green
