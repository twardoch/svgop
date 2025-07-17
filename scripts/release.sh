#!/bin/bash

# Release script for SVGOp
# This script creates a new release with git tags and uploads artifacts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[RELEASE]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository"
        exit 1
    fi
}

# Check if working directory is clean
check_clean_working_dir() {
    if [ -n "$(git status --porcelain)" ]; then
        error "Working directory is not clean. Please commit your changes first."
        git status --short
        exit 1
    fi
}

# Get current version
get_current_version() {
    local version=""
    
    # Try to get version from git tags
    if git describe --tags --abbrev=0 &>/dev/null; then
        version=$(git describe --tags --abbrev=0 | sed 's/^v//')
    else
        version="0.0.0"
    fi
    
    echo "$version"
}

# Increment version
increment_version() {
    local version=$1
    local increment_type=$2
    
    IFS='.' read -r -a version_parts <<< "$version"
    local major=${version_parts[0]}
    local minor=${version_parts[1]}
    local patch=${version_parts[2]}
    
    case "$increment_type" in
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "patch")
            patch=$((patch + 1))
            ;;
        *)
            error "Invalid increment type: $increment_type"
            exit 1
            ;;
    esac
    
    echo "${major}.${minor}.${patch}"
}

# Create git tag
create_git_tag() {
    local version=$1
    local tag="v${version}"
    
    log "Creating git tag: $tag"
    
    # Create annotated tag
    git tag -a "$tag" -m "Release $tag"
    
    # Push tag to origin
    git push origin "$tag"
    
    info "Git tag $tag created and pushed"
}

# Generate release notes
generate_release_notes() {
    local version=$1
    local previous_tag=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
    
    log "Generating release notes for version $version"
    
    local notes_file="${PROJECT_ROOT}/RELEASE_NOTES.md"
    
    {
        echo "# Release Notes for v$version"
        echo ""
        echo "## Changes"
        echo ""
        
        if [ -n "$previous_tag" ]; then
            echo "### Commits since $previous_tag:"
            git log --oneline "${previous_tag}..HEAD" | sed 's/^/- /'
        else
            echo "### All commits:"
            git log --oneline | sed 's/^/- /'
        fi
        
        echo ""
        echo "## Binary Downloads"
        echo ""
        echo "- **Linux**: svgop-pkg-linux.zip"
        echo "- **macOS**: svgop-pkg-macos.zip, svgop-qjs-macos.zip"  
        echo "- **Windows**: svgop-pkg-win64.zip"
        echo ""
        echo "## Installation"
        echo ""
        echo "1. Download the appropriate binary for your platform"
        echo "2. Extract the archive"
        echo "3. Make the binary executable (Linux/macOS): \`chmod +x svgop\`"
        echo "4. Move to your PATH or run directly"
        echo ""
        echo "## Usage"
        echo ""
        echo "\`\`\`bash"
        echo "svgop < input.svg > output.svg"
        echo "\`\`\`"
    } > "$notes_file"
    
    info "Release notes generated: $notes_file"
}

# Create GitHub release (if gh CLI is available)
create_github_release() {
    local version=$1
    local tag="v${version}"
    local notes_file="${PROJECT_ROOT}/RELEASE_NOTES.md"
    
    if ! command -v gh &> /dev/null; then
        warn "GitHub CLI (gh) not found, skipping GitHub release creation"
        return 0
    fi
    
    log "Creating GitHub release for $tag"
    
    # Create release
    gh release create "$tag" \
        --title "Release $tag" \
        --notes-file "$notes_file" \
        --draft
    
    # Upload artifacts if they exist
    local dist_dir="${PROJECT_ROOT}/dist"
    if [ -d "$dist_dir" ]; then
        log "Uploading release artifacts..."
        
        for artifact in "$dist_dir"/*.zip; do
            if [ -f "$artifact" ]; then
                info "Uploading $(basename "$artifact")"
                gh release upload "$tag" "$artifact"
            fi
        done
    fi
    
    info "GitHub release created (draft). Review and publish at: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/releases"
}

# Main release function
main() {
    local increment_type="${1:-patch}"
    
    log "Starting release process..."
    
    check_git_repo
    check_clean_working_dir
    
    local current_version=$(get_current_version)
    local new_version=$(increment_version "$current_version" "$increment_type")
    
    info "Current version: $current_version"
    info "New version: $new_version"
    
    # Confirm with user
    echo -n "Create release v$new_version? (y/N) "
    read -r confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        info "Release cancelled"
        exit 0
    fi
    
    # Build everything
    log "Building release..."
    "${SCRIPT_DIR}/build.sh"
    
    # Create git tag
    create_git_tag "$new_version"
    
    # Generate release notes
    generate_release_notes "$new_version"
    
    # Create GitHub release
    create_github_release "$new_version"
    
    log "Release v$new_version completed successfully!"
    log "Don't forget to:"
    log "  1. Review and publish the GitHub release"
    log "  2. Update any package managers (Homebrew, etc.)"
    log "  3. Announce the release"
}

# Handle command line arguments
case "${1:-}" in
    "major"|"minor"|"patch")
        main "$1"
        ;;
    "")
        main "patch"
        ;;
    *)
        echo "Usage: $0 [major|minor|patch]"
        echo "  major - Increment major version (x.0.0)"
        echo "  minor - Increment minor version (x.y.0)"
        echo "  patch - Increment patch version (x.y.z) [default]"
        exit 1
        ;;
esac