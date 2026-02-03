#!/bin/bash

# Build Script for Pomodoro Way Frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_section() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}\n"
}

print_info() {
    echo -e "${YELLOW}➜${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Build frontend
build_frontend() {
    print_section "Building Frontend"
    
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found!"
        exit 1
    fi
    
    cd frontend
    
    if ! command_exists npm; then
        print_error "npm is not installed!"
        exit 1
    fi
    
    print_info "Installing dependencies..."
    npm install
    
    print_success "Frontend dependencies installed successfully!"
    
    cd ..
}

# Run frontend
run_frontend() {
    print_section "Running Frontend"
    
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found!"
        exit 1
    fi
    
    cd frontend
    
    print_info "Starting Expo development server..."
    npm start
    
    cd ..
}

# Show usage
show_usage() {
    cat << EOF
Pomodoro Way Build Script

Usage: $0 [command]

Commands:
    build             Build frontend (install dependencies)
    run               Run frontend development server
    help              Show this help message

Examples:
    $0 build          # Install frontend dependencies
    $0 run            # Run the frontend development server

EOF
}

# Main script logic
case "${1:-help}" in
    build|frontend)
        build_frontend
        ;;
    run|run-frontend)
        run_frontend
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac

print_success "Done!"
