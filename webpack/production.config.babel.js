import webpack from 'webpack';
import merge from 'webpack-merge';
import commonConfig from './common.config.babel';

const config = merge(commonConfig, {
  mode: 'production',

  plugins: [
    new webpack.ProvidePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      }
    }),
  ]
});

export default config;