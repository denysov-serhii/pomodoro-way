#!/bin/bash

# Monorepo Build Script for Pomodoro Way

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

# Build backend (JVM)
build_backend_jvm() {
    print_section "Building Backend (JVM)"
    
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found!"
        exit 1
    fi
    
    cd backend
    
    print_info "Building with Gradle..."
    ./gradlew clean build -x test
    
    print_success "Backend built successfully!"
    print_info "JAR location: backend/build/libs/pomodoro-way-backend-0.1-all.jar"
    
    cd ..
}

# Build backend (Native Image)
build_backend_native() {
    print_section "Building Backend (Native Image)"
    
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found!"
        exit 1
    fi
    
    # Check for GraalVM
    if ! java -version 2>&1 | grep -q "GraalVM"; then
        print_error "GraalVM is not installed or not in PATH!"
        print_info "Please install GraalVM and the native-image tool."
        print_info "Visit: https://www.graalvm.org/downloads/"
        exit 1
    fi
    
    # Check for native-image tool
    if ! command_exists native-image; then
        print_error "native-image tool is not installed!"
        print_info "Install it with: gu install native-image"
        exit 1
    fi
    
    cd backend
    
    print_info "Building native image (this may take several minutes)..."
    ./gradlew nativeCompile
    
    print_success "Native image built successfully!"
    print_info "Executable location: backend/build/native/nativeCompile/pomodoro-way-backend"
    
    cd ..
}

# Run backend (JVM)
run_backend_jvm() {
    print_section "Running Backend (JVM)"
    
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found!"
        exit 1
    fi
    
    cd backend
    
    print_info "Starting backend server..."
    ./gradlew run
    
    cd ..
}

# Run backend (Native)
run_backend_native() {
    print_section "Running Backend (Native)"
    
    NATIVE_EXEC="backend/build/native/nativeCompile/pomodoro-way-backend"
    
    if [ ! -f "$NATIVE_EXEC" ]; then
        print_error "Native executable not found! Build it first with: $0 native"
        exit 1
    fi
    
    print_info "Starting native backend server..."
    ./$NATIVE_EXEC
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
Pomodoro Way Monorepo Build Script

Usage: $0 [command]

Commands:
    frontend          Build frontend (install dependencies)
    backend           Build backend JAR (JVM mode)
    native            Build backend native image (requires GraalVM)
    all               Build both frontend and backend
    
    run-frontend      Run frontend development server
    run-backend       Run backend in JVM mode
    run-native        Run backend native executable
    
    help              Show this help message

Examples:
    $0 all            # Build everything
    $0 backend        # Build backend only
    $0 native         # Build native image
    $0 run-backend    # Run the backend server

EOF
}

# Main script logic
case "${1:-help}" in
    frontend)
        build_frontend
        ;;
    backend)
        build_backend_jvm
        ;;
    native)
        build_backend_native
        ;;
    all)
        build_frontend
        build_backend_jvm
        ;;
    run-frontend)
        run_frontend
        ;;
    run-backend)
        run_backend_jvm
        ;;
    run-native)
        run_backend_native
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
