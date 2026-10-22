const VOID_ELEMENT_TAG_NAMES = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
];

const isVoidElement = (node) => {
  const tagName = (node.nodeName || '').toLowerCase();
  return VOID_ELEMENT_TAG_NAMES.includes(tagName);
};

export default isVoidElement;
