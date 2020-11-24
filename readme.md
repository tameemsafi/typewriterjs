# TypewriterJS v2

[![CircleCI](https://circleci.com/gh/tameemsafi/typewriterjs.svg?style=svg)](https://circleci.com/gh/tameemsafi/typewriterjs)

![](preview.gif)

[NPM Repository](https://npmjs.org/typewriter-effect)
[JSFiddle Example](https://jsfiddle.net/hzfxp2L9/)
[Emoji Example](https://codesandbox.io/s/typewriter-effect-emojis-pgz6e)

## CDN

You can use the CDN version of this plugin for fast and easy setup.

```html
<script src="https://unpkg.com/typewriter-effect@latest/dist/core.js"></script>
```

## Core

This include the core typewriter library, which can be used directly through the API.

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
| skipAddStyles | Boolean | Skip adding default typewriter css styles. |
| wrapperClassName | String | 'Typewriter__wrapper' | Class name for the wrapper element. |
| cursorClassName | String | 'Typewriter__cursor' | Class name for the cursor element. |
| stringSplitter | Function | String splitter function, can be used to [split emoji's](https://codesandbox.io/s/typewriter-effect-emojis-pgz6e) |
| onCreateTextNode | Function | null | Callback function to replace the internal method which creates a text node for the character before adding it to the DOM. If you return null, then it will not add anything to the DOM and so it is up to you to handle it. |
| onRemoveNode | Function | null | Callback function when a node is about to be removed. First param will be an object `{ node: HTMLNode, charater: string }` |

## Methods

All methods can be chained together.

| Name | Params | Description |
| --- | --- | --- |
| start | - | Start the typewriter effect. |
| stop | - | Stop the typewriter effect. |
| pauseFor | ``ms`` Time to pause for in milliseconds | Pause for milliseconds |
| typeString | ``string`` String to type out, it can contain HTML tags | Type out a string using the typewriter effect. |
| pasteString | ``string`` String to paste out, it can contain HTML tags | Paste out a string. |
| deleteAll | ``speed`` Speed to delete all visibles nodes, can be number or 'natural' | Delete everything that is visible inside of the typewriter wrapper element. |
| deleteChars | ``amount`` Number of characters | Delete and amount of characters, starting at the end of the visible string. |
| callFunction | ``cb`` Callback, ``thisArg`` this Object to bind to the callback function | Call a callback function. The first parameter to the callback ``elements`` which contains all DOM nodes used in the typewriter effect. |
| changeDeleteSpeed | ``speed`` Number or 'natural' | The speed at which to delete the characters, lower number is faster. |
| changeDelay | ``delay`` Number or 'natural' | Change the delay when typing out each character |

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
