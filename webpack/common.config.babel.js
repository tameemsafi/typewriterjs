import { resolve } from 'path';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

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
                  useBuiltIns: 'entry',
                  corejs: 3,
                  targets: {
                    browsers: [
                      'last 2 versions',
                      'ie >= 11',
                    ],
                  },
                },
            ],
              '@babel/preset-react',
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              'babel-plugin-transform-react-remove-prop-types',
            ]
          }
        }
      },
    ]
  },

  plugins: [
    // new BundleAnalyzerPlugin()
  ]
};

export default config;