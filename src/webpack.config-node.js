const webpack = require("webpack");
const path = require("path");
const glob = require("glob");

module.exports = {
    target: "node",
    mode: "production",
    context: __dirname,
    entry: ["./app/svgop-node.js"],
    node: {
        //fs: "empty",
    },
    output: {
        path: path.resolve(__dirname, "..", "build", "svgop-node"),
        filename: "svgop.js",
    },
    module: {
        rules: [{
            use: [],
        }, ],
    },
};