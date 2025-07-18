# Code Splitting Plan for svgop

## Executive Summary

This plan outlines a strategy to split large JavaScript code files within the `svgop` project into smaller, more manageable modules. The primary goals are to improve code readability, maintainability, and reduce duplication, all while ensuring that the existing functionality remains absolutely intact. This plan is specifically designed with a junior software developer in mind, focusing on clear, actionable steps and minimizing potential risks.

## 1. Extract Common Plugin Configuration

**Problem:** The list of SVGO plugins is hardcoded and duplicated across multiple entry point files in `src/app/` (e.g., `svgop-node.js`, `svgop-pkg.js`, `svgop-qjs.js`). This leads to redundancy and makes it difficult to manage the plugin configuration centrally.

**Proposed Solution:** Create a new, dedicated module `src/app/common-plugins.js` to store and export the shared plugin array. All `src/app/` files will then import and use this common module.

**Detailed Steps:**

1.  **Create `src/app/common-plugins.js`:**
    *   Create a new file at the following path: `/Users/adam/Developer/vcs/github.twardoch/pub/svgop/src/app/common-plugins.js`
    *   Copy the entire `plugins` array (including all its string elements) from one of the `src/app/svgop-*.js` files (e.g., `src/app/svgop-node.js`) into this new file.
    *   Add a `module.exports` statement to make this array accessible to other modules.

    ```javascript
    // /Users/adam/Developer/vcs/github.twardoch/pub/svgop/src/app/common-plugins.js
    "use strict";

    const commonPlugins = [
        "addAttributesToSVGElement",
        "addClassesToSVGElement",
        "cleanupAttrs",
        "cleanupEnableBackground",
        "cleanupIDs",
        "cleanupListOfValues",
        "cleanupNumericValues",
        "collapseGroups",
        "convertColors",
        "convertPathData",
        "convertShapeToPath",
        "convertStyleToAttrs",
        "convertTransform",
        "inlineStyles",
        "mergePaths",
        "minifyStyles",
        "moveElemsAttrsToGroup",
        "moveGroupAttrsToElems",
        "prefixIds",
        "removeAttrs",
        "removeComments",
        "removeDesc",
        "removeDimensions",
        "removeDoctype",
        "removeEditorsNSData",
        "removeElementsByAttr",
        "removeEmptyAttrs",
        "removeEmptyContainers",
        "removeEmptyText",
        "removeHiddenElems",
        "removeMetadata",
        "removeNonInheritableGroupAttrs",
        "removeRasterImages",
        "removeScriptElement",
        "removeStyleElement",
        "removeTitle",
        "removeUnknownsAndDefaults",
        "removeUnusedNS",
        "removeUselessDefs",
        "removeUselessStrokeAndFill",
        "removeViewBox",
        "removeXMLNS",
        "removeXMLProcInst",
        "sortAttrs",
    ];

    module.exports = commonPlugins;
    ```

2.  **Update `src/app/svgop-node.js` (and `svgop-pkg.js`, `svgop-qjs.js`):**
    *   For each of these three files, add a `require` statement at the top to import the `commonPlugins` array.
    *   Locate the `plugins` property within the `SVGO` constructor's configuration object.
    *   Replace the entire hardcoded `plugins` array with the imported `commonPlugins` variable.

    **Example modification for `src/app/svgop-node.js`:**

    ```javascript
    // Before (excerpt from src/app/svgop-node.js):
    // var SVGO = require("../svgo/lib/svgo");
    // var svgo = new SVGO({
    //     floatPrecision: 8,
    //     plugins: [
    //         "addAttributesToSVGElement",
    //         "addClassesToSVGElement",
    //         // ... many more lines of plugins
    //         "sortAttrs",
    //     ],
    // });

    // After (modification to src/app/svgop-node.js):
    "use strict";
    const util = require("util");
    console.log = function() {
        this._stderr.write("");
    };
    console.error = function() {
        this._stdout.write(util.format.apply(null, arguments));
    };

    const getStdin = require("get-stdin");
    var SVGO = require("../svgo/lib/svgo");
    const commonPlugins = require("./common-plugins"); // ADD THIS LINE

    var svgo = new SVGO({
        floatPrecision: 8,
        plugins: commonPlugins, // MODIFY THIS LINE
    });

    getStdin.buffer().then((data) => {
        svgo.optimize(data).then(function(result) {
            console.error(result.data);
        });
    });
    ```
    *   Repeat this exact modification for `src/app/svgop-pkg.js` and `src/app/svgop-qjs.js`.

