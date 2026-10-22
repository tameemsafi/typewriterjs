export const STEP_METHODS = [
  'typeString',
  'pasteString',
  'deleteChars',
  'deleteAll',
  'deleteAllWithDeleteSpeed',
  'clear',
  'pauseFor',
  'changeDelay',
  'changeDeleteSpeed',
  'changeCursor',
  'moveCursor',
  'moveCursorToStart',
  'moveCursorToEnd',
];

export const LABEL_STEP = 'label';

const ALL_STEP_NAMES = [...STEP_METHODS, LABEL_STEP];

/**
 * Turn the value of a step into a list of arguments.
 * true or null means the method is called without arguments.
 *
 * @param {Mixed} value Value of the step
 * @return {Array}
 */
const getStepArguments = (value) => {
  if(value === true || value === null) {
    return [];
  }

  if(Array.isArray(value)) {
    return value;
  }

  return [value];
};

/**
 * Read a step such as { "typeString": "Hello" } into its name and arguments
 *
 * @param {Object} step Step from a config file
 * @return {Object} Name and arguments of the step
 */
export const readStep = (step) => {
  const names = Object.keys(step || {});

  if(names.length !== 1) {
    throw new Error(`Each step must have exactly one key, for example { "typeString": "Hello" }. Got: ${JSON.stringify(step)}`);
  }

  const [name] = names;

  if(!ALL_STEP_NAMES.includes(name)) {
    throw new Error(`Unknown step "${name}". Use one of: ${ALL_STEP_NAMES.join(', ')}`);
  }

  return { name, args: getStepArguments(step[name]) };
};

/**
 * Read every step from a config file
 *
 * @param {Array} steps Steps from a config file
 * @return {Array}
 */
export const readSteps = (steps) => {
  if(!Array.isArray(steps)) {
    throw new Error('The "steps" value must be an array');
  }

  return steps.map(readStep);
};

/**
 * Create steps that type out each string, like the strings option does
 *
 * @param {Array} strings Strings to type
 * @param {Object} settings Pause after each string and whether to loop
 * @return {Array}
 */
export const createStepsFromStrings = (strings, { pauseFor, loop }) => {
  return strings.flatMap((string, index) => {
    const isLastString = index === strings.length - 1;
    const steps = [{ typeString: string }, { pauseFor }];

    if(!isLastString || loop) {
      steps.push({ deleteAllWithDeleteSpeed: true });
    }

    return steps;
  });
};
