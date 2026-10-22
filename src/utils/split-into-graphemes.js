/**
 * Check if the browser supports Intl.Segmenter
 *
 * @return {Boolean}
 */
const canUseSegmenter = () => {
  return typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function';
};

/**
 * Split a string into graphemes using Intl.Segmenter
 *
 * @param {String} string String to split
 * @return {Array}
 */
const splitWithSegmenter = (string) => {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(string));

  return segments.map(item => item.segment);
};

/**
 * Split a string into graphemes, which are the characters a reader sees.
 * Emojis and letters with accents stay together.
 *
 * @param {String} string String to split
 * @return {Array}
 */
const splitIntoGraphemes = (string) => {
  if(canUseSegmenter()) {
    return splitWithSegmenter(string);
  }

  return Array.from(string);
};

export default splitIntoGraphemes;
