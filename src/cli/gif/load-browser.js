import { existsSync } from 'fs';
import { createRequire } from 'module';
import { join } from 'path';
import { pathToFileURL } from 'url';

const CHROME_PATHS = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ],
};

export const MISSING_PUPPETEER_MESSAGE = 'Creating a GIF needs puppeteer. Install it with: npm install --save-dev puppeteer';

export const MISSING_CHROME_MESSAGE = 'Could not find Chrome. Install puppeteer (npm install --save-dev puppeteer), or pass the path to Chrome with --chrome or the CHROME_PATH environment variable.';

/**
 * Find the path of a package, first from the current folder and then from this package
 *
 * @param {String} name Package name
 * @return {String|null}
 */
const resolvePackage = (name) => {
  const requireFromProject = createRequire(join(process.cwd(), 'index.js'));

  try {
    return requireFromProject.resolve(name);
  } catch(error) {
    return null;
  }
};

/**
 * Load a package if it is installed
 *
 * @param {String} name Package name
 * @return {Promise<Object|null>}
 */
const importPackage = async (name) => {
  const packagePath = resolvePackage(name);

  if(!packagePath) {
    return null;
  }

  const loadedModule = await import(/* webpackIgnore: true */ pathToFileURL(packagePath).href);

  return loadedModule.default || loadedModule;
};

/**
 * Find a Chrome install for the current platform
 *
 * @return {String|null}
 */
export const findChrome = () => {
  const paths = CHROME_PATHS[process.platform] || [];
  return paths.find(path => existsSync(path)) || null;
};

/**
 * Load puppeteer, or puppeteer-core with an installed Chrome
 *
 * @param {String} chromePath Optional path to Chrome
 * @return {Promise<Object>} Puppeteer and the Chrome path to use
 */
const loadPuppeteer = async (chromePath) => {
  const puppeteer = await importPackage('puppeteer');

  if(puppeteer) {
    return { puppeteer, executablePath: chromePath };
  }

  const puppeteerCore = await importPackage('puppeteer-core');

  if(!puppeteerCore) {
    throw new Error(MISSING_PUPPETEER_MESSAGE);
  }

  const executablePath = chromePath || findChrome();

  if(!executablePath) {
    throw new Error(MISSING_CHROME_MESSAGE);
  }

  return { puppeteer: puppeteerCore, executablePath };
};

/**
 * Start a headless browser to record the GIF
 *
 * @param {String} chromePath Optional path to Chrome
 * @return {Promise<Object>} Puppeteer browser
 */
export const launchBrowser = async (chromePath = process.env.CHROME_PATH) => {
  const { puppeteer, executablePath } = await loadPuppeteer(chromePath);

  return puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--font-render-hinting=none'],
  });
};
