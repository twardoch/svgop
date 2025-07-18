#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getVersionFromGit() {
  try {
    // Get the latest git tag
    const tag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    
    // Validate semver format
    const semverRegex = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    if (!semverRegex.test(tag)) {
      throw new Error(`Invalid semver tag: ${tag}`);
    }
    
    // Remove 'v' prefix if present
    return tag.replace(/^v/, '');
  } catch (error) {
    console.warn('No git tags found, using default version 0.1.0');
    return '0.1.0';
  }
}

function updatePackageVersion(version) {
  const packagePath = path.join(__dirname, '../src/package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  packageJson.version = version;
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Updated package.json version to ${version}`);
}

function generateVersionFile(version) {
  const versionFilePath = path.join(__dirname, '../src/version.js');
  const versionContent = `module.exports = '${version}';\n`;
  
  fs.writeFileSync(versionFilePath, versionContent);
  console.log(`Generated version.js with version ${version}`);
}

function main() {
  const version = getVersionFromGit();
  updatePackageVersion(version);
  generateVersionFile(version);
  
  console.log(`Version set to: ${version}`);
}

if (require.main === module) {
  main();
}

module.exports = { getVersionFromGit, updatePackageVersion, generateVersionFile };