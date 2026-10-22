import { resolve } from 'path';
import webpack from 'webpack';

const config = {
  target: 'node24',

  entry: {
    cli: resolve('src', 'cli', 'bin.js'),
  },

  output: {
    filename: '[name].js',
    path: resolve('dist'),
  },

  node: {
    __dirname: false,
    __filename: false,
  },

  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
      entryOnly: true,
      stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
    }),
  ],

  module: {
    parser: {
      javascript: {
        createRequire: false,
      },
    },
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { node: '24' } }],
            ],
          },
        },
      },
    ],
  },
};

export default config;
