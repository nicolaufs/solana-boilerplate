const webpack = require("webpack")

module.exports = function override(config, env) {
    // New config, e.g. config.plugins.push...
    // console.log(JSON.stringify(config.resolve.fallback))
    config.resolve.fallback = {
        crypto: false,
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        ...config.resolve.fallback
    };
    config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"]
    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        }),
    ]
    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
    })
    return config
}