
const webpack = require("webpack");
const helpers = require('./helpers');
//const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const PRODUCTION = process.env.NODE_ENV === 'production';
console.log('PRODUCTION: ', PRODUCTION );

var plugins = [
  new webpack.DefinePlugin({
     'process.env.NODE_ENV': JSON.stringify('development')
   }),
   new webpack.ContextReplacementPlugin(
     /angular(\\|\/)core(\\|\/)@angular|fesm5/,
     helpers.root('./app'),
     {}
   )
]


const styles ={
    test: /\.css$/,
    use: [
      "style-loader",
      "css-loader"
    ]
};

module.exports = {
    entry: {
        main: './app/main.ts', // entry point for your application code
        vendor: './app/vendor.ts'
    },
    output: {
        filename: '[name].bundle.js',
        publicPath: '/dist/',
        libraryTarget: "amd"
    },
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
              vendor: {
                chunks: 'all',
                name: 'vendor',
                test: 'vendor',
                //enforce: true
              }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                  'ts-loader',
                  'angular-router-loader'
                ]
            },
            // css
            styles
        ]
    },
    plugins: plugins,
    externals: [
        function (context, request, callback) {
            if (/^dojo/.test(request) ||
                /^dojox/.test(request) ||
                /^dijit/.test(request) ||
                /^esri/.test(request) ||
                /^moment/.test(request)
            ) {
                return callback(null, "amd " + request);
            }
            callback();
        }
    ],
    devtool: 'source-map'
};
