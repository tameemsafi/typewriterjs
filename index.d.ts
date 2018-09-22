declare module "typewriter-effect/core" {
  export interface Options {
    strings: ?Array<string>,
    cursor: string,
    delay: 'natural' | number,
    deleteSpeed: 'natural' | number,
    loop: boolean,
    autoStart: boolean,
    devMode: boolean,
    wrapperClassName: string,
    cursorClassName: string,
  }

  class Typewriter {
    constructor(container: string | HTMLElement, options: Options);

    start(): Typewriter;
    stop(): Typewriter;
    pause(): Typewriter;
    pauseFor(ms: number): Typewriter;
    typeString(string: string): Typewriter;
    deleteAll(speed?: 'natural' | number): Typewriter;
    changeDeleteSpeed(speed: number): Typewriter;
    changeDelay(delay: number): Typewriter;
    deleteChars(amount: number): Typewriter;
    callFunction(callback: Function, thisArg: Object): Typewriter;
  }

  export default Typewriter;
}