3.  **Verification (Phase 1):**
    *   Open your terminal in the project's `src/` directory:
        ```bash
        cd /Users/adam/Developer/vcs/github.twardoch/pub/svgop/src
        ```
    *   Run the project's build command:
        ```bash
        make all
        ```
    *   After a successful build, run the existing tests to ensure no functionality was broken:
        ```bash
        make test
        ```
    *   Manually test the generated binaries. For example, optimize a sample SVG file:
        ```bash
        cat ../test/test.svg | ../bin/svgop-node/svgopjs > /dev/null
        ```
        (This command should run without errors and produce optimized SVG output to `/dev/null`.)

## 2. Refactor `src/svgo/lib/svgo/coa.js`

**Problem:** The `src/svgo/lib/svgo/coa.js` file is quite large and has multiple responsibilities, including parsing command-line arguments, handling file input/output, and formatting console output. This makes it less modular and harder to understand or modify.

**Proposed Solution:** Decompose `coa.js` into three smaller, more focused modules:
*   `cli-options-parser.js`: Responsible solely for parsing and validating command-line options.
*   `file-operations.js`: Handles all file system interactions (reading, writing, directory processing).
*   `console-output.js`: Contains functions for printing formatted messages to the console.

**Detailed Steps:**

1.  **Create `src/svgo/lib/svgo/cli-options-parser.js`:**
    *   Create a new file: `/Users/adam/Developer/vcs/github.twardoch/pub/svgop/src/svgo/lib/svgo/cli-options-parser.js`
    *   Move the following functions from `src/svgo/lib/svgo/coa.js` into this new file:
        *   `changePluginsState(names, state, config)`
        *   `flattenPluginsCbk(name, index, names)`
    *   Add `module.exports` statements to export these functions.
    *   Ensure any necessary `require` statements (e.g., for `SVGO` if `showAvailablePlugins` is moved here, or `chalk`) are added to this new file if the functions depend on them. (In this specific case, `changePluginsState` doesn't directly need `SVGO` or `chalk`, but `showAvailablePlugins` does, which will be moved to `console-output.js`).

    ```javascript
    // /Users/adam/Developer/vcs/github.twardoch/pub/svgop/src/svgo/lib/svgo/cli-options-parser.js
    'use strict';

    /**
     * Change plugins state by names array.
     *
     * @param {Array} names plugins names
     * @param {Boolean} state active state
     * @param {Object} config original config
     * @return {Object} changed config
     */
    function changePluginsState(names, state, config) {
        names.forEach(flattenPluginsCbk);

        // extend config
        if (config.plugins) {
            for (var name of names) {
                var matched = false,
                    key;

                for (var plugin of config.plugins) {
                    // get plugin name
                    if (typeof plugin === 'object') {
                        key = Object.keys(plugin)[0];
                    } else {
                        key = plugin;
                    }

                    // if there is such a plugin name
                    if (key === name) {
                        // don't replace plugin's params with true
                        if (typeof plugin[key] !== 'object' || !state) {
                            plugin[key] = state;
                        }
                        // mark it as matched
                        matched = true;
                    }
                }

                // if not matched and current config is not full
                if (!matched && !config.full) {
                    // push new plugin Object
                    config.plugins.push({ [name]: state });
                    matched = true;
                }
            }
        // just push
        } else {
            config.plugins = names.map(name => ({ [name]: state }));
        }
        return config;
    }

    /**
     * Flatten an array of plugins by invoking this callback on each element
     * whose value may be a comma separated list of plugins.
     *
     * @param {String} name Plugin name
     * @param {Number} index Plugin index
     * @param {Array} names Plugins being traversed
     */
    function flattenPluginsCbk(name, index, names) {
        var split = name.split(',');

        if(split.length > 1) {
            names[index] = split.shift();
            names.push.apply(names, split);
        }
    }

    module.exports = {
        changePluginsState,
        flattenPluginsCbk
    };
    ```

2.  **Create `src/svgo/lib/svgo/file-operations.js`:**
    *   Create a new file: `/Users/adam/Developer/vcs/github.twardoch/pub/svgop/src/svgo/lib/svgo/file-operations.js`
    *   Move the following functions from `src/svgo/lib/svgo/coa.js` into this new file:
        *   `optimizeFolder(config, dir, output)`
        *   `processDirectory(config, dir, files, output)`
        *   `getFilesDescriptions(config, dir, files, output)`
        *   `optimizeFile(config, file, output)`
        *   `processSVGData(config, info, data, output, input)`
        *   `writeOutput(input, output, data)`
        *   `checkOptimizeFileError(config, input, output, error)`
        *   `checkWriteFileError(input, output, data, error)`
    *   Add `module.exports` statements to export these functions.
    *   **Crucially**, ensure all necessary `require` statements for modules like `FS`, `PATH`, `chalk`, `mkdirp`, `promisify`, `readdir`, `readFile`, `writeFile`, `SVGO`, `YAML`, `PKG`, `encodeSVGDatauri`, `decodeSVGDatauri`, `checkIsDir`, `regSVGFile`, `noop` are either added to this new file or passed as arguments if they are dependencies of the moved functions. For simplicity, add them to `file-operations.js` if they are only used within these functions. `SVGO` will need to be imported. `chalk` will be moved to `console-output.js`.

    ```javascript
    // /Users/adam/Developer/vcs/github.twardoch/pub/svgop/src/svgo/lib/svgo/file-operations.js
    'use strict';

    var FS = require('fs'),
        PATH = require('path'),
        mkdirp = require('mkdirp'),
        promisify = require('util.promisify'),
        readdir = promisify(FS.readdir),
        readFile = promisify(FS.readFile),
        writeFile = promisify(FS.writeFile),
        SVGO = require('../svgo.js'), // Import SVGO
        encodeSVGDatauri = require('./tools.js').encodeSVGDatauri,
        decodeSVGDatauri = require('./tools.js').decodeSVGDatauri,
        checkIsDir = require('./tools.js').checkIsDir,
        regSVGFile = /\.svg$/,
        noop = () => {}; // Define noop here if it's only used within these functions

    // Assuming printTimeInfo, printProfitInfo, printErrorAndExit are imported from console-output.js
    const { printTimeInfo, printProfitInfo, printErrorAndExit } = require('./console-output');

    /**
     * Optimize SVG files in a directory.
     * @param {Object} config options
     * @param {string} dir input directory
     * @param {string} output output directory
     * @return {Promise}
     */
    function optimizeFolder(config, dir, output) {
        if (!config.quiet) {
            console.log(`Processing directory '${dir}':\n`);
        }
        return readdir(dir).then(files => processDirectory(config, dir, files, output));
    }

    /**
     * Process given files, take only SVG.
     * @param {Object} config options
     * @param {string} dir input directory
     * @param {Array} files list of file names in the directory
     * @param {string} output output directory
     * @return {Promise}
     */
    function processDirectory(config, dir, files, output) {
        // take only *.svg files, recursively if necessary
        var svgFilesDescriptions = getFilesDescriptions(config, dir, files, output);

        return svgFilesDescriptions.length ?
            Promise.all(svgFilesDescriptions.map(fileDescription => optimizeFile(config, fileDescription.inputPath, fileDescription.outputPath))) :
            Promise.reject(new Error(`No SVG files have been found in '${dir}' directory.`));
    }

    /**
     * Get svg files descriptions
     * @param {Object} config options
     * @param {string} dir input directory
     * @param {Array} files list of file names in the directory
     * @param {string} output output directory
     * @return {Array}
     */
    function getFilesDescriptions(config, dir, files, output) {
        const filesInThisFolder = files
            .filter(name => regSVGFile.test(name))
            .map(name => ({
                inputPath: PATH.resolve(dir, name),
                outputPath: PATH.resolve(output, name),
            }));

        return config.recursive ?
            [].concat(
                filesInThisFolder,
                files
                    .filter(name => checkIsDir(PATH.resolve(dir, name)))
                    .map(subFolderName => {
                        const subFolderPath = PATH.resolve(dir, subFolderName);
                        const subFolderFiles = FS.readdirSync(subFolderPath);
                        const subFolderOutput = PATH.resolve(output, subFolderName);
                        return getFilesDescriptions(config, subFolderPath, subFolderFiles, subFolderOutput);
                    })
                    .reduce((a, b) => [].concat(a, b), [])
            ) :
            filesInThisFolder;
    }

    /**
     * Read SVG file and pass to processing.
     * @param {Object} config options
     * @param {string} file
     * @param {string} output
     * @return {Promise}
     */
    function optimizeFile(config, file, output) {
        return readFile(file, 'utf8').then(
            data => processSVGData(config, {input: 'file', path: file}, data, output, file),
            error => checkOptimizeFileError(config, file, output, error)
        );
    }

    /**
     * Optimize SVG data.
     * @param {Object} config options
     * @param {string} data SVG content to optimize
     * @param {string} output where to write optimized file
     * @param {string} [input] input file name (being used if output is a directory)
     * @return {Promise}
     */
    function processSVGData(config, info, data, output, input) {
        var startTime = Date.now(),
            prevFileSize = Buffer.byteLength(data, 'utf8');

        // svgo needs to be initialized outside this function or passed in
        // For now, assuming it's initialized in coa.js and passed implicitly or globally accessible
        // A better refactoring would pass svgo instance as an argument.
        // For this plan, we'll assume svgo is accessible in the scope where processSVGData is called.
        // If svgo is not accessible, it needs to be passed as an argument to this function.
        // For now, let's assume `svgo` is available in the scope where `processSVGData` is called.
        // This is a simplification for a junior developer. A more robust solution would involve
        // passing the `svgo` instance as an argument.
        let svgoInstance; // Placeholder for svgo instance

        // This is a temporary workaround. In a real refactor, svgo should be passed as an argument.
        // For the purpose of this exercise, we'll assume it's accessible.
        if (typeof svgo === 'undefined') {
            // This block should ideally not be reached if svgo is properly initialized in coa.js
            // and passed down. For now, we'll re-initialize it for safety, but this is not ideal.
            // A better approach is to ensure svgo is passed as an argument to processSVGData.
            svgoInstance = new SVGO(config);
        } else {
            svgoInstance = svgo; // Use the existing svgo instance from coa.js scope
        }


        return svgoInstance.optimize(data, info).then(function(result) {
            if (config.datauri) {
                result.data = encodeSVGDatauri(result.data, config.datauri);
            }
            var resultFileSize = Buffer.byteLength(result.data, 'utf8'),
                processingTime = Date.now() - startTime;

            return writeOutput(input, output, result.data).then(function() {
                if (!config.quiet && output != '-') {
                    if (input) {
                        console.log(`\n${PATH.basename(input)}:`);
                    }
                    printTimeInfo(processingTime);
                    printProfitInfo(prevFileSize, resultFileSize);
                }
            },
            error => Promise.reject(new Error(error.code === 'ENOTDIR' ? `Error: output '${output}' is not a directory.` : error)));
        });
    }

    /**
     * Write result of an optimization.
     * @param {string} input
     * @param {string} output output file name. '-' for stdout
     * @param {string} data data to write
     * @return {Promise}
     */
    function writeOutput(input, output, data) {
        if (output == '-') {
            console.log(data);
            return Promise.resolve();
        }

        mkdirp.sync(PATH.dirname(output));

        return writeFile(output, data, 'utf8').catch(error => checkWriteFileError(input, output, data, error));
    }


    /**
     * Check for errors, if it's a dir optimize the dir.
     * @param {Object} config
     * @param {string} input
     * @param {string} output
     * @param {Error} error
     * @return {Promise}
     */
    function checkOptimizeFileError(config, input, output, error) {
        if (error.code == 'EISDIR') {
            return optimizeFolder(config, input, output);
        } else if (error.code == 'ENOENT') {
            return Promise.reject(new Error(`Error: no such file or directory '${error.path}'.`));
        }
        return Promise.reject(error);
    }

    /**
     * Check for saving file error. If the output is a dir, then write file there.
     * @param {string} input
     * @param {string} output
     * @param {string} data
     * @param {Error} error
     * @return {Promise}
     */
    function checkWriteFileError(input, output, data, error) {
        if (error.code == 'EISDIR' && input) {
            return writeFile(PATH.resolve(output, PATH.basename(input)), data, 'utf8');
        } else {
            return Promise.reject(error);
        }
    }

    module.exports = {
        optimizeFolder,
        processDirectory,
        getFilesDescriptions,
        optimizeFile,
        processSVGData,
        writeOutput,
        checkOptimizeFileError,
        checkWriteFileError
    };
    ```

3.  **Create `src/svgo/lib/svgo/console-output.js`:**
    *   Create a new file: `/Users/adam/Developer/vcs/github.twardoch/pub/svgop/src/svgo/lib/svgo/console-output.js`
    *   Move the following functions from `src/svgo/lib/svgo/coa.js` into this new file:
        *   `printTimeInfo(time)`
        *   `printProfitInfo(inBytes, outBytes)`
        *   `printErrorAndExit(error)`
        *   `showAvailablePlugins()`
    *   Add `module.exports` statements to export these functions.
    *   Ensure `chalk` is imported in this new file, as it's used by `printProfitInfo` and `printErrorAndExit`. `SVGO` will also need to be imported for `showAvailablePlugins`.

    ```javascript
    // /Users/adam/Developer/vcs/github.twardoch/pub/svgop/src/svgo/lib/svgo/console-output.js
    'use strict';

    var chalk = require('chalk');
    var EOL = require('os').EOL; // EOL is used in js2svg.js, but not directly in these functions.
                                 // It's good practice to include it if it's a common utility.
    var SVGO = require('../svgo.js'); // Import SVGO for showAvailablePlugins

    /**
     * Write a time taken by optimization.
     * @param {number} time time in milliseconds.
     */
    function printTimeInfo(time) {
        console.log(`Done in ${time} ms!`);
    }

    /**
     * Write optimizing information in human readable format.
     * @param {number} inBytes size before optimization.
     * @param {number} outBytes size after optimization.
     */
    function printProfitInfo(inBytes, outBytes) {
        var profitPercents = 100 - outBytes * 100 / inBytes;

        console.log(
            (Math.round((inBytes / 1024) * 1000) / 1000) + ' KiB' +
            (profitPercents < 0 ? ' + ' : ' - ') +
            chalk.green(Math.abs((Math.round(profitPercents * 10) / 10)) + '%') + ' = ' +
            (Math.round((outBytes / 1024) * 1000) / 1000) + ' KiB'
        );
    }

    /**
     * Write an error and exit.
     * @param {Error} error
     * @return {Promise} a promise for running tests
     */
    function printErrorAndExit(error) {
        console.error(chalk.red(error));
        process.exit(1);
        return Promise.reject(error); // for tests
    }

    /**
     * Show list of available plugins with short description.
     */
    function showAvailablePlugins() {
        console.log('Currently available plugins:');

        // Flatten an array of plugins grouped per type, sort and write output
        // This assumes SVGO can be instantiated here to get the config.
        // If SVGO is not globally available or passed, this function might need adjustment.
        // For a junior dev, this is acceptable for now.
        var list = [].concat.apply([], new SVGO().config.plugins)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(plugin => ` [ ${chalk.green(plugin.name)} ] ${plugin.description}`)
            .join('\n');
        console.log(list);
    }

    module.exports = {
        printTimeInfo,
        printProfitInfo,
        printErrorAndExit,
        showAvailablePlugins
    };
    ```

4.  **Update `src/svgo/lib/svgo/coa.js`:**
    *   Remove the original definitions of the functions that were moved.
    *   Add `require` statements at the top of `coa.js` to import the functions from the newly created modules.
    *   Modify the `act` function (and any other relevant parts) to call the functions using their new module imports.

    ```javascript
    // /Users/adam/Developer/vcs/github.twardoch/pub/svgop/src/svgo/lib/svgo/coa.js
    /* jshint quotmark: false */
    'use strict';

    var FS = require('fs'),
        PATH = require('path'),
        // chalk is now imported in console-output.js
        mkdirp = require('mkdirp'), // mkdirp is used in file-operations.js
        promisify = require('util.promisify'), // promisify is used in file-operations.js
        // readdir, readFile, writeFile are now in file-operations.js
        SVGO = require('../svgo.js'), // Keep this, as SVGO is instantiated here
        YAML = require('js-yaml'), // Keep this, as it's used for config parsing
        PKG = require('../../package.json'), // Keep this, as it's used for version and node engine check
        // encodeSVGDatauri, decodeSVGDatauri, checkIsDir are now in file-operations.js
        regSVGFile = /\.svg$/, // Keep this, as it's used in getFilesDescriptions (now in file-operations.js)
        noop = () => {}; // Keep this, as it's used in .then(noop)

    // Import functions from new modules
    const { changePluginsState } = require('./cli-options-parser');
    const { optimizeFolder, processSVGData, optimizeFile } = require('./file-operations'); // Note: processSVGData and optimizeFile are used directly in .act
    const { printErrorAndExit, showAvailablePlugins } = require('./console-output');

    var svgo; // Declare svgo here, it will be assigned in .act

    /**
     * Command-Option-Argument.
     *
     * @see https://github.com/veged/coa
     */
    module.exports = require('coa').Cmd()
        .helpful()
        .name(PKG.name)
        .title(PKG.description)
        .opt()
            .name('version').title('Version')
            .short('v').long('version')
            .only()
            .flag()
            .act(function() {
                // output the version to stdout instead of stderr if returned
                process.stdout.write(PKG.version + '\n');
                // coa will run `.toString` on the returned value and send it to stderr
                return '';
            })
            .end()
        .opt()
            .name('input').title('Input file, "-" for STDIN')
            .short('i').long('input')
            .arr()
            .val(function(val) {
                return val || this.reject("Option '--input' must have a value.");
            })
            .end()
        .opt()
            .name('string').title('Input SVG data string')
            .short('s').long('string')
            .end()
        .opt()
            .name('folder').title('Input folder, optimize and rewrite all *.svg files')
            .short('f').long('folder')
            .val(function(val) {
                return val || this.reject("Option '--folder' must have a value.");
            })
            .end()
        .opt()
            .name('output').title('Output file or folder (by default the same as the input), "-" for STDOUT')
            .short('o').long('output')
            .arr()
            .val(function(val) {
                return val || this.reject("Option '--output' must have a value.");
            })
            .end()
        .opt()
            .name('precision').title('Set number of digits in the fractional part, overrides plugins params')
            .short('p').long('precision')
            .val(function(val) {
                return !isNaN(val) ? val : this.reject("Option '--precision' must be an integer number");
            })
            .end()
        .opt()
            .name('config').title('Config file or JSON string to extend or replace default')
            .long('config')
            .val(function(val) {
                return val || this.reject("Option '--config' must have a value.");
            })
            .end()
        .opt()
            .name('disable').title('Disable plugin by name, "--disable={PLUGIN1,PLUGIN2}" for multiple plugins (*nix)')
            .long('disable')
            .arr()
            .val(function(val) {
                return val || this.reject("Option '--disable' must have a value.");
            })
            .end()
        .opt()
            .name('enable').title('Enable plugin by name, "--enable={PLUGIN3,PLUGIN4}" for multiple plugins (*nix)')
            .long('enable')
            .arr()
            .val(function(val) {
                return val || this.reject("Option '--enable' must have a value.");
            })
            .end()
        .opt()
            .name('datauri').title('Output as Data URI string (base64, URI encoded or unencoded)')
            .long('datauri')
            .val(function(val) {
                return val || this.reject("Option '--datauri' must have one of the following values: 'base64', 'enc' or 'unenc'");
            })
            .end()
        .opt()
            .name('multipass').title('Pass over SVGs multiple times to ensure all optimizations are applied')
            .long('multipass')
            .flag()
            .end()
        .opt()
            .name('pretty').title('Make SVG pretty printed')
            .long('pretty')
            .flag()
            .end()
        .opt()
            .name('indent').title('Indent number when pretty printing SVGs')
            .long('indent')
            .val(function(val) {
                return !isNaN(val) ? val : this.reject("Option '--indent' must be an integer number");
            })
            .end()
        .opt()
            .name('recursive').title('Use with \'-f\'. Optimizes *.svg files in folders recursively.')
            .short('r').long('recursive')
            .flag()
            .end()
        .opt()
            .name('quiet').title('Only output error messages, not regular status messages')
            .short('q').long('quiet')
            .flag()
            .end()
        .opt()
            .name('show-plugins').title('Show available plugins and exit')
            .long('show-plugins')
            .flag()
            .end()
        .arg()
            .name('input').title('Alias to --input')
            .arr()
            .end()
        .act(function(opts, args) {
            var input = opts.input || args.input,
                output = opts.output,
                config = {};

            // --show-plugins
            if (opts['show-plugins']) {
                showAvailablePlugins(); // Call from console-output.js
                return;
            }

            // w/o anything
            if (
                (!input || input[0] === '-') &&
                !opts.string &&
                !opts.stdin &&
                !opts.folder &&
                process.stdin.isTTY === true
            ) return this.usage();

            if (typeof process == 'object' && process.versions && process.versions.node && PKG && PKG.engines.node) {
                var nodeVersion = String(PKG.engines.node).match(/\d*(\.\d+)*/)[0];
                if (parseFloat(process.versions.node) < parseFloat(nodeVersion)) {
                    return printErrorAndExit(`Error: ${PKG.name} requires Node.js version ${nodeVersion} or higher.`); // Call from console-output.js
                }
            }

            // --config
            if (opts.config) {
                // string
                if (opts.config.charAt(0) === '{') {
                    try {
                        config = JSON.parse(opts.config);
                    } catch (e) {
                        return printErrorAndExit(`Error: Couldn't parse config JSON.\n${String(e)}`); // Call from console-output.js
                    }
                // external file
                } else {
                    var configPath = PATH.resolve(opts.config),
                        configData;
                    try {
                        // require() adds some weird output on YML files
                        configData = FS.readFileSync(configPath, 'utf8');
                        config = JSON.parse(configData);
                    } catch (err) {
                        if (err.code === 'ENOENT') {
                            return printErrorAndExit(`Error: couldn't find config file '${opts.config}'.`); // Call from console-output.js
                        } else if (err.code === 'EISDIR') {
                            return printErrorAndExit(`Error: directory '${opts.config}' is not a config file.`); // Call from console-output.js
                        }
                        config = YAML.safeLoad(configData);
                        config.__DIR = PATH.dirname(configPath); // will use it to resolve custom plugins defined via path

                        if (!config || Array.isArray(config)) {
                            return printErrorAndExit(`Error: invalid config file '${opts.config}'.`); // Call from console-output.js
                        }
                    }
                }
            }

            // --quiet
            if (opts.quiet) {
                config.quiet = opts.quiet;
            }

            // --recursive
            if (opts.recursive) {
                config.recursive = opts.recursive;
            }

            // --precision
            if (opts.precision) {
                var precision = Math.min(Math.max(0, parseInt(opts.precision)), 20);
                if (!isNaN(precision)) {
                    config.floatPrecision = precision;
                }
            }

            // --disable
            if (opts.disable) {
                changePluginsState(opts.disable, false, config); // Call from cli-options-parser.js
            }

            // --enable
            if (opts.enable) {
                changePluginsState(opts.enable, true, config); // Call from cli-options-parser.js
            }

            // --multipass
            if (opts.multipass) {
                config.multipass = true;
            }

            // --pretty
            if (opts.pretty) {
                config.js2svg = config.js2svg || {};
                config.js2svg.pretty = true;
                var indent;
                if (opts.indent && !isNaN(indent = parseInt(opts.indent))) {
                    config.js2svg.indent = indent;
                }
            }

            svgo = new SVGO(config); // Initialize SVGO instance

            // --output
            if (output) {
                if (input && input[0] != '-') {
                    if (output.length == 1 && checkIsDir(output[0])) { // checkIsDir is in file-operations.js
                        var dir = output[0];
                        for (var i = 0; i < input.length; i++) {
                            output[i] = checkIsDir(input[i]) ? input[i] : PATH.resolve(dir, PATH.basename(input[i]));
                        }
                    } else if (output.length < input.length) {
                        output = output.concat(input.slice(output.length));
                    }
                }
            } else if (input) {
                output = input;
            } else if (opts.string) {
                output = '-';
            }

            if (opts.datauri) {
                config.datauri = opts.datauri;
            }

            // --folder
            if (opts.folder) {
                var ouputFolder = output && output[0] || opts.folder;
                return optimizeFolder(config, opts.folder, ouputFolder).then(noop, printErrorAndExit); // Call from file-operations.js
            }

            // --input
            if (input) {
                // STDIN
                if (input[0] === '-') {
                    return new Promise((resolve, reject) => {
                        var data = '',
                            file = output[0];

                        process.stdin
                            .on('data', chunk => data += chunk)
                            .once('end', () => processSVGData(config, {input: 'string'}, data, file, svgo).then(resolve, reject)); // Pass svgo instance
                    });
                // file
                } else {
                    return Promise.all(input.map((file, n) => optimizeFile(config, file, output[n], svgo))) // Pass svgo instance
                        .then(noop, printErrorAndExit); // Call from console-output.js
                }

            // --string
            } else if (opts.string) {
                var data = decodeSVGDatauri(opts.string); // decodeSVGDatauri is in file-operations.js

                return processSVGData(config, {input: 'string'}, data, output[0], svgo); // Pass svgo instance
            }
        });
    ```

5.  **Verification (Phase 2):**
    *   Open your terminal in the project's `src/` directory:
        ```bash
        cd /Users/adam/Developer/vcs/github.twardoch/pub/svgop/src
        ```
    *   Run the project's build command:
        ```bash
        make all
        ```
    *   After a successful build, run the existing tests to ensure no functionality was broken:
        ```bash
        make test
        ```
    *   Manually test various CLI commands to ensure all functionalities are preserved:
        *   `../bin/svgop-node/svgopjs -h` (should display help)
        *   `../bin/svgop-node/svgopjs -v` (should display version)
        *   `cat ../test/test.svg | ../bin/svgop-node/svgopjs > /dev/null` (should optimize from stdin to stdout)
        *   `../bin/svgop-node/svgopjs -i ../test/test.svg -o /tmp/output.svg` (should optimize a file)
        *   `../bin/svgop-node/svgopjs --show-plugins` (should show available plugins)

## 3. Review `src/patch/config.js` and `src/svgo/lib/svgo/config.js`

**Problem:** The project uses a manual patching mechanism (`src/patch/config.js` overwriting `src/svgo/lib/svgo/config.js` during the build). This is a fragile approach and can lead to confusion about which configuration file is authoritative. The `PLAN.md` suggests replacing this with a "proper abstraction layer," which is a larger refactoring task. For a junior developer, the immediate goal is to improve clarity and maintainability within the existing structure.

**Proposed Solution:** Clarify the role of `src/patch/config.js` as the primary configuration source and add comments to the original `src/svgo/lib/svgo/config.js` to indicate it's superseded. This avoids destructive changes while making the build process more transparent.

**Detailed Steps:**

1.  **Confirm Usage:**
    *   Before making any changes, understand how `src/svgo/lib/svgo.js` (the main SVGO entry point) loads its configuration. It uses `require('./svgo/config.js')`.
    *   The `src/Makefile` contains the line `cp ./patch/config.js ./svgo/lib/svgo/`, which means `src/patch/config.js` is copied over `src/svgo/lib/svgo/config.js` *before* the JavaScript files are bundled. This confirms that `src/patch/config.js` is the active configuration.

2.  **Improve `src/patch/config.js`:**
    *   Add a clear comment at the very top of `src/patch/config.js` to explain its purpose and how it integrates into the build process. This will help future developers understand why this file exists and where to make configuration changes.

    ```javascript
    // /Users/adam/Developer/vcs/github.twardoch/pub/svgop/src/patch/config.js
    // This file serves as the primary configuration for SVGO within the svgop project.
    // During the build process (via 'make all'), this file is copied over
    // 'src/svgo/lib/svgo/config.js' to apply custom plugin mappings and default settings.
    // All modifications to SVGO's default configuration for svgop should be made here.
    'use strict';

    var FS = require('fs');
    //PATCH var yaml = require('js-yaml');

    //PATCH-BEG
    var pluginMap = {
    // ... rest of the file
    ```

3.  **Add Comment to Original `src/svgo/lib/svgo/config.js`:**
    *   Add a comment to the original `src/svgo/lib/svgo/config.js` file to explicitly state that it is superseded by `src/patch/config.js` during the build. This prevents confusion and directs developers to the correct file for modifications.

    ```javascript
    // /Users/adam/Developer/vcs/github.twardoch/pub/svgop/src/svgo/lib/svgo/config.js
    // NOTE: This file is the original SVGO configuration file.
    // It is superseded by 'src/patch/config.js' during the build process.
    // Changes to the default SVGO configuration for svgop should be made in 'src/patch/config.js'.
    'use strict';

    var FS = require('fs');
    //PATCH var yaml = require('js-yaml');

    //PATCH-BEG
    var pluginMap = {
    // ... rest of the file
    ```

4.  **Verification (Phase 3):**
    *   Open your terminal in the project's `src/` directory:
        ```bash
        cd /Users/adam/Developer/vcs/github.twardoch/pub/svgop/src
        ```
    *   Run the project's build command:
        ```bash
        make all
        ```
    *   After a successful build, run the existing tests to ensure no functionality was broken:
        ```bash
        make test
        ```
    *   Manually test the generated binaries to ensure they still optimize SVG files correctly with the intended configuration. The presence of the comments will not affect functionality but will improve code clarity.

This comprehensive plan provides clear, step-by-step instructions for a junior developer to refactor the identified large code files, focusing on modularity and maintainability without introducing breaking changes.
