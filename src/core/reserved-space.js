import { EVENT_NAMES } from './constants';

const ADD_EVENT_NAMES = [
  EVENT_NAMES.TYPE_CHARACTER,
  EVENT_NAMES.PASTE_STRING,
  EVENT_NAMES.ADD_HTML_TAG_ELEMENT,
];

const REMOVE_EVENT_NAMES = [
  EVENT_NAMES.REMOVE_ALL,
  EVENT_NAMES.REMOVE_CHARACTER,
  EVENT_NAMES.CLEAR,
];

/**
 * Create a span that is placed in the first cell of a CSS grid
 *
 * @param {String} extraStyles Extra inline styles to add
 * @return {HTMLSpanElement}
 */
const createGridItem = (extraStyles = '') => {
  const element = document.createElement('span');
  element.setAttribute('style', `grid-area: 1 / 1;${extraStyles}`);

  return element;
};

/**
 * Add the elements used to reserve space inside of the container.
 * The content and the hidden sizer are placed in the same grid cell,
 * so the container is always as big as the largest text.
 *
 * @param {HTMLElement} container Container element
 * @return {Object} Content element for the typed text and the hidden sizer element
 */
export const createReservedSpaceElements = (container) => {
  const space = document.createElement('span');
  const content = createGridItem();
  const sizer = createGridItem(' display: grid; visibility: hidden;');

  space.setAttribute('style', 'display: inline-grid;');
  sizer.setAttribute('aria-hidden', 'true');

  space.appendChild(content);
  space.appendChild(sizer);
  container.appendChild(space);

  return { content, sizer };
};

/**
 * Replace the hidden copies of the text inside of the sizer element
 *
 * @param {HTMLElement} sizer Hidden sizer element
 * @param {Array} snapshots Copies of the text to reserve space for
 */
export const renderReservedSpace = (sizer, snapshots) => {
  sizer.replaceChildren(...snapshots);
};

/**
 * Get the options used by the hidden typewriter that works out the text
 *
 * @param {Object} options Options of the visible typewriter
 * @return {Object}
 */
const getSimulationOptions = (options) => {
  return {
    ...options,
    loop: false,
    autoStart: false,
    devMode: false,
    skipAddStyles: true,
    reserveSpace: false,
    initialText: null,
    onCreateTextNode: null,
    onRemoveNode: null,
  };
};

/**
 * Save every node inside of a copied tree against the original node
 *
 * @param {Node} original Original node
 * @param {Node} copy Deep copy of the original node
 * @param {Map} nodeMap Map of original nodes to copied nodes
 */
const mapCopiedNodes = (original, copy, nodeMap) => {
  nodeMap.set(original, copy);

  original.childNodes.forEach((child, index) => {
    mapCopiedNodes(child, copy.childNodes[index], nodeMap);
  });
};

/**
 * Get the copy of a node, creating an empty copy when it has not been copied yet
 *
 * @param {Node} node Original node
 * @param {Map} nodeMap Map of original nodes to copied nodes
 * @return {Node}
 */
const getCopiedNode = (node, nodeMap) => {
  if(!nodeMap.has(node)) {
    nodeMap.set(node, node.cloneNode(false));
  }

  return nodeMap.get(node);
};

/**
 * Copy a visible node so it points to the copied page nodes
 *
 * @param {Object} visibleNode Visible node of the visible typewriter
 * @param {Map} nodeMap Map of original nodes to copied nodes
 * @return {Object}
 */
const copyVisibleNode = (visibleNode, nodeMap) => {
  return {
    ...visibleNode,
    node: nodeMap.get(visibleNode.node) || null,
    parentNode: nodeMap.get(visibleNode.parentNode) || null,
  };
};

/**
 * Copy the text that is already on the page into the hidden typewriter
 *
 * @param {Typewriter} typewriter Visible typewriter
 * @param {Typewriter} simulation Hidden typewriter
 * @return {Map} Map of original nodes to copied nodes
 */
