const webpack = require('webpack');



module.exports = {
    entry: {
         'espression.umd': __dirname + "/src/main.ts",
         'espression.umd.min': __dirname + "/src/main.ts",
    },
    output: {
        path:  __dirname + "/dist/bundle",
        filename: "[name].js",
        libraryTarget: "umd",
        library: "espression",
        umdNamedDefine: true
    },
    resolve: {
        extensions: [ '.ts']
    },
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: true,
            include: /\.min\.js$/,
        })
    ],
    module: {
        loaders: [{
            test: /\.ts$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
        }]
    }
}
