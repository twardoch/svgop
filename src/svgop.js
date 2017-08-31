#!/usr/bin/env node

'use strict';

var SVGO = require('../lib/svgo');
var svgo = new SVGO({
            plugins:
                ['removeDoctype',
                    'removeXMLProcInst',
                    'removeComments',
                    'removeMetadata',
                    'removeXMLNS',
                    'removeEditorsNSData',
                    'cleanupAttrs',
                    'minifyStyles',
                    'convertStyleToAttrs',
                    'cleanupIDs',
                    'removeRasterImages',
                    'removeUselessDefs',
                    'cleanupNumericValues',
                    'cleanupListOfValues',
                    'convertColors',
                    'removeUnknownsAndDefaults',
                    'removeNonInheritableGroupAttrs',
                    'removeUselessStrokeAndFill',
                    'removeViewBox',
                    'cleanupEnableBackground',
                    'removeHiddenElems',
                    'removeEmptyText',
                    'convertShapeToPath',
                    'moveElemsAttrsToGroup',
                    'moveGroupAttrsToElems',
                    'collapseGroups',
                    'convertPathData',
                    'convertTransform',
                    'removeEmptyAttrs',
                    'removeEmptyContainers',
                    'mergePaths',
                    'removeUnusedNS',
                    'transformsWithOnePath',
                    'sortAttrs',
                    'removeTitle',
                    'removeDesc',
                    'removeDimensions',
                    'removeAttrs',
                    'removeElementsByAttr',
                    'addClassesToSVGElement',
                    'removeStyleElement',
                    'removeScriptElement',
                    'addAttributesToSVGElement']
        });
var stdin = process.openStdin();
var data = "";

stdin.on('data', function(chunk) {
  data += chunk;
});

stdin.on('end', function() {
    svgo.optimize(data).then(function(result) {
        console.log(result.data);
        //console.dir(svgo.config);
    });
});

