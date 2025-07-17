# Build and Release Scripts

This directory contains scripts for building, testing, and releasing SVGOp.

## Scripts

### `version.js`
Updates the version in `package.json` based on git tags using semantic versioning.

**Usage:**
```bash
node scripts/version.js
```

### `build.sh`
Comprehensive build script that:
- Checks prerequisites
- Updates version from git tags
- Builds all targets for the current platform
- Runs tests
- Packages binaries

**Usage:**
```bash
# Full build process
./scripts/build.sh

# Clean build artifacts
./scripts/build.sh clean

# Run tests only
./scripts/build.sh test

# Update version only
./scripts/build.sh version
```

### `release.sh`
Creates a new release with git tags and uploads artifacts.

**Usage:**
```bash
# Create patch release (default)
./scripts/release.sh

# Create minor release
./scripts/release.sh minor

# Create major release
./scripts/release.sh major
```

## Prerequisites

Make sure you have the following installed:
- Node.js (16+ recommended)
- npm
- make
- pkg (`npm install -g pkg`)
- upx (for compression)
- git (for version management)

### Platform-specific requirements

**Linux:**
```bash
sudo apt-get install upx-ucl libxml2-utils
```

**macOS:**
```bash
brew install upx
```

**Windows:**
```bash
choco install upx
```

## Workflow

### Development Build
```bash
./scripts/build.sh
```

### Creating a Release
1. Ensure all changes are committed
2. Run the release script:
   ```bash
   ./scripts/release.sh patch  # or minor/major
   ```
3. The script will:
   - Build all targets
   - Create a git tag
   - Generate release notes
   - Create a GitHub release (if `gh` CLI is available)

### GitHub Actions

The repository includes GitHub Actions for:
- **CI**: Runs tests on push/PR
- **Release**: Builds and uploads binaries when tags are pushed

## Directory Structure

After building, you'll have:
- `bin/` - Binary executables
- `build/` - Intermediate build artifacts
- `dist/` - Distribution packages (ZIP files)
- `src/version.js` - Generated version file

## Troubleshooting

### Build fails with "pkg not found"
```bash
npm install -g pkg
```

### upx not found
Install upx for your platform (see prerequisites above).

### Permission denied
Make sure scripts are executable:
```bash
chmod +x scripts/*.sh
```

### Git tag issues
Make sure you're in a git repository and have at least one commit:
```bash
git tag v1.0.0
```