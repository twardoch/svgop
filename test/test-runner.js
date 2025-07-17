#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class TestRunner {
  constructor() {
    this.testDir = path.join(__dirname);
    this.binDir = path.join(__dirname, '../bin');
    this.srcDir = path.join(__dirname, '../src');
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  log(message) {
    console.log(`[TEST] ${message}`);
  }

  error(message) {
    console.error(`[ERROR] ${message}`);
  }

  assert(condition, message) {
    if (condition) {
      this.passed++;
      this.log(`✓ ${message}`);
      return true;
    } else {
      this.failed++;
      this.error(`✗ ${message}`);
      return false;
    }
  }

  async testSVGOptimization(binaryPath, testName) {
    const testSvgPath = path.join(this.testDir, 'test.svg');
    
    if (!fs.existsSync(binaryPath)) {
      this.error(`Binary not found: ${binaryPath}`);
      return false;
    }

    if (!fs.existsSync(testSvgPath)) {
      this.error(`Test SVG not found: ${testSvgPath}`);
      return false;
    }

    try {
      const inputSvg = fs.readFileSync(testSvgPath, 'utf8');
      const inputSize = Buffer.byteLength(inputSvg, 'utf8');
      
      // Run the optimization
      const optimized = execSync(`cat "${testSvgPath}" | "${binaryPath}"`, { 
        encoding: 'utf8',
        timeout: 10000 
      });
      
      const outputSize = Buffer.byteLength(optimized, 'utf8');
      
      // Basic validation
      this.assert(optimized.length > 0, `${testName}: produces output`);
      this.assert(optimized.includes('<svg'), `${testName}: output contains SVG tag`);
      this.assert(optimized.includes('</svg>'), `${testName}: output has closing SVG tag`);
      this.assert(outputSize <= inputSize, `${testName}: output is smaller or equal to input (${outputSize} <= ${inputSize})`);
      
      // Test that output is valid XML
      try {
        require('child_process').execSync(`echo '${optimized.replace(/'/g, "'\\''")}' | xmllint --noout -`, { stdio: 'ignore' });
        this.assert(true, `${testName}: output is valid XML`);
      } catch (e) {
        this.assert(false, `${testName}: output is valid XML`);
      }
      
      return true;
    } catch (error) {
      this.error(`${testName}: ${error.message}`);
      return false;
    }
  }

  async testBinaryVersion(binaryPath, testName) {
    if (!fs.existsSync(binaryPath)) {
      this.error(`Binary not found: ${binaryPath}`);
      return false;
    }

    try {
      // Most binaries should handle empty input gracefully
      const result = execSync(`echo "" | "${binaryPath}"`, { 
        encoding: 'utf8',
        timeout: 5000 
      });
      
      this.assert(true, `${testName}: handles empty input without crashing`);
      return true;
    } catch (error) {
      // Some error is expected with empty input, but shouldn't crash
      this.assert(error.status !== 139, `${testName}: doesn't segfault on empty input`);
      return false;
    }
  }

  async testBuildArtifacts() {
    const expectedBinaries = [
      'svgop-pkg-linux/svgop',
      'svgop-pkg-macos/svgop', 
      'svgop-pkg-win64/svgop.exe',
      'svgop-qjs-macos/svgop'
    ];

    for (const binary of expectedBinaries) {
      const binaryPath = path.join(this.binDir, binary);
      const exists = fs.existsSync(binaryPath);
      
      this.assert(exists, `Binary exists: ${binary}`);
      
      if (exists && !binary.includes('win')) {
        // Test Unix binaries
        const stats = fs.statSync(binaryPath);
        this.assert(stats.mode & 0o111, `Binary is executable: ${binary}`);
        
        // Test basic functionality
        await this.testSVGOptimization(binaryPath, `Optimization test (${binary})`);
        await this.testBinaryVersion(binaryPath, `Version test (${binary})`);
      }
    }
  }

  async testPackageJson() {
    const packagePath = path.join(this.srcDir, 'package.json');
    
    this.assert(fs.existsSync(packagePath), 'package.json exists');
    
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      this.assert(packageJson.name === 'svgop', 'package.json has correct name');
      this.assert(packageJson.version && packageJson.version.match(/^\d+\.\d+\.\d+/), 'package.json has valid version');
      this.assert(packageJson.description && packageJson.description.length > 0, 'package.json has description');
      this.assert(packageJson.license, 'package.json has license');
    }
  }

  async testSourceFiles() {
    const appFiles = [
      'svgop-node.js',
      'svgop-pkg.js', 
      'svgop-qjs.js'
    ];

    for (const file of appFiles) {
      const filePath = path.join(this.srcDir, 'app', file);
      const exists = fs.existsSync(filePath);
      
      this.assert(exists, `Source file exists: ${file}`);
      
      if (exists) {
        const content = fs.readFileSync(filePath, 'utf8');
        this.assert(content.includes('svgo'), `Source file references svgo: ${file}`);
        this.assert(content.includes('use strict'), `Source file has strict mode: ${file}`);
      }
    }
  }

  async run() {
    this.log('Starting test suite...');
    
    await this.testPackageJson();
    await this.testSourceFiles();
    await this.testBuildArtifacts();
    
    this.log(`\n=== Test Results ===`);
    this.log(`Passed: ${this.passed}`);
    this.log(`Failed: ${this.failed}`);
    this.log(`Total: ${this.passed + this.failed}`);
    
    if (this.failed > 0) {
      this.error(`${this.failed} tests failed!`);
      process.exit(1);
    } else {
      this.log('All tests passed!');
      process.exit(0);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;