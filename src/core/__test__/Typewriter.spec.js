import FakeTimers from '@sinonjs/fake-timers';
import requestFrame from '../../utils/request-frame';
import cancelFrame from '../../utils/cancel-frame';
import Typewriter from '../Typewriter';
import {
  EVENT_NAMES,
  VISIBLE_NODE_TYPES,
  STYLES,
} from '../constants';

jest.mock('../../utils/request-frame', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../utils/cancel-frame', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('Typewriter', () => {
  let wrapperElement;
  let clock;
  let styleNode;

  beforeEach(() => {
    window.___TYPEWRITER_JS_STYLES_ADDED___ = false;
    wrapperElement = document.createElement('div');
    wrapperElement.id = 'test';
    document.body.appendChild(wrapperElement);
    document.head.appendChild = jest.fn(node => styleNode = node);
    clock = FakeTimers.install();
  });
  
  afterEach(() => {
    styleNode = undefined;
    clock = clock.uninstall();
    jest.clearAllMocks();
  });

  it('should have added styles correctly', () => {
    new Typewriter(wrapperElement);
    expect(document.head.appendChild).toHaveBeenCalledTimes(1);
    expect(styleNode.innerHTML).toEqual(STYLES);
    expect(window.___TYPEWRITER_JS_STYLES_ADDED___).toEqual(true);
  });

  it('should have added styles only once', () => {
    new Typewriter(wrapperElement);
    new Typewriter(wrapperElement);
    new Typewriter(wrapperElement);
    expect(document.head.appendChild).toHaveBeenCalledTimes(1);
    expect(styleNode.innerHTML).toEqual(STYLES);
    expect(window.___TYPEWRITER_JS_STYLES_ADDED___).toEqual(true);
  });

  it('should not add styles when skip option is passed', () => {
    new Typewriter(wrapperElement, { skipAddStyles: true });
    expect(document.head.appendChild).toHaveBeenCalledTimes(0);
    expect(styleNode).toEqual(undefined);
    expect(window.___TYPEWRITER_JS_STYLES_ADDED___).toEqual(false);
  });

  it('shoud setup correctly with default settings', () => {
    const instance = new Typewriter('#test');
    expect(instance.state).toMatchSnapshot();
    expect(instance.options).toMatchSnapshot();
  });

  it('shoud setup correctly with custom options', () => {
    const options = {
      strings: ['hello', 'world'],
      cursor: '+',
      delay: 100,
      deleteSpeed: 500,
      loop: true,
      autoStart: true,
      devMode: true,
      skipAddStyles: true,
      wrapperClassName: 'wrapper-class',
      cursorClassName: 'cursor-class',
      stringSplitter: null,
      pauseFor: 1500,
      onCreateTextNode: jest.fn(),
      onRemoveNode: jest.fn(),
      maxCatchUpDelta: 1000,
      parseHTML: false,
      initialText: null,
      keepLastString: true,
      deleteOnLoop: false,
      cursorBlink: false,
      useGraphemeSplitter: true,
      mergeTextNodes: true,
      pasteAsCharacters: true,
      onlyDelayVisibleChanges: true,
    };

    const instance = new Typewriter('#test', options);
    expect(instance.options).toEqual(options);
  });

  it('should throw error if container wih selector is not found', () => {
    expect(() => {
      new Typewriter('.hello');
    }).toThrow('Could not find container element: .hello');
  });

  it('should throw a clear error if the container is not an html element', () => {
    expect(() => {
      new Typewriter({ length: 1 });
    }).toThrow('Container must be an HTML element or a CSS selector string');
  });

  it('should hide the cursor from screen readers', () => {
    const instance = new Typewriter(wrapperElement);
    expect(instance.state.elements.cursor.getAttribute('aria-hidden')).toEqual('true');
  });

  it('should keep the cursor blinking by default', () => {
    const instance = new Typewriter(wrapperElement);
    expect(instance.state.elements.cursor.style.animation).toEqual('');
  });

  it('should stop the cursor blinking when cursorBlink is false', () => {
    const instance = new Typewriter(wrapperElement, { cursorBlink: false });
    expect(instance.state.elements.cursor.style.animation).toEqual('none');
  });

  it('should correctly setup container element with selector', () => {
    const instance = new Typewriter('#test');
    expect(instance.state.elements.container).toMatchSnapshot();
  });

  it('should correctly setup container element with element', () => {
    const instance = new Typewriter(wrapperElement);
    expect(instance.state.elements.container).toMatchSnapshot();
  });

  it('should correctly setup queue if autostart is set to true', () => {
    const instance = new Typewriter(wrapperElement, {
      strings: ['Hello', 'world!'],
      autoStart: true,
    })

    expect(instance.state.eventQueue).toMatchSnapshot();
  });

  describe('methods', () => {
    let instance;
    let instanceInitialOptions;

    beforeEach(() => {
      instance = new Typewriter(wrapperElement);
      instanceInitialOptions = { ...instance.options };
    });

    it('start should correctly run event loop', () => {
      instance.runEventLoop = jest.fn();
      instance.start();
      expect(instance.state.eventLoopPaused).toEqual(false);
      expect(instance.runEventLoop).toHaveBeenCalledTimes(1);
    });

    it('start should cancel the current event loop before running a new one', () => {
      instance.runEventLoop = jest.fn();
      instance.state.eventLoop = 123;
      instance.start();
      expect(cancelFrame).toHaveBeenCalledTimes(1);
      expect(cancelFrame).toHaveBeenCalledWith(123);
    });

    it('pause should correctly set event loop paused state', () => {
      instance.pause();
      expect(instance.state.eventLoopPaused).toEqual(true);
    });

    it('stop should correctly cancel event loop animation frame', () => {
      const test = window.requestAnimationFrame(() => {});
      instance.state.eventLoop = test;
      instance.stop();
      expect(instance.state.eventLoop).toEqual(null);
      expect(cancelFrame).toHaveBeenCalledTimes(1);
    });

    it('pauseFor should correctly add event item to queue', () => {
      instance.pauseFor(5000);
      expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.PAUSE_FOR);
      expect(instance.state.eventQueue[2].eventArgs.ms).toEqual(5000);
    });

    describe('typeOutAllStrings', () => {
      it('should correctly add event item to queue when options.strings is a string', () => {
        instance.options.strings = 'Hello world!';
        instance.typeOutAllStrings();
        expect(instance.state.eventQueue).toMatchSnapshot();
      });
  
      it('should correctly add multiple event items to queue when options.strings is an array', () => {
        instance.options.strings = [
          'Hello',
          'world!, ',
          'How',
          'are',
          'you?'
        ];
        instance.typeOutAllStrings();
        expect(instance.state.eventQueue).toMatchSnapshot();
      });

      it('should delete the last string by default', () => {
        instance.options.strings = ['Hello', 'world'];
        instance.typeOutAllStrings();
        const lastEvent = instance.state.eventQueue[instance.state.eventQueue.length - 1];
        expect(lastEvent.eventName).toEqual(EVENT_NAMES.REMOVE_ALL);
      });

      it('should not delete the last string when keepLastString is true', () => {
        instance.options.strings = ['Hello', 'world'];
        instance.options.keepLastString = true;
        instance.typeOutAllStrings();
        const removeAllEvents = instance.state.eventQueue.filter(event => event.eventName === EVENT_NAMES.REMOVE_ALL);
        const lastEvent = instance.state.eventQueue[instance.state.eventQueue.length - 1];
        expect(removeAllEvents).toHaveLength(2);
        expect(lastEvent.eventName).toEqual(EVENT_NAMES.PAUSE_FOR);
      });

      it('should still delete the last string when keepLastString and loop are true', () => {
        instance.options.strings = ['Hello', 'world'];
        instance.options.keepLastString = true;
        instance.options.loop = true;
        instance.typeOutAllStrings();
        const lastEvent = instance.state.eventQueue[instance.state.eventQueue.length - 1];
        expect(lastEvent.eventName).toEqual(EVENT_NAMES.REMOVE_ALL);
      });
    });

    describe('clear', () => {
      it('should add clear event item to queue', () => {
        instance.clear();
        expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.CLEAR);
      });
    });

    describe('clearQueue', () => {
      it('should remove all events, called events and pause time', () => {
        instance.typeString('hello');
        instance.state.calledEvents = [{ eventName: EVENT_NAMES.PAUSE_FOR, eventArgs: { ms: 10 } }];
        instance.state.pauseUntil = Date.now() + 1000;
        instance.clearQueue();
        expect(instance.state.eventQueue).toEqual([]);
        expect(instance.state.calledEvents).toEqual([]);
        expect(instance.state.pauseUntil).toEqual(null);
      });
    });

    describe('typeString', () => {
      it('should correctly call `typeOutHTMLString` if string contains html', () => {
        instance.typeOutHTMLString = jest.fn();
        instance.typeString('Hello <strong>world</strong>!');
        expect(instance.typeOutHTMLString).toHaveBeenCalledTimes(1);
        expect(instance.state.eventQueue.length).toEqual(2);
        expect(instance.state.eventQueue[0].eventName).toEqual(EVENT_NAMES.REMOVE_ALL);
        expect(instance.state.eventQueue[1].eventName).toEqual(EVENT_NAMES.CHANGE_CURSOR);
      });

      it('should correctly add event items to queue if string does not contain html', () => {
        instance.typeString('Hello world!');
        expect(instance.state.eventQueue).toMatchSnapshot();
      });
    });

    describe('pasteString', () => {
      it('should correctly call `typeOutHTMLString` passing `pasteString` true if string contains html', () => {
        instance.typeOutHTMLString = jest.fn();
        instance.pasteString('Hello <strong>world</strong>!');
        expect(instance.typeOutHTMLString).toHaveBeenCalledTimes(1);
        expect(instance.typeOutHTMLString).toHaveBeenCalledWith("Hello <strong>world</strong>!", null, true);
        expect(instance.state.eventQueue.length).toEqual(2);
        expect(instance.state.eventQueue[0].eventName).toEqual(EVENT_NAMES.REMOVE_ALL);
        expect(instance.state.eventQueue[1].eventName).toEqual(EVENT_NAMES.CHANGE_CURSOR);
      });

      it('should correctly add event items to queue if string does not contain html', () => {
        instance.pasteString('Hello world!');
        expect(instance.state.eventQueue).toMatchSnapshot();
      });
    });

    describe('typeOutHTMLString', () => {
      it('should not add anything to event queue if string is empty', () => {
        instance.typeOutHTMLString('');
        expect(instance.state.eventQueue.length).toEqual(2);
        expect(instance.state.eventQueue[0].eventName).toEqual(EVENT_NAMES.REMOVE_ALL);
        expect(instance.state.eventQueue[1].eventName).toEqual(EVENT_NAMES.CHANGE_CURSOR);
      });

      it('should correctly add event item when string contains only string', () => {
        instance.typeOutHTMLString('test');
        expect(instance.state.eventQueue).toMatchSnapshot();
      });

      it('should correctly add event items for html wrapper and all string characters', () => {
        instance.typeOutHTMLString('<strong>hello world</strong> <div>how are you?</div> <p>Google</p>!!!!');
        expect(instance.state.eventQueue).toMatchSnapshot();
      });

      it('should correctly add event items for nested html and parent node', () => {
        const parentNode = document.createElement('div');
        parentNode.className = 'parent-node';
        instance.typeOutHTMLString('<div class="wrapper"><p><strong>test</strong></p>!</div>', parentNode);
        expect(instance.state.eventQueue).toMatchSnapshot();
      });
    });

    describe('deleteAll', () => {
      it('should add remove all event item with natural speed by default', () => {
        instance.deleteAll();
        expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.REMOVE_ALL);
        expect(instance.state.eventQueue[2].eventArgs.speed).toEqual('natural');
      });
  
      it('should add remove all event item with natural speed by default', () => {
        instance.deleteAll(500);
        expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.REMOVE_ALL);
        expect(instance.state.eventQueue[2].eventArgs.speed).toEqual(500);
      });
    });

    describe('deleteAllWithDeleteSpeed', () => {
      it('should add remove all event item without a speed so the delete speed option is used', () => {
        instance.deleteAllWithDeleteSpeed();
        expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.REMOVE_ALL);
        expect(instance.state.eventQueue[2].eventArgs).toEqual({});
      });
    });

    describe('parseHTML option', () => {
      it('should type html like text as normal characters when parseHTML is false', () => {
        instance.options.parseHTML = false;
        instance.typeOutHTMLString = jest.fn();
        instance.typeString('<b>hi</b>');
        expect(instance.typeOutHTMLString).toHaveBeenCalledTimes(0);
        expect(instance.state.eventQueue.length).toEqual(11);
        expect(instance.state.eventQueue[2].eventArgs.character).toEqual('<');
      });

      it('should paste html like text as a normal string when parseHTML is false', () => {
        instance.options.parseHTML = false;
        instance.typeOutHTMLString = jest.fn();
        instance.pasteString('<b>hi</b>');
        expect(instance.typeOutHTMLString).toHaveBeenCalledTimes(0);
        expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.PASTE_STRING);
        expect(instance.state.eventQueue[2].eventArgs.character).toEqual('<b>hi</b>');
      });
    });

    describe('changeDeleteSpeed', () => {
      it('should add event item with new speed', () => {
        instance.changeDeleteSpeed(500);
        expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.CHANGE_DELETE_SPEED);
        expect(instance.state.eventQueue[2].eventArgs.speed).toEqual(500);
      });

      it('should throw error if no new speed is provided', () => {
        expect(() => {
          instance.changeDeleteSpeed();
        }).toThrow('Must provide new delete speed');
      });

      it('should add event item when new speed is zero', () => {
        instance.changeDeleteSpeed(0);
        expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.CHANGE_DELETE_SPEED);
        expect(instance.state.eventQueue[2].eventArgs.speed).toEqual(0);
      });
    });

    describe('changeDelay', () => {
      it('should add event item with new delay', () => {
        instance.changeDelay(500);
        expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.CHANGE_DELAY);
        expect(instance.state.eventQueue[2].eventArgs.delay).toEqual(500);
      });

      it('should throw error if no new speed is provided', () => {
        expect(() => {
          instance.changeDelay();
        }).toThrow('Must provide new delay');
      });

      it('should add event item when new delay is zero', () => {
        instance.changeDelay(0);
        expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.CHANGE_DELAY);
        expect(instance.state.eventQueue[2].eventArgs.delay).toEqual(0);
      });
    });

    describe('changeCursor', () => {
        it('should add event item with new cursor', () => {
            instance.changeCursor('$');
            expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.CHANGE_CURSOR);
            expect(instance.state.eventQueue[2].eventArgs.cursor).toEqual('$');
        });

        it('should throw error if no new cursor is provided', () => {
            expect(() => {
                instance.changeCursor();
            }).toThrow('Must provide new cursor');
        });

        it('should add event item when new cursor is an empty string', () => {
            instance.changeCursor('');
            expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.CHANGE_CURSOR);
            expect(instance.state.eventQueue[2].eventArgs.cursor).toEqual('');
        });
    });

    describe('deleteChars', () => {
      it('should add event items for amount of characters', () => {
        instance.deleteChars(10);
        expect(instance.state.eventQueue).toMatchSnapshot();
      });

      it('should throw error if amount is not provided', () => {
        expect(() => {
          instance.deleteChars();
        }).toThrow('Must provide amount of characters to delete');
      });
    });

    describe('callFunction', () => {
      it('should add event items to call callback function', () => {
        const cb = () => {};
        instance.callFunction(cb);
        expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.CALL_FUNCTION);
        expect(instance.state.eventQueue[2].eventArgs.cb).toEqual(cb);
        expect(instance.state.eventQueue[2].eventArgs.thisArg).toEqual(undefined);
      });

      it('should add event items to call callback function with thisArg', () => {
        const cb = () => {};
        const thisArg = { hello: 1 };
        instance.callFunction(cb, thisArg);
        expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.CALL_FUNCTION);
        expect(instance.state.eventQueue[2].eventArgs.cb).toEqual(cb);
        expect(instance.state.eventQueue[2].eventArgs.thisArg).toEqual(thisArg);
      });

      it('should throw error if callback function is not provided', () => {
        expect(() => {
          instance.callFunction();
        }).toThrow('Callback must be a function');
      });

      it('should throw error if callback is not a function', () => {
        expect(() => {
          instance.callFunction(false);
        }).toThrow('Callback must be a function');
      });
    });

    describe('typeCharacters', () => {
      it('should add event items for amount of characters', () => {
        instance.typeCharacters(['h', 'e', 'l', 'l', '0']);
        expect(instance.state.eventQueue).toMatchSnapshot();
      });

      it('should throw error if characters param is not provided', () => {
        expect(() => {
          instance.typeCharacters();
        }).toThrow('Characters must be an array');
      });

      it('should throw error if characters param is not array', () => {
        expect(() => {
          instance.typeCharacters('test');
        }).toThrow('Characters must be an array');
      });
    });

    describe('removeCharacters', () => {
      it('should add event items for amount of characters', () => {
        instance.removeCharacters(['h', 'e', 'l', 'l', '0']);
        expect(instance.state.eventQueue).toMatchSnapshot();
      });

      it('should throw error if characters param is not provided', () => {
        expect(() => {
          instance.removeCharacters();
        }).toThrow('Characters must be an array');
      });

      it('should throw error if characters param is not array', () => {
        expect(() => {
          instance.removeCharacters('test');
        }).toThrow('Characters must be an array');
      });
    });

    describe('addEventToQueue', () => {
      it('should call addEventToStateProperty correctly', () => {
        instance.addEventToStateProperty = jest.fn();
        instance.addEventToQueue('test', { hello: 1 }, false);
        expect(instance.addEventToStateProperty).toHaveBeenCalledTimes(1);
        expect(instance.addEventToStateProperty).toHaveBeenCalledWith('test', { hello: 1 }, false, 'eventQueue');
      });
    });

    describe('addEventToStateProperty', () => {
      it('should append event item correctly', () => {
        const event = {
          eventName: 'test',
          eventArgs: { hello: 1 },
        };

        instance.state.eventQueue = [{ item: 1 }];
        instance.addEventToStateProperty(event.eventName, event.eventArgs, false, 'eventQueue');
        expect(instance.state.eventQueue[1]).toEqual(event);
      });

      it('should prepend event item correctly', () => {
        const event = {
          eventName: 'test',
          eventArgs: { hello: 1 },
        };

        instance.state.eventQueue = [{ item: 1 }];
        instance.addEventToStateProperty(event.eventName, event.eventArgs, true, 'eventQueue');
        expect(instance.state.eventQueue[0]).toEqual(event);
      });
    });

    describe('runEventLoop', () => {
      const events = [{ eventName: EVENT_NAMES.CHANGE_DELAY, eventArgs: { delay: 5000 } }];

      it('should call requestFrame method correctly', () => {
        requestFrame.mockReset();
        instance.typeString('test').runEventLoop();
        expect(requestFrame).toHaveBeenCalledTimes(1);
      });

      it('should not run if event queue is empty and loop option is false', () => {
        instance.options.loop = false;
        instance.state.eventQueue = [];
        requestFrame.mockReset();
        instance.runEventLoop();
        expect(requestFrame).toHaveBeenCalledTimes(0);
      });

      it('should reset queue correctly if event queue is empty and loop option is true', () => {
        instance.options.loop = true;
        instance.state.eventQueue = [];
        instance.state.calledEvents = events;
        instance.runEventLoop();
        expect(instance.state.eventQueue).toMatchSnapshot();
        expect(instance.state.calledEvents).toEqual([]);
        expect(instance.options).toEqual(instanceInitialOptions);
      });

      it('should not run if event loop is paused', () => {
        instance.state.eventQueue = [...events];
        instance.state.eventLoopPaused = true;
        instance.runEventLoop();
        expect(instance.state.eventQueue).toEqual(events);
      });

      it('should not run until pause is finished if there is a pause time set', () => {
        instance.state.eventQueue = [...events];
        instance.state.pauseUntil = Date.now() + 5000;
        clock.tick(1000);
        instance.runEventLoop();
        expect(instance.state.eventQueue).toEqual(events);
      });

      it('should run and clear pause if there is a pause time set and current time exceeds pause', () => {
        instance.options.delay = 0;
        instance.state.lastFrameTime = Date.now() + 100;
        instance.state.eventQueue = [...events];
        instance.state.eventLoopPaused = false;
        instance.state.pauseUntil = Date.now() + 5000;
        clock.tick(10000);
        instance.runEventLoop();
        expect(instance.state.pauseUntil).toEqual(null);
        expect(instance.state.eventQueue).toEqual([]);
      });

      it('should not run loop if time between last frame is less than the delay', () => {
        instance.options.delay = 0;
        instance.state.lastFrameTime = 0;
        instance.state.eventQueue = [...events];
        instance.state.eventLoopPaused = false;
        instance.runEventLoop();
        expect(instance.state.eventQueue).toEqual(events);
      });

      describe('maxCatchUpDelta', () => {
        beforeEach(() => {
          instance.options.delay = 100;
          instance.state.eventLoopPaused = false;
          instance.state.pauseUntil = null;
          instance.state.visibleNodes = [];
          // Fake clock starts at 0 which is treated as an unset lastFrameTime
          clock.tick(1);
          instance.state.lastFrameTime = Date.now();
          instance.state.eventQueue = [
            { eventName: EVENT_NAMES.TYPE_CHARACTER, eventArgs: { character: 'a' } },
            { eventName: EVENT_NAMES.TYPE_CHARACTER, eventArgs: { character: 'b' } },
            { eventName: EVENT_NAMES.TYPE_CHARACTER, eventArgs: { character: 'c' } },
            { eventName: EVENT_NAMES.TYPE_CHARACTER, eventArgs: { character: 'd' } },
          ];
        });

        it('should run a single event per frame when not set', () => {
          instance.options.maxCatchUpDelta = null;
          clock.tick(1000);
          instance.runEventLoop();
          expect(instance.state.visibleNodes).toHaveLength(1);
          expect(instance.state.eventQueue).toHaveLength(3);
        });

        it('should run several events for the elapsed time when set', () => {
          instance.options.maxCatchUpDelta = 10000;
          clock.tick(250);
          instance.runEventLoop();
          expect(instance.state.visibleNodes).toHaveLength(2);
          expect(instance.state.eventQueue).toHaveLength(2);
          expect(instance.state.lastFrameTime).toEqual(Date.now() - 50);
        });

        it('should cap the elapsed time', () => {
          instance.options.maxCatchUpDelta = 250;
          clock.tick(100000);
          instance.runEventLoop();
          expect(instance.state.visibleNodes).toHaveLength(2);
          expect(instance.state.eventQueue).toHaveLength(2);
        });

        it('should stop processing after a pause event', () => {
          instance.options.maxCatchUpDelta = 10000;
          instance.state.eventQueue.splice(1, 0, { eventName: EVENT_NAMES.PAUSE_FOR, eventArgs: { ms: 1000 } });
          clock.tick(1000);
          instance.runEventLoop();
          expect(instance.state.visibleNodes).toHaveLength(1);
          expect(instance.state.pauseUntil).toEqual(Date.now() + 1000);
          expect(instance.state.eventQueue).toHaveLength(3);
        });
      });

      describe('valid delta', () => {
        beforeEach(() => {
          instance.options.delay = 0;
          instance.state.eventQueue = [...events];
          instance.logInDevMode = jest.fn();
          instance.state.lastFrameTime = Date.now() + 100;
          clock.tick(10000);
        });

        it('should use correct natural delay speed', () => {
          instance.options.delay = 'natural';
          instance.runEventLoop();
          expect(instance.logInDevMode).toHaveBeenCalledTimes(1);
          expect(instance.logInDevMode.mock.calls[0][0].delay).toBeGreaterThanOrEqual(120);
          expect(instance.logInDevMode.mock.calls[0][0].delay).toBeLessThanOrEqual(160);
        });

        it('should use correct delay speed', () => {
          instance.options.delay = 50;
          instance.runEventLoop();
          expect(instance.logInDevMode).toHaveBeenCalledTimes(1);
          expect(instance.logInDevMode.mock.calls[0][0].delay).toEqual(50);
        });

        it('should use correct natural delay speed when removing character', () => {
          instance.state.eventQueue = [{ eventName: EVENT_NAMES.REMOVE_CHARACTER }];
          instance.options.deleteSpeed = 'natural';
          instance.runEventLoop();
          expect(instance.logInDevMode).toHaveBeenCalledTimes(1);
          expect(instance.logInDevMode.mock.calls[0][0].delay).toBeGreaterThanOrEqual(40);
          expect(instance.logInDevMode.mock.calls[0][0].delay).toBeLessThanOrEqual(80);
        });

        it('should use correct delay speed when removing character', () => {
          instance.state.eventQueue = [{ eventName: EVENT_NAMES.REMOVE_CHARACTER }];
          instance.options.deleteSpeed = 25;
          instance.runEventLoop();
          expect(instance.logInDevMode).toHaveBeenCalledTimes(1);
          expect(instance.logInDevMode.mock.calls[0][0].delay).toEqual(25);
        });

        it('should call log in dev mode function with current event and state', () => {
          instance.runEventLoop();
          expect(instance.logInDevMode).toHaveBeenCalledTimes(1);
          expect(instance.logInDevMode).toHaveBeenCalledWith({
            currentEvent: {...events[0]},
            state: {...instance.state },
            delay: 0,
          });
        });

        it(`should add called event to state if event is not ${EVENT_NAMES.REMOVE_ALL} or ${EVENT_NAMES.REMOVE_CHARACTER} when loop option is true`, () => {
          const event = {
            eventName: EVENT_NAMES.TYPE_CHARACTER,
            eventArgs: {
              character: 't',
              node: null,
            }
          };
          instance.options.loop = true;
          instance.state.eventQueue = [event];
          instance.runEventLoop();
          expect(instance.state.calledEvents[0]).toEqual(event);
        });

        it(`should not add called event to state if event is ${EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE} when loop option is true`, () => {
          const event = {
            eventName: EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE,
            eventArgs: {
              speed: 100,
            }
          };
          instance.options.loop = true;
          instance.state.eventQueue = [event];
          instance.runEventLoop();
          expect(instance.state.calledEvents).toEqual([]);
        });

        it(`should not add called event to state if eventArgs has temp value when loop option is true`, () => {
          const event = {
            eventName: EVENT_NAMES.CHANGE_DELETE_SPEED,
            eventArgs: { temp: true },
          };
          instance.options.loop = true;
          instance.state.eventQueue = [event];
          instance.runEventLoop();
          expect(instance.state.calledEvents).toEqual([]);
        });

        it('should set last fame time correcly', () => {
          const currentTime = Date.now();
          instance.state.lastFrameTime = currentTime;
          clock.tick(2000);
          instance.runEventLoop();
          expect(instance.state.lastFrameTime).toEqual(currentTime + 2000);
        });

        describe(`${EVENT_NAMES.TYPE_CHARACTER}`, () => {
          beforeEach(() => {
            instance.state.eventQueue = [
              {
                eventName: EVENT_NAMES.TYPE_CHARACTER,
                eventArgs: {
                  character: 't',
                  node: null,
                }
              },
            ];
          });

          it('should append child to wrapper if node element is not provided', () => {
            instance.state.elements.wrapper.appendChild = jest.fn();
            instance.runEventLoop();
            expect(instance.state.elements.wrapper.appendChild).toHaveBeenCalledTimes(1);
            expect(instance.state.elements.wrapper.appendChild.mock.calls[0][0].textContent).toEqual('t');
            expect(instance.state.visibleNodes).toEqual([
              {
                type: VISIBLE_NODE_TYPES.TEXT_NODE,
                node: instance.state.elements.wrapper.appendChild.mock.calls[0][0],
                character: 't',
              }
            ]);
          });

          it('should append child to node if provided', () => {
            const node = { appendChild: jest.fn() };
            instance.state.eventQueue[0].eventArgs.node = node;
            instance.runEventLoop();
            expect(node.appendChild).toHaveBeenCalledTimes(1);
            expect(node.appendChild.mock.calls[0][0].textContent).toEqual('t');
            expect(instance.state.visibleNodes).toEqual([
              {
                type: VISIBLE_NODE_TYPES.TEXT_NODE,
                node: node.appendChild.mock.calls[0][0],
                character: 't',
              }
            ]);
          });
        });

        describe(`${EVENT_NAMES.REMOVE_CHARACTER}`, () => {
          it(`should prepend ${EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE} to event queue`, () => {
            instance.state.eventQueue = [
              {
                eventName: EVENT_NAMES.REMOVE_CHARACTER,
                eventArgs: {},
              },
            ];
            instance.runEventLoop();
            expect(instance.state.eventQueue).toEqual([
              {
                eventName: EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE,
                eventArgs: { removingCharacterNode: true },
              }
            ]);
          });
        });

        describe(`${EVENT_NAMES.PAUSE_FOR}`, () => {
          it('should change pauseUntil state based on event args', () => {
            instance.state.eventQueue = [
              {
                eventName: EVENT_NAMES.PAUSE_FOR,
                eventArgs: { ms: 1000 },
              },
            ];
            instance.runEventLoop();
            expect(instance.state.pauseUntil).toEqual(Date.now() + 1000);
          });
        });

        describe(`${EVENT_NAMES.CALL_FUNCTION}`, () => {
          it('should call callback function with object containing elements in state', () => {
            const cb = jest.fn();
            instance.state.eventQueue = [
              {
                eventName: EVENT_NAMES.CALL_FUNCTION,
                eventArgs: {
                  cb,
                },
              },
            ];
            instance.runEventLoop();
            expect(cb).toHaveBeenCalledTimes(1);
            expect(cb).toHaveBeenCalledWith({
              elements: { ...instance.state.elements },
            });
          });
        });

        describe(`${EVENT_NAMES.ADD_HTML_TAG_ELEMENT}`, () => {
          it('should append node to the wrapepr element', () => {
            const node = document.createElement('div');
            instance.state.elements.wrapper.appendChild = jest.fn();
            instance.state.eventQueue = [
              {
                eventName: EVENT_NAMES.ADD_HTML_TAG_ELEMENT,
                eventArgs: {
                  node,
                },
              },
            ];
            instance.runEventLoop();
            expect(instance.state.elements.wrapper.appendChild).toHaveBeenCalledTimes(1);
            expect(instance.state.elements.wrapper.appendChild).toHaveBeenCalledWith(node);
            expect(instance.state.visibleNodes).toEqual([
              {
                type: VISIBLE_NODE_TYPES.HTML_TAG,
                node,
                parentNode: instance.state.elements.wrapper,
              },
            ]);
          });

          it('should append node to parent node if passed as eventArgs', () => {
            const node = document.createElement('div');
            const parentNode = document.createElement('div');
            parentNode.className = 'parent-node';
            parentNode.appendChild = jest.fn();
            instance.state.eventQueue = [
              {
                eventName: EVENT_NAMES.ADD_HTML_TAG_ELEMENT,
                eventArgs: {
                  node,
                  parentNode,
                },
              },
            ];
            instance.runEventLoop();
            expect(parentNode.appendChild).toHaveBeenCalledTimes(1);
            expect(parentNode.appendChild).toHaveBeenCalledWith(node);
            expect(instance.state.visibleNodes).toEqual([
              {
                type: VISIBLE_NODE_TYPES.HTML_TAG,
                node,
                parentNode,
              },
            ]);
          });
        });

        describe(`${EVENT_NAMES.REMOVE_ALL}`, () => {
          beforeEach(() => {
            instance.state.visibleNodes = [{ type: VISIBLE_NODE_TYPES.HTML_TAG }];
            instance.state.eventQueue = [
              {
                eventName: EVENT_NAMES.REMOVE_ALL,
                eventArgs: {
                  speed: null,
                },
              },
            ];
          });

          it('should correctly push remove last node events without speed change', () => {
            instance.runEventLoop();
            expect(instance.state.eventQueue).toMatchSnapshot();
          });

          it('should correctly push remove last node events with speed change when provided', () => {
            instance.options.deleteSpeed = 10;
            instance.state.eventQueue[0].eventArgs.speed = 100;
            instance.runEventLoop();
            expect(instance.state.eventQueue).toMatchSnapshot();
          });
        });

        describe(`${EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE}`, () => {
          let node;

          beforeEach(() => {
            node = { parentNode: { removeChild: jest.fn() } };
            instance.state.eventQueue = [
              {
                eventName: EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE,
                eventArgs: {
                  removingCharacterNode: true,
                },
              },
            ];
          });

          it('should remove visible node correctly', () => {
            instance.state.visibleNodes = [{ type: VISIBLE_NODE_TYPES.TEXT_NODE, node, }];
            instance.runEventLoop();
            expect(node.parentNode.removeChild).toHaveBeenCalledTimes(1);
            expect(node.parentNode.removeChild).toHaveBeenCalledWith(node);
            expect(instance.state.visibleNodes).toEqual([]);
          });

          it('should remove visible node correctly and add an extra remove event if type was html tag', () => {
            instance.state.visibleNodes = [{ type: VISIBLE_NODE_TYPES.HTML_TAG, node, }];
            instance.runEventLoop();
            expect(node.parentNode.removeChild).toHaveBeenCalledTimes(1);
            expect(node.parentNode.removeChild).toHaveBeenCalledWith(node);
            expect(instance.state.visibleNodes).toEqual([]);
            expect(instance.state.eventQueue[0].eventName).toEqual(EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE);
            expect(instance.state.eventQueue[0].eventArgs).toEqual({ removingCharacterNode: true });
          });

          it('should not throw if visible node was already removed from the page', () => {
            const detachedNode = document.createElement('span');
            instance.state.visibleNodes = [{ type: VISIBLE_NODE_TYPES.TEXT_NODE, node: detachedNode, }];
            expect(() => instance.runEventLoop()).not.toThrow();
            expect(instance.state.visibleNodes).toEqual([]);
          });
        });

        describe(`${EVENT_NAMES.CHANGE_DELETE_SPEED}`, () => {
          it('should set options delete speed correctly', () => {
            instance.state.eventQueue = [
              {
                eventName: EVENT_NAMES.CHANGE_DELETE_SPEED,
                eventArgs: {
                  speed: 6000,
                },
              },
            ];
            instance.runEventLoop();
            expect(instance.options.deleteSpeed).toEqual(6000);
          });
        });

        describe(`${EVENT_NAMES.CHANGE_DELAY}`, () => {
          it('should set options delay correctly', () => {
            instance.state.eventQueue = [
              {
                eventName: EVENT_NAMES.CHANGE_DELAY,
                eventArgs: {
                  delay: 6000,
                },
              },
            ];
            instance.runEventLoop();
            expect(instance.options.delay).toEqual(6000);
          });
        });

        describe(`${EVENT_NAMES.CHANGE_CURSOR}`, () => {
          it('should set options and inner html of cursor element correctly', () => {
            instance.state.elements.cursor = document.createElement('div');
            instance.state.eventQueue = [
              {
                eventName: EVENT_NAMES.CHANGE_CURSOR,
                eventArgs: {
                  cursor: '$$$$',
                },
              },
            ];
            instance.runEventLoop();
            expect(instance.options.cursor).toEqual('$$$$');
            expect(instance.state.elements.cursor.innerHTML).toEqual('$$$$');
          });
        });
      });
    });

    describe('logInDevMode', () => {
      it('should log message to console when option devMode is true', () => {
        const spy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
        instance.options.devMode = true;
        instance.logInDevMode('test');
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith('test');
      });

      it('should not log message to console when option devMode is false', () => {
        const spy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
        instance.options.devMode = false;
        instance.logInDevMode('test');
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('with a running event loop', () => {
    const FRAME_TIME = 16;

    beforeEach(() => {
      requestFrame.mockImplementation(callback => setTimeout(callback, FRAME_TIME));
      cancelFrame.mockImplementation(id => clearTimeout(id));
    });

    afterEach(() => {
      requestFrame.mockReset();
      cancelFrame.mockReset();
    });

    it('should not leave an event loop running after pause, start and stop', () => {
      const instance = new Typewriter(wrapperElement, { delay: 50 });
      instance.typeString('abcdefghij').start();
      clock.tick(100);
      instance.pause();
      clock.tick(100);
      instance.start();
      instance.stop();
      expect(clock.countTimers()).toEqual(0);
    });

    it('should delete characters across nested empty html tags', () => {
      const instance = new Typewriter(wrapperElement, { delay: 1, deleteSpeed: 1 });
      instance.typeString('a<b><i>x</i></b>').deleteChars(2).start();
      clock.tick(5000);
      expect(instance.state.elements.wrapper.textContent).toEqual('');
    });

    it('should use the delete speed option when calling deleteAllWithDeleteSpeed', () => {
      const instance = new Typewriter(wrapperElement, { delay: 1, deleteSpeed: 30 });
      instance.logInDevMode = jest.fn();
      instance.typeString('ab').deleteAllWithDeleteSpeed().start();
      clock.tick(5000);

      const removeDelays = instance.logInDevMode.mock.calls
        .filter(([log]) => log.currentEvent.eventName === EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE)
        .map(([log]) => log.delay);

      expect(removeDelays).toEqual([30, 30]);
      expect(instance.state.elements.wrapper.textContent).toEqual('');
    });

    it('should type html like text exactly as written when parseHTML is false', () => {
      const instance = new Typewriter(wrapperElement, { delay: 1, parseHTML: false });
      instance.typeString('if x<y and y>z').start();
      clock.tick(5000);
      expect(instance.state.elements.wrapper.textContent).toEqual('if x<y and y>z');
    });

    it('should type html entities as plain characters inside html strings', () => {
      const instance = new Typewriter(wrapperElement, { delay: 1 });
      instance.typeString('<b>Tom &amp; Jerry</b> x &lt;y and y&gt; z').start();
      clock.tick(5000);
      expect(instance.state.elements.wrapper.textContent).toEqual('Tom & Jerry x <y and y> z');
      expect(instance.state.elements.wrapper.querySelectorAll('y').length).toEqual(0);
    });

    it('should delete a void element as a single character', () => {
      const instance = new Typewriter(wrapperElement, { delay: 1, deleteSpeed: 1 });
      instance.typeString('ab<br>').deleteChars(1).start();
      clock.tick(5000);
      expect(instance.state.elements.wrapper.innerHTML).toEqual('ab');
    });

    it('should not add html comments to the page or count them as characters', () => {
      const instance = new Typewriter(wrapperElement, { delay: 1 });
      instance.typeString('ab<!-- note --><b>c</b>').start();
      clock.tick(5000);
      expect(instance.state.elements.wrapper.innerHTML).toEqual('ab<b>c</b>');
      expect(instance.state.visibleNodes.length).toEqual(4);
    });

    const getLoggedDelays = (instance, eventName) => {
      return instance.logInDevMode.mock.calls
        .filter(([log]) => log.currentEvent.eventName === eventName)
        .map(([log]) => log.delay);
    };

    it('should type events that are added inside callFunction', () => {
      const instance = new Typewriter(wrapperElement, { delay: 1 });
      instance.typeString('a')
        .callFunction(() => instance.typeString('b'))
        .typeString('c')
        .start();
      clock.tick(5000);
      expect(instance.state.elements.wrapper.textContent).toEqual('acb');
    });

    it('should hide the cursor when changeCursor is called with an empty string', () => {
      const instance = new Typewriter(wrapperElement, { delay: 1 });
      instance.typeString('ab').changeCursor('').start();
      clock.tick(5000);
      expect(instance.state.elements.cursor.innerHTML).toEqual('');
    });

    it('should use a delete speed of zero when deleteAll is called with zero', () => {
      const instance = new Typewriter(wrapperElement, { delay: 1, deleteSpeed: 30 });
      instance.logInDevMode = jest.fn();
      instance.typeString('ab').deleteAll(0).start();
      clock.tick(5000);
      expect(getLoggedDelays(instance, EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE)).toEqual([0, 0]);
    });

    it('should use a random delay between min and max when delay is a range', () => {
      const instance = new Typewriter(wrapperElement, {
        delay: { min: 20, max: 30 },
        deleteSpeed: { min: 5, max: 8 },
      });
      instance.logInDevMode = jest.fn();
      instance.typeString('abcdef').deleteChars(3).start();
      clock.tick(5000);

      const typingDelays = getLoggedDelays(instance, EVENT_NAMES.TYPE_CHARACTER);
      const deleteDelays = getLoggedDelays(instance, EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE);

      expect(typingDelays.every(delay => delay >= 20 && delay <= 30)).toEqual(true);
      expect(deleteDelays.every(delay => delay >= 5 && delay <= 8)).toEqual(true);
      expect(instance.state.elements.wrapper.textContent).toEqual('abc');
    });

    describe('clear', () => {
      it('should remove everything in a single frame and call onRemoveNode for each node', () => {
        const onRemoveNode = jest.fn();
        const instance = new Typewriter(wrapperElement, { delay: 1, onRemoveNode });
        instance.typeString('a<b>bc</b>').clear().start();
        clock.tick(5000);
        expect(instance.state.elements.wrapper.innerHTML).toEqual('');
        expect(instance.state.visibleNodes).toEqual([]);
        expect(onRemoveNode).toHaveBeenCalledTimes(4);
      });

      it('should run in the same frame as the event before it', () => {
        const instance = new Typewriter(wrapperElement, { delay: 50 });
        const eventTimes = {};
        instance.logInDevMode = ({ currentEvent }) => {
          eventTimes[currentEvent.eventName] = Date.now();
        };
        instance.typeString('ab').clear().start();
        clock.tick(5000);
        expect(eventTimes[EVENT_NAMES.CLEAR]).toEqual(eventTimes[EVENT_NAMES.TYPE_CHARACTER]);
        expect(instance.state.elements.wrapper.textContent).toEqual('');
      });
    });

    describe('clearQueue', () => {
      it('should let new events run straight away instead of the old ones', () => {
        const instance = new Typewriter(wrapperElement, { delay: 1 });
        instance.typeString('abcdefghij').start();
        clock.tick(100);
        instance.clearQueue().clear().typeString('xyz').start();
        clock.tick(5000);
        expect(instance.state.elements.wrapper.textContent).toEqual('xyz');
      });
    });

    describe('skipToEnd', () => {
      it('should run all queued events straight away including callbacks and pauses', () => {
        const cb = jest.fn();
        const instance = new Typewriter(wrapperElement, { delay: 100 });
        instance.typeString('Hello')
          .pauseFor(10000)
          .deleteChars(2)
          .typeString(' <b>world</b>')
          .callFunction(cb)
          .start();

        instance.skipToEnd();

        expect(instance.state.elements.wrapper.innerHTML).toEqual('Hel <b>world</b>');
        expect(instance.state.eventQueue).toEqual([]);
        expect(instance.state.pauseUntil).toEqual(null);
        expect(cb).toHaveBeenCalledTimes(1);
      });

      it('should not run events that are added by callbacks while skipping', () => {
        const instance = new Typewriter(wrapperElement, { delay: 100 });
        const typeAgain = () => instance.typeString('x').callFunction(typeAgain);
        instance.typeString('a').callFunction(typeAgain);

        instance.skipToEnd();

        expect(instance.state.elements.wrapper.textContent).toEqual('a');
        expect(instance.state.eventQueue).toHaveLength(2);
      });
    });

    describe('initialText', () => {
      it('should show the initial text straight away', () => {
        const instance = new Typewriter(wrapperElement, { initialText: 'Hello <b>world</b>' });
        expect(instance.state.elements.wrapper.innerHTML).toEqual('Hello <b>world</b>');
        expect(instance.state.eventQueue).toEqual([]);
      });

      it('should let the initial text be deleted one character at a time', () => {
        const instance = new Typewriter(wrapperElement, { initialText: 'Hello', delay: 1, deleteSpeed: 1 });
        instance.deleteChars(2).typeString('p!').start();
        clock.tick(5000);
        expect(instance.state.elements.wrapper.textContent).toEqual('Help!');
      });

      it('should not type the initial text again when looping', () => {
        const instance = new Typewriter(wrapperElement, {
          initialText: 'Hi',
          delay: 1,
          deleteSpeed: 1,
          loop: true,
        });
        instance.typeString(' there').start();
        clock.tick(5000);
        expect(instance.state.calledEvents.every(event => !event.eventArgs.temp)).toEqual(true);
        expect(instance.state.elements.wrapper.textContent).not.toContain('Hi');
      });
    });

    describe('deleteOnLoop', () => {
      it('should delete everything when the loop starts again by default', () => {
        const instance = new Typewriter(wrapperElement, { delay: 1, deleteSpeed: 1, loop: true });
        instance.typeString('ab').start();
        clock.tick(5000);
        expect(instance.state.elements.wrapper.textContent.length).toBeLessThanOrEqual(2);
      });

      it('should keep the text when the loop starts again when set to false', () => {
        const instance = new Typewriter(wrapperElement, { delay: 1, loop: true, deleteOnLoop: false });
        instance.typeString('ab').start();
        clock.tick(5000);
        expect(instance.state.elements.wrapper.textContent.startsWith('ababab')).toEqual(true);
      });
    });

    describe('useGraphemeSplitter', () => {
      it('should split emojis into broken characters by default', () => {
        const instance = new Typewriter(wrapperElement, { delay: 1 });
        instance.typeString('a😋').start();
        clock.tick(5000);
        expect(instance.state.visibleNodes).toHaveLength(3);
      });

      it('should type and delete emojis as a single character', () => {
        const instance = new Typewriter(wrapperElement, { delay: 1, deleteSpeed: 1, useGraphemeSplitter: true });
        instance.typeString('a😋👨‍👩‍👧').deleteChars(1).start();
        clock.tick(5000);
        expect(instance.state.visibleNodes.map(node => node.character)).toEqual(['a', '😋']);
        expect(instance.state.elements.wrapper.textContent).toEqual('a😋');
      });
    });

    describe('mergeTextNodes', () => {
      it('should create a text node for each character by default', () => {
        const instance = new Typewriter(wrapperElement, { delay: 1 });
        instance.typeString('abc').start();
        clock.tick(5000);
        expect(instance.state.elements.wrapper.childNodes).toHaveLength(3);
      });

      it('should add typed characters to a single text node', () => {
        const instance = new Typewriter(wrapperElement, { delay: 1, mergeTextNodes: true });
        instance.typeString('abc').start();
        clock.tick(5000);
        expect(instance.state.elements.wrapper.childNodes).toHaveLength(1);
        expect(instance.state.elements.wrapper.textContent).toEqual('abc');
      });

      it('should keep html tags and delete characters from the merged text node', () => {
        const instance = new Typewriter(wrapperElement, { delay: 1, deleteSpeed: 1, mergeTextNodes: true });
        instance.typeString('ab<b>cd</b>ef').deleteChars(3).typeString('XY').start();
        clock.tick(5000);

        const { wrapper } = instance.state.elements;

        expect(wrapper.innerHTML).toEqual('ab<b>c</b>XY');
        expect(wrapper.childNodes).toHaveLength(3);
      });

      it('should remove everything with deleteAll', () => {
        const instance = new Typewriter(wrapperElement, { delay: 1, deleteSpeed: 1, mergeTextNodes: true });
        instance.typeString('ab<b>cd</b>ef').deleteAll().start();
        clock.tick(5000);
        expect(instance.state.elements.wrapper.innerHTML).toEqual('');
      });

      it('should create a text node for each character when onCreateTextNode is set', () => {
        const instance = new Typewriter(wrapperElement, {
          delay: 1,
          mergeTextNodes: true,
          onCreateTextNode: (character) => document.createTextNode(character),
        });
        instance.typeString('abc').start();
        clock.tick(5000);
        expect(instance.state.elements.wrapper.childNodes).toHaveLength(3);
      });
    });

    describe('pasteAsCharacters', () => {
      it('should delete a pasted string as one character by default', () => {
        const instance = new Typewriter(wrapperElement, { delay: 1, deleteSpeed: 1 });
        instance.typeString('a').pasteString('hello').deleteChars(1).start();
        clock.tick(5000);
        expect(instance.state.elements.wrapper.textContent).toEqual('a');
      });

      it('should let deleteChars delete pasted text one character at a time', () => {
        const instance = new Typewriter(wrapperElement, { delay: 1, deleteSpeed: 1, pasteAsCharacters: true });
        instance.typeString('a').pasteString('hello').deleteChars(2).start();
        clock.tick(5000);
        expect(instance.state.elements.wrapper.textContent).toEqual('ahel');
      });
    });

    describe('onlyDelayVisibleChanges', () => {
      const typeAndWait = (options, time) => {
        const instance = new Typewriter(wrapperElement, { delay: 50, ...options });
        instance.typeString('ab').start();
        clock.tick(time);
        return instance.state.elements.wrapper.textContent;
      };

      it('should spend a typing delay on every event by default', () => {
        expect(typeAndWait({}, 150)).toEqual('');
      });

      it('should only spend a delay on events that change the text', () => {
        expect(typeAndWait({ onlyDelayVisibleChanges: true }, 150)).toEqual('ab');
      });

      it('should use the delete speed once for each deleted character', () => {
        const instance = new Typewriter(wrapperElement, { delay: 1, deleteSpeed: 30, onlyDelayVisibleChanges: true });
        instance.logInDevMode = jest.fn();
        instance.typeString('a<b>b</b>').deleteChars(2).callFunction(() => {}).start();
        clock.tick(5000);

        expect(getLoggedDelays(instance, EVENT_NAMES.REMOVE_CHARACTER)).toEqual([0, 0]);
        expect(getLoggedDelays(instance, EVENT_NAMES.REMOVE_LAST_VISIBLE_NODE)).toEqual([30, 0, 30]);
        expect(getLoggedDelays(instance, EVENT_NAMES.CALL_FUNCTION)).toEqual([0]);
        expect(instance.state.elements.wrapper.innerHTML).toEqual('');
      });

      it('should paste a html string in one step', () => {
        const instance = new Typewriter(wrapperElement, { delay: 50, onlyDelayVisibleChanges: true });
        instance.pasteString('<b>a</b><i>b</i>c').start();
        clock.tick(FRAME_TIME);
        expect(instance.state.elements.wrapper.innerHTML).toEqual('<b>a</b><i>b</i>c');
      });
    });
  });
});