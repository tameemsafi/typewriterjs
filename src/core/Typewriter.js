import {
  doesStringContainHTMLTag,
  getDOMElementFromString,
  getRandomInteger,
  addStyles,
  isValueMissing,
  isVoidElement,
  isDelayRange,
  splitIntoGraphemes,
  requestFrame,
  cancelFrame,
} from './../utils';
import {
  EVENT_NAMES,
  VISIBLE_NODE_TYPES,
  STYLES,
  NATURAL_TYPING_DELAY,
  NATURAL_DELETE_DELAY,
} from './constants';

class Typewriter {
  state = {
    lastFrameTime: null,
    pauseUntil: null,
    eventQueue: [],
    eventLoop: null,
    eventLoopPaused: false,
    calledEvents: [],
    visibleNodes: [],
    initialOptions: null,
    elements: {
      container: null,
      wrapper: document.createElement('span'),
      cursor: document.createElement('span'),
    },
  }

  options = {
    strings: null,
    cursor: '|',
    delay: 'natural',
    pauseFor: 1500,
    deleteSpeed: 'natural',
    loop: false,
    autoStart: false,
    devMode: false,
    skipAddStyles: false,
    wrapperClassName: 'Typewriter__wrapper',
    cursorClassName: 'Typewriter__cursor',
    stringSplitter: null,
    onCreateTextNode: null,
    onRemoveNode: null,
    maxCatchUpDelta: null,
    parseHTML: true,
    initialText: null,
    keepLastString: false,
    deleteOnLoop: true,
    cursorBlink: true,
    useGraphemeSplitter: false,
    mergeTextNodes: false,
    pasteAsCharacters: false,
    onlyDelayVisibleChanges: false,
  }

  constructor(container, options) {
    if(container) {
      this.state.elements.container = this.getContainerElement(container);
    }

    if(options) {
      this.options = {
        ...this.options,
        ...options
      };
    }

    // Make a copy of the options used to reset options when looping
    this.state.initialOptions = { ...this.options };

    this.init();
  }

  init() {
    this.setupWrapperElement();
    this.addEventToQueue(EVENT_NAMES.CHANGE_CURSOR, { cursor: this.options.cursor }, true);
    this.addEventToQueue(EVENT_NAMES.REMOVE_ALL, { isLoopStart: true }, true);

    if(window && !window.___TYPEWRITER_JS_STYLES_ADDED___ && !this.options.skipAddStyles) {
      addStyles(STYLES);
      window.___TYPEWRITER_JS_STYLES_ADDED___ = true;
    }

    if(this.options.initialText) {
      this.showInitialText();
    }

    if(this.options.autoStart === true && this.options.strings) {
      this.typeOutAllStrings().start();
		}
  }

  /**
   * Get the container element from a CSS selector or an HTML element
   *
   * @param {String|HTMLElement} container CSS selector or HTML element
   * @return {HTMLElement}
   */
  getContainerElement = (container) => {
    if(typeof container === 'string') {
      return this.findContainerElement(container);
    }

    if(typeof container.appendChild !== 'function') {
      throw new Error('Container must be an HTML element or a CSS selector string');
    }

    return container;
  }

  /**
   * Find the container element using a CSS selector
   *
   * @param {String} selector CSS selector of the container element
   * @return {HTMLElement}
   */
  findContainerElement = (selector) => {
    const containerElement = document.querySelector(selector);

    if(!containerElement) {
      throw new Error(`Could not find container element: ${selector}`);
    }

    return containerElement;
  }

  /**
   * Replace all child nodes of provided element with
   * state wrapper element used for typewriter effect
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  setupWrapperElement = () => {
    if(!this.state.elements.container) {
      return
    }

    this.state.elements.wrapper.className = this.options.wrapperClassName;
    this.state.elements.cursor.className = this.options.cursorClassName;
    this.state.elements.cursor.setAttribute('aria-hidden', 'true');

    if(this.options.cursorBlink === false) {
      this.state.elements.cursor.style.animation = 'none';
    }

    this.state.elements.cursor.innerHTML = this.options.cursor;
    this.state.elements.container.innerHTML = '';

    this.state.elements.container.appendChild(this.state.elements.wrapper);
    this.state.elements.container.appendChild(this.state.elements.cursor);
  }

  /**
   * Add the initialText option to the page straight away.
   * These events are not replayed when looping.
   */
  showInitialText = () => {
    const firstEventIndex = this.state.eventQueue.length;

    this.typeString(this.options.initialText);
    this.updateEventsFrom(firstEventIndex, { temp: true });
    this.skipToEnd();
  }

