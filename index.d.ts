type Speed = "natural" | number

declare module "typewriter-effect" {
  export interface Options {
    /**
     * Strings to type out when using autoStart option
     * 
     * @default null
     */
    strings?: string | string[]
    /**
     * String value to use as the cursor.
     * 
     * @default Pipe character
     */
    cursor?: string
    /**
     * The delay between each key when typing.
     * 
     * @default "natural"
     */
    delay?: Speed
    /**
     * The delay between deleting each character.
     * 
     * @default "natural"
     */
    deleteSpeed?: Speed
    /**
     * Whether to keep looping or not.
     * 
     * @default false
     */
    loop?: boolean
    /**
     * Whether to autostart typing strings or not. You are required to provide
     * strings option.
     * 
     * @default false
     */
    autoStart?: boolean
    /**
     * Whether or not to display console logs.
     *
     * @default false
     */
    devMode?: boolean
    /**
     * Skip adding default typewriter css styles.
     *
     * @default false
     */
    skipAddStyles?: boolean
    /**
     * Class name for the wrapper element.
     * 
     * @default "Typewriter__wrapper"
     */
    wrapperClassName?: string
    /**
     * Class name for the cursor element.
     * 
     * @default "Typewriter__cursor"
     */
    cursorClassName?: string
    /**
     * String splitter function, can be used to split emoji's
     * 
     * @default null
     */
    stringSplitter?: (text: string) => string[]
    /**
     * Callback function to replace the internal method which
     * creates a text node for the character before adding
     * it to the DOM. If you return null, then it will
     * not add anything to the DOM and so it
     * is up to you to handle it
     * 
     * @default null
     */
    onCreateTextNode?: (character: string, textNode: Text) => Text | null
    /**
     * Callback function when a node is about to be removed
     * 
     * @default null
     */
    onRemoveNode?: (param: { node: Node | void, charater: string }) => void
  }

  export interface TypewriterState {
    elements: {
      container: HTMLDivElement
      cursor: HTMLSpanElement
      wrapper: HTMLSpanElement
    }
  }


  export class TypewriterClass {
    constructor(container: string | HTMLElement, options: Options)

    /**
     * Start the typewriter effect.
     */
    start(): TypewriterClass

    /**
     * Stop the typewriter effect.
     */
    stop(): TypewriterClass

    /**
     * Pause the typewriter effect.
     */
    pause(): TypewriterClass

    /**
     * Pause for milliseconds
     * 
     * @param ms Time to pause for in milliseconds
     */
    pauseFor(ms: number): TypewriterClass

    /**
     * Type out a string using the typewriter effect.
     * 
     * @param string String to type out, it can contain HTML tags
     */
    typeString(string: string): TypewriterClass

    /**
     * Paste out a string.
     *
     * @param string  String to paste out, it can contain HTML tags
     */
    pasteString(string: string, node: HTMLElement | null): TypewriterClass

    /**
     * Delete everything that is visible inside of the typewriter wrapper
     * element.
     *
     * @param speed  Speed to delete all visibles nodes, can be number or
     * 'natural'
     */
    deleteAll(speed?: Speed): TypewriterClass

    /**
     * Delete and amount of characters, starting at the end of the visible
     * string.
     *
     * @param amount Number of characters
     */
    deleteChars(amount: number): TypewriterClass

    /**
     * Call a callback function. The first parameter to the callback elements
     * which contains all DOM nodes used in the typewriter effect.
     * 
     * @param callback Callback
     * @param thisArg this Object to bind to the callback function
     */
    callFunction(
      callback: (state: TypewriterState) => void,
      thisArg?: Record<string, any>,
    ): TypewriterClass

    /**
     * The speed at which to delete the characters, lower number is faster.
     *
     * @param speed Number or 'natural'
     */
    changeDeleteSpeed(speed?: Speed): TypewriterClass

    /**
     * Change the delay when typing out each character
     *
     * @param delay delay Number or 'natural'
     */
    changeDelay(delay?: Speed): TypewriterClass
  }

  const TypewriterComponent: React.FunctionComponent<{
    component?: React.ElementType
    onInit?: (typewriter: TypewriterClass) => void
    options?: Partial<Options>
  }>

  export default TypewriterComponent
}
