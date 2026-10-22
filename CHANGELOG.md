# Changelog

## 3.3.0

### Added

- Command line tool. Run ``npx typewriter-effect "Hello" "World"`` to play a typewriter effect in the terminal, or add ``--gif out.gif`` to save it as a GIF. Steps can be described in a JSON or JavaScript config file, and ``--demo`` plays a tour of the features.
- GIFs are recorded with the real typewriter in a headless browser. This needs the optional ``puppeteer`` peer dependency and ffmpeg. The library itself still has no runtime dependencies.
- New readme GIF, made with ``npm run demo:gif``.

## 3.2.0

All new behaviour is opt-in, so existing code keeps working the same way.

### Added

- `moveCursor(amount)`, `moveCursorToStart()` and `moveCursorToEnd()` methods. Typed, pasted and deleted text happens at the cursor, so you can fix typos or type in the middle of the text. `deleteAll` and `clear` move the cursor back to the end first.
- `reserveSpace` option to keep the space of the largest text that will be typed, so the page does not move while typing.
- FAQ entries and examples for moving the cursor, reserving space and scrolling lines.

## 3.1.0

All new behaviour is opt-in, so existing code keeps working the same way.

### Added

- `clear()` method to remove everything straight away, without a delete animation.
- `clearQueue()` method to remove every event that has not run yet.
- `skipToEnd()` method to run every queued event straight away, for example for a skip button.
- `initialText` option to show text straight away that can be deleted like typed text.
- `keepLastString` option to keep the last string of the `strings` option when `loop` is false.
- `deleteOnLoop` option. Set it to `false` to keep the text when the loop starts again.
- `cursorBlink` option to turn off the cursor blinking.
- `useGraphemeSplitter` option to type emojis and letters with accents or marks as one character.
- `mergeTextNodes` option to add typed characters to a single text node. This fixes Arabic, Thai and other scripts not joining in Safari and makes long text faster.
- `pasteAsCharacters` option so `deleteChars` can delete pasted text one character at a time.
- `onlyDelayVisibleChanges` option so only typed, pasted or deleted characters wait for a delay. `deleteChars` then uses `deleteSpeed` once per character, and `pasteString` with HTML is pasted in one step.
- `delay` and `deleteSpeed` accept a `{ min, max }` range for a random delay.
- `changeCursor('')` hides the cursor. Before, an empty string threw an error.
- React: extra props such as `className`, `id`, `style`, `translate`, `aria-*` and `data-*` are passed to the element.
- React: the core class is exported as `TypewriterClass`, matching the TypeScript types.
- React: the build includes `'use client'` so it works in Next.js server components.
- The cursor has `aria-hidden="true"` so screen readers do not read it.
- FAQ section in the readme and new examples.

### Fixed

- Events added inside `callFunction`, such as `typeString`, were lost.
- `deleteAll(0)` used the `deleteSpeed` option instead of a speed of zero.
- Passing something that is not an HTML element as the container now throws a clear error, and the selector is included in the `Could not find container element` error.

## 3.0.0

### Breaking changes

- Dropped Internet Explorer 11 and other outdated browsers. Supported browsers now follow [Baseline Widely available](https://web.dev/baseline) with downstream browsers, using the browserslist query `baseline widely available with downstream`. See the Browser support section in the readme.
- React: when the `options` prop changes, the old typewriter is stopped and `onInit` is called again with the new instance. Before, the text was cleared and nothing was typed.
- React: functions inside `options` are no longer compared. Changing only a function, such as `stringSplitter`, no longer creates a new typewriter.
- Void elements such as `<br>` and `<img>` now count as one character when using `deleteChars`. Before, deleting one of them also deleted the character before it.
- HTML comments inside strings are ignored instead of being counted as characters.
- HTML entities such as `&lt;`, `&gt;` and `&amp;` inside HTML strings are now typed as the characters they represent.
- TypeScript: `changeDelay` and `changeDeleteSpeed` now require a value, and the `onRemoveNode` param uses `character` instead of `charater`.

### Added

- `deleteAllWithDeleteSpeed()` method to delete everything using the current `deleteSpeed` option. `deleteAll()` still uses `'natural'` by default.
- `parseHTML` option (default `true`). Set it to `false` to type strings exactly as written, without turning them into HTML elements.
- TypeScript types for `typewriter-effect/dist/core`, `changeCursor`, `deleteAllWithDeleteSpeed`, `parseHTML`, `pauseFor` and `maxCatchUpDelta`.
- Security section in the readme about passing untrusted text.

### Fixed

- Calling `start()` after `pause()` no longer starts a second event loop that `stop()` could not cancel.
- `deleteChars` now deletes the correct amount of characters across nested HTML tags.
- `changeDelay(0)` and `changeDeleteSpeed(0)` no longer throw an error.
- Removing a node that was already removed from the page no longer throws an error.
- Typing long strings is faster because the event queue is no longer copied for every new event.
- TypeScript: `container` is now typed as `HTMLElement` and can be `null`, and `options` and the `pasteString` node are optional.
- React: in `StrictMode`, the first typewriter instance is now stopped correctly, so callbacks no longer run twice.
- React: inline functions inside `options` no longer restart the effect on every render.

### Changed

- No runtime dependencies. Removed `raf`, `lodash` and `prop-types`.
- `dist/core.js` and `dist/react.js` are much smaller.
- The `dist` files use ES2019 syntax, so older bundlers such as webpack 4 can still read them.

### Development

- Updated to Babel 8, Jest 30, webpack-cli 7 and React 19 for development. React 17, 18 and 19 are still supported.
- Building and running the tests now requires Node.js 26 or newer. Added `.nvmrc` and a `devEngines` check that warns when an older Node.js version is used. This does not affect projects that install `typewriter-effect`.
- Replaced `lolex` with `@sinonjs/fake-timers`.
- Updated GitHub Actions to Node.js 26 and the latest `actions/checkout` and `actions/setup-node`. Pull requests now also run the production build.
