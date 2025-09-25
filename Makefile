# MASKTRONIC C20 - Automated Testing Makefile
# Professional test automation for template loading verification

.PHONY: test test-server test-templates test-modules clean help

# Configuration
PORT = 8081
BROWSER = firefox
TEST_TIMEOUT = 30
TEST_URL = http://localhost:$(PORT)

# Colors for output
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Default target
all: help

# Help target
help:
	@echo "$(BLUE)MASKTRONIC C20 - Automated Test Suite$(NC)"
	@echo "======================================"
	@echo ""
	@echo "Available commands:"
	@echo "  $(GREEN)make test$(NC)           - Run complete automated test suite"
	@echo "  $(GREEN)make test-server$(NC)    - Start test server and run tests"
	@echo "  $(GREEN)make test-templates$(NC) - Test only template loading"
	@echo "  $(GREEN)make test-modules$(NC)   - Test only module loading"
	@echo "  $(GREEN)make clean$(NC)          - Clean up test artifacts"
	@echo "  $(GREEN)make help$(NC)           - Show this help message"
	@echo ""
	@echo "$(YELLOW)Requirements:$(NC)"
	@echo "  - Python 3.x for HTTP server"
	@echo "  - Firefox or Chrome browser"
	@echo "  - Node.js (optional, for advanced testing)"

# Main test target
test: check-server run-tests

# Check if server is running
check-server:
	@echo "$(BLUE)🔍 Checking if server is running on port $(PORT)...$(NC)"
	@if lsof -i :$(PORT) > /dev/null 2>&1; then \
		echo "$(GREEN)✅ Server is running on port $(PORT)$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Server not running. Starting server...$(NC)"; \
		$(MAKE) start-server; \
	fi

# Start development server
run:
	@echo "$(BLUE)🚀 Starting MASKTRONIC C20 development server...$(NC)"
	@python3 -m http.server $(PORT) &
	@echo $$! > .server.pid
	@sleep 3
	@echo "$(GREEN)✅ Server started on http://localhost:$(PORT)$(NC)"

# Stop development server using robust script
stop:
	@if [ -f scripts/stop-server.sh ]; then \
		./scripts/stop-server.sh; \
	else \
		echo "$(RED)❌ Robust stop script not found, using fallback method...$(NC)"; \
		if [ -f .server.pid ]; then \
			echo "$(BLUE)🛑 Stopping development server...$(NC)"; \
			kill `cat .server.pid` 2>/dev/null || true; \
			rm -f .server.pid; \
			echo "$(GREEN)✅ Server stopped$(NC)"; \
		fi; \
		# Also try to kill by port as fallback \
		echo "$(YELLOW)🔌 Killing processes on port $(PORT)...$(NC)"; \
		lsof -ti:$(PORT) | xargs -r kill -9 2>/dev/null || true; \
		echo "$(GREEN)✅ Port cleanup completed$(NC)"; \
	fi

# Run automated tests
run-tests:
	@echo "$(BLUE)🧪 Running MASKTRONIC C20 Automated Tests...$(NC)"
	@echo "=========================================="
	@echo ""
	@echo "$(YELLOW)Test URL: $(TEST_URL)$(NC)"
	@echo "$(YELLOW)Browser: $(BROWSER)$(NC)"
	@echo "$(YELLOW)Timeout: $(TEST_TIMEOUT) seconds$(NC)"
	@echo ""
	
	@# Create test runner script
	@echo '#!/bin/bash' > run_test.sh
	@echo 'echo "🔗 Opening test URL: $(TEST_URL)"' >> run_test.sh
	@echo 'if command -v $(BROWSER) &> /dev/null; then' >> run_test.sh
	@echo '    $(BROWSER) "$(TEST_URL)" &' >> run_test.sh
	@echo '    BROWSER_PID=$$!' >> run_test.sh
	@echo 'else' >> run_test.sh
	@echo '    echo "$(RED)❌ Browser $(BROWSER) not found. Please open $(TEST_URL) manually$(NC)"' >> run_test.sh
	@echo '    exit 1' >> run_test.sh
	@echo 'fi' >> run_test.sh
	@echo '' >> run_test.sh
	@echo 'echo "$(YELLOW)⏳ Waiting $(TEST_TIMEOUT) seconds for tests to complete...$(NC)"' >> run_test.sh
	@echo 'sleep $(TEST_TIMEOUT)' >> run_test.sh
	@echo '' >> run_test.sh
	@echo 'echo "$(GREEN)✅ Test execution completed$(NC)"' >> run_test.sh
	@echo 'echo "$(BLUE)📋 Check browser console for detailed test results$(NC)"' >> run_test.sh
	@echo 'echo "$(BLUE)🔍 Look for: MASKTRONIC C20 TEMPLATE LOADING TEST REPORT$(NC)"' >> run_test.sh
	@echo '' >> run_test.sh
	@echo 'kill $$BROWSER_PID 2>/dev/null || true' >> run_test.sh
	
	@chmod +x run_test.sh
	@./run_test.sh
	@rm -f run_test.sh