  /**
   * Start typewriter effect
   */
  start = () => {
    this.stop();
    this.state.eventLoopPaused = false;
    this.runEventLoop();

    return this;
  }

  /**
   * Pause the event loop
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  pause = () => {
    this.state.eventLoopPaused = true;

    return this;
  }

  /**
   * Destroy current running instance
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  stop = () => {
    if(this.state.eventLoop) {
      cancelFrame(this.state.eventLoop);
      this.state.eventLoop = null;
    }

    return this;
  }

  /**
   * Run every event that is currently in the queue straight away,
   * without any delay or pause. Events added by callbacks while
   * skipping stay in the queue.
   *
   * @return {Typewriter}
   */
  skipToEnd = () => {
    const { eventQueue } = this.state;
    const lastEvent = eventQueue[eventQueue.length - 1];

    this.runEventsUntil(lastEvent);
    this.state.pauseUntil = null;

    return this;
  }

  /**
   * Run events from the start of the queue until the last event has run
   *
   * @param {Object} lastEvent Last event to run
   */
  runEventsUntil = (lastEvent) => {
    let currentEvent = null;

    while(this.state.eventQueue.length && currentEvent !== lastEvent) {
      currentEvent = this.state.eventQueue.shift();
      this.processEvent(currentEvent, 0);
    }
  }

  /**
   * Remove every event that has not run yet
   *
   * @return {Typewriter}
   */
  clearQueue = () => {
    this.state.eventQueue = [];
    this.state.calledEvents = [];
    this.state.pauseUntil = null;

    return this;
  }

  /**
   * Add pause event to queue for ms provided
   *
   * @param {Number} ms Time in ms to pause for
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  pauseFor = (ms) => {
    this.addEventToQueue(EVENT_NAMES.PAUSE_FOR, { ms });

    return this;
  }

  /**
   * Start typewriter effect by typing
   * out all strings provided
   *
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  typeOutAllStrings = () => {
    if(typeof this.options.strings === 'string') {
      this.typeString(this.options.strings)
        .pauseFor(this.options.pauseFor);
      return this;
    }

    this.options.strings.forEach((string, index) => {
      this.typeString(string)
        .pauseFor(this.options.pauseFor);

      if(this.shouldDeleteString(index)) {
        this.deleteAll(this.options.deleteSpeed);
      }
    });

    return this;
  }

  /**
   * Check if a string from the strings option should be deleted after it is typed
   *
   * @param {Number} index Index of the string in the strings option
   * @return {Boolean}
   */
  shouldDeleteString = (index) => {
    const isLastString = index === this.options.strings.length - 1;

    if(!isLastString || this.options.loop) {
      return true;
    }

    return !this.options.keepLastString;
  }

  /**
   * Adds string characters to event queue for typing
   *
   * @param {String} string String to type
   * @param {HTMLElement} node Node to add character inside of
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  typeString = (string, node = null) => {
    if(this.shouldParseAsHTML(string)) {
      return this.typeOutHTMLString(string, node);
    }

    return this.typeText(string, node);
  }

  typeText = (string, node = null) => {
    if(string) {
      this.typeCharacters(this.splitString(string), node);
    }

    return this;
  }

  /**
   * Split a string into the characters that will be typed
   *
   * @param {String} string String to split
   * @return {Array}
   */
  splitString = (string) => {
    const { stringSplitter, useGraphemeSplitter } = this.options;

    if(typeof stringSplitter === 'function') {
      return stringSplitter(string);
    }

    if(useGraphemeSplitter) {
      return splitIntoGraphemes(string);
    }

    return string.split('');
  }

