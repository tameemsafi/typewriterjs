import { parseArguments, HELP_TEXT } from './parse-arguments';
import { buildConfig } from './build-config';
import { loadConfigFile } from './load-config-file';
import { demoConfig } from './demo-config';
import { playInTerminal } from './terminal/play-in-terminal';
import { createGif } from './gif/create-gif';
import packageJson from '../../package.json';

/**
 * Get the config from the demo, a config file, or nothing
 *
 * @param {Object} values Flag values
 * @return {Promise<Object>}
 */
const getFileConfig = async (values) => {
  if(values.demo) {
    return demoConfig;
  }

  if(values.config) {
    return loadConfigFile(values.config);
  }

  return {};
};

/**
 * Save the steps as a GIF
 *
 * @param {Object} config Options, steps and GIF settings
 * @param {Object} values Flag values
 * @param {Object} io Output streams
 * @return {Promise}
 */
const saveGif = async (config, values, { stdout, stderr }) => {
  await createGif(config, {
    output: values.gif,
    chromePath: values.chrome,
    ffmpegPath: values.ffmpeg,
    log: message => stderr.write(`${message}\n`),
  });

  stdout.write(`Saved ${values.gif}\n`);
};

/**
 * Run the typewriter-effect command
 *
 * @param {Array} argv Arguments after the command name
 * @param {Object} io Output streams, usually process.stdout and process.stderr
 * @return {Promise}
 */
export const runCli = async (argv, io) => {
  const { values, strings } = parseArguments(argv);

  if(values.version) {
    io.stdout.write(`${packageJson.version}\n`);
    return;
  }

  const fileConfig = await getFileConfig(values);
  const config = buildConfig({ fileConfig, values, strings });

  if(values.help || !config.steps.length) {
    io.stdout.write(HELP_TEXT);
    return;
  }

  if(values.gif) {
    await saveGif(config, values, io);
    return;
  }

  await playInTerminal(config, io.stdout);
};
