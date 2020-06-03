const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AutoDllPlugin = require('autodll-webpack-plugin')
const webpack = require('webpack')
const threadLoader = require('thread-loader');

threadLoader.warmup({}, ['babel-loader', 'ts-loader', 'eslint-loader', 'sass-loader'])

module.exports = function getConfig(port = 8000) {
  const { NODE_ENV } = process.env;
  const isDev = NODE_ENV === 'development';
  return {
    mode: NODE_ENV,
    entry: {
      main: './index.ts',
      ...(isDev ? {
        hmr: [
          // Include the client code. Note host/post.
          `webpack-dev-server/client?http://localhost:${port}`,
          // Hot reload only when compiled successfully
          'webpack/hot/only-dev-server',
        ],
      } : {})
    },
    output: {
      filename: isDev ? '[name].js' : '[name].[hash].js',
      chunkFilename: isDev ? '[name].js' : '[name].[chunckhash].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/mugong/bi'
    },
    devtool: isDev ? 'inline-source-map' : '',
    resolve: {
      modules: ['node_modules', path.resolve(__dirname, 'src')],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      alias: {
        '@components': 'src/components',
        '@styles': 'src/styles',
        '@src': 'src'
      },
      symlinks: false
    },
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          exclude: /node_modules/,
          use: [
            isDev ? {loader: 'style-loader'} : {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: process.env.NODE_ENV === 'development',
              },
            },
            // {
            //   loader: 'thread-loader'
            // },
            {
              loader: 'css-loader',
              options: {
                modules: true,
              },
            },
            {
              loader: 'sass-loader',
            },
          ],
        },
        {
          test: /\.(scss|css)$/,
          include: /node_modules\/antd/,
          use: [
            isDev ? {loader: 'style-loader'} : {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: process.env.NODE_ENV === 'development',
              },
            },
            // {
            //   loader: 'thread-loader'
            // },
            {
              loader: 'css-loader',
            },
            {
              loader: 'sass-loader',
            },
          ],
        },
        {
          test: /\.tsx?$|\.jsx?$/,
          exclude: /node_modules/,
          use: [
            // {
            //   loader: 'thread-loader'
            // },
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: [
                  ["import", {
                    "libraryName": "antd",
                    "libraryDirectory": "es",
                    "style": "css"
                  }],'react-hot-loader/babel'],
              },
            },
            {
              loader: 'ts-loader',
            },
            {
              loader: 'eslint-loader',
              options: {
                fix: true,
                quiet: true
              }
            }
          ],
        },
        // {
        //   test: /\.tsx?$|\.jsx?$/,
        //   enforce: 'pre',
        //   include: [path.join(__dirname, 'src')],
        //   use: {
        //     loader: 'eslint-loader',
        //     options: {
        //       fix: true,
        //       quiet: true
        //     }
        //   }
        // },
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.mode': JSON.stringify(NODE_ENV)
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, 'template/index.html'),
      }),
      new AutoDllPlugin({
        inject: true,
        filename: '[name].dll.js',
        path: './dll',
        entry: {
          react: [
            'react',
            'react-dom'
          ]
        }
      }),
      new ProgressBarPlugin(),
    ].concat(isDev ? [] : new MiniCssExtractPlugin({
      filename: isDev ? '[name].css' : '[name].[hash].css',
      chunkFilename: isDev ? '[id].css' : '[id].[hash].css',
    })),
    optimization: {
      minimize: !isDev,
      splitChunks: {
        chunks: 'all',
        minSize: 3000,
        maxSize: 0,
        minChunks: 1,
        maxInitialRequests: 10,
        maxAsyncRequests: 20,
        automaticNameDelimiter: '~',
        automaticNameMaxLength: 30,
        cacheGroups: {
          chart: {
            test: /chart/,
            priority: 1,
            minChunks: 1,
            maxInitialRequests: 10,
            maxAsyncRequests: 20,
          }
        },
      },
      ...(isDev
        ? {
          runtimeChunk: {
            name: 'manifest',
          },
        }
        : {}),
    },
  };
};
