/**
 * Create a label that looks like a method call, such as typewriter.typeString('...')
 *
 * @param {String} name Method name
 * @param {String} args Arguments to show
 * @return {Object} Label step
 */
const methodLabel = (name, args = '') => {
  return { label: `<span class="dim">typewriter</span>.${name}<span class="dim">(${args})</span>` };
};

/**
 * Create a label that looks like an option, such as { useGraphemeSplitter: true }
 *
 * @param {String} name Option name
 * @param {String} value Option value
 * @return {Object} Label step
 */
const optionLabel = (name, value) => {
  return { label: `<span class="dim">{ </span>${name}: <span class="green">${value}</span><span class="dim"> }</span>` };
};

export const DEMO_DELAY = { min: 45, max: 85 };

export const demoConfig = {
  options: {
    delay: DEMO_DELAY,
    deleteSpeed: 25,
    useGraphemeSplitter: true,
    mergeTextNodes: true,
    onlyDelayVisibleChanges: true,
  },
  gif: {
    title: 'typewriter-effect',
  },
  steps: [
    methodLabel('typeString', "'...'"),
    { pauseFor: 400 },
    { typeString: 'A simple yet powerful <span class="green">typewriter</span> effect' },
    { pauseFor: 1200 },

    methodLabel('deleteChars', '6'),
    { pauseFor: 500 },
    { deleteChars: 6 },
    { typeString: 'for <span class="blue">JavaScript</span> and <span class="pink">React</span>' },
    { pauseFor: 1400 },

    methodLabel('deleteAll'),
    { pauseFor: 500 },
    { deleteAll: 12 },
    methodLabel('moveCursor', '-3'),
    { pauseFor: 400 },
    { typeString: 'Fix tpyos' },
    { pauseFor: 500 },
    { moveCursor: -3 },
    { pauseFor: 300 },
    { deleteChars: 1 },
    { moveCursor: 1 },
    { typeString: 'p' },
    { pauseFor: 300 },
    { moveCursorToEnd: true },
    { typeString: ' as you go' },
    { pauseFor: 1400 },

    { deleteAll: 12 },
    optionLabel('useGraphemeSplitter', 'true'),
    { pauseFor: 400 },
    { typeString: 'Emojis just work 👋 🎉 🚀' },
    { pauseFor: 1400 },

    methodLabel('pasteString', "'...'"),
    { pauseFor: 500 },
    { typeString: '<br>' },
    { pasteString: '<span class="amber">Pasted in one go!</span>' },
    { pauseFor: 1400 },

    { deleteAll: 10 },
    methodLabel('changeDelay', '10'),
    { pauseFor: 400 },
    { typeString: 'Type slowly...' },
    { changeDelay: 10 },
    { typeString: ' or really fast when you need to!' },
    { changeDelay: DEMO_DELAY },
    { pauseFor: 1400 },

    { deleteAll: 10 },
    methodLabel('changeCursor', "'▋'"),
    { pauseFor: 400 },
    { changeCursor: '▋' },
    { typeString: 'Use any <span class="green">cursor</span> you like' },
    { pauseFor: 1400 },
    { changeCursor: '|' },

    { deleteAll: 10 },
    { label: '<span class="dim">$</span> npm install' },
    { pauseFor: 400 },
    { typeString: '<code>typewriter-effect</code>' },
    { pauseFor: 2500 },
  ],
};
