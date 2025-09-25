#!/bin/bash

# MASKSERVICE C20 - Robust Server Stop Script
# Multiple methods to ensure server is properly stopped

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PORT=8081
PROJECT_NAME="MASKSERVICE C20"

echo -e "${BLUE}🛑 Stopping ${PROJECT_NAME} development server...${NC}"
echo "=================================================="

# Method 1: Stop by PID file
stop_by_pid() {
    if [ -f .server.pid ]; then
        echo -e "${YELLOW}📝 Method 1: Stopping by PID file...${NC}"
        PID=$(cat .server.pid)
        if kill -0 $PID 2>/dev/null; then
            kill $PID 2>/dev/null
            sleep 2
            if kill -0 $PID 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Process $PID still running, force killing...${NC}"
                kill -9 $PID 2>/dev/null
            fi
            echo -e "${GREEN}✅ Process $PID stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  PID file exists but process $PID not running${NC}"
        fi
        rm -f .server.pid
    else
        echo -e "${YELLOW}⚠️  No PID file found${NC}"
    fi
}

# Method 2: Stop by port
stop_by_port() {
    echo -e "${YELLOW}🔌 Method 2: Stopping by port ${PORT}...${NC}"
    
    # Find PIDs using the port
    PIDS=$(lsof -t -i:${PORT} 2>/dev/null)
    
    if [ -n "$PIDS" ]; then
        echo -e "${YELLOW}🎯 Found processes using port ${PORT}: $PIDS${NC}"
        for PID in $PIDS; do
            # Get process info
            PROCESS_INFO=$(ps -p $PID -o pid,ppid,cmd --no-headers 2>/dev/null)
            echo -e "${YELLOW}   Process: $PROCESS_INFO${NC}"
            
            # Try graceful kill first
            kill $PID 2>/dev/null
            sleep 2
            
            # Force kill if still running
            if kill -0 $PID 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Force killing process $PID...${NC}"
                kill -9 $PID 2>/dev/null
            fi
            echo -e "${GREEN}✅ Process $PID stopped${NC}"
        done
    else
        echo -e "${GREEN}✅ No processes found using port ${PORT}${NC}"
    fi
}

# Method 3: Stop Python HTTP servers
stop_python_servers() {
    echo -e "${YELLOW}🐍 Method 3: Stopping Python HTTP servers...${NC}"
    
    # Find Python HTTP server processes
    PYTHON_PIDS=$(pgrep -f "python.*http.server.*${PORT}" 2>/dev/null)
    
    if [ -n "$PYTHON_PIDS" ]; then
        echo -e "${YELLOW}🎯 Found Python HTTP servers: $PYTHON_PIDS${NC}"
        for PID in $PYTHON_PIDS; do
            PROCESS_INFO=$(ps -p $PID -o pid,ppid,cmd --no-headers 2>/dev/null)
            echo -e "${YELLOW}   Python server: $PROCESS_INFO${NC}"
            
            kill $PID 2>/dev/null
            sleep 2
            
            if kill -0 $PID 2>/dev/null; then
                kill -9 $PID 2>/dev/null
            fi
            echo -e "${GREEN}✅ Python server $PID stopped${NC}"
        done
    else
        echo -e "${GREEN}✅ No Python HTTP servers found${NC}"
    fi
}

# Method 4: Stop Docker containers (if applicable)
stop_docker_containers() {
    echo -e "${YELLOW}🐳 Method 4: Checking Docker containers...${NC}"
    
    if command -v docker &> /dev/null; then
        # Find containers using the port or related to the project
        CONTAINERS=$(docker ps --filter "publish=${PORT}" --format "{{.ID}}" 2>/dev/null)
        
        if [ -n "$CONTAINERS" ]; then
            echo -e "${YELLOW}🎯 Found Docker containers using port ${PORT}: $CONTAINERS${NC}"
            for CONTAINER in $CONTAINERS; do
                CONTAINER_INFO=$(docker ps --filter "id=${CONTAINER}" --format "{{.ID}} {{.Image}} {{.Names}}" 2>/dev/null)
                echo -e "${YELLOW}   Container: $CONTAINER_INFO${NC}"
                
                docker stop $CONTAINER 2>/dev/null
                echo -e "${GREEN}✅ Container $CONTAINER stopped${NC}"
            done
        else
            echo -e "${GREEN}✅ No Docker containers found using port ${PORT}${NC}"
        fi
        
        # Also check for containers with MASKSERVICE in name
        MASKSERVICE_CONTAINERS=$(docker ps --filter "name=maskservice" --filter "name=c20" --format "{{.ID}}" 2>/dev/null)
        if [ -n "$MASKSERVICE_CONTAINERS" ]; then
            echo -e "${YELLOW}🎯 Found MASKSERVICE related containers: $MASKSERVICE_CONTAINERS${NC}"
            for CONTAINER in $MASKSERVICE_CONTAINERS; do
                docker stop $CONTAINER 2>/dev/null
                echo -e "${GREEN}✅ Container $CONTAINER stopped${NC}"
            done
        fi
    else
        echo -e "${YELLOW}⚠️  Docker not found, skipping Docker cleanup${NC}"
    fi
}

# Method 5: Final verification and cleanup
final_verification() {
    echo -e "${YELLOW}🔍 Method 5: Final verification...${NC}"
    
    # Check if port is still in use
    if lsof -i:${PORT} &>/dev/null; then
        echo -e "${RED}❌ Port ${PORT} is still in use!${NC}"
        echo -e "${YELLOW}🔍 Processes still using port ${PORT}:${NC}"
        lsof -i:${PORT}
        
        echo -e "${RED}⚠️  Force killing remaining processes...${NC}"
        REMAINING_PIDS=$(lsof -t -i:${PORT} 2>/dev/null)
        for PID in $REMAINING_PIDS; do
            kill -9 $PID 2>/dev/null
            echo -e "${GREEN}✅ Force killed process $PID${NC}"
        done
        
        sleep 1
        if lsof -i:${PORT} &>/dev/null; then
            echo -e "${RED}❌ CRITICAL: Port ${PORT} is still occupied after all cleanup attempts!${NC}"
            echo -e "${YELLOW}Manual intervention may be required.${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ Port ${PORT} is now free${NC}"
}

# Cleanup temporary files
cleanup_temp_files() {
    echo -e "${YELLOW}🧹 Cleaning up temporary files...${NC}"
    
    # Remove PID files
    rm -f .server.pid server.pid *.pid
    
    # Remove log files if any
    rm -f server.log *.log
    
    # Remove socket files if any
    rm -f /tmp/maskservice-*.sock
    
    echo -e "${GREEN}✅ Temporary files cleaned${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}Starting comprehensive server shutdown...${NC}"
    echo
    
    # Execute all stop methods
    stop_by_pid
    echo
    
    stop_by_port
    echo
    
    stop_python_servers
    echo
    
    stop_docker_containers
    echo
    
    final_verification
    echo
    
    cleanup_temp_files
    echo
    
    echo -e "${GREEN}🎉 ${PROJECT_NAME} server completely stopped!${NC}"
    echo -e "${GREEN}✅ Port ${PORT} is available for use${NC}"
}

# Execute main function
main

exit 0
