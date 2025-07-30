const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    main: './index.web.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-screens': 'react-native-web/dist/exports/View',
      '@react-navigation/elements': '@react-navigation/elements/lib/commonjs',
      '@react-navigation/native': '@react-navigation/native/lib/commonjs',
      '@react-navigation/stack': '@react-navigation/stack/lib/commonjs',
      '@react-navigation/bottom-tabs': '@react-navigation/bottom-tabs/lib/commonjs',
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/utils/AsyncStorageWeb.ts'),
      'react-native-safe-area-context': 'react-native-web/dist/exports/View',
    },
    extensions: ['.web.js', '.js', '.web.ts', '.ts', '.web.tsx', '.tsx', '.json'],
    fallback: {
      "crypto": false,
      "stream": false,
      "buffer": false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      chunks: ['main'],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3006,
    open: true,
    hot: true,
    historyApiFallback: true,
  },
};