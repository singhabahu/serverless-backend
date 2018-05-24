const path = require('path');
// eslint-disable-next-line import/no-unresolved
const webpack = require('serverless-webpack');

module.exports = {
  entry: webpack.lib.entries,
  target: 'node',
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel-loader'],
      include: path.resolve(__dirname, 'src'),
      exclude: /node_modules/,
    }],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
};
