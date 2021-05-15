const webpack = require('webpack')
const pkg = require('./package.json')
const { genUserScriptInfo } = require('./template/userscirpt')
const CopyPlugin = require('copy-webpack-plugin')

/** @type {webpack.Configuration} */
const config = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'index.user.js',
    iife: true,
    clean: true,
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
      },
      {
        test: /\.s(c|a)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: genUserScriptInfo(pkg),
      raw: true,
    }),
    new CopyPlugin({
      patterns: ['README.md', 'package.json', 'LICENSE'],
    }),
    new webpack.DefinePlugin({
      'process.env.APP_VERSION': JSON.stringify(pkg.version),
    }),
  ],
}
module.exports = config
