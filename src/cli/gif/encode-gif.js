import { spawn } from 'child_process';
import { join } from 'path';

export const MISSING_FFMPEG_MESSAGE = 'Creating a GIF needs ffmpeg. Install it from https://ffmpeg.org (for example "brew install ffmpeg" or "sudo apt install ffmpeg"), or pass its path with --ffmpeg.';

/**
 * Get the ffmpeg arguments that turn the frames into a GIF. A palette is
 * made from all frames first so the text stays sharp.
 *
 * @param {Object} settings Frames folder, frames per second and output file
 * @return {Array}
 */
export const getFfmpegArguments = ({ framesDirectory, fps, output }) => {
  return [
    '-y',
    '-loglevel', 'error',
    '-framerate', String(fps),
    '-i', join(framesDirectory, 'frame-%05d.png'),
    '-vf', 'split[frames][copy];[copy]palettegen=max_colors=256:stats_mode=full[palette];[frames][palette]paletteuse=dither=none:diff_mode=rectangle',
    '-loop', '0',
    output,
  ];
};

/**
 * Run a command and wait for it to finish
 *
 * @param {String} command Command to run
 * @param {Array} args Arguments for the command
 * @return {Promise}
 */
const runCommand = (command, args) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let errorOutput = '';

    child.stderr.on('data', data => {
      errorOutput += data;
    });

    child.on('error', error => {
      reject(error.code === 'ENOENT' ? new Error(MISSING_FFMPEG_MESSAGE) : error);
    });

    child.on('close', code => {
      if(code === 0) {
        resolve();
        return;
      }

      reject(new Error(`ffmpeg could not create the GIF: ${errorOutput.trim()}`));
    });
  });
};

/**
 * Turn the recorded frames into a GIF with ffmpeg
 *
 * @param {Object} settings ffmpeg path, frames folder, frames per second and output file
 * @return {Promise}
 */
export const encodeGif = ({ ffmpegPath, ...settings }) => {
  return runCommand(ffmpegPath, getFfmpegArguments(settings));
};

/**
 * Check that ffmpeg can be run, so a missing ffmpeg is found before recording
 *
 * @param {String} ffmpegPath Path or name of the ffmpeg command
 * @return {Promise}
 */
export const checkFfmpeg = (ffmpegPath) => {
  return runCommand(ffmpegPath, ['-version']);
};