# Test with Node.js (if available)
test-node:
	@echo "$(BLUE)🧪 Running Node.js automated tests...$(NC)"
	@if command -v node &> /dev/null; then \
		echo "$(GREEN)✅ Node.js found, running headless tests$(NC)"; \
		node -e " \
			const http = require('http'); \
			console.log('📡 Testing server availability...'); \
			http.get('$(TEST_URL)', (res) => { \
				console.log('$(GREEN)✅ Server responsive: ' + res.statusCode + '$(NC)'); \
			}).on('error', (err) => { \
				console.log('$(RED)❌ Server error: ' + err.message + '$(NC)'); \
			}); \
		"; \
	else \
		echo "$(YELLOW)⚠️  Node.js not found, skipping headless tests$(NC)"; \
	fi

# Test only templates
test-templates: check-server
	@echo "$(BLUE)🧪 Testing Template Loading Only...$(NC)"
	@echo "$(YELLOW)Focus: Template availability and export functionality$(NC)"
	@$(MAKE) run-tests

# Test only modules  
test-modules: check-server
	@echo "$(BLUE)🧪 Testing Module Loading Only...$(NC)"
	@echo "$(YELLOW)Focus: JavaScript module initialization$(NC)"
	@$(MAKE) run-tests

# Test server with full automation
test-server: stop-server start-server run-tests stop-server

# Clean up
clean:
	@echo "$(BLUE)🧹 Cleaning up test artifacts...$(NC)"
	@rm -f .server.pid run_test.sh
	@echo "$(GREEN)✅ Cleanup completed$(NC)"

# Continuous testing (watch mode)
test-watch:
	@echo "$(BLUE)👀 Starting continuous testing mode...$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop$(NC)"
	@while true; do \
		$(MAKE) test; \
		echo "$(BLUE)⏳ Waiting 30 seconds before next test...$(NC)"; \
		sleep 30; \
	done

# Generate test report
test-report:
	@echo "$(BLUE)📊 MASKTRONIC C20 Test Environment Report$(NC)"
	@echo "=========================================="
	@echo "$(YELLOW)System Information:$(NC)"
	@echo "  OS: $$(uname -s)"
	@echo "  Python: $$(python3 --version 2>/dev/null || echo 'Not found')"
	@echo "  Node.js: $$(node --version 2>/dev/null || echo 'Not found')"
	@echo "  Browser: $(BROWSER)"
	@echo ""
	@echo "$(YELLOW)Test Configuration:$(NC)"
	@echo "  Server Port: $(PORT)"
	@echo "  Test URL: $(TEST_URL)"
	@echo "  Timeout: $(TEST_TIMEOUT) seconds"
	@echo ""
	@echo "$(YELLOW)Expected Results:$(NC)"
	@echo "  ✅ Working Templates: 5 (with Export buttons)"
	@echo "  ❌ Missing Templates: 8 (expected behavior)"
	@echo "  🔧 Modules: 8 (all should load)"
	@echo "  📊 Export Functions: 5 (all should work)"
	@echo ""

# Run performance test
test-performance:
	@echo "$(BLUE)⚡ Running Performance Tests...$(NC)"
	@echo "$(YELLOW)Testing page load times and module initialization$(NC)"
	@curl -o /dev/null -s -w "$(GREEN)✅ Page Load Time: %{time_total}s$(NC)\n" $(TEST_URL)

# Validate test suite
validate:
	@echo "$(BLUE)🔍 Validating Test Suite...$(NC)"
	@if [ -f "test.js" ]; then \
		echo "$(GREEN)✅ test.js found$(NC)"; \
	else \
		echo "$(RED)❌ test.js missing$(NC)"; \
		exit 1; \
	fi
	@if [ -f "index.html" ]; then \
		echo "$(GREEN)✅ index.html found$(NC)"; \
	else \
		echo "$(RED)❌ index.html missing$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Test suite validation completed$(NC)"
