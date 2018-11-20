/**
 * Get the DOM element from a string
 * - Create temporary div element
 * - Change innerHTML of div element to the string
 * - Return the first child of the temporary div element
 * 
 * @param {String} string String to convert into a DOM node
 * 
 * @author Tameem Safi <tamem@safi.me.uk>
 */
const getDOMElementFromString = (string) => {
  const div = document.createElement('div');
  div.innerHTML = string;
  return div.childNodes;
}

export default getDOMElementFromString;