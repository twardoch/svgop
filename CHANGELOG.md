# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-06-29

### Recent Changes
- Fixed install-mac.command script issue (2025-06-25)
- Merged Docker build support from @mdeweerd (2023-03-12)
  - Added Dockerfile for containerized builds
  - Added docker-compose.yml for easy build orchestration
  - Added UPX compression support for smaller binaries
  - Added .pre-commit-config.yaml for code quality
  - Added build-with-docker.sh script (Note: currently has issues)

### Known Issues
- Docker builds are currently failing
- Project uses outdated svgo version (1.3.2, current is 3.x)
- QuickJS builds only available for macOS
- Manual patching of svgo config.js is fragile

## [0.8.0] - 2020-04-13

### Changed
- QuickJS compiler now works! macOS binary is **97% smaller**
- svgop-qjs-macos: 2 MB (down from 83 MB with pkg)
- Removed non-functional pdf.js bundling from older versions

### Added
- QuickJS compilation support for macOS
- Potential for Windows and Linux QuickJS builds (not yet provided)

## Previous Versions

### Features
- Standalone SVG optimization without Node.js requirement
- Stdin/stdout piping support
- Support for .svg and .svgz formats
- Prebuilt binaries for macOS, Windows x64, and Linux (pkg version)