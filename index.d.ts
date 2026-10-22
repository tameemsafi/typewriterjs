declare module "typewriter-effect" {
  export interface DelayRange {
    /**
     * Smallest delay in milliseconds.
     */
    min: number
    /**
     * Largest delay in milliseconds.
     */
    max: number
  }

  export type Speed = "natural" | number | DelayRange

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
     * The delay between each key when typing. Use a `{ min, max }` range to
     * pick a random delay between two values.
     *
     * @default "natural"
     */
    delay?: Speed
    /**
     * The delay between deleting each character. Use a `{ min, max }` range
     * to pick a random delay between two values.
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
     * The pause duration after a string is typed when using autostart mode.
     *
     * @default 1500
     */
    pauseFor?: number
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
     * Class name for the cursor element. The default blinking animation uses
     * the `Typewriter__cursor` class, so include it to keep the blinking,
     * for example `"Typewriter__cursor my-cursor"`.
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
     * Callback function when a node is about to be removed.
     * The character is only set when a text node is removed.
     *
     * @default null
     */
    onRemoveNode?: (param: { node: Node | void, character?: string }) => void
    /**
     * Max milliseconds of elapsed time to catch up on in a single frame.
     * When set, several events can run per frame so typing keeps its pace
     * after the tab was inactive.
     *
     * @default null
     */
    maxCatchUpDelta?: number | null
    /**
     * Whether strings that look like HTML should be added as HTML elements.
     * Set to false to always type strings exactly as written, for example
     * when the text contains `<` or `>` characters or comes from users.
     *
     * @default true
     */
    parseHTML?: boolean
    /**
     * Text that is shown straight away when the typewriter is created.
     * It can be deleted like typed text and is not typed again when looping.
     *
     * @default null
     */
    initialText?: string | null
    /**
     * Keep the last string of the `strings` option on the page instead of
     * deleting it. Only used when `loop` is false.
     *
     * @default false
     */
    keepLastString?: boolean
    /**
     * Whether to delete everything when the loop starts again. Set to false
     * to keep adding text on every loop.
     *
     * @default true
     */
    deleteOnLoop?: boolean
    /**
     * Whether the cursor blinks.
     *
     * @default true
     */
    cursorBlink?: boolean
    /**
     * Split strings into graphemes, so emojis like 👨‍👩‍👧 and letters with
     * accents or marks are typed and deleted as one character.
     * Ignored when `stringSplitter` is set.
     *
     * @default false
     */
    useGraphemeSplitter?: boolean
    /**
     * Add typed characters to a single text node instead of one text node
     * for each character. Fixes text shaping in Safari for scripts such as
     * Arabic or Thai and makes long text faster. Ignored when
     * `onCreateTextNode` is set.
     *
     * @default false
     */
    mergeTextNodes?: boolean
    /**
     * Let `deleteChars` delete pasted text one character at a time instead of
     * deleting the whole pasted string at once. Ignored when
     * `onCreateTextNode` is set.
     *
     * @default false
     */
    pasteAsCharacters?: boolean
    /**
     * Only wait for `delay` or `deleteSpeed` when a character is typed,
     * pasted or deleted. Other events such as `callFunction`, `pauseFor`,
     * `changeDelay` and empty HTML tags run straight away, and `pasteString`
     * with HTML is pasted in one step.
     *
     * @default false
     */
    onlyDelayVisibleChanges?: boolean
    /**
     * Reserve the space that the typed text will need, so the page does not
     * move while typing. The space is worked out from the queued events each
     * time `start()` is called, and is as big as the largest text that will
     * be shown.
     *
     * @default false
     */
    reserveSpace?: boolean
  }

  export interface TypewriterState {
    elements: {
      container: HTMLElement
      cursor: HTMLSpanElement
      wrapper: HTMLSpanElement
    }
  }


  export class TypewriterClass {
    constructor(container: string | HTMLElement | null, options?: Options)

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
     * Run every event in the queue straight away, without any delay or
     * pause. Useful for a skip button. When looping, call `stop()` after it
     * to keep the final text on the page.
     */
    skipToEnd(): TypewriterClass

    /**
     * Remove every event that has not run yet. Call `start()` again after
     * adding new events.
     */
    clearQueue(): TypewriterClass

    /**
     * Move the cursor by an amount of characters. A negative amount moves the
     * cursor to the left. Typed, pasted and deleted text then happens at the
     * cursor.
     *
     * @param amount Number of characters to move the cursor by
     */
    moveCursor(amount: number): TypewriterClass

    /**
     * Move the cursor before all of the text.
     */
    moveCursorToStart(): TypewriterClass

    /**
     * Move the cursor after all of the text.
     */
    moveCursorToEnd(): TypewriterClass

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
     * @param node Element to type the string inside of
     */
    typeString(string: string, node?: HTMLElement | null): TypewriterClass

    /**
     * Paste out a string.
     *
     * @param string String to paste out, it can contain HTML tags
     * @param node Element to paste the string inside of
     */
    pasteString(string: string, node?: HTMLElement | null): TypewriterClass

    /**
     * Delete everything that is visible inside of the typewriter wrapper
     * element.
     *
     * @param speed  Speed to delete all visibles nodes, can be number or
     * 'natural'
     * @default "natural"
     */
    deleteAll(speed?: Speed): TypewriterClass

    /**
     * Delete everything that is visible inside of the typewriter wrapper
     * element using the current deleteSpeed option.
     */
    deleteAllWithDeleteSpeed(): TypewriterClass

    /**
     * Remove everything that is visible inside of the typewriter wrapper
     * element straight away, without a delete animation.
     */
    clear(): TypewriterClass

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
      thisArg?: unknown,
    ): TypewriterClass

    /**
     * The speed at which to delete the characters, lower number is faster.
     *
     * @param speed Number or 'natural'
     */
    changeDeleteSpeed(speed: Speed): TypewriterClass

    /**
     * Change the delay when typing out each character
     *
     * @param delay delay Number or 'natural'
     */
    changeDelay(delay: Speed): TypewriterClass

    /**
     * Change the cursor. Use an empty string to hide the cursor.
     *
     * @param cursor String to use as the cursor
     */
    changeCursor(cursor: string): TypewriterClass
  }

  export interface TypewriterComponentProps
    extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
    component?: React.ElementType
    onInit?: (typewriter: TypewriterClass) => void
    options?: Partial<Options>
  }

  const TypewriterComponent: React.FunctionComponent<TypewriterComponentProps>

  export default TypewriterComponent
}

declare module "typewriter-effect/dist/core" {
  import { TypewriterClass } from "typewriter-effect"

  export default TypewriterClass
}