  /**
   * Adds entire strings to event queue for paste effect
   *
   * @param {String} string String to paste
   * @param {HTMLElement} node Node to add string inside of
   * @return {Typewriter}
   *
   * @author Luiz Felicio <unifelicio@gmail.com>
   */
  pasteString = (string, node = null) => {
    if(this.shouldParseAsHTML(string)) {
      return this.pasteHTMLString(string, node);
    }

    return this.pasteText(string, node);
  }

  /**
   * Add events to paste a string which contains HTML tags
   *
   * @param {String} string String to paste
   * @param {HTMLElement} node Node to add string inside of
   * @return {Typewriter}
   */
  pasteHTMLString = (string, node) => {
    const firstEventIndex = this.state.eventQueue.length;

    this.typeOutHTMLString(string, node, true);

    if(this.options.onlyDelayVisibleChanges) {
      this.updateEventsFrom(firstEventIndex + 1, { skipDelay: true });
    }

    return this;
  }

  pasteText = (string, node = null) => {
    if(string) {
      this.addEventToQueue(EVENT_NAMES.PASTE_STRING, { character: string, node });
    }

    return this;
  }

  shouldParseAsHTML = (string) => {
    return this.options.parseHTML !== false && doesStringContainHTMLTag(string);
  }

  /**
   * Type out a string which is wrapper around HTML tag
   *
   * @param {String} string String to type
   * @param {HTMLElement} parentNode Node to add inner nodes to
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  typeOutHTMLString = (string, parentNode = null, pasteEffect) => {
    const childNodes = Array.from(getDOMElementFromString(string));
    this.addChildNodesToQueue(childNodes, parentNode, pasteEffect);

    return this;
  }

  addChildNodesToQueue = (childNodes, parentNode, pasteEffect) => {
    childNodes.forEach(childNode => {
      this.addChildNodeToQueue(childNode, parentNode, pasteEffect);
    });
  }

  addChildNodeToQueue = (node, parentNode, pasteEffect) => {
    if(node.nodeType === Node.ELEMENT_NODE) {
      this.addElementNodeToQueue(node, parentNode, pasteEffect);
      return;
    }

    if(node.nodeType === Node.TEXT_NODE) {
      this.addTextToQueue(node.textContent, parentNode, pasteEffect);
    }
  }

  addElementNodeToQueue = (node, parentNode, pasteEffect) => {
    const childNodes = Array.from(node.childNodes);
    node.innerHTML = '';

    this.addEventToQueue(EVENT_NAMES.ADD_HTML_TAG_ELEMENT, {
      node,
      parentNode,
    });

    this.addChildNodesToQueue(childNodes, node, pasteEffect);
  }

  addTextToQueue = (text, node, pasteEffect) => {
    if(pasteEffect) {
      this.pasteText(text, node);
    } else {
      this.typeText(text, node);
    }
  }

  /**
   * Add delete all characters to event queue
   *
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  deleteAll = (speed = 'natural') => {
    this.addEventToQueue(EVENT_NAMES.REMOVE_ALL, { speed });
    return this;
  }

  deleteAllWithDeleteSpeed = () => {
    this.addEventToQueue(EVENT_NAMES.REMOVE_ALL);
    return this;
  }

  /**
   * Add event to remove everything that is visible straight away
   *
   * @return {Typewriter}
   */
  clear = () => {
    this.addEventToQueue(EVENT_NAMES.CLEAR);
    return this;
  }

  /**
   * Change delete speed
   *
   * @param {Number} speed Speed to use for deleting characters
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  changeDeleteSpeed = (speed) => {
    if(isValueMissing(speed)) {
      throw new Error('Must provide new delete speed');
    }

    this.addEventToQueue(EVENT_NAMES.CHANGE_DELETE_SPEED, { speed });

    return this;
  }

  /**
   * Change delay when typing
   *
   * @param {Number} delay Delay when typing out characters
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  changeDelay = (delay) => {
    if(isValueMissing(delay)) {
      throw new Error('Must provide new delay');
    }

    this.addEventToQueue(EVENT_NAMES.CHANGE_DELAY, { delay });

    return this;
  }

  /**
   * Change cursor
   *
   * @param {String} character/string to represent as cursor
   * @return {Typewriter}
   *
   * @author Y.Paing <ye@y3p.io>
   */
  changeCursor = (cursor) => {
    if(isValueMissing(cursor)) {
      throw new Error('Must provide new cursor');
    }

    this.addEventToQueue(EVENT_NAMES.CHANGE_CURSOR, { cursor });

    return this;
  }

