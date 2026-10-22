import { readSteps, createStepsFromStrings } from './steps';
import { THEMES } from './colors';

export const DEFAULT_GIF_SETTINGS = {
  width: 800,
  height: null,
  fontSize: 40,
  fps: 25,
  scale: 2,
  theme: 'dark',
  title: '',
  windowBar: true,
  holdFor: 1500,
  maxDuration: 120000,
};

export const DEFAULT_OPTIONS = {
  useGraphemeSplitter: true,
  mergeTextNodes: true,
  onlyDelayVisibleChanges: true,
};

const DEFAULT_PAUSE = 1500;

/**
 * Read a speed flag such as natural, 50 or 50-90
 *
 * @param {String} value Flag value
 * @param {String} flag Flag name, used in the error message
 * @return {String|Number|Object}
 */
export const parseSpeed = (value, flag) => {
  if(value === 'natural') {
    return value;
  }

  const range = /^(\d+)-(\d+)$/.exec(value);

  if(range) {
    return { min: Number(range[1]), max: Number(range[2]) };
  }

  return parseNumber(value, flag);
};

/**
 * Read a number flag
 *
 * @param {String} value Flag value
 * @param {String} flag Flag name, used in the error message
 * @return {Number}
 */
export const parseNumber = (value, flag) => {
  const number = Number(value);

  if(value === '' || !Number.isFinite(number) || number < 0) {
    throw new Error(`${flag} must be a number that is 0 or more. Got: ${value}`);
  }

  return number;
};

/**
 * Read the theme flag
 *
 * @param {String} value Flag value
 * @param {String} flag Flag name, used in the error message
 * @return {String}
 */
const parseTheme = (value, flag) => {
  if(!THEMES[value]) {
    throw new Error(`${flag} must be one of: ${Object.keys(THEMES).join(', ')}. Got: ${value}`);
  }

  return value;
};

const keepValue = (value) => value;

const OPTION_FLAGS = [
  { flag: 'delay', option: 'delay', read: parseSpeed },
  { flag: 'delete-speed', option: 'deleteSpeed', read: parseSpeed },
  { flag: 'pause', option: 'pauseFor', read: parseNumber },
  { flag: 'cursor', option: 'cursor', read: keepValue },
  { flag: 'loop', option: 'loop', read: keepValue },
];

const GIF_FLAGS = [
  { flag: 'width', option: 'width', read: parseNumber },
  { flag: 'height', option: 'height', read: parseNumber },
  { flag: 'font-size', option: 'fontSize', read: parseNumber },
  { flag: 'fps', option: 'fps', read: parseNumber },
  { flag: 'scale', option: 'scale', read: parseNumber },
  { flag: 'theme', option: 'theme', read: parseTheme },
  { flag: 'title', option: 'title', read: keepValue },
  { flag: 'plain', option: 'windowBar', read: () => false },
];

/**
 * Turn the flags that were passed into settings
 *
 * @param {Object} values Flag values
 * @param {Array} flagList Flags to read and the setting each one changes
 * @return {Object}
 */
const readFlags = (values, flagList) => {
  const passedFlags = flagList.filter(({ flag }) => values[flag] !== undefined);

  return passedFlags.reduce((settings, { flag, option, read }) => {
    return { ...settings, [option]: read(values[flag], `--${flag}`) };
  }, {});
};

/**
 * Get the steps from the strings on the command line, or from the config file
 *
 * @param {Object} fileConfig Config from a file
 * @param {Array} strings Strings from the command line
 * @param {Object} options Typewriter options
 * @return {Array}
 */
const getRawSteps = (fileConfig, strings, options) => {
  const settings = { pauseFor: options.pauseFor ?? DEFAULT_PAUSE, loop: Boolean(options.loop) };

  if(strings.length) {
    return createStepsFromStrings(strings, settings);
  }

  if(fileConfig.steps) {
    return fileConfig.steps;
  }

  if(fileConfig.strings) {
    return createStepsFromStrings([].concat(fileConfig.strings), settings);
  }

  return [];
};

/**
 * Combine the config file and the command line flags. Flags win over the config file.
 *
 * @param {Object} settings Config from a file, flag values and strings from the command line
 * @return {Object} Typewriter options, steps and GIF settings
 */
export const buildConfig = ({ fileConfig = {}, values = {}, strings = [] }) => {
  const options = { ...DEFAULT_OPTIONS, ...fileConfig.options, ...readFlags(values, OPTION_FLAGS) };
  const gif = { ...DEFAULT_GIF_SETTINGS, ...fileConfig.gif, ...readFlags(values, GIF_FLAGS) };
  const steps = readSteps(getRawSteps(fileConfig, strings, options));

  return { options, gif, steps };
};
