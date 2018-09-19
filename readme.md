# TypewriterJS v2

A simple yet powerful native javascript plugin for a cool typewriter effect, developed by Tameem Safi.

I am still learning so any advice or feedback would be amazing. You can find my email on my profile page.

[NPM Repository](https://npmjs.org/typewriter-effect)
[Website](https://safi.me.uk/typewriterjs)
[JSFiddle Example](https://jsfiddle.net/shbqy0mv/9/)

# Core

This include the core typewriter library, which can be used directly through the API.

See examples in the 'examples' folder.

```
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
| loop | Boolean | false | Wether to keep looping or not. |
| autoStart | Boolean | false | Wether to autostart typing strings or not. You are required to provide ``strings`` option. |
| devMode | Boolean | false | Wether or not to display console logs. |
| wrapperClassName | String | 'Typewriter__wrapper' | Class name for the wrapper element. |
| cursorClassName | String | 'Typewriter__cursor' | Class name for the cursor element. |

## Methods

All methods can be chained together.

| Name | Params | Description |
| --- | --- | --- |
| start | - | Start the typewriter effect. |
| stop | - | Stop the typewriter effect. |
| pauseFor | ``ms`` Time to pause for in milliseconds | Pause for milliseconds |
| typeString | ``string`` String to type out, it can contain HTML tags | Type out a string using the typewriter effect. |
| deleteAll | ``speed`` Speed to delete all visibles nodes, can be number or 'natural' | Delete everything that is visible inside of the typewriter wrapper element. |
| deleteChars | ``amount`` Number of characters | Delete and amount of characters, starting at the end of the visible string. |
| callFunction | ``cb`` Callback, ``thisArg`` this Object to bind to the callback function | Call a callback function. The first parameter to the callback ``elements`` which contains all DOM nodes used in the typewriter effect. |
| changeDeleteSpeed | ``speed`` Number or 'natural' | The speed at which to delete the characters, lower number is faster. |
| changeDelay | ``delay`` Number or 'natural' | Change the delay when typing out each character |


# React

This incldues a React component which can be used within your project. You can pass in a onInit function which will be called with the instance of the typewriter so you can use the typewriter core API.

```
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

```
import Typewriter from 'typewriter-effect';

<Typewriter
  options={{
    strings: ['Hello', 'World'],
    autoStart: true,
    loop: true,
  }}
/>
```

# CDN JS

You can use the CDN JS version of this plugin for fast and easy setup.

```html
<script src="https://unpkg.com/typewriter-effect/dist/core.js"></script>
```