  /**
   * Add delete character to event queue for amount of characters provided
   *
   * @param {Number} amount Number of characters to remove
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  deleteChars = (amount) => {
    if(!amount) {
      throw new Error('Must provide amount of characters to delete');
    }

    for(let i = 0; i < amount; i++) {
      this.addEventToQueue(EVENT_NAMES.REMOVE_CHARACTER);
    }

    return this;
  }

  /**
   * Add an event item to call a callback function
   *
   * @param {cb}      cb        Callback function to call
   * @param {Object}  thisArg   thisArg to use when calling function
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  callFunction = (cb, thisArg) => {
    if(!cb || typeof cb !== 'function') {
      throw new Error('Callback must be a function');
    }

    this.addEventToQueue(EVENT_NAMES.CALL_FUNCTION, { cb, thisArg });

    return this;
  }

  /**
   * Add type character event for each character
   *
   * @param {Array} characters Array of characters
   * @param {HTMLElement} node Node to add character inside of
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  typeCharacters = (characters, node = null) => {
    if(!characters || !Array.isArray(characters)) {
      throw new Error('Characters must be an array');
    }

    characters.forEach(character => {
      this.addEventToQueue(EVENT_NAMES.TYPE_CHARACTER, { character, node });
    });

    return this;
  }

  /**
   * Add remove character event for each character
   *
   * @param {Array} characters Array of characters
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  removeCharacters = (characters) => {
    if(!characters || !Array.isArray(characters)) {
      throw new Error('Characters must be an array');
    }

    characters.forEach(() => {
      this.addEventToQueue(EVENT_NAMES.REMOVE_CHARACTER);
    });

    return this;
  }

  /**
   * Add an event to the event queue
   *
   * @param {String}  eventName Name of the event
   * @param {Object}  eventArgs Arguments to pass to event callback
   * @param {Boolean} prepend   Prepend to begining of event queue
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  addEventToQueue = (eventName, eventArgs, prepend = false) => {
    return this.addEventToStateProperty(
      eventName,
      eventArgs,
      prepend,
      'eventQueue'
    );
  }

  /**
   * Add an event to correct state property
   *
   * @param {String}  eventName Name of the event
   * @param {Object}  eventArgs Arguments to pass to event callback
   * @param {Boolean} prepend   Prepend to begining of event queue
   * @param {String}  property  Property name of state object
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  addEventToStateProperty = (eventName, eventArgs, prepend = false, property) => {
    const eventItem = {
      eventName,
      eventArgs: eventArgs || {},
    };

    if(prepend) {
      this.state[property].unshift(eventItem);
    } else {
      this.state[property].push(eventItem);
    }

    return this;
  }

  /**
   * Add extra event args to every event from an index in the queue
   *
   * @param {Number} firstEventIndex Index of the first event to update
   * @param {Object} newEventArgs Event args to add
   */
  updateEventsFrom = (firstEventIndex, newEventArgs) => {
    const events = this.state.eventQueue.slice(firstEventIndex);

    events.forEach(event => {
      Object.assign(event.eventArgs, newEventArgs);
    });
  }

