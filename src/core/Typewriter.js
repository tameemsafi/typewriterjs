import raf from 'raf';
import {
  doesStringContainHTMLTag,
  getDOMElementFromString,
  getRandomInteger,
} from './../utils';
import './Typewriter.scss';

class Typewriter {
  eventNames = {
    TYPE_CHARACTER: 'TYPE_CHARACTER',
    REMOVE_CHARACTER: 'REMOVE_CHARACTER',
    REMOVE_ALL: 'REMOVE_ALL',
    REMOVE_LAST_VISIBLE_NODE: 'REMOVE_LAST_VISIBLE_NODE',
    PAUSE_FOR: 'PAUSE_FOR',
    CALL_FUNCTION: 'CALL_FUNCTION',
    ADD_HTML_TAG_ELEMENT: 'ADD_HTML_TAG_ELEMENT',
    REMOVE_HTML_TAG_ELEMENT: 'REMOVE_HTML_TAG_ELEMENT',
  }

  visibleNodeTypes = {
    HTML_TAG: 'HTML_TAG',
    TEXT_NODE: 'TEXT_NODE',
  }

  state = {
    cursorAnimation: null,
    lastFrameTime: null,
    pauseUntil: null,
    eventQueue: [],
    eventLoop: null,
    eventLoopPaused: false,
    reverseCalledEvents: [],
    calledEvents: [],
    visibleNodes: [],
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
    loop: false,
    autoStart: false,
    devMode: false,
    wrapperClassName: 'Typewriter__wrapper',
    cursorClassName: 'Typewriter__cursor',
  }

  constructor(container, options) {
    if(!container) {
      throw new Error('No container element was provided');
      return;
    }

    if(typeof container === 'string') {
      const containerElement = document.querySelector(container);

      if(!containerElement) {
        throw new Error('Could not find container element');
        return;
      }

      this.state.elements.container = containerElement;
    } else {
      this.state.elements.container = container;
    }

    if(options) {
      this.options = {
        ...this.options,
        ...options
      };
    }

    this.init();
  }

  init() {
    this.setupWrapperElement();

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
      raf.cancel(this.state.eventLoop);
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
    this.addEventToQueue(this.eventNames.PAUSE_FOR, { ms });

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
        .pauseFor(1500);
      return this;
    }

    this.options.strings.forEach((string, index) => {
      this.typeString(string);

      if(index !== this.options.strings.length - 1) {
        this.typeString(' ');
      }

      this.pauseFor(1500);
    });

