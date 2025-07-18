# GitHub Actions Setup Instructions

Due to GitHub App permissions, the workflow files need to be manually added to enable CI/CD.

## Quick Setup

1. **Create the workflows directory:**
   ```bash
   mkdir -p .github/workflows
   ```

2. **Copy the workflow files:**
   ```bash
   cp github-workflows/ci.yml .github/workflows/
   cp github-workflows/release.yml .github/workflows/
   ```

3. **Commit and push:**
   ```bash
   git add .github/workflows/
   git commit -m "Add GitHub Actions workflows for CI/CD"
   git push
   ```

## What the Workflows Do

### `ci.yml` - Continuous Integration
- **Triggers:** Push to main/master/develop branches, pull requests
- **Actions:**
  - Tests on Node.js 16.x, 18.x, 20.x
  - Builds multiplatform binaries (Linux, macOS, Windows)
  - Runs security scans with npm audit and Trivy
  - Uploads build artifacts

### `release.yml` - Automated Releases
- **Triggers:** Git tags matching `v*` pattern (e.g., `v1.0.0`)
- **Actions:**
  - Creates GitHub release with generated notes
  - Builds multiplatform binaries
  - Uploads binary artifacts as release assets
  - Generates checksums for all binaries

## Creating Your First Release

Once workflows are set up:

1. **Tag a release:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **The release workflow will automatically:**
   - Build binaries for all platforms
   - Create a GitHub release
   - Upload artifacts
   - Generate checksums

## Alternative: Manual GitHub Setup

If you prefer to set up manually through GitHub UI:

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Click "set up a workflow yourself"
4. Copy the contents of `github-workflows/ci.yml`
5. Save as `.github/workflows/ci.yml`
6. Repeat for `github-workflows/release.yml`

## Testing the Setup

After setting up the workflows:

1. **Test CI:** Make a small change and push to main branch
2. **Test Release:** Create and push a git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## Troubleshooting

### Missing Dependencies
If builds fail, make sure these are available in the CI environment:
- Node.js 18+
- npm
- pkg (`npm install -g pkg`)
- upx (for binary compression)

### Permission Issues
Make sure the repository has:
- Actions enabled
- Write permissions for GITHUB_TOKEN
- Release permissions

### Build Failures
Check that:
- All source files are committed
- `package.json` is valid
- Dependencies install correctly

## Security Notes

The workflows include:
- Dependency vulnerability scanning
- Container security scanning with Trivy
- Automated security updates via Dependabot (if enabled)

For production use, consider:
- Code signing for binaries
- Supply chain security scanning
- Artifact attestation