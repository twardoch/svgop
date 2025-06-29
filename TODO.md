# TODO

## Critical Issues

- [ ] Fix Docker build failures in build-with-docker.sh
- [ ] Update svgo from 1.3.2 to 3.x (major update with breaking changes)
- [ ] Replace manual config.js patching with proper abstraction layer

## Build System

- [ ] Set up GitHub Actions CI/CD pipeline
- [ ] Create automated builds for all platforms (macOS, Linux, Windows)
- [ ] Add Linux QuickJS builds (x64 and ARM64)
- [ ] Add Windows QuickJS builds
- [ ] Fix UPX compression issues on certain platforms
- [ ] Update webpack from v4 to v5
- [ ] Create multi-stage Docker builds
- [ ] Add build matrix for different OS/architecture combinations

## Features

- [ ] Add command-line options support (--help, --version, --config)
- [ ] Implement output file option (--output / -o)
- [ ] Add optimization presets (default, aggressive, safe)
- [ ] Enable plugin configuration via CLI
- [ ] Add --pretty option for formatted output
- [ ] Implement proper error handling with meaningful messages
- [ ] Add standard Unix exit codes

## Code Quality

- [ ] Refactor duplicate code in entry points (svgop-*.js)
- [ ] Create shared core module for common functionality
- [ ] Add TypeScript definitions
- [ ] Set up ESLint and Prettier
- [ ] Add comprehensive test suite (unit and integration tests)
- [ ] Achieve >80% test coverage
- [ ] Add performance benchmarks

## Documentation

- [ ] Update README with comprehensive installation instructions
- [ ] Add troubleshooting section to README
- [ ] Create Unix man page
- [ ] Write architecture documentation
- [ ] Add contributing guidelines
- [ ] Document all CLI options and exit codes
- [ ] Create migration guide for v1.0

## Distribution

- [ ] Create Homebrew formula for macOS
- [ ] Create Scoop manifest for Windows
- [ ] Create .deb packages for Debian/Ubuntu
- [ ] Create .rpm packages for Red Hat/Fedora
- [ ] Submit to AUR for Arch Linux
- [ ] Set up automated release process
- [ ] Add checksums and GPG signatures to releases

## Security and Maintenance

- [ ] Run security audit on all dependencies
- [ ] Update all dev dependencies to latest versions
- [ ] Set up automated dependency updates (Dependabot)
- [ ] Add security scanning to CI pipeline
- [ ] Create security policy document

## Performance

- [ ] Profile and optimize binary size (target ≤ 3MB)
- [ ] Implement streaming for large SVG files
- [ ] Optimize memory usage for batch processing
- [ ] Add progress indicators for large files
- [ ] Benchmark against native svgo performance

## Long-term Goals

- [ ] Create web-based version using WebAssembly
- [ ] Add batch processing mode for multiple files
- [ ] Support for SVG animation optimization
- [ ] Create GUI wrapper for desktop platforms
- [ ] Develop VS Code extension
- [ ] Add support for custom plugin development