  /**
   * Run the event loop and do anything inside of the queue
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  runEventLoop = () => {
    if(!this.state.lastFrameTime) {
      this.state.lastFrameTime = Date.now();
    }

    const nowTime = Date.now();
    const canCatchUp = this.isCatchUpEnabled();
    let delta = this.getFrameDelta(nowTime, canCatchUp);

    if(!this.state.eventQueue.length) {
      if(!this.options.loop) {
        return;
      }

      this.restartLoop();
    }

    // Request next frame
    this.state.eventLoop = requestFrame(this.runEventLoop);

    // Check if event loop is paused
    if(this.state.eventLoopPaused) {
      return;
    }

    // Check if state has pause until time
    if(this.state.pauseUntil) {
      // Check if event loop should be paused
      if(nowTime < this.state.pauseUntil) {
        return;
      }

      // Reset pause time
      this.state.pauseUntil = null;

      // Time spent paused must not be replayed as a burst of events
      if(canCatchUp) {
        this.state.lastFrameTime = nowTime;
        delta = 0;
      }
    }

    const { timeLeft, processedDelayedEvent } = this.processEventsForFrame(delta, canCatchUp);

    if(processedDelayedEvent) {
      this.state.lastFrameTime = canCatchUp ? nowTime - timeLeft : nowTime;
    }
  }

  /**
   * Check if the maxCatchUpDelta option is set
   *
   * @return {Boolean}
   */
  isCatchUpEnabled = () => {
    const { maxCatchUpDelta } = this.options;
    return typeof maxCatchUpDelta === 'number' && maxCatchUpDelta > 0;
  }

  /**
   * Get the time in ms since the last frame that ran an event
   *
   * @param {Number} nowTime Current time in ms
   * @param {Boolean} canCatchUp Whether maxCatchUpDelta is set
   * @return {Number}
   */
  getFrameDelta = (nowTime, canCatchUp) => {
    const delta = nowTime - this.state.lastFrameTime;

    if(canCatchUp) {
      return Math.min(delta, this.options.maxCatchUpDelta);
    }

    return delta;
  }

  /**
   * Add every called event back to the queue so the loop starts again
   */
  restartLoop = () => {
    this.state.eventQueue = [...this.state.calledEvents];
    this.state.calledEvents = [];
    this.options = {...this.state.initialOptions};
  }

  /**
   * Run the events that have enough time to run in this frame
   *
   * @param {Number} delta Time in ms that can be used by events
   * @param {Boolean} canCatchUp Whether more than one delayed event can run
   * @return {Object} Time left and whether a delayed event ran
   */
  processEventsForFrame = (delta, canCatchUp) => {
    let timeLeft = delta;
    let processedDelayedEvent = false;

    while(this.state.eventQueue.length) {
      const currentEvent = this.state.eventQueue[0];
      const isInstant = this.isInstantEvent(currentEvent);
      const delay = isInstant ? 0 : this.getEventDelay(currentEvent);
      const canRunDelayedEvent = canCatchUp || !processedDelayedEvent;

      if(!isInstant && (!canRunDelayedEvent || timeLeft <= delay)) {
        break;
      }

      this.state.eventQueue.shift();
      this.processEvent(currentEvent, delay);
      timeLeft -= delay;
      processedDelayedEvent = processedDelayedEvent || !isInstant;

      if(this.shouldStopProcessingEvents()) {
        break;
      }
    }

    return { timeLeft, processedDelayedEvent };
  }

  /**
   * Check if a pause has started so no more events run in this frame
   *
   * @return {Boolean}
   */
  shouldStopProcessingEvents = () => {
    return Boolean(this.state.pauseUntil) || this.state.eventLoopPaused;
  }

  /**
   * Check if an event should run without waiting for a delay
   *
   * @param {Object} currentEvent Event to check
   * @return {Boolean}
   */
  isInstantEvent = (currentEvent) => {
    const eventArgs = currentEvent.eventArgs || {};

    if(eventArgs.skipDelay || currentEvent.eventName === EVENT_NAMES.CLEAR) {
      return true;
    }

    if(!this.options.onlyDelayVisibleChanges) {
      return false;
    }

    return !this.changesVisibleText(currentEvent);
  }

  /**
   * Check if an event adds or removes a visible character
   *
   * @param {Object} currentEvent Event to check
   * @return {Boolean}
   */
  changesVisibleText = ({ eventName, eventArgs }) => {
    switch(eventName) {
      case EVENT_NAMES.TYPE_CHARACTER:
      case EVENT_NAMES.PASTE_STRING:
        return true;

      case EVENT_NAMES.ADD_HTML_TAG_ELEMENT:
        return isVoidElement(eventArgs.node);

      case EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE:
        return this.isLastVisibleNodeACharacter();

      default:
        return false;
    }
  }

