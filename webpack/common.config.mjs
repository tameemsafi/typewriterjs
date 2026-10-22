import { resolve } from 'path';
import webpack from 'webpack';

const config = {
  entry: {
    core: resolve('src', 'core', 'index.js'),
    react: resolve('src', 'react'),
  },

  output: {
    filename: '[name].js',
    path: resolve('dist'),
    library: 'Typewriter',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'typeof self !== \'undefined\' ? self : this',
    umdNamedDefine: true,
  },

  plugins: [
    new webpack.BannerPlugin({
      banner: '"use client";',
      raw: true,
      include: /react\.js$/,
      stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
    }),
  ],

  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  include: ['transform-class-properties'],
                },
            ],
              ['@babel/preset-react', { runtime: 'classic' }],
            ],
          }
        }
      },
    ]
  },
};

export default config;