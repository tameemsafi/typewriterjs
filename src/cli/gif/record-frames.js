import { join } from 'path';

/**
 * Get the file path of a frame
 *
 * @param {String} framesDirectory Folder for the frames
 * @param {Number} index Frame number
 * @return {String}
 */
export const getFramePath = (framesDirectory, index) => {
  return join(framesDirectory, `frame-${String(index).padStart(5, '0')}.png`);
};

/**
 * Throw an error if the page had any errors
 *
 * @param {Array} errors Error messages from the page
 */
const throwPageErrors = (errors) => {
  if(errors.length) {
    throw new Error(`The GIF page had an error: ${errors.join(', ')}`);
  }
};

/**
 * Change the page height to match the card, which already reserves space
 * for the largest text
 *
 * @param {Object} page Puppeteer page
 * @param {Object} settings Width and scale of the GIF
 */
const fitPageToCard = async (page, { width, scale }) => {
  const height = await page.$eval('.card', card => Math.ceil(card.getBoundingClientRect().height));
  await page.setViewport({ width, height, deviceScaleFactor: scale });
};

/**
 * Move the page clock forward one frame at a time and save a screenshot of each frame
 *
 * @param {Object} page Puppeteer page
 * @param {Object} settings Frames folder, frames per second, hold time and max duration
 * @return {Promise<Number>} Number of frames saved
 */
const captureFrames = async (page, { framesDirectory, fps, holdFor, maxDuration }) => {
  const frameTime = 1000 / fps;
  const maxFrames = Math.ceil(maxDuration / frameTime);
  const holdFrames = Math.max(1, Math.ceil(holdFor / frameTime));
  let frameCount = 0;
  let framesAfterEnd = 0;

  while(frameCount < maxFrames && framesAfterEnd < holdFrames) {
    const isTyping = await page.evaluate(ms => window.__advance(ms), frameTime);
    await page.screenshot({ path: getFramePath(framesDirectory, frameCount) });
    frameCount += 1;
    framesAfterEnd = isTyping ? 0 : framesAfterEnd + 1;
  }

  return frameCount;
};

/**
 * Open the GIF page in the browser and save every frame as an image
 *
 * @param {Object} browser Puppeteer browser
 * @param {String} html HTML of the GIF page
 * @param {Object} settings GIF settings and the folder for the frames
 * @return {Promise<Number>} Number of frames saved
 */
export const recordFrames = async (browser, html, settings) => {
  const page = await browser.newPage();
  const errors = [];

  page.on('pageerror', error => errors.push(error.message));

  await page.setViewport({ width: settings.width, height: settings.height || 200, deviceScaleFactor: settings.scale });
  await page.setContent(html, { waitUntil: 'load' });
  throwPageErrors(errors);

  if(!settings.height) {
    await fitPageToCard(page, settings);
  }

  const frameCount = await captureFrames(page, settings);
  throwPageErrors(errors);
  await page.close();

  return frameCount;
};
