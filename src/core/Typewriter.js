import raf from 'raf';
import './Typewriter.scss';

class Typewriter {
  eventNames = {
    TYPE_CHARACTER: 'TYPE_CHARACTER',
    REMOVE_CHARACTER: 'REMOVE_CHARACTER',
    REMOVE_ALL: 'REMOVE_ALL',
    PAUSE_FOR: 'PAUSE_FOR',
    CALL_FUNCTION: 'CALL_FUNCTION',
  }

  state = {
    cursorAnimation: null,
    lastFrameTime: null,
    pauseUntil: null,
    eventQueue: [],
    eventLoop: null,
    eventLoopPaused: false,
    calledEvents: [],
    visibleString: '',
    elements: {
      container: null,
      wrapper: document.createElement('span'),
      cursor: document.createElement('span'),
    },
  }

  options = {
    strings: false,
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
   * Start typewriter effect by typing
   * out all strings provided
   * 
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  typeOutAllStrings = () => {
    const allCharacters = this.getStringsAsCharacters();

    allCharacters.forEach(characters => {
      this.typeCharacters(characters);
      this.pauseFor(1500);
      this.removeCharacters(characters);
      this.pauseFor(1500);
    });

		return this;
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
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  pauseFor = (ms) => {
    this.addEventToQueue(this.eventNames.PAUSE_FOR, { ms });

    return this;
  }

  /**
   * Adds string characters to event queue for typing
   * 
   * @param {String} string String to type
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  typeString = (string) => {
    const characters = string.split('');

    characters.forEach(character => {
      this.addEventToQueue(this.eventNames.TYPE_CHARACTER, { character });
    });

    return this;
  }

  /**
   * Add delete all characters to event queue
   * 
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  deleteAll = () => {
    this.addEventToQueue(this.eventNames.REMOVE_ALL, null);

    return this;
  }

  /**
   * Add delete character to event queue for amount of characters provided
   * 
   * @param {Number} amount Number of characters to remove
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
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  typeCharacters = (characters) => {
    characters.forEach(character => {
      this.addEventToQueue(this.eventNames.TYPE_CHARACTER, { character });
    });
  }

  /**
   * Add remove character event for each character
   * 
   * @param {Array} characters Array of characters
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  removeCharacters = (characters) => {
    characters.forEach(() => {
      this.addEventToQueue(this.eventNames.REMOVE_CHARACTER);
    });
  }

  /**
   * Add an event to the event queue
   * 
   * @param {String}  eventName Name of the event
   * @param {String}  eventArgs Arguments to pass to event callback
   * @param {Boolean} prepend   Prepend to begining of event queue
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  addEventToQueue = (eventName, eventArgs, prepend = false) => {
    const eventItem = {
      eventName,
      eventArgs,
    };

    if(prepend) {
      this.state.eventQueue.unshift(eventItem);
    } else {
      this.state.eventQueue.push(eventItem);
    }
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
    
    const delay = this.options.delay === 'natural' ? this.getRandomInteger(100, 200) : this.options.delay;

    // Check if frame should run or be
    // skipped based on fps interval
    if(delta <= delay) {
      return;
    }

    // Get first event from queue
    const currentEvent = this.state.eventQueue.shift();
    let visibleString = this.state.visibleString;

    // Get current event args
    const { eventName, eventArgs } = currentEvent;

    this.logInDevMode({ currentEvent, state: this.state });

    // Run item from event loop
    switch(eventName) {
      case this.eventNames.TYPE_CHARACTER: {
        const { character } = eventArgs;
        visibleString = `${visibleString}${character}`;
        break;
      }

      case this.eventNames.REMOVE_CHARACTER: {
        visibleString = visibleString.slice(0, -1);
        break;
      }

      case this.eventNames.PAUSE_FOR: {
        this.state.pauseUntil = Date.now() + parseInt(eventArgs.ms);
        break;
      }

      case this.eventNames.REMOVE_ALL: {
        // Add an event item for each character of visible string
        const characters = visibleString.split('');

        // Add event item to remove each character
        characters.reverse().forEach(() => {
          this.addEventToQueue(this.eventNames.REMOVE_CHARACTER, null, true);
        });

        break;
      }

      case this.eventNames.CALL_FUNCTION: {
        const { cb, thisArg } = currentEvent.eventArgs;

        cb.call(thisArg, {
          visibleString,
          elements: this.state.elements,
        });

        break;
      }

      default: {
        break;
      }
    }

    if(visibleString !== this.state.visibleString) {
      this.state.visibleString = visibleString;
      this.state.elements.wrapper.innerText = this.state.visibleString;
    }

    // Add que item to called queue if we are looping
    // Skip for remove all event as it just creates new event items to remove characters
    if(this.options.loop && currentEvent.eventName !== this.eventNames.REMOVE_ALL) {
      this.state.calledEvents.push(currentEvent);
    }

    // Set last frame time so it can be used to calculate next frame
    this.state.lastFrameTime = nowTime;
  }

  /**
   * Get all current provided strings as character arrays
   * 
   * Given:
   * ['apple', 'bannana']
   * 
   * Output:
   * [ ['a', 'p', 'p', 'l', 'e'], ['b', 'a', 'n', 'n', 'a', 'n', 'a'] ]
   * 
   * @return {Array} Two dimentional array of characters
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  getStringsAsCharacters = () => {
    if(typeof this.options.strings === 'string') {
      return [this.options.strings.split('')];
    }

    return this.options.strings.map(string => {
      if(typeof string !== 'string') {
        return false;
      }

      return string.split('');
    });
  }

  /**
   * Return a random integer between min/max values
   * 
   * @param {Number} min Minimum number to generate
   * @param {Number} max Maximum number to generate
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  getRandomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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