    return this;
  }

  /**
   * Adds string characters to event queue for typing
   * 
   * @param {String} string String to type
   * @return {Typewriter}
   * 
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  typeString = (string) => {
    if(doesStringContainHTMLTag(string)) {
      
      return this.typeOutHTMLString(string);
    }

    const characters = string.split('');

    characters.forEach(character => {
      this.addEventToQueue(this.eventNames.TYPE_CHARACTER, { character });
    });

    return this;
  }

  /**
   * Type out a string which is wrapper around HTML tag
   * 
   * @param {String} string String to type
   * @return {Typewriter}
   * 
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  typeOutHTMLString = (string) => {
    const htmlTagElement = getDOMElementFromString(string);
    const text = htmlTagElement.innerText;
    const characters = text.split('');

    if(!characters.length) {
      return this;
    }

    // Reset innerText of HTML element
    htmlTagElement.innerText = '';

    // Add event queue item to insert HTML tag before typing characters
    this.addEventToQueue(this.eventNames.ADD_HTML_TAG_ELEMENT, {
      htmlTagElement,
    });

    characters.forEach(character => {
      this.addEventToQueue(this.eventNames.TYPE_CHARACTER, {
        character,
        htmlTagElement,
      });
    });
    
    return this;
  }

  /**
   * Add delete all characters to event queue
   * 
   * @return {Typewriter}
   * 
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  deleteAll = () => {
    this.addEventToQueue(this.eventNames.REMOVE_ALL, { removingCharacterNode: false });

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
    for(let i = 0; i < amount; i++) {
      this.addEventToQueue(this.eventNames.REMOVE_CHARACTER);
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
    if(typeof cb === 'function') {
      this.addEventToQueue(this.eventNames.CALL_FUNCTION, { cb, thisArg });
    }

    return this;
  }
  
  /**
   * Add type character event for each character
   * 
   * @param {Array} characters Array of characters
   * @return {Typewriter}
   * 
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  typeCharacters = (characters) => {
    characters.forEach(character => {
      this.addEventToQueue(this.eventNames.TYPE_CHARACTER, { character });
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
    characters.forEach(() => {
      this.addEventToQueue(this.eventNames.REMOVE_CHARACTER);
    });
    return this;
  }

  /**
   * Add an event to the event queue
   * 
   * @param {String}  eventName Name of the event
   * @param {String}  eventArgs Arguments to pass to event callback
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
   * Add an event to reverse called events used for looping
   * 
   * @param {String}  eventName Name of the event
   * @param {String}  eventArgs Arguments to pass to event callback
   * @param {Boolean} prepend   Prepend to begining of event queue
   * @return {Typewriter}
   * 
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  addReverseCalledEvent = (eventName, eventArgs, prepend = false) => {
    const { loop } = this.options;

    if(!loop) {
      return this;
    }

    return this.addEventToStateProperty(
      eventName,
      eventArgs,
      prepend,
      'reverseCalledEvents'
    );
  }

  /**
   * Add an event to correct state property
   * 
   * @param {String}  eventName Name of the event
   * @param {String}  eventArgs Arguments to pass to event callback
   * @param {Boolean} prepend   Prepend to begining of event queue
   * @param {String}  property  Property name of state object
   * @return {Typewriter}
   * 
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  addEventToStateProperty = (eventName, eventArgs, prepend = false, property) => {
    const eventItem = {
      eventName,
      eventArgs,
    };

    if(prepend) {
      this.state[property] = [
        eventItem,
        ...this.state[property],
      ];
    } else {
      this.state[property] = [
        ...this.state[property],
        eventItem,
      ];
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
    const delta = nowTime - this.state.lastFrameTime;

    if(!this.state.eventQueue.length) {
      if(!this.options.loop) {
        return;
      }
      
      // Reset event queue if we are looping
      this.state.eventQueue = this.state.calledEvents;
      this.state.calledEvents = [];
      this.addEventToQueue(this.eventNames.REMOVE_ALL, null, true);
    }

    // Request next frame
    this.state.eventLoop = raf(this.runEventLoop);

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
    }
    
    const delay = this.options.delay === 'natural' ? getRandomInteger(100, 200) : this.options.delay;

    // Check if frame should run or be
    // skipped based on fps interval
    if(delta <= delay) {
      return;
    }

    // Get first event from queue
    const currentEvent = this.state.eventQueue.shift();

    // Get current event args
    const { eventName, eventArgs } = currentEvent;

    this.logInDevMode({ currentEvent, state: this.state });

    // Run item from event loop
    switch(eventName) {
      case this.eventNames.TYPE_CHARACTER: {
        const { character, htmlTagElement } = eventArgs;
        const textNode = document.createTextNode(character);

        if(htmlTagElement) {
          htmlTagElement.appendChild(textNode);
        } else {
          this.state.elements.wrapper.appendChild(textNode);
        }

        this.state.visibleNodes = [
          ...this.state.visibleNodes,
          {
            type: this.visibleNodeTypes.TEXT_NODE,
            node: textNode,
          },
        ];

        break;
      }

      case this.eventNames.REMOVE_CHARACTER: {
        this.addEventToQueue(this.eventNames.REMOVE_LAST_VISIBLE_NODE, { removingCharacterNode: true }, true);
        break;
      }

      case this.eventNames.PAUSE_FOR: {
        const { ms } = currentEvent.eventArgs;
        this.state.pauseUntil = Date.now() + parseInt(ms);
        break;
      }

      case this.eventNames.CALL_FUNCTION: {
        const { cb, thisArg } = currentEvent.eventArgs;

        cb.call(thisArg, {
          elements: this.state.elements,
        });

        break;
      }

      case this.eventNames.ADD_HTML_TAG_ELEMENT: {
        const { htmlTagElement } = currentEvent.eventArgs;
        this.state.elements.wrapper.appendChild(htmlTagElement);
        this.state.visibleNodes = [
          ...this.state.visibleNodes,
          {
            type: this.visibleNodeTypes.HTML_TAG,
            node: htmlTagElement,
          },
        ];
        break;
      }

      case this.eventNames.REMOVE_ALL: {
        const { visibleNodes } = this.state;

        for(let i = 0, length = visibleNodes.length; i < length; i++) {
          this.addEventToQueue(this.eventNames.REMOVE_LAST_VISIBLE_NODE, { removingCharacterNode: false }, true);
        }

        break;
      }

      case this.eventNames.REMOVE_LAST_VISIBLE_NODE: {
        const { removingCharacterNode } = currentEvent.eventArgs;

        if(this.state.visibleNodes.length) {
          const { type, node } = this.state.visibleNodes.pop();
          node.remove();

          // If we are removing characters only then remove one more
          // item if current element was wrapper html tag
          if(type === this.visibleNodeTypes.HTML_TAG && removingCharacterNode) {
            this.addEventToQueue(this.eventNames.REMOVE_LAST_VISIBLE_NODE, null, true);
          }
        }
        break;
      }

      default: {
        break;
      }
    }

    // Add que item to called queue if we are looping
    if(this.options.loop) {
      if(
        currentEvent.eventName !== this.eventNames.REMOVE_ALL ||
        currentEvent.eventName !== this.eventNames.REMOVE_LAST_VISIBLE_NODE
      ) {
        this.state.calledEvents.push(currentEvent);
      }
    }

    // Set last frame time so it can be used to calculate next frame
    this.state.lastFrameTime = nowTime;
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