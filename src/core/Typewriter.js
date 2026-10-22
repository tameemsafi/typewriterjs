import {
  doesStringContainHTMLTag,
  getDOMElementFromString,
  getRandomInteger,
  addStyles,
  isValueMissing,
  isVoidElement,
  requestFrame,
  cancelFrame,
} from './../utils';
import {
  EVENT_NAMES,
  VISIBLE_NODE_TYPES,
  STYLES,
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
  }

  constructor(container, options) {
    if(container) {
      if(typeof container === 'string') {
        const containerElement = document.querySelector(container);
  
        if(!containerElement) {
          throw new Error('Could not find container element');
        }
  
        this.state.elements.container = containerElement;
      } else {
        this.state.elements.container = container;
      }
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
    this.addEventToQueue(EVENT_NAMES.REMOVE_ALL, null, true);

    if(window && !window.___TYPEWRITER_JS_STYLES_ADDED___ && !this.options.skipAddStyles) {
      addStyles(STYLES);
      window.___TYPEWRITER_JS_STYLES_ADDED___ = true;
    }

    if(this.options.autoStart === true && this.options.strings) {
      this.typeOutAllStrings().start();
		}
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

    this.state.elements.cursor.innerHTML = this.options.cursor;
    this.state.elements.container.innerHTML = '';

    this.state.elements.container.appendChild(this.state.elements.wrapper);
    this.state.elements.container.appendChild(this.state.elements.cursor);
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

    this.options.strings.forEach(string => {
      this.typeString(string)
        .pauseFor(this.options.pauseFor)
        .deleteAll(this.options.deleteSpeed);
    });

    return this;
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
      const { stringSplitter } = this.options || {};
      const characters = typeof stringSplitter === 'function' ? stringSplitter(string) : string.split('');
      this.typeCharacters(characters, node);
    }

    return this;
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
      return this.typeOutHTMLString(string, node, true);
    }

    return this.pasteText(string, node);
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
    if(!cursor) {
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
   * Run the event loop and do anything inside of the queue
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  runEventLoop = () => {
    if(!this.state.lastFrameTime) {
      this.state.lastFrameTime = Date.now();
    }

    // Setup variables to calculate if this frame should run
    const nowTime = Date.now();
    const { maxCatchUpDelta } = this.options;
    const canCatchUp = typeof maxCatchUpDelta === 'number' && maxCatchUpDelta > 0;
    let delta = nowTime - this.state.lastFrameTime;

    // Cap the elapsed time so returning to an inactive tab does not freeze the page
    if(canCatchUp) {
      delta = Math.min(delta, maxCatchUpDelta);
    }

    if(!this.state.eventQueue.length) {
      if(!this.options.loop) {
        return;
      }

      // Reset event queue if we are looping
      this.state.eventQueue = [...this.state.calledEvents];
      this.state.calledEvents = [];
      this.options = {...this.state.initialOptions};
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

    // Make a clone of event queue
    const eventQueue = [...this.state.eventQueue];
    let processedAny = false;

    // Without catch up only a single event runs per frame
    while(eventQueue.length && (canCatchUp || !processedAny)) {
      // Get first event from queue
      const currentEvent = eventQueue.shift();

      // Setup delay variable
      let delay = 0;

      // Check if frame should run or be
      // skipped based on fps interval
      if(
        currentEvent.eventName === EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE ||
        currentEvent.eventName === EVENT_NAMES.REMOVE_CHARACTER
      ) {
        delay = this.options.deleteSpeed === 'natural' ? getRandomInteger(40, 80) : this.options.deleteSpeed;
      } else {
        delay = this.options.delay === 'natural' ? getRandomInteger(120, 160) : this.options.delay;
      }

      if(delta <= delay) {
        eventQueue.unshift(currentEvent);
        break;
      }

      this.processEvent(currentEvent, eventQueue, delay);

      delta -= delay;
      processedAny = true;

      // A pause event stops processing until pauseUntil has passed
      if(this.state.pauseUntil) {
        break;
      }
    }

    if(processedAny) {
      // Replace state event queue with cloned queue
      this.state.eventQueue = eventQueue;

      // Set last frame time so it can be used to calculate next frame,
      // keeping leftover time when catching up
      this.state.lastFrameTime = canCatchUp ? nowTime - delta : nowTime;
    }
  }

  /**
   * Run a single event from the queue
   *
   * @param {Object} currentEvent Event to run
   * @param {Array} eventQueue Working copy of the queue, may be modified
   * @param {Number} delay Delay used for this event
   */
  processEvent = (currentEvent, eventQueue, delay) => {
    // Get current event args
    const { eventName, eventArgs } = currentEvent;

    this.logInDevMode({ currentEvent, state: this.state, delay });

    // Run item from event loop
    switch(eventName) {
      case EVENT_NAMES.PASTE_STRING:
      case EVENT_NAMES.TYPE_CHARACTER: {
        const { character, node } = eventArgs;
        const textNode = document.createTextNode(character);

        let textNodeToUse = textNode

        if(this.options.onCreateTextNode && typeof this.options.onCreateTextNode === 'function') {
          textNodeToUse = this.options.onCreateTextNode(character, textNode)
        }

        if(textNodeToUse) {
          if(node) {
            node.appendChild(textNodeToUse);
          } else {
            this.state.elements.wrapper.appendChild(textNodeToUse);
          }
        }

        this.state.visibleNodes.push({
          type: VISIBLE_NODE_TYPES.TEXT_NODE,
          character,
          node: textNodeToUse,
        });

        break;
      }

      case EVENT_NAMES.REMOVE_CHARACTER: {
        eventQueue.unshift({
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
        const { visibleNodes } = this.state;
        const { speed } = eventArgs;
        const removeAllEventItems = [];

        // Change speed before deleteing
        if(speed) {
          removeAllEventItems.push({
            eventName: EVENT_NAMES.CHANGE_DELETE_SPEED,
            eventArgs: { speed, temp: true },
          });
        }

        for(let i = 0, length = visibleNodes.length; i < length; i++) {
          removeAllEventItems.push({
            eventName: EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE,
            eventArgs: { removingCharacterNode: false },
          });
        }

        // Change speed back to normal after deleteing
        if(speed) {
          removeAllEventItems.push({
            eventName: EVENT_NAMES.CHANGE_DELETE_SPEED,
            eventArgs: { speed: this.options.deleteSpeed, temp: true },
          });
        }

        eventQueue.unshift(...removeAllEventItems);

        break;
      }

      case EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE: {
        const { removingCharacterNode } = currentEvent.eventArgs;

        if(this.state.visibleNodes.length) {
          const { type, node, character } = this.state.visibleNodes.pop();

          if(this.options.onRemoveNode && typeof this.options.onRemoveNode === 'function') {
            this.options.onRemoveNode({
              node,
              character,
            })
          }

          if(node && node.parentNode) {
            node.parentNode.removeChild(node);
          }

          // Remove extra node as current deleted one is just an empty wrapper node
          if(type === VISIBLE_NODE_TYPES.HTML_TAG && removingCharacterNode && !isVoidElement(node)) {
            eventQueue.unshift({
              eventName: EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE,
              eventArgs: { removingCharacterNode: true },
            });
          }
        }
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

    // Add que item to called queue if we are looping
    if(this.options.loop) {
      if(
        currentEvent.eventName !== EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE &&
        !(currentEvent.eventArgs && currentEvent.eventArgs.temp)
      ) {
        this.state.calledEvents.push(currentEvent);
      }
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
