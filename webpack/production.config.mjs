import { merge } from 'webpack-merge';
import commonConfig from './common.config.mjs';

const config = merge(commonConfig, {
  mode: 'production',
  devtool: 'source-map',
});

export default config;