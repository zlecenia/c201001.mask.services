#!/bin/bash
echo "🔗 Opening test URL: http://localhost:8084"
if command -v firefox &> /dev/null; then
    firefox "http://localhost:8084" &
    BROWSER_PID=$!
else
    echo "\033[0;31m❌ Browser firefox not found. Please open http://localhost:8084 manually\033[0m "
    exit 1
fi

echo "\033[1;33m⏳ Waiting 30 seconds for tests to complete...\033[0m "
sleep 30

echo "\033[0;32m✅ Test execution completed\033[0m "
echo "\033[0;34m📋 Check browser console for detailed test results\033[0m "
echo "\033[0;34m🔍 Look for: MASKSERVICE C20 TEMPLATE LOADING TEST REPORT\033[0m "

kill $BROWSER_PID 2>/dev/null || true
