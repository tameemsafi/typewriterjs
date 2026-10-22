import { merge } from 'webpack-merge';
import commonConfig from './common.config.mjs';
import cliConfig from './cli.config.mjs';

const productionSettings = {
  mode: 'production',
  devtool: 'source-map',
};

const config = [
  merge(commonConfig, productionSettings),
  merge(cliConfig, productionSettings),
];

export default config;