  /**
   * Check if the last visible node is a character instead of an empty HTML tag
   *
   * @return {Boolean}
   */
  isLastVisibleNodeACharacter = () => {
    const { visibleNodes } = this.state;
    const lastVisibleNode = visibleNodes[visibleNodes.length - 1];

    if(!lastVisibleNode) {
      return false;
    }

    if(lastVisibleNode.type === VISIBLE_NODE_TYPES.TEXT_NODE) {
      return true;
    }

    return isVoidElement(lastVisibleNode.node);
  }

  /**
   * Get the delay in ms to wait before running an event
   *
   * @param {Object} currentEvent Event to get the delay for
   * @return {Number}
   */
  getEventDelay = ({ eventName }) => {
    const isDeleteEvent = (
      eventName === EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE ||
      eventName === EVENT_NAMES.REMOVE_CHARACTER
    );

    if(isDeleteEvent) {
      return this.getDelayFromSpeed(this.options.deleteSpeed, NATURAL_DELETE_DELAY);
    }

    return this.getDelayFromSpeed(this.options.delay, NATURAL_TYPING_DELAY);
  }

  /**
   * Get the delay in ms from a speed value
   *
   * @param {String|Number|Object} speed 'natural', number or { min, max } range
   * @param {Object} naturalDelay Range to use for 'natural'
   * @return {Number}
   */
  getDelayFromSpeed = (speed, naturalDelay) => {
    if(speed === 'natural') {
      return getRandomInteger(naturalDelay.min, naturalDelay.max);
    }

    if(isDelayRange(speed)) {
      return getRandomInteger(speed.min, speed.max);
    }

    return speed;
  }

  /**
   * Run a single event from the queue
   *
   * @param {Object} currentEvent Event to run
   * @param {Number} delay Delay used for this event
   */
  processEvent = (currentEvent, delay) => {
    // Get current event args
    const { eventName, eventArgs } = currentEvent;

    this.logInDevMode({ currentEvent, state: this.state, delay });

    // Run item from event loop
    switch(eventName) {
      case EVENT_NAMES.PASTE_STRING:
      case EVENT_NAMES.TYPE_CHARACTER: {
        this.addTextToPage(eventName, eventArgs);
        break;
      }

      case EVENT_NAMES.REMOVE_CHARACTER: {
        this.state.eventQueue.unshift({
          eventName: EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE,
          eventArgs: { removingCharacterNode: true },
        });
        break;
      }

      case EVENT_NAMES.PAUSE_FOR: {
        const { ms } = currentEvent.eventArgs;
        this.state.pauseUntil = Date.now() + parseInt(ms);
        break;
      }

      case EVENT_NAMES.CALL_FUNCTION: {
        const { cb, thisArg } = currentEvent.eventArgs;

        cb.call(thisArg, {
          elements: this.state.elements,
        });

        break;
      }

      case EVENT_NAMES.ADD_HTML_TAG_ELEMENT: {
        const { node, parentNode } = currentEvent.eventArgs;

        if(!parentNode) {
          this.state.elements.wrapper.appendChild(node);
        } else {
          parentNode.appendChild(node);
        }

        this.state.visibleNodes.push({
          type: VISIBLE_NODE_TYPES.HTML_TAG,
          node,
          parentNode: parentNode || this.state.elements.wrapper,
        });
        break;
      }

      case EVENT_NAMES.REMOVE_ALL: {
        this.addRemoveAllEventsToQueue(eventArgs);
        break;
      }

      case EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE: {
        const { removingCharacterNode } = currentEvent.eventArgs;

        if(this.state.visibleNodes.length) {
          const { type, node } = this.removeLastVisibleNode();

          // Remove extra node as current deleted one is just an empty wrapper node
          if(type === VISIBLE_NODE_TYPES.HTML_TAG && removingCharacterNode && !isVoidElement(node)) {
            this.state.eventQueue.unshift({
              eventName: EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE,
              eventArgs: { removingCharacterNode: true },
            });
          }
        }
        break;
      }

      case EVENT_NAMES.CLEAR: {
        this.removeAllVisibleNodes();
        break;
      }

      case EVENT_NAMES.CHANGE_DELETE_SPEED: {
        this.options.deleteSpeed = currentEvent.eventArgs.speed;
        break;
      }

      case EVENT_NAMES.CHANGE_DELAY: {
        this.options.delay = currentEvent.eventArgs.delay;
        break;
      }

      case EVENT_NAMES.CHANGE_CURSOR: {
        this.options.cursor = currentEvent.eventArgs.cursor;
        this.state.elements.cursor.innerHTML = currentEvent.eventArgs.cursor;
        break;
      }

      default: {
        break;
      }
    }

    this.addToCalledEvents(currentEvent);
  }

