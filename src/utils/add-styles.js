/**
 * Add styles to document head
 * 
 * @param {String} styles CSS styles to add
 * @returns {void}
 */
const addStyles = (styles) => {
  const styleBlock = document.createElement('style');
  styleBlock.appendChild(document.createTextNode(styles));
  document.head.appendChild(styleBlock);
};

export default addStyles;