const copyPageToSimulation = (typewriter, simulation) => {
  const { wrapper, cursor } = typewriter.state.elements;
  const nodeMap = new Map();
  const wrapperCopy = wrapper.cloneNode(true);

  mapCopiedNodes(wrapper, wrapperCopy, nodeMap);

  if(nodeMap.has(cursor)) {
    nodeMap.get(cursor).remove();
  }

  simulation.state.elements.wrapper.replaceWith(wrapperCopy);
  simulation.state.elements.wrapper = wrapperCopy;
  simulation.state.visibleNodes = typewriter.state.visibleNodes.map(visibleNode => copyVisibleNode(visibleNode, nodeMap));
  simulation.setCursorIndex(typewriter.state.cursorIndex);

  return nodeMap;
};

/**
 * Copy an event so it adds copied nodes instead of the original nodes
 *
 * @param {Object} event Event to copy
 * @param {Map} nodeMap Map of original nodes to copied nodes
 * @return {Object}
 */
const copyEvent = ({ eventName, eventArgs = {} }, nodeMap) => {
  const copiedEventArgs = { ...eventArgs };

  if(eventArgs.node) {
    copiedEventArgs.node = getCopiedNode(eventArgs.node, nodeMap);
  }

  if(eventArgs.parentNode) {
    copiedEventArgs.parentNode = getCopiedNode(eventArgs.parentNode, nodeMap);
  }

  return { eventName, eventArgs: copiedEventArgs };
};

/**
 * Copy the queued events, leaving out callbacks so they are not called twice
 *
 * @param {Array} eventQueue Event queue of the visible typewriter
 * @param {Map} nodeMap Map of original nodes to copied nodes
 * @return {Array}
 */
const copyEvents = (eventQueue, nodeMap) => {
  const events = eventQueue.filter(event => event.eventName !== EVENT_NAMES.CALL_FUNCTION);

  return events.map(event => copyEvent(event, nodeMap));
};

/**
 * Create a hidden typewriter with the same text and queued events
 *
 * @param {Typewriter} typewriter Visible typewriter
 * @return {Typewriter}
 */
const createSimulation = (typewriter) => {
  const TypewriterClass = typewriter.constructor;
  const container = document.createElement('span');
  const simulation = new TypewriterClass(container, getSimulationOptions(typewriter.options));
  const nodeMap = copyPageToSimulation(typewriter, simulation);

  simulation.state.eventQueue = copyEvents(typewriter.state.eventQueue, nodeMap);

  return simulation;
};

/**
 * Remove id attributes from a copy so the page does not get duplicate ids
 *
 * @param {HTMLElement} element Copied element
 */
const removeIds = (element) => {
  element.querySelectorAll('[id]').forEach(child => {
    child.removeAttribute('id');
  });
};

/**
 * Create a copy of the text that is currently in the hidden typewriter
 *
 * @param {Typewriter} simulation Hidden typewriter
 * @return {HTMLElement}
 */
const createSnapshot = (simulation) => {
  const snapshot = simulation.state.elements.container.cloneNode(true);

  snapshot.setAttribute('style', 'grid-area: 1 / 1;');
  removeIds(snapshot);

  return snapshot;
};

/**
 * Run every event in the hidden typewriter and copy the text each time
 * it is about to be deleted, and once more at the end.
 *
 * @param {Typewriter} simulation Hidden typewriter
 * @return {Array}
 */
const collectSnapshots = (simulation) => {
  const snapshots = [];
  let hasNewText = simulation.state.visibleNodes.length > 0;

  while(simulation.state.eventQueue.length) {
    const currentEvent = simulation.state.eventQueue.shift();

    if(hasNewText && REMOVE_EVENT_NAMES.includes(currentEvent.eventName)) {
      snapshots.push(createSnapshot(simulation));
      hasNewText = false;
    }

    hasNewText = hasNewText || ADD_EVENT_NAMES.includes(currentEvent.eventName);
    simulation.processEvent(currentEvent, 0);
  }

  if(hasNewText || !snapshots.length) {
    snapshots.push(createSnapshot(simulation));
  }

  return snapshots;
};

/**
 * Work out copies of the text for every point where it is largest,
 * which are used to reserve space before the text is typed.
 *
 * @param {Typewriter} typewriter Visible typewriter
 * @return {Array}
 */
export const getReservedSpaceSnapshots = (typewriter) => {
  const simulation = createSimulation(typewriter);

  return collectSnapshots(simulation);
};