  /**
   * Save an event so it can run again when looping
   *
   * @param {Object} currentEvent Event that has run
   */
  addToCalledEvents = (currentEvent) => {
    if(!this.options.loop) {
      return;
    }

    const isTemporary = currentEvent.eventArgs && currentEvent.eventArgs.temp;

    if(currentEvent.eventName === EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE || isTemporary) {
      return;
    }

    this.state.calledEvents.push(currentEvent);
  }

  /**
   * Add typed or pasted text to the page
   *
   * @param {String} eventName Name of the event
   * @param {Object} eventArgs Event args with the character and node
   */
  addTextToPage = (eventName, eventArgs) => {
    if(this.canShareTextNodes(eventName)) {
      this.addSharedText(eventName, eventArgs);
      return;
    }

    this.addTextNode(eventArgs);
  }

  /**
   * Check if text can be added to a text node shared with other characters
   *
   * @param {String} eventName Name of the event
   * @return {Boolean}
   */
  canShareTextNodes = (eventName) => {
    const { onCreateTextNode, mergeTextNodes, pasteAsCharacters } = this.options;

    if(typeof onCreateTextNode === 'function') {
      return false;
    }

    const isPaste = eventName === EVENT_NAMES.PASTE_STRING;

    return mergeTextNodes || (pasteAsCharacters && isPaste);
  }

  /**
   * Add a new text node for a character
   *
   * @param {Object} eventArgs Event args with the character and node
   */
  addTextNode = ({ character, node }) => {
    const textNode = this.createTextNode(character);

    if(textNode) {
      this.getParentNode(node).appendChild(textNode);
    }

    this.state.visibleNodes.push({
      type: VISIBLE_NODE_TYPES.TEXT_NODE,
      character,
      node: textNode,
    });
  }

  /**
   * Create a text node, using the onCreateTextNode option when it is set
   *
   * @param {String} character Character to create a text node for
   * @return {Text|null}
   */
  createTextNode = (character) => {
    const textNode = document.createTextNode(character);
    const { onCreateTextNode } = this.options;

    if(typeof onCreateTextNode === 'function') {
      return onCreateTextNode(character, textNode);
    }

    return textNode;
  }

  /**
   * Add text to a text node that can be shared with other characters
   *
   * @param {String} eventName Name of the event
   * @param {Object} eventArgs Event args with the character and node
   */
  addSharedText = (eventName, { character, node }) => {
    const textNode = this.getTextNodeToAddTo(this.getParentNode(node));
    const characters = this.getCharactersToTrack(eventName, character);

    textNode.appendData(character);

    characters.forEach(trackedCharacter => {
      this.state.visibleNodes.push({
        type: VISIBLE_NODE_TYPES.TEXT_NODE,
        character: trackedCharacter,
        node: textNode,
        isSharedTextNode: true,
      });
    });
  }

  /**
   * Get the text node to add text to, creating a new one when needed
   *
   * @param {HTMLElement} parentNode Node the text is added inside of
   * @return {Text}
   */
  getTextNodeToAddTo = (parentNode) => {
    const lastTextNode = this.getLastSharedTextNode(parentNode);

    if(this.options.mergeTextNodes && lastTextNode) {
      return lastTextNode;
    }

    const textNode = document.createTextNode('');
    parentNode.appendChild(textNode);

    return textNode;
  }

