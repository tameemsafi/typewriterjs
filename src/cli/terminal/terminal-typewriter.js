import { parseHTML } from './parse-html';
import { renderFrame } from './render';
import { getTypingDelay, getDeleteDelay } from '../get-delay';
import { PALETTES } from '../colors';

const LABEL_STYLE = { color: PALETTES.dark.amber };
const CURSOR_STYLE = { color: PALETTES.dark.green };

const DEFAULT_OPTIONS = {
  delay: 'natural',
  deleteSpeed: 'natural',
  cursor: '|',
  loop: false,
  deleteOnLoop: true,
  parseHTML: true,
};

/**
 * Plays typewriter steps in a terminal. It supports the same steps as the
 * command line config, such as typeString, deleteChars and moveCursor.
 */
class TerminalTypewriter {
  /**
   * @param {Object} settings Options, steps, a draw function and a wait function
   */
  constructor({ options = {}, steps = [], draw = () => {}, wait }) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.steps = steps;
    this.draw = draw;
    this.wait = wait;
    this.isStopped = false;
    this.characters = [];
    this.cursorIndex = 0;
    this.label = null;
    this.resetSettings();
  }

  /**
   * Reset the speeds and cursor to the options, like the browser version does when looping
   */
  resetSettings() {
    this.delay = this.options.delay;
    this.deleteSpeed = this.options.deleteSpeed;
    this.cursor = this.options.cursor;
  }

  /**
   * Run every step, and keep running them when the loop option is set
   *
   * @return {Promise}
   */
  async play() {
    this.render();
    await this.runSteps();

    while(this.options.loop && !this.isStopped) {
      await this.restartLoop();
      await this.runSteps();
    }
  }

  /**
   * Stop running steps after the current one
   */
  stop() {
    this.isStopped = true;
  }

  /**
   * Run every step one after the other
   *
   * @return {Promise}
   */
  async runSteps() {
    for(const step of this.steps) {
      if(this.isStopped) {
        return;
      }

      await this.runStep(step);
    }
  }

  /**
   * Delete everything and reset the settings before the loop starts again
   *
   * @return {Promise}
   */
  async restartLoop() {
    this.resetSettings();

    if(this.options.deleteOnLoop !== false) {
      await this.deleteAll(this.deleteSpeed);
    }
  }

  /**
   * Run a single step
   *
   * @param {Object} step Name and arguments of the step
   * @return {Promise}
   */
  async runStep({ name, args }) {
    const handlers = this.getStepHandlers();
    await handlers[name](...args);
  }

  /**
   * Get the function that runs each step
   *
   * @return {Object}
   */
  getStepHandlers() {
    return {
      typeString: (text) => this.typeCharacters(this.parse(text)),
      pasteString: (text) => this.pasteCharacters(this.parse(text)),
      deleteChars: (amount) => this.deleteCharacters(amount, this.deleteSpeed),
      deleteAll: (speed = 'natural') => this.deleteAll(speed),
      deleteAllWithDeleteSpeed: () => this.deleteAll(this.deleteSpeed),
      clear: () => this.clear(),
      pauseFor: (ms) => this.wait(Number(ms) || 0),
      changeDelay: (delay) => { this.delay = delay; },
      changeDeleteSpeed: (speed) => { this.deleteSpeed = speed; },
      changeCursor: (cursor) => this.changeCursor(cursor),
      moveCursor: (amount) => this.moveCursorBy(amount),
      moveCursorToStart: () => this.moveCursorTo(0),
      moveCursorToEnd: () => this.moveCursorTo(this.characters.length),
      label: (text) => this.showLabel(text),
    };
  }

  /**
   * Turn a string into styled characters
   *
   * @param {String} text Text that may contain HTML
   * @return {Array}
   */
  parse(text) {
    return parseHTML(text, { parseHTML: this.options.parseHTML });
  }

  /**
   * Type characters one at a time at the cursor
   *
   * @param {Array} characters Styled characters
   * @return {Promise}
   */
  async typeCharacters(characters) {
    for(const character of characters) {
      await this.wait(getTypingDelay(this.delay));
      this.insertCharacters([character]);
    }
  }

  /**
   * Add all characters at the cursor in one step
   *
   * @param {Array} characters Styled characters
   * @return {Promise}
   */
  async pasteCharacters(characters) {
    await this.wait(getTypingDelay(this.delay));
    this.insertCharacters(characters);
  }

  /**
   * Add characters at the cursor and draw the new frame
   *
   * @param {Array} characters Styled characters
   */
  insertCharacters(characters) {
    this.characters.splice(this.cursorIndex, 0, ...characters);
    this.cursorIndex += characters.length;
    this.render();
  }

  /**
   * Delete characters before the cursor one at a time
   *
   * @param {Number} amount Number of characters to delete
   * @param {String|Number|Object} speed Delete speed
   * @return {Promise}
   */
  async deleteCharacters(amount, speed) {
    for(let i = 0; i < amount && this.cursorIndex > 0; i++) {
      await this.wait(getDeleteDelay(speed));
      this.characters.splice(this.cursorIndex - 1, 1);
      this.cursorIndex -= 1;
      this.render();
    }
  }

  /**
   * Move the cursor to the end and delete everything
   *
   * @param {String|Number|Object} speed Delete speed
   * @return {Promise}
   */
  deleteAll(speed) {
    this.cursorIndex = this.characters.length;
    return this.deleteCharacters(this.characters.length, speed);
  }

  /**
   * Remove everything straight away
   */
  clear() {
    this.characters = [];
    this.cursorIndex = 0;
    this.render();
  }

  /**
   * Change the cursor text
   *
   * @param {String} cursor New cursor
   */
  changeCursor(cursor) {
    this.cursor = cursor;
    this.render();
  }

  /**
   * Move the cursor one character at a time
   *
   * @param {Number} amount Number of characters, negative to move left
   * @return {Promise}
   */
  async moveCursorBy(amount) {
    const direction = amount < 0 ? -1 : 1;

    for(let i = 0; i < Math.abs(amount); i++) {
      await this.moveCursorTo(this.cursorIndex + direction);
    }
  }

  /**
   * Move the cursor to an index after the typing delay
   *
   * @param {Number} index New cursor index
   * @return {Promise}
   */
  async moveCursorTo(index) {
    await this.wait(getTypingDelay(this.delay));
    this.cursorIndex = Math.min(Math.max(index, 0), this.characters.length);
    this.render();
  }

  /**
   * Show a label above the text, such as the name of the method being shown
   *
   * @param {String} text Label text that may contain HTML
   */
  showLabel(text) {
    this.label = parseHTML(text, { baseStyle: LABEL_STYLE });
    this.render();
  }

  /**
   * Get the typed text without styles
   *
   * @return {String}
   */
  getText() {
    return this.characters.map(item => item.character).join('');
  }

  /**
   * Get the text for the current frame
   *
   * @return {String}
   */
  getFrame() {
    return renderFrame({
      characters: this.characters,
      cursorIndex: this.cursorIndex,
      cursor: this.cursor,
      cursorStyle: CURSOR_STYLE,
      label: this.label,
    });
  }

  /**
   * Draw the current frame
   */
  render() {
    this.draw(this.getFrame());
  }
}

export default TerminalTypewriter;
