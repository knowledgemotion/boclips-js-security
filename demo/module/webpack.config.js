const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const distPath = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    regular: path.resolve(__dirname, 'App.tsx'),
    autologin: path.resolve(__dirname, 'Autologin.tsx'),
  },
  output: {
    path: distPath,
    filename: '[name].[chunkhash:8].js',
    publicPath: '/',
  },
  devServer: {
    contentBase: distPath,
    port: 8081,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: ['file-loader', 'image-webpack-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['regular'],
      filename: 'index.html',
      template: path.resolve(__dirname, 'index.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['autologin'],
      filename: 'autologin.html',
      template: path.resolve(__dirname, 'autologin.html'),
    }),
    new HtmlWebpackPlugin({
      inject: false,
      filename: 'silent-check-sso.html',
      template: path.resolve(__dirname, 'silent-check-sso.html'),
    }),
  ],
};
