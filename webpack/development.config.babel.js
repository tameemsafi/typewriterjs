import merge from 'webpack-merge';
import commonConfig from './common.config.babel';
import webpack from 'webpack';

const config = merge(commonConfig, {
  mode: 'development',
  watch: true
});

export default config;