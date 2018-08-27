import { resolve } from 'path';

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
    umdNamedDefine: true,
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
              ['@babel/preset-env', { useBuiltIns: 'usage' }],
              '@babel/preset-react',
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
            ]
          }
        }
      },

      {
        test: /\.scss$/,
        use: [
          'style-loader',   // creates style nodes from JS strings
          'css-loader',     // translates CSS into CommonJS
          'postcss-loader', // PostCSS plugins
          'sass-loader',    // compiles Sass to CSS, using Node Sass by default
        ]
      }
    ]
  }
};

export default config;