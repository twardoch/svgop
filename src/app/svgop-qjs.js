import * as std from "std";
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

var utf8ArrayToStr = (function() {
    var charCache = new Array(128); // Preallocate the cache for the common single byte chars
    var charFromCodePt = String.fromCodePoint || String.fromCharCode;
    var result = [];

    return function(array) {
        var codePt, byte1;
        var buffLen = array.length;

        result.length = 0;

        for (var i = 0; i < buffLen;) {
            byte1 = array[i++];

            if (byte1 <= 0x7f) {
                codePt = byte1;
            } else if (byte1 <= 0xdf) {
                codePt = ((byte1 & 0x1f) << 6) | (array[i++] & 0x3f);
            } else if (byte1 <= 0xef) {
                codePt =
                    ((byte1 & 0x0f) << 12) |
                    ((array[i++] & 0x3f) << 6) |
                    (array[i++] & 0x3f);
            } else if (String.fromCodePoint) {
                codePt =
                    ((byte1 & 0x07) << 18) |
                    ((array[i++] & 0x3f) << 12) |
                    ((array[i++] & 0x3f) << 6) |
                    (array[i++] & 0x3f);
            } else {
                codePt = 63; // Cannot convert four byte code points, so use "?" instead
                i += 3;
            }

            result.push(
                charCache[codePt] ||
                (charCache[codePt] = charFromCodePt(codePt))
            );
        }

        return result.join("");
    };
})();

function getstdin() {
    const result = [];
    let length = 0;
    let chunk;
    while (std.in.eof() != true) {
        chunk = std.in.getByte();
        if (chunk > 0) {
            result.push(chunk);
            length += chunk.length;
        }
    }
    return utf8ArrayToStr(result);
}

function svgop(input) {
    svgo.optimize(input).then(function(result) {
        std.out.puts(result.data);
    });
}

function main() {
    svgop(getstdin());
}

main();