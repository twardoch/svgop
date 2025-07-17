# SVGOp: Standalone SVG Optimizer

SVGOp provides standalone, pre-compiled binary executables of **SVGO**, a powerful Node.js-based tool for optimizing SVG vector graphics files. This allows users to easily optimize SVGs without needing to install Node.js or manage npm packages directly.

## What is SVGOp?

SVGOp is a command-line utility that takes an SVG file as input and outputs an optimized version of it. It uses a comprehensive set of SVGO's optimization plugins, configured for a good balance of file size reduction and visual fidelity (using a float precision of 8).

This project essentially packages the SVGO library into easy-to-use executables for various platforms.

## Who is it for?

*   **Designers and Developers:** Anyone working with SVG files who wants to reduce their size for web performance or cleaner code, without the overhead of a Node.js environment.
*   **Build Systems & Workflows:** Integrates easily into automated build processes or scripts where SVG optimization is a required step.
*   **Users on systems without Node.js:** Provides access to SVGO's capabilities where installing Node.js might be difficult or undesirable.

## Why is it useful?

*   **No Node.js Required:** The primary benefit is using SVGO's optimization power without installing Node.js or its ecosystem.
*   **Portability:** Single executable files can be easily moved and run on compatible systems.
*   **Simplicity:** Offers a straightforward command-line interface for quick optimizations.
*   **Pre-configured:** Comes with a robust, general-purpose optimization configuration, so you don't need to tinker with SVGO plugin settings unless you have very specific needs (in which case, using SVGO directly might be better).

## Installation

### Option 1: Download Pre-built Binaries (Recommended)

