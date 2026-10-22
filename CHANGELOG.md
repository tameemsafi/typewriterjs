# Changelog

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
