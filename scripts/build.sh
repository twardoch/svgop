#!/bin/bash

# Build script for SVGOp
# This script builds all targets and runs tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SRC_DIR="${PROJECT_ROOT}/src"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[BUILD]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is required but not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is required but not installed"
        exit 1
    fi
    
    # Check make
    if ! command -v make &> /dev/null; then
        error "make is required but not installed"
        exit 1
    fi
    
    # Check pkg
    if ! command -v pkg &> /dev/null; then
        warn "pkg not found, installing globally..."
        npm install -g pkg
    fi
    
    log "Prerequisites check passed"
}

# Update version based on git tags
update_version() {
    log "Updating version from git tags..."
    node "${SCRIPT_DIR}/version.js"
}

# Build all targets
build_all() {
    log "Building all targets..."
    
    cd "${SRC_DIR}"
    
    # Clean previous builds
    log "Cleaning previous builds..."
    make clean || true
    
    # Build for current platform
    case "$(uname -s)" in
        Darwin*)
            log "Building for macOS..."
            make macos
            ;;
        Linux*)
            log "Building for Linux..."
            make linux
            ;;
        *)
            warn "Unknown platform, building available targets..."
            make node
            ;;
    esac
}

# Run tests
run_tests() {
    log "Running tests..."
    
    cd "${PROJECT_ROOT}"
    
    if [ -f "test/test-runner.js" ]; then
        node test/test-runner.js
    else
        warn "Test runner not found, skipping tests"
    fi
}

# Package binaries
package_binaries() {
    log "Packaging binaries..."
    
    cd "${SRC_DIR}"
    
    case "$(uname -s)" in
        Darwin*)
            make package-macos
            ;;
        Linux*)
            make package-linux
            ;;
        *)
            warn "Unknown platform, skipping packaging"
            ;;
    esac
}

# Main execution
main() {
    log "Starting build process..."
    
    check_prerequisites
    update_version
    build_all
    run_tests
    package_binaries
    
    log "Build completed successfully!"
    log "Binaries are available in: ${PROJECT_ROOT}/bin/"
    log "Packages are available in: ${PROJECT_ROOT}/dist/"
}

# Handle command line arguments
case "${1:-}" in
    "clean")
        cd "${SRC_DIR}"
        make clean
        ;;
    "test")
        run_tests
        ;;
    "version")
        update_version
        ;;
    "")
        main
        ;;
    *)
        echo "Usage: $0 [clean|test|version]"
        echo "  clean   - Clean build artifacts"
        echo "  test    - Run tests only"
        echo "  version - Update version only"
        echo "  (no args) - Full build process"
        exit 1
        ;;
esac