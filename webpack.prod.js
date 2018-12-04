const webpack = require("webpack");
const helpers = require('./helpers');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    main: './app/main.ts', // entry point for your application code
    vendor: './app/vendor.ts'
  },
  output: {
    filename: '[name].bundle.[chunkhash].js',
    // path is /dist/ insetad of /, as for production will be using expressjs
    publicPath: '/dist/',
    libraryTarget: "amd"
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },
  optimization: {
    noEmitOnErrors: true, // default
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'all',
          test: 'vendor',
          name: 'vendor'
          //enforce: true
        }
      }
    },
    minimizer: [new OptimizeCSSAssetsPlugin({})]
  },
  module: {
    rules: [{
        test: /\.tsx?$/,
        use: [
          'ts-loader',
          'angular-router-loader'
        ]
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',

          // curently not minimizing with html loader
          options: {
            minimize: false
          }
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({ // Also generate a test.html
      filename: 'index.html',
      template: 'index-production.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new UglifyJsPlugin({
      sourceMap: true,
      uglifyOptions: {
        output: {
          comments: false,
          beautify: false
        }
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)@angular|fesm5/,
      helpers.root('./app'), {}
    )
  ],
  externals: [
    function(context, request, callback) {
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
  devtool: 'none'
};
