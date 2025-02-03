const path = require('path');
const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: slsw.lib.entries,
  output: {
    path: path.resolve(__dirname, '.webpack'),
    filename: '[name].js',
  },
  externals: [
    nodeExternals({
      allowlist: ['@google/generative-ai', '@prisma/client', '@prisma/client/.prisma'],
    }),
  ],
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/@prisma/client'),
          to: '@prisma/client',
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
