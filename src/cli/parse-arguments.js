import { parseArgs } from 'util';

const ARGUMENT_OPTIONS = {
  config: { type: 'string', short: 'c' },
  demo: { type: 'boolean' },
  gif: { type: 'string', short: 'g' },
  delay: { type: 'string' },
  'delete-speed': { type: 'string' },
  pause: { type: 'string' },
  cursor: { type: 'string' },
  loop: { type: 'boolean' },
  width: { type: 'string' },
  height: { type: 'string' },
  'font-size': { type: 'string' },
  fps: { type: 'string' },
  scale: { type: 'string' },
  theme: { type: 'string' },
  title: { type: 'string' },
  plain: { type: 'boolean' },
  chrome: { type: 'string' },
  ffmpeg: { type: 'string' },
  help: { type: 'boolean', short: 'h' },
  version: { type: 'boolean', short: 'v' },
};

export const HELP_TEXT = `Usage: typewriter-effect [strings...] [options]

Play a typewriter effect in the terminal, or save it as a GIF.

Examples:
  npx typewriter-effect "Hello" "World"
  npx typewriter-effect "Hello World" --gif hello.gif
  npx typewriter-effect --config typewriter.json --gif demo.gif
  npx typewriter-effect --demo

Options:
  -c, --config <file>        JSON or JavaScript file with options and steps
      --demo                 Play the built-in tour of the features
  -g, --gif <file>           Save a GIF instead of playing in the terminal
      --delay <speed>        Delay between typed characters: natural, a number or a range like 50-90
      --delete-speed <speed> Delay between deleted characters: natural, a number or a range like 20-40
      --pause <ms>           Pause after each string (default 1500)
      --cursor <text>        Cursor text (default |)
      --loop                 Keep looping

GIF options:
      --width <px>           Width of the GIF (default 800)
      --height <px>          Height of the GIF (default fits the largest text)
      --font-size <px>       Font size of the text (default 40)
      --fps <number>         Frames per second (default 25)
      --scale <number>       Pixel scale, 2 looks sharp on high resolution screens (default 2)
      --theme <name>         dark or light (default dark)
      --title <text>         Title in the window bar
      --plain                Hide the window bar
      --chrome <path>        Path to Chrome, when puppeteer-core is used
      --ffmpeg <path>        Path to ffmpeg (default ffmpeg)

  -h, --help                 Show this help
  -v, --version              Show the version

Creating a GIF needs puppeteer (npm install --save-dev puppeteer) and ffmpeg.
`;

/**
 * Read the command line arguments
 *
 * @param {Array} argv Arguments after the command name
 * @return {Object} Flag values and the strings to type
 */
export const parseArguments = (argv) => {
  const { values, positionals } = parseArgs({
    args: argv,
    options: ARGUMENT_OPTIONS,
    allowPositionals: true,
  });

  return { values, strings: positionals };
};