  /**
   * Get the last shared text node when it is still the last child of the parent node
   *
   * @param {HTMLElement} parentNode Node the text is added inside of
   * @return {Text|null}
   */
  getLastSharedTextNode = (parentNode) => {
    const { visibleNodes } = this.state;
    const lastVisibleNode = visibleNodes[visibleNodes.length - 1];

    if(!lastVisibleNode || !lastVisibleNode.isSharedTextNode) {
      return null;
    }

    if(parentNode.lastChild !== lastVisibleNode.node) {
      return null;
    }

    return lastVisibleNode.node;
  }

  /**
   * Get the characters to save as visible nodes so they can be deleted
   *
   * @param {String} eventName Name of the event
   * @param {String} character Character or pasted string
   * @return {Array}
   */
  getCharactersToTrack = (eventName, character) => {
    const isPaste = eventName === EVENT_NAMES.PASTE_STRING;

    if(isPaste && this.options.pasteAsCharacters) {
      return this.splitString(character);
    }

    return [character];
  }

  /**
   * Get the node to add text inside of
   *
   * @param {HTMLElement} node Node passed to typeString or pasteString
   * @return {HTMLElement}
   */
  getParentNode = (node) => {
    return node || this.state.elements.wrapper;
  }

  /**
   * Add events to the start of the queue to remove every visible node
   *
   * @param {Object} eventArgs Event args with the speed and isLoopStart values
   */
  addRemoveAllEventsToQueue = ({ speed, isLoopStart }) => {
    if(isLoopStart && this.options.deleteOnLoop === false) {
      return;
    }

    const removeEvents = this.createRemoveEvents(this.state.visibleNodes.length);

    if(isValueMissing(speed)) {
      this.state.eventQueue.unshift(...removeEvents);
      return;
    }

    this.state.eventQueue.unshift(
      this.createChangeDeleteSpeedEvent(speed),
      ...removeEvents,
      this.createChangeDeleteSpeedEvent(this.options.deleteSpeed),
    );
  }

  /**
   * Create events to remove the last visible node
   *
   * @param {Number} amount Number of events to create
   * @return {Array}
   */
  createRemoveEvents = (amount) => {
    return Array.from({ length: amount }, () => ({
      eventName: EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE,
      eventArgs: { removingCharacterNode: false },
    }));
  }

  /**
   * Create a temporary event to change the delete speed
   *
   * @param {String|Number|Object} speed New delete speed
   * @return {Object}
   */
  createChangeDeleteSpeedEvent = (speed) => {
    return {
      eventName: EVENT_NAMES.CHANGE_DELETE_SPEED,
      eventArgs: { speed, temp: true },
    };
  }

  /**
   * Remove every visible node straight away
   */
  removeAllVisibleNodes = () => {
    while(this.state.visibleNodes.length) {
      this.removeLastVisibleNode();
    }
  }

  /**
   * Remove the last visible node from the page and call the onRemoveNode option
   *
   * @return {Object} Visible node that was removed
   */
  removeLastVisibleNode = () => {
    const lastVisibleNode = this.state.visibleNodes.pop();
    const { node, character } = lastVisibleNode;

    if(typeof this.options.onRemoveNode === 'function') {
      this.options.onRemoveNode({
        node,
        character,
      });
    }

    this.removeVisibleNodeFromPage(lastVisibleNode);

    return lastVisibleNode;
  }

  /**
   * Remove a visible node from the page. Characters inside a shared
   * text node are removed from the end of the text node.
   *
   * @param {Object} visibleNode Visible node to remove
   */
  removeVisibleNodeFromPage = ({ node, character, isSharedTextNode }) => {
    const hasOtherCharacters = isSharedTextNode && node.data.length > character.length;

    if(hasOtherCharacters) {
      node.deleteData(node.data.length - character.length, character.length);
      return;
    }

    if(node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  /**
   * Log a message in development mode
   *
   * @param {Mixed} message Message or item to console.log
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  logInDevMode(message) {
    if(this.options.devMode) {
      console.log(message);
    }
  }
}

export default Typewriter;
