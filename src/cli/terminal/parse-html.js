import splitIntoGraphemes from '../../utils/split-into-graphemes';
import { PALETTES, resolveColor } from '../colors';

const TAG_PATTERN = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g;

const NEW_LINE_TAGS = ['br', 'hr'];

const VOID_TAGS = ['br', 'hr', 'img', 'wbr', 'input'];

const TAG_STYLES = {
  b: { bold: true },
  strong: { bold: true },
  i: { italic: true },
  em: { italic: true },
  u: { underline: true },
  s: { strikethrough: true },
  del: { strikethrough: true },
};

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/**
 * Turn HTML entities such as &amp; into the characters they stand for
 *
 * @param {String} text Text with entities
 * @return {String}
 */
export const decodeEntities = (text) => {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if(code[0] !== '#') {
      return ENTITIES[code.toLowerCase()] ?? entity;
    }

    const isHex = code[1].toLowerCase() === 'x';
    const number = isHex ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);

    return String.fromCodePoint(number);
  });
};

/**
 * Read the value of an attribute from the attributes part of a tag
 *
 * @param {String} attributes Attributes part of a tag
 * @param {String} name Name of the attribute
 * @return {String}
 */
const getAttribute = (attributes, name) => {
  const pattern = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i');
  const match = pattern.exec(attributes);

  if(!match) {
    return '';
  }

  return match[1] ?? match[2];
};

/**
 * Get the text color from the class or style attribute of a tag
 *
 * @param {String} attributes Attributes part of a tag
 * @param {Object} palette Palette used for color names
 * @return {String|null}
 */
const getColor = (attributes, palette) => {
  const styleMatch = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(getAttribute(attributes, 'style'));

  if(styleMatch) {
    return resolveColor(styleMatch[1], palette);
  }

  const classNames = getAttribute(attributes, 'class').split(/\s+/).filter(Boolean);
  const colorClass = classNames.find(className => palette[className]);

  return colorClass ? palette[colorClass] : null;
};

/**
 * Get the style for the text inside of a tag
 *
 * @param {String} tagName Name of the tag
 * @param {String} attributes Attributes part of the tag
 * @param {Object} parentStyle Style of the text outside of the tag
 * @param {Object} palette Palette used for color names
 * @return {Object}
 */
const getTagStyle = (tagName, attributes, parentStyle, palette) => {
  const style = { ...parentStyle, ...TAG_STYLES[tagName] };
  const color = tagName === 'code' ? palette.green : getColor(attributes, palette);

  if(color) {
    style.color = color;
  }

  return style;
};

/**
 * Split text into characters that all use the same style
 *
 * @param {String} text Text to split
 * @param {Object} style Style of the text
 * @return {Array}
 */
const createCharacters = (text, style) => {
  return splitIntoGraphemes(decodeEntities(text)).map(character => ({ character, style }));
};

/**
 * Remove the styles of tags until the closing tag's own style is removed
 *
 * @param {Array} styleStack Styles of the open tags
 * @param {String} tagName Name of the closing tag
 */
const closeTag = (styleStack, tagName) => {
  const index = styleStack.map(item => item.tagName).lastIndexOf(tagName);

  if(index > 0) {
    styleStack.splice(index);
  }
};

/**
 * Update the open tags for a tag and get any characters it adds, such as a new line
 *
 * @param {Array} match Match of the tag pattern
 * @param {Array} styleStack Styles of the open tags
 * @param {Object} palette Palette used for color names
 * @return {Array}
 */
const readTag = (match, styleStack, palette) => {
  const [, closingSlash, rawTagName, attributes] = match;
  const tagName = rawTagName.toLowerCase();
  const currentStyle = styleStack[styleStack.length - 1].style;

  if(closingSlash) {
    closeTag(styleStack, tagName);
    return [];
  }

  if(NEW_LINE_TAGS.includes(tagName)) {
    return [{ character: '\n', style: currentStyle }];
  }

  if(!VOID_TAGS.includes(tagName)) {
    styleStack.push({ tagName, style: getTagStyle(tagName, attributes, currentStyle, palette) });
  }

  return [];
};

/**
 * Turn a string that may contain HTML into characters with a style, so they
 * can be shown in a terminal. Supported tags are b, strong, i, em, u, s, del,
 * code and br, and colors can be set with a class such as "green" or with
 * style="color: #34d399".
 *
 * @param {String} string String to parse
 * @param {Object} settings Base style, palette and whether to parse HTML
 * @return {Array}
 */
export const parseHTML = (string, { baseStyle = {}, palette = PALETTES.dark, parseHTML: shouldParse = true } = {}) => {
  if(!shouldParse) {
    return splitIntoGraphemes(String(string)).map(character => ({ character, style: baseStyle }));
  }

  const text = String(string);
  const styleStack = [{ tagName: null, style: baseStyle }];
  const characters = [];
  let lastIndex = 0;

  for(const match of text.matchAll(TAG_PATTERN)) {
    const textBefore = text.slice(lastIndex, match.index);
    const currentStyle = styleStack[styleStack.length - 1].style;

    characters.push(...createCharacters(textBefore, currentStyle));
    characters.push(...readTag(match, styleStack, palette));
    lastIndex = match.index + match[0].length;
  }

  characters.push(...createCharacters(text.slice(lastIndex), styleStack[styleStack.length - 1].style));

  return characters;
};
