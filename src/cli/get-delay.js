import getRandomInteger from '../utils/get-random-integer';
import isDelayRange from '../utils/is-delay-range';
import { NATURAL_TYPING_DELAY, NATURAL_DELETE_DELAY } from '../core/constants';

/**
 * Get a delay in ms from a speed value, using the same rules as the browser version
 *
 * @param {String|Number|Object} speed 'natural', a number or a { min, max } range
 * @param {Object} naturalDelay Range to use for 'natural'
 * @return {Number}
 */
const getDelay = (speed, naturalDelay) => {
  if(speed === 'natural') {
    return getRandomInteger(naturalDelay.min, naturalDelay.max);
  }

  if(isDelayRange(speed)) {
    return getRandomInteger(speed.min, speed.max);
  }

  return Number(speed) || 0;
};

/**
 * Get the delay before typing a character
 *
 * @param {String|Number|Object} speed Typing speed
 * @return {Number}
 */
export const getTypingDelay = (speed) => getDelay(speed, NATURAL_TYPING_DELAY);

/**
 * Get the delay before deleting a character
 *
 * @param {String|Number|Object} speed Delete speed
 * @return {Number}
 */
export const getDeleteDelay = (speed) => getDelay(speed, NATURAL_DELETE_DELAY);
