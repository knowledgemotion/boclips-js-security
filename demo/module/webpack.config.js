const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const distPath = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'development',
  devtool: "eval-source-map",
  entry: path.resolve(__dirname, 'App.tsx'),
  output: {
    path: distPath,
    filename: '[name].[chunkhash:8].js',
    publicPath: '/'
  },
  devServer: {
    contentBase: distPath,
    port: 8081,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'file-loader',
          'image-webpack-loader'
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({template: path.resolve(__dirname, 'index.html')})
  ]
};
