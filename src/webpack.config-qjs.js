const webpack = require("webpack");
const path = require("path");
const glob = require("glob");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;

module.exports = {
    target: "web",
    mode: "production",
    entry: ["./app/svgop-qjs.js"],
    output: {
        path: path.resolve(__dirname, "..", "build", "svgop-qjs"),
        filename: "svgop-mod.js",
    },
    externals: {
        std: "std",
    },
    node: {
        fs: "empty",
        __dirname: true,
        __filename: true,
        assert: true,
        buffer: true,
        Buffer: true,
        child_process: "empty",
        cluster: "empty",
        console: true,
        constants: true,
        cryptp: true,
        dgram: "empty",
        dns: "mock",
        domain: true,
        events: true,
        global: true,
        http: true,
        https: true,
        module: false,
        net: "mock",
        os: true,
        path: true,
        process: true,
        punycode: true,
        querystring: true,
        readline: "empty",
        setImmediate: true,
        repl: "empty",
        stream: true,
        string_decoder: true,
        sys: true,
        timers: true,
        tls: "mock",
        tty: true,
        url: true,
        util: true,
        vm: true,
        zlib: true,
    },
    module: {
        rules: [{
            test: /\.js$/,
            //loader: "babel-loader",
            //options: {
            //    presets: ["es2015"],
            //},
            exclude: /node_modules/,
        }, ],
    },
    plugins: [
        //new BundleAnalyzerPlugin()
    ],
};