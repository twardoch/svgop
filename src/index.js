'use strict';
// This version is for running via https://bellard.org/quickjs/

//require('./domstubs.js').setStubs(global);

var SVGO = require('../lib/svgo');

//var pdfjsLib = require('pdfjs-dist'); //require('../lib/pdf.combined.js');
//pdfjsLib.PDFJS.disableWorker = true;
//pdfjsLib.PDFJS.disableFontFace = true;
//pdfjsLib.PDFJS.disableStream = true;
//pdfjsLib.PDFJS.disableWebGL = true;
//pdfjsLib.PDFJS.verbosity = pdfjsLib.PDFJS.VERBOSITY_LEVELS.errors; 
//pdfjsLib.verbosity = pdfjsLib.PDFJS.VERBOSITY_LEVELS.errors; 
//console.log(pdfjsLib.PDFJS);

var svgo = new SVGO({
    floatPrecision: 8,
    plugins: [
        'addAttributesToSVGElement',
        'addClassesToSVGElement',
        'cleanupAttrs',
        'cleanupEnableBackground',
        'cleanupIDs',
        'cleanupListOfValues',
        'cleanupNumericValues',
        'collapseGroups',
        'convertColors',
        'convertPathData',
        'convertShapeToPath',
        'convertStyleToAttrs',
        'convertTransform',
        'inlineStyles',
        'mergePaths',
        'minifyStyles',
        'moveElemsAttrsToGroup',
        'moveGroupAttrsToElems',
        'prefixIds',
        'removeAttrs',
        'removeComments',
        'removeDesc',
        'removeDimensions',
        'removeDoctype',
        'removeEditorsNSData',
        'removeElementsByAttr',
        'removeEmptyAttrs',
        'removeEmptyContainers',
        'removeEmptyText',
        'removeHiddenElems',
        'removeMetadata',
        'removeNonInheritableGroupAttrs',
        'removeRasterImages',
        'removeScriptElement',
        'removeStyleElement',
        'removeTitle',
        'removeUnknownsAndDefaults',
        'removeUnusedNS',
        'removeUselessDefs',
        'removeUselessStrokeAndFill',
        'removeViewBox',
        'removeXMLNS',
        'removeXMLProcInst',
        'sortAttrs'
    ]
});

var utf8ArrayToStr = (function () {
    var charCache = new Array(128);  // Preallocate the cache for the common single byte chars
    var charFromCodePt = String.fromCodePoint || String.fromCharCode;
    var result = [];

    return function (array) {
        var codePt, byte1;
        var buffLen = array.length;

        result.length = 0;

        for (var i = 0; i < buffLen;) {
            byte1 = array[i++];

            if (byte1 <= 0x7F) {
                codePt = byte1;
            } else if (byte1 <= 0xDF) {
                codePt = ((byte1 & 0x1F) << 6) | (array[i++] & 0x3F);
            } else if (byte1 <= 0xEF) {
                codePt = ((byte1 & 0x0F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F);
            } else if (String.fromCodePoint) {
                codePt = ((byte1 & 0x07) << 18) | ((array[i++] & 0x3F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F);
            } else {
                codePt = 63;    // Cannot convert four byte code points, so use "?" instead
                i += 3;
            }

            result.push(charCache[codePt] || (charCache[codePt] = charFromCodePt(codePt)));
        }

        return result.join('');
    };
})();

function getstdin() {
    const result = [];
    let length = 0;
    let chunk;
    while ((std.in.eof() != true)) {
        chunk = std.in.getByte()
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

//console.log(`This processor architecture is ${process.arch}`);


//getStdin.buffer().then(data => {
//    var doctype = data.toString('utf8').substring(0,5); 
//    if (doctype == "%PDF-") { 
//        pdfjsLib.getDocument({
//                data: data.buffer,
//                nativeImageDecoderSupport: pdfjsLib.NativeImageDecoding.DISPLAY
//            }).then(function (pdfDoc) {
//                var lastPromise = Promise.resolve();
//                var loadPage = function (pageNum) {
//                    return pdfDoc.getPage(pageNum).then(function (page) {
//                        var viewport = page.getViewport(1.0);
//                        var svgGfx = new PDFJS.SVGGraphics(page.commonObjs, page.objs);
//                        svgGfx.embedFonts = true;
//                        return page.getOperatorList().then(function (opList) {
//                            return svgGfx.getSVG(opList, viewport).then(function (svg) {
//                                var svgstr = svg.toString().replace(/svg:/g, '');
//                                svgo.optimize(svgstr).then(function(result) {
//                                    console.error(result.data.replace('<svg width','<svg xmlns="http://www.w3.org/2000/svg" width'));
//                                });
//                            }); 
//                        }); 
//                    });
//                }; 
//            lastPromise = lastPromise.then(loadPage.bind(null, 1));
//        });
//    } else {
//      svgo.optimize(data).then(function(result) {
//            console.error(result.data);
//        });
//    };
//});




/**
var stdin = process.openStdin();
var data = "";

stdin.on('data', function(chunk) {
  data += chunk;
});

stdin.on('end', function() {
    if (data.substring(0,4) == "%PDF") { 
        PDFJS.getDocument({
            data: data,
            nativeImageDecoderSupport: PDFJS.NativeImageDecoding.DISPLAY
            }).then(function (pdfDocument) {
                pdfDocument.getPage(1).then(function (page) {
                    var viewport = page.getViewport(1.0);
                    console.log('Size: ' + viewport.width + 'x' + viewport.height);
                    console.log();
                    page.getOperatorList().then(function (opList) {
                        var svgGfx = new PDFJS.SVGGraphics(page.commonObjs, page.objs);
                        svgGfx.embedFonts = true;
                        svgGfx.getSVG(opList, viewport).then(function (svg) {
                            console.log(svg);
                        }); 
                    }); 
                }); 
            }); 
        console.log(data.substring(0,4));
    } else { 
        svgo.optimize(data).then(function(result) {
            console.log(result.data);
            //console.log(JSON.stringify(svgo.config, null, 2));
        });
    }
});

**/