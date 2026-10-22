import { hexToRgb } from '../colors';

const ESCAPE = '\u001b[';
const RESET = `${ESCAPE}0m`;

export const HIDE_CURSOR = `${ESCAPE}?25l`;
export const SHOW_CURSOR = `${ESCAPE}?25h`;

const WIDE_CHARACTER_PATTERN = /\p{Extended_Pictographic}|[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/u;

const ANSI_PATTERN = /\u001b\[[0-9;?]*[a-zA-Z]/g;

/**
 * Get the ANSI codes that turn on a style
 *
 * @param {Object} style Style of a character
 * @return {String}
 */
export const getStyleCode = (style) => {
  const codes = [];

  if(style.bold) codes.push('1');
  if(style.italic) codes.push('3');
  if(style.underline) codes.push('4');
  if(style.strikethrough) codes.push('9');

  const rgb = style.color ? hexToRgb(style.color) : null;

  if(rgb) {
    codes.push(`38;2;${rgb.join(';')}`);
  }

  return codes.length ? `${ESCAPE}${codes.join(';')}m` : '';
};

/**
 * Join characters next to each other that use the same style
 *
 * @param {Array} characters Characters with a style
 * @return {Array} Runs of text that share a style code
 */
const groupByStyle = (characters) => {
  return characters.reduce((runs, { character, style }) => {
    const styleCode = getStyleCode(style || {});
    const lastRun = runs[runs.length - 1];

    if(lastRun && lastRun.styleCode === styleCode) {
      lastRun.text += character;
    } else {
      runs.push({ text: character, styleCode });
    }

    return runs;
  }, []);
};

/**
 * Turn styled characters into text with ANSI style codes
 *
 * @param {Array} characters Characters with a style
 * @return {String}
 */
export const stylizeCharacters = (characters) => {
  return groupByStyle(characters).map(({ text, styleCode }) => {
    return styleCode ? `${styleCode}${text}${RESET}` : text;
  }).join('');
};

/**
 * Remove ANSI codes from text
 *
 * @param {String} text Text with ANSI codes
 * @return {String}
 */
export const stripAnsi = (text) => text.replace(ANSI_PATTERN, '');

/**
 * Get how many columns a line of text takes up in a terminal
 *
 * @param {String} line Line of text without ANSI codes
 * @return {Number}
 */
const getLineWidth = (line) => {
  return Array.from(line).reduce((width, character) => {
    return width + (WIDE_CHARACTER_PATTERN.test(character) ? 2 : 1);
  }, 0);
};

/**
 * Count how many terminal rows some text takes up, including wrapped lines
 *
 * @param {String} text Text that may contain ANSI codes and new lines
 * @param {Number} columns Width of the terminal
 * @return {Number}
 */
export const countRows = (text, columns) => {
  const lines = stripAnsi(text).split('\n');

  return lines.reduce((rows, line) => {
    return rows + Math.max(1, Math.ceil(getLineWidth(line) / columns));
  }, 0);
};

/**
 * Build the text for one frame: the label line, then the typed text with the cursor
 *
 * @param {Object} frame Characters, cursor index, cursor text and label
 * @return {String}
 */
export const renderFrame = ({ characters, cursorIndex, cursor, cursorStyle, label }) => {
  const before = stylizeCharacters(characters.slice(0, cursorIndex));
  const after = stylizeCharacters(characters.slice(cursorIndex));
  const cursorText = cursor ? `${getStyleCode(cursorStyle || {})}${cursor}${RESET}` : '';
  const labelLine = label && label.length ? `${stylizeCharacters(label)}\n\n` : '';

  return `${labelLine}${before}${cursorText}${after}`;
};

/**
 * Draws frames in a terminal, clearing the previous frame each time
 */
export class TerminalScreen {
  /**
   * @param {Object} output Stream to write to, such as process.stdout
   */
  constructor(output) {
    this.output = output;
    this.previousRows = 0;
  }

  /**
   * Hide the terminal cursor before drawing
   */
  start() {
    this.output.write(HIDE_CURSOR);
  }

  /**
   * Replace the previous frame with a new one
   *
   * @param {String} frameText Text of the frame
   */
  draw(frameText) {
    this.output.write(`${this.getClearCode()}${frameText}`);
    this.previousRows = countRows(frameText, this.output.columns || 80);
  }

  /**
   * Get the ANSI codes that move back to the start of the previous frame and clear it
   *
   * @return {String}
   */
  getClearCode() {
    const moveUp = this.previousRows > 1 ? `${ESCAPE}${this.previousRows - 1}A` : '';
    return `${moveUp}\r${ESCAPE}J`;
  }

  /**
   * Move to a new line and show the terminal cursor again
   */
  finish() {
    this.output.write(`\n${SHOW_CURSOR}`);
  }
}
