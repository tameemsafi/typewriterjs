import { merge } from 'webpack-merge';
import commonConfig from './common.config.mjs';
import cliConfig from './cli.config.mjs';

const developmentSettings = {
  mode: 'development',
  watch: true,
};

const config = [
  merge(commonConfig, developmentSettings),
  merge(cliConfig, developmentSettings),
];

export default config;
