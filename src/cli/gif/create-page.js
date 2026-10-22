import { STEP_METHODS, LABEL_STEP } from '../steps';
import { PALETTES, THEMES } from '../colors';

const FAKE_CLOCK_SCRIPT = `
  (() => {
    let now = 1000000;
    let nextFrameId = 1;
    const frameCallbacks = new Map();

    Date.now = () => now;
    window.requestAnimationFrame = (callback) => {
      const id = nextFrameId++;
      frameCallbacks.set(id, callback);
      return id;
    };
    window.cancelAnimationFrame = (id) => frameCallbacks.delete(id);

    window.__advance = (ms) => {
      now += ms;
      const callbacks = Array.from(frameCallbacks.values());
      frameCallbacks.clear();
      callbacks.forEach(callback => callback(now));
      document.getAnimations().forEach(animation => {
        animation.pause();
        animation.currentTime = now;
      });
      return frameCallbacks.size > 0;
    };
  })();
`;

const RUNNER_SCRIPT = `
  (() => {
    const config = JSON.parse(document.getElementById('typewriter-config').textContent);
    const label = document.getElementById('typewriter-label');
    const typewriter = new Typewriter('#typewriter', config.options);

    const showLabel = (html) => () => {
      label.innerHTML = html;
      label.style.visibility = 'visible';
    };

    config.steps.forEach((step) => {
      if(step.name === config.labelStep) {
        typewriter.callFunction(showLabel(step.args[0]));
        return;
      }

      if(config.methods.includes(step.name)) {
        typewriter[step.name](...step.args);
      }
    });

    typewriter.start();
  })();
`;

/**
 * Escape text so it can be shown inside of HTML
 *
 * @param {String} text Text to escape
 * @return {String}
 */
export const escapeHtml = (text) => {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Turn a value into JSON that is safe to put inside of a script tag
 *
 * @param {Mixed} value Value to turn into JSON
 * @return {String}
 */
export const toScriptJson = (value) => {
  return JSON.stringify(value).replace(/</g, '\\u003c');
};

/**
 * Make a script safe to put inside of a script tag
 *
 * @param {String} script JavaScript code
 * @return {String}
 */
const escapeScript = (script) => script.replace(/<\/script/gi, '<\\/script');

/**
 * Create the CSS classes for the palette colors, such as .green
 *
 * @param {Object} palette Palette of colors
 * @return {String}
 */
const createPaletteCss = (palette) => {
  return Object.entries(palette)
    .map(([name, color]) => `.${name} { color: ${color}; }`)
    .join('\n');
};

/**
 * Create the CSS for the page
 *
 * @param {Object} gif GIF settings such as width, theme and font size
 * @return {String}
 */
const createStyles = ({ width, theme, fontSize }) => {
  const colors = THEMES[theme];

  return `
    * { box-sizing: border-box; }
    html, body { margin: 0; background: ${colors.background}; }
    .card {
      width: ${width}px;
      background: ${colors.background};
      font-family: -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    }
    .bar {
      height: 44px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 18px;
      background: ${colors.bar};
      border-bottom: 1px solid ${colors.border};
    }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .title { margin-left: 12px; color: ${colors.muted}; font: 500 14px Menlo, Consolas, monospace; }
    .content { padding: 28px 40px 36px; }
    .label {
      display: inline-block;
      visibility: hidden;
      padding: 6px 12px;
      border-radius: 8px;
      background: ${colors.labelBackground};
      color: ${colors.labelText};
      font: 600 16px Menlo, Consolas, monospace;
      margin-bottom: 24px;
    }
    #typewriter {
      color: ${colors.text};
      font-size: ${fontSize}px;
      font-weight: 600;
      line-height: 1.3;
      letter-spacing: -0.5px;
    }
    .Typewriter__cursor { color: ${colors.cursor}; font-weight: 400; }
    code { font-family: Menlo, Consolas, monospace; font-size: 0.85em; color: ${colors.code}; }
    ${createPaletteCss(PALETTES[theme])}
  `;
};

/**
 * Create the window bar with three dots and a title
 *
 * @param {String} title Title to show in the window bar
 * @return {String}
 */
const createWindowBar = (title) => {
  return `
    <div class="bar">
      <span class="dot" style="background: #ef4444"></span>
      <span class="dot" style="background: #f59e0b"></span>
      <span class="dot" style="background: #22c55e"></span>
      <span class="title">${escapeHtml(title)}</span>
    </div>
  `;
};

/**
 * Get the options for the typewriter on the page. The space for the text is
 * always reserved so the GIF does not change size, and looping is turned off
 * because the GIF itself loops.
 *
 * @param {Object} options Typewriter options from the config
 * @return {Object}
 */
const getPageOptions = (options) => {
  return { ...options, loop: false, reserveSpace: true, devMode: false };
};

/**
 * Add a deleteAll step at the end when looping, so the GIF loops smoothly
 *
 * @param {Array} steps Steps from the config
 * @param {Object} options Typewriter options from the config
 * @return {Array}
 */
const getPageSteps = (steps, options) => {
  const shouldDeleteAtEnd = options.loop && options.deleteOnLoop !== false;

  if(!shouldDeleteAtEnd) {
    return steps;
  }

  return [...steps, { name: 'deleteAllWithDeleteSpeed', args: [] }];
};

/**
 * Create the HTML page that is recorded to make the GIF
 *
 * @param {Object} settings Core script, steps, typewriter options and GIF settings
 * @return {String}
 */
export const createPage = ({ coreScript, steps, options, gif }) => {
  const hasLabels = steps.some(step => step.name === LABEL_STEP);
  const pageConfig = {
    options: getPageOptions(options),
    steps: getPageSteps(steps, options),
    methods: STEP_METHODS,
    labelStep: LABEL_STEP,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>${createStyles(gif)}</style>
  <script>${FAKE_CLOCK_SCRIPT}</script>
</head>
<body>
  <div class="card">
    ${gif.windowBar ? createWindowBar(gif.title) : ''}
    <div class="content">
      ${hasLabels ? '<div class="label" id="typewriter-label">&nbsp;</div>' : '<div id="typewriter-label" hidden></div>'}
      <div id="typewriter"></div>
    </div>
  </div>
  <script type="application/json" id="typewriter-config">${toScriptJson(pageConfig)}</script>
  <script>${escapeScript(coreScript)}</script>
  <script>${RUNNER_SCRIPT}</script>
</body>
</html>`;
};
