const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

const srcPath = path.resolve(__dirname, '../src');
const distPath = path.resolve(__dirname, '../dist/min');

module.exports = {
  mode: 'production',
  entry: {
    'boclips-js-security': path.resolve(srcPath, 'index.ts'),
  },
  output: {
    filename: '[name].js',
    path: distPath,
    publicPath: '/',
    library: 'Boclips',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
};
