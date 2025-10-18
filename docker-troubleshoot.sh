#!/bin/bash
# docker-troubleshoot.sh
# Complete Docker troubleshooting script as specified in CONTEXT.md

echo "🔍 Docker Connection Troubleshooting"
echo "=================================="

# Check Docker status
echo "📊 Docker status:"
docker --version
docker info | grep -i "server version"

# Check running containers
echo "📦 Running containers:"
docker ps

# Check if our container exists
echo "🔍 Checking jamstock-test container:"
if docker ps -a --format "table {{.Names}}" | grep -q "jamstock-test"; then
    echo "✅ Container exists"
    docker ps -a --filter "name=jamstock-test" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "❌ Container not found"
fi

# Check port usage
echo "🔌 Port 8081 usage:"
netstat -an | findstr :8081

# Test container health
echo "🏥 Container health:"
if docker ps --filter "name=jamstock-test" --format "{{.Names}}" | grep -q "jamstock-test"; then
    echo "✅ Container is running"
    docker exec jamstock-test wget --spider http://localhost/ 2>/dev/null && echo "✅ nginx is responding" || echo "❌ nginx not responding"
else
    echo "❌ Container is not running"
fi

# Test external access
echo "🌐 Testing external access:"
curl -f http://localhost:8081 >/dev/null 2>&1 && echo "✅ External access working" || echo "❌ External access failed"

echo "🎯 Troubleshooting complete"
