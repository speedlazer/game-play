const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    game: './app/index.js'
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'app/')
    },
    extensions: [".js", ".coffee"]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: "app/index.html"
    }),
    new webpack.ProvidePlugin({
      Crafty: ['src/crafty-loader', 'Crafty'],
      $: ['jquery'],
      WhenJS: ['src/when-loader', 'default'],
      _: ['underscore']
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        options: {
          minimize: true
        }
      },
      {
        test: /\.coffee$/,
        use: [
          'coffee-loader'
        ]
      }
    ]
  }
};