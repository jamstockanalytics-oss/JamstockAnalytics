#!/bin/bash

# Deploy JamStockAnalytics to GitHub Pages
# This script builds the web app and pushes to gh-pages branch

echo "🚀 Deploying JamStockAnalytics to GitHub Pages..."

# Build the web app
echo "📦 Building web app..."
cd JamStockAnalytics
npm run build:web:optimized

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Build failed."
    exit 1
fi

echo "✅ Web app built successfully!"

# Create or update gh-pages branch
echo "🌿 Setting up gh-pages branch..."

# Add dist contents to git
git add dist/

# Commit the changes
git commit -m "Deploy web app to GitHub Pages - $(date)"

# Create and switch to gh-pages branch
if ! git checkout -b gh-pages 2>/dev/null; then
    if ! git checkout gh-pages 2>/dev/null; then
        echo "❌ Error: Could not create or switch to gh-pages branch"
        exit 1
    fi
fi

# Copy dist contents to root
cp -r dist/* .

# Add all files
git add .

# Commit deployment
git commit -m "Deploy web app to GitHub Pages - $(date)"

# Push to gh-pages branch
echo "📤 Pushing to GitHub Pages..."
git push origin gh-pages --force

# Switch back to main branch (or master if main doesn't exist)
if ! git checkout main 2>/dev/null; then
    git checkout master
fi

echo "✅ Deployment complete!"
echo "🌐 Your web app will be available at:"
echo "   https://jamstockanalytics-oss.github.io/JamstockAnalytics/"
echo ""
echo "📝 Note: It may take a few minutes for GitHub Pages to update."
