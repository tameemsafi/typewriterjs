import TerminalTypewriter from './terminal-typewriter';
import { TerminalScreen } from './render';

/**
 * Wait for an amount of time
 *
 * @param {Number} ms Time to wait in ms
 * @return {Promise}
 */
const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Run every step without waiting and print the final text. Used when the
 * output is not a terminal, for example when it is piped to a file.
 *
 * @param {Object} config Options and steps
 * @param {Object} output Stream to write to
 * @return {Promise}
 */
const printFinalText = async ({ options, steps }, output) => {
  const typewriter = new TerminalTypewriter({
    options: { ...options, loop: false },
    steps,
    wait: () => Promise.resolve(),
  });

  await typewriter.play();
  output.write(`${typewriter.getText()}\n`);
};

/**
 * Play the steps in the terminal with the typewriter effect
 *
 * @param {Object} config Options and steps
 * @param {Object} output Stream to write to, such as process.stdout
 * @param {Object} settings Optional wait function, used by tests
 * @return {Promise}
 */
export const playInTerminal = async (config, output, { wait = waitFor } = {}) => {
  if(!output.isTTY) {
    await printFinalText(config, output);
    return;
  }

  const screen = new TerminalScreen(output);
  const typewriter = new TerminalTypewriter({ ...config, wait, draw: frame => screen.draw(frame) });
  const stopOnExit = () => {
    screen.finish();
    process.exit(130);
  };

  process.once('SIGINT', stopOnExit);
  screen.start();

  try {
    await typewriter.play();
  } finally {
    process.off('SIGINT', stopOnExit);
    screen.finish();
  }
};
