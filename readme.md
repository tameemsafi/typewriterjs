# TypewriterJS v3

[![Tests](https://github.com/tameemsafi/typewriterjs/actions/workflows/tests.yaml/badge.svg)](https://github.com/tameemsafi/typewriterjs/actions/workflows/tests.yaml)

![](preview.gif)

[NPM Repository](https://npmjs.org/typewriter-effect)
[JSFiddle Example](https://jsfiddle.net/hzfxp2L9/)
[Emoji Example](https://codesandbox.io/s/typewriter-effect-emojis-pgz6e)

## CDN

You can use the CDN version of this plugin for fast and easy setup.

```html
<script src="https://unpkg.com/typewriter-effect@3/dist/core.js"></script>
```

## Upgrading to v3

Version 3 drops support for Internet Explorer 11 and other outdated browsers, and changes how the React component handles `options` changes. See [CHANGELOG.md](CHANGELOG.md) for all breaking changes.

## Installation
You can install Typewriterjs with just one command and you're good to go
```shell

# with npm
npm i typewriter-effect

# with yarn
yarn add typewriter-effect

```

## Browser support

Supported browsers follow [Baseline Widely available](https://web.dev/baseline), which covers browser versions released in the last 30 months, including Chromium based browsers such as Samsung Internet and Opera. This is set using the browserslist query `baseline widely available with downstream` in `package.json`.

## Building

You will need to bundle the javascript before it can be used, this can be done using `npm run build:dev` for development or `npm run build:prod` for production.

Building and running the tests requires Node.js 26 or newer. If you use [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to switch to the version in `.nvmrc`.

This only applies to working on this project. Websites and apps that install `typewriter-effect` can use any Node.js version.

## Core

This is the base version of the typewriter effect. It will need a the bundled version of the javascript to work correctly.

See examples in the 'examples' folder.

```js
import Typewriter from 'typewriter-effect/dist/core';

new Typewriter('#typewriter', {
  strings: ['Hello', 'World'],
  autoStart: true,
});
```

## Options

| Name | Type | Default value | Description |
| --- | --- | --- | --- |
| strings | String or Array | null | Strings to type out when using ``autoStart`` option |
| cursor | String | Pipe character | String value to use as the cursor. |
| delay | 'natural' or Number | 'natural' | The delay between each key when typing. |
| deleteSpeed | 'natural' or Number | 'natural' | The delay between deleting each character. |
| loop | Boolean | false | Whether to keep looping or not. |
| autoStart | Boolean | false | Whether to autostart typing strings or not. You are required to provide ``strings`` option. |
| pauseFor | Number | 1500 | The pause duration after a string is typed when using autostart mode |
| devMode | Boolean | false | Whether or not to display console logs. |
| skipAddStyles | Boolean | false | Skip adding default typewriter css styles. |
| wrapperClassName | String | 'Typewriter__wrapper' | Class name for the wrapper element. |
| cursorClassName | String | 'Typewriter__cursor' | Class name for the cursor element. |
| stringSplitter | Function | null | String splitter function, can be used to [split emoji's](https://codesandbox.io/s/typewriter-effect-emojis-pgz6e) |
| onCreateTextNode | Function | null | Callback function to replace the internal method which creates a text node for the character before adding it to the DOM. If you return null, then it will not add anything to the DOM and so it is up to you to handle it. |
| onRemoveNode | Function | null | Callback function when a node is about to be removed. First param will be an object `{ node: HTMLNode, character: string }`. The `character` is only set when a text node is removed. |
| maxCatchUpDelta | Number | null | Max milliseconds of elapsed time to catch up on in a single frame. When set, several events can run per frame so typing keeps its pace after the tab was inactive. Disabled by default (one event per frame). |
| parseHTML | Boolean | true | Whether strings that look like HTML should be added as HTML elements. Set to `false` to always type strings exactly as written, for example when the text contains `<` or `>` characters or comes from users. |

## Methods

All methods can be chained together.

| Name | Params | Description |
| --- | --- | --- |
| start | - | Start the typewriter effect. |
| stop | - | Stop the typewriter effect. |
| pause | - | Pause the typewriter effect. Call ``start`` to continue. |
| pauseFor | ``ms`` Time to pause for in milliseconds | Pause for milliseconds |
| typeString | ``string`` String to type out, it can contain HTML tags | Type out a string using the typewriter effect. |
| pasteString | ``string`` String to paste out, it can contain HTML tags | Paste out a string. |
| deleteAll | ``speed`` Speed to delete all visibles nodes, can be number or 'natural'. Defaults to 'natural' | Delete everything that is visible inside of the typewriter wrapper element. |
| deleteAllWithDeleteSpeed | - | Delete everything that is visible inside of the typewriter wrapper element using the current ``deleteSpeed`` option. |
| deleteChars | ``amount`` Number of characters | Delete and amount of characters, starting at the end of the visible string. |
| callFunction | ``cb`` Callback, ``thisArg`` this Object to bind to the callback function | Call a callback function. The first parameter to the callback ``elements`` which contains all DOM nodes used in the typewriter effect. |
| changeDeleteSpeed | ``speed`` Number or 'natural' | The speed at which to delete the characters, lower number is faster. |
| changeDelay | ``delay`` Number or 'natural' | Change the delay when typing out each character |
| changeCursor | ``cursor`` String to use as the cursor | Change the cursor. |

## HTML strings

``typeString`` and ``pasteString`` add strings that contain HTML tags as real HTML elements.

- Void elements such as ``<br>`` and ``<img>`` count as one character when using ``deleteChars``.
- HTML comments are ignored.
- To show a ``<`` or ``>`` character inside a string that contains HTML, use ``&lt;`` and ``&gt;``. For example ``'<strong>Note:</strong> 1 &lt; 2'``.
- To type a string exactly as written without any HTML, set the ``parseHTML`` option to ``false``.

## Security

Strings that contain HTML and the ``cursor`` option are added to the page using ``innerHTML``. Passing text from users or other untrusted sources can run scripts on your page (XSS).

- Never pass untrusted text to the ``cursor`` option.
- Never pass untrusted text to ``typeString``, ``pasteString`` or ``strings`` while ``parseHTML`` is enabled. Set ``parseHTML: false`` when the text is not fully under your control.

## Examples

### Basic example

```js
var app = document.getElementById('app');

var typewriter = new Typewriter(app, {
  loop: true,
  delay: 75,
});

typewriter
  .pauseFor(2500)
  .typeString('A simple yet powerful native javascript')
  .pauseFor(300)
  .deleteChars(10)
  .typeString('<strong>JS</strong> plugin for a cool typewriter effect and ')
  .typeString('<strong>only <span style="color: #27ae60;">5kb</span> Gzipped!</strong>')
  .pauseFor(1000)
  .start();
```

### Custom text node creator using callback

```js
var app = document.getElementById('app');

var customNodeCreator = function(character) {
  return document.createTextNode(character);
}

var typewriter = new Typewriter(app, {
  loop: true,
  delay: 75,
  onCreateTextNode: customNodeCreator,
});

typewriter
  .typeString('A simple yet powerful native javascript')
  .pauseFor(300)
  .start();
```

### Custom handling text insert using input placeholder

```js
var input = document.getElementById('input')

var customNodeCreator = function(character) {
  // Add character to input placeholder
  input.placeholder = input.placeholder + character;

  // Return null to skip internal adding of dom node
  return null;
}

var onRemoveNode = function({ character }) {
  if(input.placeholder) {
    // Remove last character from input placeholder
    input.placeholder = input.placeholder.slice(0, -1)
  }
}

var typewriter = new Typewriter(null, {
  loop: true,
  delay: 75,
  onCreateTextNode: customNodeCreator,
  onRemoveNode: onRemoveNode,
});

typewriter
  .typeString('A simple yet powerful native javascript')
  .pauseFor(300)
  .start();
```

## React

This includes a React component which can be used within your project. You can pass in a onInit function which will be called with the instance of the typewriter so you can use the typewriter core API.

```jsx
import Typewriter from 'typewriter-effect';

<Typewriter
  onInit={(typewriter) => {
    typewriter.typeString('Hello World!')
      .callFunction(() => {
        console.log('String typed out!');
      })
      .pauseFor(2500)
      .deleteAll()
      .callFunction(() => {
        console.log('All strings were deleted');
      })
      .start();
  }}
/>
```

Alternatively you can also pass in options to use auto play and looping for example:

```jsx
import Typewriter from 'typewriter-effect';

<Typewriter
  options={{
    strings: ['Hello', 'World'],
    autoStart: true,
    loop: true,
  }}
/>
```

When the ``options`` prop changes, the current typewriter is stopped and a new one is created. The ``onInit`` function is then called again with the new instance. Functions inside ``options``, such as ``stringSplitter``, are not compared, so creating a new inline function on every render will not restart the effect.
