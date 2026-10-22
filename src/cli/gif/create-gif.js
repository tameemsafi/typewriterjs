import { mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { createPage } from './create-page';
import { launchBrowser } from './load-browser';
import { recordFrames } from './record-frames';
import { checkFfmpeg, encodeGif } from './encode-gif';

/**
 * Get the path of the browser version of typewriter-effect, which sits next to this file in dist
 *
 * @return {String}
 */
const getCoreScriptPath = () => join(__dirname, 'core.js');

/**
 * Record the steps in a headless browser and save them as a GIF
 *
 * @param {Object} config Options, steps and GIF settings
 * @param {Object} settings Output file, Chrome path, ffmpeg path and a log function
 * @return {Promise}
 */
export const createGif = async ({ options, steps, gif }, { output, chromePath, ffmpegPath = 'ffmpeg', log = () => {} }) => {
  const coreScript = readFileSync(getCoreScriptPath(), 'utf8');
  const html = createPage({ coreScript, steps, options, gif });

  await checkFfmpeg(ffmpegPath);

  const browser = await launchBrowser(chromePath);
  const framesDirectory = mkdtempSync(join(tmpdir(), 'typewriter-effect-'));

  try {
    log('Recording frames...');
    const frameCount = await recordFrames(browser, html, { ...gif, framesDirectory });

    log(`Creating GIF from ${frameCount} frames...`);
    await encodeGif({ ffmpegPath, framesDirectory, fps: gif.fps, output: resolve(output) });
  } finally {
    await browser.close();
    rmSync(framesDirectory, { recursive: true, force: true });
  }
};