1.  **Download:** Go to the [Releases page](https://github.com/twardoch/svgop/releases) of the SVGOp GitHub repository.
2.  **Choose the right binary:** Download the appropriate executable for your operating system:
    *   `svgop-pkg-linux.zip` for Linux (x64)
    *   `svgop-pkg-macos.zip` for macOS (x64)
    *   `svgop-qjs-macos.zip` for macOS (QuickJS version, smaller binary)
    *   `svgop-pkg-win64.zip` for Windows (64-bit)
3.  **Extract and install:**
    ```bash
    # Extract the archive
    unzip svgop-pkg-linux.zip  # or appropriate file for your OS
    
    # Make it executable (Linux/macOS)
    chmod +x svgop-pkg-linux/svgop
    
    # Move to your PATH (optional)
    sudo mv svgop-pkg-linux/svgop /usr/local/bin/svgop
    ```

### Option 2: Build from Source

If you want to build the latest version from source:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/twardoch/svgop.git
    cd svgop
    ```

2.  **Install prerequisites:**
    ```bash
    # Install Node.js dependencies
    npm install -g pkg
    
    # Install system dependencies (Linux)
    sudo apt-get install upx-ucl libxml2-utils
    
    # Install system dependencies (macOS)
    brew install upx
    ```

3.  **Build:**
    ```bash
    ./build.sh
    ```

4.  **Binaries will be available in `bin/` directory**

## Usage

### Command-Line Interface (CLI)

SVGOp reads SVG data from standard input (stdin) and writes the optimized SVG data to standard output (stdout) (Note: for `svgop-node` and `svgop-pkg` versions, it technically writes to stderr, but this is usually redirected to behave like stdout for piping).

**Optimize a file:**

```bash
./path/to/svgop < input.svg > output.svg
```

Or, if `svgop` is in your PATH:

```bash
svgop < input.svg > output.svg
```

**Example:**

```bash
# On macOS, using the pkg version
./bin/svgop-pkg-macos/svgop < my_icon.svg > my_icon_optimized.svg
```

### Programmatic Usage (as a JavaScript module)

While SVGOp is primarily designed for CLI use as standalone executables, the underlying SVGO library can be used programmatically in a Node.js environment. If you need programmatic control, it's generally recommended to use the [official `svgo` npm package](https://www.npmjs.com/package/svgo) directly.

However, the `svgop` project does bundle `svgo` and provides different entry points that could theoretically be required if you were building it from source within a compatible JavaScript environment:

*   `src/app/svgop-mod.js`: Potentially for QuickJS modules.
*   `src/app/svgop-node.js`: For Node.js environment (though `get-stdin` makes it CLI-focused).

**Example (Conceptual - using SVGO directly is preferred for module usage):**

If you had the `svgop` source and its dependencies installed in a Node.js project, you might try:

```javascript
// This is a conceptual example. For library use, install and use 'svgo' directly.
// const SVGO = require('./path/to/svgop/src/svgo/lib/svgo'); // Path to bundled SVGO

// const svgoInstance = new SVGO({
//     floatPrecision: 8,
//     plugins: [ /* ... list of plugins used by svgop ... */ ]
// });

// const svgInput = '<svg>...</svg>';
// svgoInstance.optimize(svgInput).then(result => {
//     console.log(result.data);
// });
```

**For robust programmatic usage, please refer to the [SVGO documentation](https://github.com/svg/svgo#api).**

---

## Technical Details

### How SVGOp Works

SVGOp leverages the **SVGO (SVG Optimizer)** library. Here's a breakdown of its architecture and process:

1.  **Core Engine (SVGO):** The heart of SVGOp is a bundled version of the `svgo` library (specifically, a version around `1.3.2` as per `src/package.json`). SVGO itself works by:
    *   **Parsing SVG:** Converting the input SVG string into a JavaScript object representation (AST-like structure). This is handled by `SVG2JS` (`src/svgo/lib/svgo/svg2js.js`).
    *   **Applying Plugins:** Traversing the JS object tree and applying a series of enabled plugins. Each plugin performs a specific optimization task (e.g., removing empty containers, minifying styles, converting colors). The list of plugins used by `svgop` is hardcoded in the `src/app/svgop-*.js` files.
    *   **Generating SVG:** Converting the modified JS object tree back into an optimized SVG string. This is handled by `JS2SVG` (`src/svgo/lib/svgo/js2svg.js`).
    *   **Multipass:** SVGO supports multipass optimization, where the process is repeated until no further size reduction is achieved (up to a limit, typically 10 passes). SVGOp uses this feature.

2.  **SVGOp Wrappers (`src/app/`):**
    *   The files in `src/app/` (`svgop-node.js`, `svgop-pkg.js`, `svgop-qjs.js`, etc.) serve as different entry points for various JavaScript environments and packaging methods.
    *   They initialize `SVGO` with a fixed configuration:
        *   `floatPrecision: 8`
        *   A long, predefined list of SVGO plugins (see `src/app/svgop-node.js` for the full list). This list aims for comprehensive optimization.
    *   They handle input/output:
        *   `svgop-node.js` and `svgop-pkg.js`: Use `get-stdin` to read from stdin. Output is directed to `console.error` (which is typically `process.stdout` in CLI tools).
        *   `svgop-qjs.js`: Uses custom functions (`getstdin`, `std.out.puts`) for the QuickJS runtime environment.
        *   `svgop-mod.js`: Appears to be a module version, possibly for QuickJS.
        *   `svgop-web.js`: An incomplete attempt for web/browser usage.

3.  **Packaging and Distribution (`pkg`, QuickJS compilation, etc.):**
    *   The project uses tools like `pkg` (for Node.js based executables) and QuickJS compilation to create standalone binaries found in the `bin/` and `build/` directories.
    *   `webpack` is used to bundle the JavaScript code before packaging (see `webpack.config-*.js` files).
    *   A `Makefile` (`src/Makefile`) and Docker files (`src/Dockerfile`, `src/docker-compose.yml`, `src/build-with-docker.sh`) are present, indicating the build process for creating these executables.

### Code Structure Highlights

*   **`bin/`**: Contains pre-compiled, ready-to-use executables for different platforms.
*   **`build/`**: Contains intermediate build artifacts, including compiled executables.
*   **`src/`**: Source code.
    *   **`src/app/`**: JavaScript wrappers/entry points for different targets (Node, pkg, QuickJS).
    *   **`src/svgo/`**: A bundled copy of the `svgo` library source code.
    *   **`src/package.json`**: Defines project metadata, dependencies (`svgo`, `get-stdin`), and build scripts (using `webpack`).
    *   **`src/Makefile`**: Makefile for orchestrating builds.
    *   **`src/webpack.config-*.js`**: Webpack configurations for bundling for different targets.
*   **`test/`**: Contains sample SVG files for testing.

### Default SVGO Configuration in SVGOp

SVGOp uses a fixed, comprehensive set of SVGO plugins. This configuration is hardcoded in the `src/app/svgop-*.js` files. Key settings include:

*   `floatPrecision: 8` (number of decimal places for floating-point numbers)
*   **Enabled Plugins (non-exhaustive list):**
    *   `cleanupAttrs`, `cleanupIDs`, `cleanupNumericValues`
    *   `collapseGroups`
    *   `convertColors`, `convertPathData`, `convertShapeToPath`, `convertStyleToAttrs`, `convertTransform`
    *   `inlineStyles`, `minifyStyles`
    *   `mergePaths`
    *   `removeComments`, `removeDesc`, `removeDoctype`, `removeEditorsNSData`, `removeEmptyAttrs`, `removeEmptyContainers`, `removeEmptyText`, `removeHiddenElems`, `removeMetadata`, `removeRasterImages`, `removeScriptElement`, `removeStyleElement`, `removeTitle`, `removeUnknownsAndDefaults`, `removeUnusedNS`, `removeUselessDefs`, `removeUselessStrokeAndFill`, `removeViewBox`, `removeXMLNS`, `removeXMLProcInst`
    *   `sortAttrs`
    *   And several others. For the complete list, refer to the source code (e.g., `src/app/svgop-node.js`).

This default configuration is designed to be generally effective for most SVG optimization tasks. If you require fine-grained control over plugins (e.g., to preserve certain elements or attributes that SVGOp might remove), you should use SVGO directly as a Node.js library, where you can customize the plugin configuration.

## Coding and Contribution Rules

While there isn't a formal `CONTRIBUTING.md` file with explicit rules in this repository, contributions would generally follow standard open-source practices:

1.  **Understand the Project:** Familiarize yourself with SVGOp's purpose (providing standalone SVGO executables) and its current architecture.
2.  **Issue Tracker:** Check the [GitHub Issues](https://github.com/twardoch/svgop/issues) for existing bugs, feature requests, or discussions.
    *   If you find a bug, provide detailed steps to reproduce it.
    *   If you have a feature idea, consider discussing it first.
3.  **Fork the Repository:** Create your own fork of `twardoch/svgop`.
4.  **Create a Branch:** Make your changes in a new git branch, named descriptively (e.g., `fix-windows-path-issue`, `feature-add-new-build-target`).
5.  **Code Style:**
    *   The existing JavaScript code primarily uses `"use strict";` and CommonJS modules (`require`).
    *   Follow the existing code style for consistency (indentation, variable naming, comments).
    *   The project includes `.editorconfig`, `.jshintrc`, and `.babelrc` which might provide hints on coding standards.
6.  **Dependencies:**
    *   The core dependency is `svgo`. Updates to `svgo` should be tested carefully.
    *   Other dependencies like `get-stdin` and `webpack` are for the build and CLI wrapper functionality.
7.  **Build Process:**
    *   Understand the build process involving `webpack`, `pkg`, and potentially QuickJS compilation (see `src/Makefile`, `src/build-with-docker.sh`).
    *   If your changes affect the build, ensure they work across the different targets if possible.
    *   The `bin/` and `build/` directories contain generated files. You might need to update these if your changes affect the executables, or understand how they are generated.
8.  **Testing:**
    *   Test your changes thoroughly. The `test/` directory contains sample SVG files.
    *   Ideally, new functionality should come with corresponding tests or test cases.
9.  **Commit Messages:** Write clear and concise commit messages.
10. **Pull Request:** Submit a Pull Request (PR) to the `main` branch (or the relevant active development branch) of the original `twardoch/svgop` repository.
    *   Clearly describe the changes you've made and why.
    *   Link to any relevant issues.

**Specific considerations for this project:**

*   **Focus on Standalone Executables:** The primary goal is to provide easy-to-use binaries. Contributions should generally align with this.
*   **SVGO Version:** Changes might involve updating the bundled SVGO version or modifying how it's integrated.
*   **Build System Complexity:** The build system targets multiple platforms and JS environments. Changes here require careful testing.
*   **Plugin Configuration:** The SVGO plugin configuration is currently fixed. Changes to this would be a significant alteration and should be discussed.

By following these guidelines, you can help maintain the quality and consistency of the SVGOp project.

## Development and Release Process

### For Developers

This project uses **semantic versioning** with **git-tag-based releases**:

1. **Development workflow:**
   ```bash
   # Make your changes
   git add .
   git commit -m "Your changes"
   
   # Build and test
   ./build.sh
   
   # Run tests only
   ./build.sh test
   ```

2. **Creating releases:**
   ```bash
   # Create a patch release (1.0.0 -> 1.0.1)
   ./release.sh patch
   
   # Create a minor release (1.0.1 -> 1.1.0)
   ./release.sh minor
   
   # Create a major release (1.1.0 -> 2.0.0)
   ./release.sh major
   ```

3. **Automatic CI/CD:**
   - Pull requests trigger automated testing
   - Git tags trigger multiplatform binary builds
   - Releases are automatically created with artifacts

### Testing

The project includes comprehensive tests:

```bash
# Run all tests
./build.sh test

# Run tests from source directory
cd src && make test-all
```

### Build System

The build system supports multiple targets:

- **pkg**: Creates standalone Node.js executables
- **QuickJS**: Creates smaller, faster native executables
- **Platforms**: Linux, macOS, Windows

Build artifacts:
- `bin/` - Ready-to-use executables
- `build/` - Intermediate build files
- `dist/` - Distribution packages (ZIP files)

### Version Management

Versions are automatically managed based on git tags:
- Tags must follow semantic versioning (e.g., `v1.2.3`)
- The build system reads the latest tag and updates `package.json`
- CI/CD creates releases when tags are pushed to the repository
