import lolex from 'lolex';
import raf, { cancel as cancelRaf } from 'raf';
import Typewriter from '../Typewriter';
import {
  EVENT_NAMES,
  VISIBLE_NODE_TYPES,
  STYLES,
} from '../constants';

jest.mock('raf', () => ({
  __esModule: true,
  default: jest.fn(),
  cancel: jest.fn(),
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
    clock = lolex.install();
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
      onStringTyped: jest.fn(),
      onStringType: jest.fn(),
    };

    const instance = new Typewriter('#test', options);
    expect(instance.options).toEqual(options);
  });

  it('should throw error if no container selector or element is provided', () => {
    expect(() => {
      new Typewriter();
    }).toThrowError('No container element was provided');
  });

  it('should throw error if container wih selector is not found', () => {
    expect(() => {
      new Typewriter('.hello');
    }).toThrowError('Could not find container element');
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

    it('pause should correctly set event loop paused state', () => {
      instance.pause();
      expect(instance.state.eventLoopPaused).toEqual(true);
    });

    it('stop should correctly cancel event loop animation frame', () => {
      const test = window.requestAnimationFrame(() => {});
      instance.state.eventLoop = test;
      instance.stop();
      expect(instance.state.eventLoop).toEqual(null);
      expect(cancelRaf).toHaveBeenCalledTimes(1);
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

    describe('changeDeleteSpeed', () => {
      it('should add event item with new speed', () => {
        instance.changeDeleteSpeed(500);
        expect(instance.state.eventQueue[2].eventName).toEqual(EVENT_NAMES.CHANGE_DELETE_SPEED);
        expect(instance.state.eventQueue[2].eventArgs.speed).toEqual(500);
      });

      it('should throw error if no new speed is provided', () => {
        expect(() => {
          instance.changeDeleteSpeed();
        }).toThrowError('Must provide new delete speed');
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
        }).toThrowError('Must provide new delay');
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
            }).toThrowError('Must provide new cursor');
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
        }).toThrowError('Must provide amount of characters to delete');
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
        }).toThrowError('Callbak must be a function');
      });

      it('should throw error if callback is not a function', () => {
        expect(() => {
          instance.callFunction(false);
        }).toThrowError('Callbak must be a function');
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
        }).toThrowError('Characters must be an array');
      });

      it('should throw error if characters param is not array', () => {
        expect(() => {
          instance.typeCharacters('test');
        }).toThrowError('Characters must be an array');
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
        }).toThrowError('Characters must be an array');
      });

      it('should throw error if characters param is not array', () => {
        expect(() => {
          instance.removeCharacters('test');
        }).toThrowError('Characters must be an array');
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

    describe('addReverseCalledEvent', () => {
      it('should call addEventToStateProperty correctly when loop options is true', () => {
        instance.options.loop = true;
        instance.addEventToStateProperty = jest.fn();
        instance.addReverseCalledEvent('test', { hello: 1 }, false);
        expect(instance.addEventToStateProperty).toHaveBeenCalledTimes(1);
        expect(instance.addEventToStateProperty).toHaveBeenCalledWith('test', { hello: 1 }, false, 'reverseCalledEvents');
      });

      it('should not call addEventToStateProperty correctly when loop options is false', () => {
        instance.options.loop = false;
        instance.addEventToStateProperty = jest.fn();
        instance.addReverseCalledEvent('test', { hello: 1 }, false);
        expect(instance.addEventToStateProperty).toHaveBeenCalledTimes(0);
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

      it('should call raf method correctly', () => {
        raf.mockReset();
        instance.typeString('test').runEventLoop();
        expect(raf).toHaveBeenCalledTimes(1);
      });

      it('should not run if event queue is empty and loop option is false', () => {
        instance.options.loop = false;
        instance.state.eventQueue = [];
        raf.mockReset();
        instance.runEventLoop();
        expect(raf).toHaveBeenCalledTimes(0);
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

          it('should append child to wrapper if nod element is not provided', () => {
            instance.state.elements.wrapper.appendChild = jest.fn();
            instance.runEventLoop();
            expect(instance.state.elements.wrapper.appendChild).toHaveBeenCalledTimes(1);
            expect(instance.state.elements.wrapper.appendChild.mock.calls[0][0].textContent).toEqual('t');
            expect(instance.state.visibleNodes).toEqual([
              {
                type: VISIBLE_NODE_TYPES.TEXT_NODE,
                node: instance.state.elements.wrapper.appendChild.mock.calls[0][0],
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
});