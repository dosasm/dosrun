//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
    target: 'node', // 📖 -> https://webpack.js.org/configuration/node/

    entry: './nodejs/src/api.ts', // the entry point 📖 -> https://webpack.js.org/configuration/entry-context/
    output: { // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, 'nodejs', 'dist'),
        filename: 'index.js',
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    node: {
        __dirname: false, // leave the __dirname behavior intact
    },
    devtool: 'source-map',
    externals: {
        //modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        emulators: "commonjs2 emulators"
    },
    resolve: { // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [{
            test: /\.ts$/,
            exclude: /node_modules/,
            use: [{
                // configure TypeScript loader:
                // * enable sources maps for end-to-end source maps
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        "sourceMap": true,
                    }
                }
            }]
        }]
    },
    optimization: {
        minimize: process.argv.includes('--mode=production')
    },
    stats: {
        warnings: false
    }
};

const config2 = {
    entry: './web/src/index.ts', // the entry point 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        path: path.resolve(__dirname, 'web', 'dist'),
        filename: 'index.js',
        devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    externals: ["socket.io"],
    devtool: 'source-map',
    resolve: { // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [{
            test: /\.ts$/,
            exclude: /node_modules/,
            use: [{
                // configure TypeScript loader:
                // * enable sources maps for end-to-end source maps
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        "sourceMap": true,
                    }
                }
            }]
        }]
    },
    optimization: {
        minimize: process.argv.includes('--mode=production')
    },
    stats: {
        warnings: false
    }
}

module.exports = [config, config2];