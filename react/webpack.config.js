var webpack = require('webpack');
var path = require('path');

var APP_DIR = path.resolve(__dirname);
var BUILD_DIR = path.resolve(__dirname, '..', 'build');

var config = {
  devtool: 'cheap-module-source-map',
  entry: APP_DIR + '/index.jsx',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ],
  module : {
    loaders : [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        include: APP_DIR,
        loader: 'babel-loader'
      }
    ]
  },

  resolve: {
    extensions: [".jsx", ".json", ".js"]
  }
};

module.exports = config;