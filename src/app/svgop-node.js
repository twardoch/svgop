#!/usr/bin/env node

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

var svgo = new SVGO({
    floatPrecision: 8,
    plugins: [
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
    ],
});

getStdin.buffer().then((data) => {
    svgo.optimize(data).then(function(result) {
        console.error(result.data);
    });
});