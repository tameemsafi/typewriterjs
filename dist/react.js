!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("react")):"function"==typeof define&&define.amd?define("Typewriter",["react"],t):"object"==typeof exports?exports.Typewriter=t(require("react")):e.Typewriter=t(e.react)}("undefined"!=typeof self?self:this,(function(e){return(()=>{var t={7403:(e,t,r)=>{"use strict";r.d(t,{default:()=>N});var n=r(4087),o=r.n(n);const a=function(e){return new RegExp(/<[a-z][\s\S]*>/i).test(e)},i=function(e){var t=document.createElement("div");return t.innerHTML=e,t.childNodes},s=function(e,t){return Math.floor(Math.random()*(t-e+1))+e};var u="TYPE_CHARACTER",c="REMOVE_CHARACTER",p="REMOVE_ALL",l="REMOVE_LAST_VISIBLE_NODE",f="PAUSE_FOR",v="CALL_FUNCTION",d="ADD_HTML_TAG_ELEMENT",h="CHANGE_DELETE_SPEED",y="CHANGE_DELAY",b="CHANGE_CURSOR",m="PASTE_STRING",_="CLEAR",g="HTML_TAG",w="TEXT_NODE";function x(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function j(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?x(Object(r),!0).forEach((function(t){A(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):x(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function E(e){return function(e){if(Array.isArray(e))return O(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(e){if("string"==typeof e)return O(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?O(e,t):void 0}}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function O(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function T(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function A(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var S=function(){function e(t,r){var x=this;if(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),A(this,"state",{cursorAnimation:null,lastFrameTime:null,pauseUntil:null,eventQueue:[],eventLoop:null,eventLoopPaused:!1,reverseCalledEvents:[],calledEvents:[],visibleNodes:[],initialOptions:null,elements:{container:null,wrapper:document.createElement("span"),cursor:document.createElement("span")}}),A(this,"options",{strings:null,cursor:"|",delay:"natural",pauseFor:1500,deleteSpeed:"natural",loop:!1,autoStart:!1,devMode:!1,skipAddStyles:!1,wrapperClassName:"Typewriter__wrapper",cursorClassName:"Typewriter__cursor",stringSplitter:null,onCreateTextNode:null,onRemoveNode:null}),A(this,"setupWrapperElement",(function(){x.state.elements.container&&(x.state.elements.wrapper.className=x.options.wrapperClassName,x.state.elements.cursor.className=x.options.cursorClassName,x.state.elements.cursor.innerHTML=x.options.cursor,x.state.elements.container.innerHTML="",x.state.elements.container.appendChild(x.state.elements.wrapper),x.state.elements.container.appendChild(x.state.elements.cursor))})),A(this,"start",(function(){return x.state.eventLoopPaused=!1,x.runEventLoop(),x})),A(this,"pause",(function(){return x.state.eventLoopPaused=!0,x})),A(this,"stop",(function(){return x.state.eventLoop&&((0,n.cancel)(x.state.eventLoop),x.state.eventLoop=null),x})),A(this,"pauseFor",(function(e){return x.addEventToQueue(f,{ms:e}),x})),A(this,"typeOutAllStrings",(function(){return"string"==typeof x.options.strings?(x.typeString(x.options.strings).pauseFor(x.options.pauseFor),x):(x.options.strings.forEach((function(e){x.typeString(e).pauseFor(x.options.pauseFor).deleteAll(x.options.deleteSpeed)})),x)})),A(this,"typeString",(function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(a(e))return x.typeOutHTMLString(e,t);if(e){var r=x.options||{},n=r.stringSplitter,o="function"==typeof n?n(e):e.split("");x.typeCharacters(o,t)}return x})),A(this,"pasteString",(function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return a(e)?x.typeOutHTMLString(e,t,!0):(e&&x.addEventToQueue(m,{character:e,node:t}),x)})),A(this,"typeOutHTMLString",(function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r=arguments.length>2?arguments[2]:void 0,n=i(e);if(n.length>0)for(var o=0;o<n.length;o++){var a=n[o],s=a.innerHTML;a&&3!==a.nodeType?(a.innerHTML="",x.addEventToQueue(d,{node:a,parentNode:t}),r?x.pasteString(s,a):x.typeString(s,a)):a.textContent&&(r?x.pasteString(a.textContent,t):x.typeString(a.textContent,t))}return x})),A(this,"clear",(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return x.addEventToQueue(_,{amount:e,callOnRemove:t}),x})),A(this,"deleteAll",(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"natural";return x.addEventToQueue(p,{speed:e}),x})),A(this,"changeDeleteSpeed",(function(e){if(!e)throw new Error("Must provide new delete speed");return x.addEventToQueue(h,{speed:e}),x})),A(this,"changeDelay",(function(e){if(!e)throw new Error("Must provide new delay");return x.addEventToQueue(y,{delay:e}),x})),A(this,"changeCursor",(function(e){if(!e)throw new Error("Must provide new cursor");return x.addEventToQueue(b,{cursor:e}),x})),A(this,"deleteChars",(function(e){if(!e)throw new Error("Must provide amount of characters to delete");for(var t=0;t<e;t++)x.addEventToQueue(c);return x})),A(this,"callFunction",(function(e,t){if(!e||"function"!=typeof e)throw new Error("Callback must be a function");return x.addEventToQueue(v,{cb:e,thisArg:t}),x})),A(this,"typeCharacters",(function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(!e||!Array.isArray(e))throw new Error("Characters must be an array");return e.forEach((function(e){x.addEventToQueue(u,{character:e,node:t})})),x})),A(this,"removeCharacters",(function(e){if(!e||!Array.isArray(e))throw new Error("Characters must be an array");return e.forEach((function(){x.addEventToQueue(c)})),x})),A(this,"addEventToQueue",(function(e,t){var r=arguments.length>2&&void 0!==arguments[2]&&arguments[2];return x.addEventToStateProperty(e,t,r,"eventQueue")})),A(this,"addReverseCalledEvent",(function(e,t){var r=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=x.options.loop;return n?x.addEventToStateProperty(e,t,r,"reverseCalledEvents"):x})),A(this,"addEventToStateProperty",(function(e,t){var r=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=arguments.length>3?arguments[3]:void 0,o={eventName:e,eventArgs:t||{}};return x.state[n]=r?[o].concat(E(x.state[n])):[].concat(E(x.state[n]),[o]),x})),A(this,"runEventLoop",(function(){x.state.lastFrameTime||(x.state.lastFrameTime=Date.now());var e=Date.now(),t=e-x.state.lastFrameTime;if(!x.state.eventQueue.length){if(!x.options.loop)return;x.state.eventQueue=E(x.state.calledEvents),x.state.calledEvents=[],x.options=j({},x.state.initialOptions)}if(x.state.eventLoop=o()(x.runEventLoop),!x.state.eventLoopPaused){if(x.state.pauseUntil){if(e<x.state.pauseUntil)return;x.state.pauseUntil=null}var r,n=E(x.state.eventQueue),a=n.shift();if(!(t<=(r=a.eventName===l||a.eventName===c?"natural"===x.options.deleteSpeed?s(40,80):x.options.deleteSpeed:"natural"===x.options.delay?s(120,160):x.options.delay))){var i=a.eventName,O=a.eventArgs;switch(x.logInDevMode({currentEvent:a,state:x.state,delay:r}),i){case m:case u:var T=O.character,A=O.node,S=document.createTextNode(T),N=S;x.options.onCreateTextNode&&"function"==typeof x.options.onCreateTextNode&&(N=x.options.onCreateTextNode(T,S)),N&&(A?A.appendChild(N):x.state.elements.wrapper.appendChild(N)),x.state.visibleNodes=[].concat(E(x.state.visibleNodes),[{type:w,character:T,node:N}]);break;case c:n.unshift({eventName:l,eventArgs:{removingCharacterNode:!0}});break;case f:var C=a.eventArgs.ms;x.state.pauseUntil=Date.now()+parseInt(C);break;case v:var P=a.eventArgs,k=P.cb,R=P.thisArg;k.call(R,{elements:x.state.elements});break;case d:var L=a.eventArgs,D=L.node,M=L.parentNode;M?M.appendChild(D):x.state.elements.wrapper.appendChild(D),x.state.visibleNodes=[].concat(E(x.state.visibleNodes),[{type:g,node:D,parentNode:M||x.state.elements.wrapper}]);break;case p:var F=x.state.visibleNodes,z=O.speed,I=[];"number"==typeof z&&(z<=0&&x.logInDevMode("If you intend to delete the entire text without noticeable delay take a look at the clear() function"),I.push({eventName:h,eventArgs:{speed:z,temp:!0}}));for(var Q=0,U=F.length;Q<U;Q++)I.push({eventName:l,eventArgs:{removingCharacterNode:!1}});"number"==typeof z&&I.push({eventName:h,eventArgs:{speed:x.options.deleteSpeed,temp:!0}}),n.unshift.apply(n,I);break;case l:var H=a.eventArgs.removingCharacterNode;if(x.state.visibleNodes.length){var q=x.state.visibleNodes.pop(),B=q.type,W=q.node,V=q.character;x.options.onRemoveNode&&"function"==typeof x.options.onRemoveNode&&x.options.onRemoveNode({node:W,character:V}),W&&W.parentNode.removeChild(W),B===g&&H&&n.unshift({eventName:l,eventArgs:{}})}break;case _:var $=E(x.state.visibleNodes),G=O.amount,Y=O.callOnRemove;if($.length>0){for(var J=G&&G>0&&G<$.length?G:$.length,X=0;X<J&&$.length>0;){var K=$.pop(),Z=K.type,ee=K.node,te=K.character;Y&&x.options.onRemoveNode&&"function"==typeof x.options.onRemoveNode&&x.options.onRemoveNode(ee,te),ee.parentNode.removeChild(ee),Z===w&&X++}x.state.visibleNodes=$}break;case h:x.options.deleteSpeed=a.eventArgs.speed;break;case y:x.options.delay=a.eventArgs.delay;break;case b:x.options.cursor=a.eventArgs.cursor,x.state.elements.cursor.innerHTML=a.eventArgs.cursor}x.options.loop&&(a.eventName===l||a.eventArgs&&a.eventArgs.temp||(x.state.calledEvents=[].concat(E(x.state.calledEvents),[a]))),x.state.eventQueue=n,x.state.lastFrameTime=e}}})),t)if("string"==typeof t){var O=document.querySelector(t);if(!O)throw new Error("Could not find container element");this.state.elements.container=O}else this.state.elements.container=t;r&&(this.options=j(j({},this.options),r)),this.state.initialOptions=j({},this.options),this.init()}var t,r;return t=e,(r=[{key:"init",value:function(){var e,t;this.setupWrapperElement(),this.addEventToQueue(b,{cursor:this.options.cursor},!0),this.addEventToQueue(p,null,!0),!window||window.___TYPEWRITER_JS_STYLES_ADDED___||this.options.skipAddStyles||(e=".Typewriter__cursor{-webkit-animation:Typewriter-cursor 1s infinite;animation:Typewriter-cursor 1s infinite;margin-left:1px}@-webkit-keyframes Typewriter-cursor{0%{opacity:0}50%{opacity:1}100%{opacity:0}}@keyframes Typewriter-cursor{0%{opacity:0}50%{opacity:1}100%{opacity:0}}",(t=document.createElement("style")).appendChild(document.createTextNode(e)),document.head.appendChild(t),window.___TYPEWRITER_JS_STYLES_ADDED___=!0),!0===this.options.autoStart&&this.options.strings&&this.typeOutAllStrings().start()}},{key:"logInDevMode",value:function(e){this.options.devMode&&console.log(e)}}])&&T(t.prototype,r),e}();const N=S},8552:(e,t,r)=>{var n=r(852)(r(5639),"DataView");e.exports=n},1989:(e,t,r)=>{var n=r(1789),o=r(401),a=r(7667),i=r(1327),s=r(1866);function u(e){var t=-1,r=null==e?0:e.length;for(this.clear();++t<r;){var n=e[t];this.set(n[0],n[1])}}u.prototype.clear=n,u.prototype.delete=o,u.prototype.get=a,u.prototype.has=i,u.prototype.set=s,e.exports=u},8407:(e,t,r)=>{var n=r(7040),o=r(4125),a=r(2117),i=r(7518),s=r(4705);function u(e){var t=-1,r=null==e?0:e.length;for(this.clear();++t<r;){var n=e[t];this.set(n[0],n[1])}}u.prototype.clear=n,u.prototype.delete=o,u.prototype.get=a,u.prototype.has=i,u.prototype.set=s,e.exports=u},7071:(e,t,r)=>{var n=r(852)(r(5639),"Map");e.exports=n},3369:(e,t,r)=>{var n=r(4785),o=r(1285),a=r(6e3),i=r(9916),s=r(5265);function u(e){var t=-1,r=null==e?0:e.length;for(this.clear();++t<r;){var n=e[t];this.set(n[0],n[1])}}u.prototype.clear=n,u.prototype.delete=o,u.prototype.get=a,u.prototype.has=i,u.prototype.set=s,e.exports=u},3818:(e,t,r)=>{var n=r(852)(r(5639),"Promise");e.exports=n},8525:(e,t,r)=>{var n=r(852)(r(5639),"Set");e.exports=n},8668:(e,t,r)=>{var n=r(3369),o=r(619),a=r(2385);function i(e){var t=-1,r=null==e?0:e.length;for(this.__data__=new n;++t<r;)this.add(e[t])}i.prototype.add=i.prototype.push=o,i.prototype.has=a,e.exports=i},6384:(e,t,r)=>{var n=r(8407),o=r(7465),a=r(3779),i=r(7599),s=r(4758),u=r(4309);function c(e){var t=this.__data__=new n(e);this.size=t.size}c.prototype.clear=o,c.prototype.delete=a,c.prototype.get=i,c.prototype.has=s,c.prototype.set=u,e.exports=c},2705:(e,t,r)=>{var n=r(5639).Symbol;e.exports=n},1149:(e,t,r)=>{var n=r(5639).Uint8Array;e.exports=n},577:(e,t,r)=>{var n=r(852)(r(5639),"WeakMap");e.exports=n},4963:e=>{e.exports=function(e,t){for(var r=-1,n=null==e?0:e.length,o=0,a=[];++r<n;){var i=e[r];t(i,r,e)&&(a[o++]=i)}return a}},4636:(e,t,r)=>{var n=r(2545),o=r(5694),a=r(1469),i=r(4144),s=r(5776),u=r(6719),c=Object.prototype.hasOwnProperty;e.exports=function(e,t){var r=a(e),p=!r&&o(e),l=!r&&!p&&i(e),f=!r&&!p&&!l&&u(e),v=r||p||l||f,d=v?n(e.length,String):[],h=d.length;for(var y in e)!t&&!c.call(e,y)||v&&("length"==y||l&&("offset"==y||"parent"==y)||f&&("buffer"==y||"byteLength"==y||"byteOffset"==y)||s(y,h))||d.push(y);return d}},2488:e=>{e.exports=function(e,t){for(var r=-1,n=t.length,o=e.length;++r<n;)e[o+r]=t[r];return e}},2908:e=>{e.exports=function(e,t){for(var r=-1,n=null==e?0:e.length;++r<n;)if(t(e[r],r,e))return!0;return!1}},8470:(e,t,r)=>{var n=r(7813);e.exports=function(e,t){for(var r=e.length;r--;)if(n(e[r][0],t))return r;return-1}},8866:(e,t,r)=>{var n=r(2488),o=r(1469);e.exports=function(e,t,r){var a=t(e);return o(e)?a:n(a,r(e))}},4239:(e,t,r)=>{var n=r(2705),o=r(9607),a=r(2333),i=n?n.toStringTag:void 0;e.exports=function(e){return null==e?void 0===e?"[object Undefined]":"[object Null]":i&&i in Object(e)?o(e):a(e)}},9454:(e,t,r)=>{var n=r(4239),o=r(7005);e.exports=function(e){return o(e)&&"[object Arguments]"==n(e)}},939:(e,t,r)=>{var n=r(2492),o=r(7005);e.exports=function e(t,r,a,i,s){return t===r||(null==t||null==r||!o(t)&&!o(r)?t!=t&&r!=r:n(t,r,a,i,e,s))}},2492:(e,t,r)=>{var n=r(6384),o=r(7114),a=r(8351),i=r(6096),s=r(4160),u=r(1469),c=r(4144),p=r(6719),l="[object Arguments]",f="[object Array]",v="[object Object]",d=Object.prototype.hasOwnProperty;e.exports=function(e,t,r,h,y,b){var m=u(e),_=u(t),g=m?f:s(e),w=_?f:s(t),x=(g=g==l?v:g)==v,j=(w=w==l?v:w)==v,E=g==w;if(E&&c(e)){if(!c(t))return!1;m=!0,x=!1}if(E&&!x)return b||(b=new n),m||p(e)?o(e,t,r,h,y,b):a(e,t,g,r,h,y,b);if(!(1&r)){var O=x&&d.call(e,"__wrapped__"),T=j&&d.call(t,"__wrapped__");if(O||T){var A=O?e.value():e,S=T?t.value():t;return b||(b=new n),y(A,S,r,h,b)}}return!!E&&(b||(b=new n),i(e,t,r,h,y,b))}},8458:(e,t,r)=>{var n=r(3560),o=r(5346),a=r(3218),i=r(346),s=/^\[object .+?Constructor\]$/,u=Function.prototype,c=Object.prototype,p=u.toString,l=c.hasOwnProperty,f=RegExp("^"+p.call(l).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");e.exports=function(e){return!(!a(e)||o(e))&&(n(e)?f:s).test(i(e))}},8749:(e,t,r)=>{var n=r(4239),o=r(1780),a=r(7005),i={};i["[object Float32Array]"]=i["[object Float64Array]"]=i["[object Int8Array]"]=i["[object Int16Array]"]=i["[object Int32Array]"]=i["[object Uint8Array]"]=i["[object Uint8ClampedArray]"]=i["[object Uint16Array]"]=i["[object Uint32Array]"]=!0,i["[object Arguments]"]=i["[object Array]"]=i["[object ArrayBuffer]"]=i["[object Boolean]"]=i["[object DataView]"]=i["[object Date]"]=i["[object Error]"]=i["[object Function]"]=i["[object Map]"]=i["[object Number]"]=i["[object Object]"]=i["[object RegExp]"]=i["[object Set]"]=i["[object String]"]=i["[object WeakMap]"]=!1,e.exports=function(e){return a(e)&&o(e.length)&&!!i[n(e)]}},280:(e,t,r)=>{var n=r(5726),o=r(6916),a=Object.prototype.hasOwnProperty;e.exports=function(e){if(!n(e))return o(e);var t=[];for(var r in Object(e))a.call(e,r)&&"constructor"!=r&&t.push(r);return t}},2545:e=>{e.exports=function(e,t){for(var r=-1,n=Array(e);++r<e;)n[r]=t(r);return n}},1717:e=>{e.exports=function(e){return function(t){return e(t)}}},4757:e=>{e.exports=function(e,t){return e.has(t)}},4429:(e,t,r)=>{var n=r(5639)["__core-js_shared__"];e.exports=n},7114:(e,t,r)=>{var n=r(8668),o=r(2908),a=r(4757);e.exports=function(e,t,r,i,s,u){var c=1&r,p=e.length,l=t.length;if(p!=l&&!(c&&l>p))return!1;var f=u.get(e),v=u.get(t);if(f&&v)return f==t&&v==e;var d=-1,h=!0,y=2&r?new n:void 0;for(u.set(e,t),u.set(t,e);++d<p;){var b=e[d],m=t[d];if(i)var _=c?i(m,b,d,t,e,u):i(b,m,d,e,t,u);if(void 0!==_){if(_)continue;h=!1;break}if(y){if(!o(t,(function(e,t){if(!a(y,t)&&(b===e||s(b,e,r,i,u)))return y.push(t)}))){h=!1;break}}else if(b!==m&&!s(b,m,r,i,u)){h=!1;break}}return u.delete(e),u.delete(t),h}},8351:(e,t,r)=>{var n=r(2705),o=r(1149),a=r(7813),i=r(7114),s=r(8776),u=r(1814),c=n?n.prototype:void 0,p=c?c.valueOf:void 0;e.exports=function(e,t,r,n,c,l,f){switch(r){case"[object DataView]":if(e.byteLength!=t.byteLength||e.byteOffset!=t.byteOffset)return!1;e=e.buffer,t=t.buffer;case"[object ArrayBuffer]":return!(e.byteLength!=t.byteLength||!l(new o(e),new o(t)));case"[object Boolean]":case"[object Date]":case"[object Number]":return a(+e,+t);case"[object Error]":return e.name==t.name&&e.message==t.message;case"[object RegExp]":case"[object String]":return e==t+"";case"[object Map]":var v=s;case"[object Set]":var d=1&n;if(v||(v=u),e.size!=t.size&&!d)return!1;var h=f.get(e);if(h)return h==t;n|=2,f.set(e,t);var y=i(v(e),v(t),n,c,l,f);return f.delete(e),y;case"[object Symbol]":if(p)return p.call(e)==p.call(t)}return!1}},6096:(e,t,r)=>{var n=r(8234),o=Object.prototype.hasOwnProperty;e.exports=function(e,t,r,a,i,s){var u=1&r,c=n(e),p=c.length;if(p!=n(t).length&&!u)return!1;for(var l=p;l--;){var f=c[l];if(!(u?f in t:o.call(t,f)))return!1}var v=s.get(e),d=s.get(t);if(v&&d)return v==t&&d==e;var h=!0;s.set(e,t),s.set(t,e);for(var y=u;++l<p;){var b=e[f=c[l]],m=t[f];if(a)var _=u?a(m,b,f,t,e,s):a(b,m,f,e,t,s);if(!(void 0===_?b===m||i(b,m,r,a,s):_)){h=!1;break}y||(y="constructor"==f)}if(h&&!y){var g=e.constructor,w=t.constructor;g==w||!("constructor"in e)||!("constructor"in t)||"function"==typeof g&&g instanceof g&&"function"==typeof w&&w instanceof w||(h=!1)}return s.delete(e),s.delete(t),h}},1957:(e,t,r)=>{var n="object"==typeof r.g&&r.g&&r.g.Object===Object&&r.g;e.exports=n},8234:(e,t,r)=>{var n=r(8866),o=r(9551),a=r(3674);e.exports=function(e){return n(e,a,o)}},5050:(e,t,r)=>{var n=r(7019);e.exports=function(e,t){var r=e.__data__;return n(t)?r["string"==typeof t?"string":"hash"]:r.map}},852:(e,t,r)=>{var n=r(8458),o=r(7801);e.exports=function(e,t){var r=o(e,t);return n(r)?r:void 0}},9607:(e,t,r)=>{var n=r(2705),o=Object.prototype,a=o.hasOwnProperty,i=o.toString,s=n?n.toStringTag:void 0;e.exports=function(e){var t=a.call(e,s),r=e[s];try{e[s]=void 0;var n=!0}catch(e){}var o=i.call(e);return n&&(t?e[s]=r:delete e[s]),o}},9551:(e,t,r)=>{var n=r(4963),o=r(479),a=Object.prototype.propertyIsEnumerable,i=Object.getOwnPropertySymbols,s=i?function(e){return null==e?[]:(e=Object(e),n(i(e),(function(t){return a.call(e,t)})))}:o;e.exports=s},4160:(e,t,r)=>{var n=r(8552),o=r(7071),a=r(3818),i=r(8525),s=r(577),u=r(4239),c=r(346),p="[object Map]",l="[object Promise]",f="[object Set]",v="[object WeakMap]",d="[object DataView]",h=c(n),y=c(o),b=c(a),m=c(i),_=c(s),g=u;(n&&g(new n(new ArrayBuffer(1)))!=d||o&&g(new o)!=p||a&&g(a.resolve())!=l||i&&g(new i)!=f||s&&g(new s)!=v)&&(g=function(e){var t=u(e),r="[object Object]"==t?e.constructor:void 0,n=r?c(r):"";if(n)switch(n){case h:return d;case y:return p;case b:return l;case m:return f;case _:return v}return t}),e.exports=g},7801:e=>{e.exports=function(e,t){return null==e?void 0:e[t]}},1789:(e,t,r)=>{var n=r(4536);e.exports=function(){this.__data__=n?n(null):{},this.size=0}},401:e=>{e.exports=function(e){var t=this.has(e)&&delete this.__data__[e];return this.size-=t?1:0,t}},7667:(e,t,r)=>{var n=r(4536),o=Object.prototype.hasOwnProperty;e.exports=function(e){var t=this.__data__;if(n){var r=t[e];return"__lodash_hash_undefined__"===r?void 0:r}return o.call(t,e)?t[e]:void 0}},1327:(e,t,r)=>{var n=r(4536),o=Object.prototype.hasOwnProperty;e.exports=function(e){var t=this.__data__;return n?void 0!==t[e]:o.call(t,e)}},1866:(e,t,r)=>{var n=r(4536);e.exports=function(e,t){var r=this.__data__;return this.size+=this.has(e)?0:1,r[e]=n&&void 0===t?"__lodash_hash_undefined__":t,this}},5776:e=>{var t=/^(?:0|[1-9]\d*)$/;e.exports=function(e,r){var n=typeof e;return!!(r=null==r?9007199254740991:r)&&("number"==n||"symbol"!=n&&t.test(e))&&e>-1&&e%1==0&&e<r}},7019:e=>{e.exports=function(e){var t=typeof e;return"string"==t||"number"==t||"symbol"==t||"boolean"==t?"__proto__"!==e:null===e}},5346:(e,t,r)=>{var n,o=r(4429),a=(n=/[^.]+$/.exec(o&&o.keys&&o.keys.IE_PROTO||""))?"Symbol(src)_1."+n:"";e.exports=function(e){return!!a&&a in e}},5726:e=>{var t=Object.prototype;e.exports=function(e){var r=e&&e.constructor;return e===("function"==typeof r&&r.prototype||t)}},7040:e=>{e.exports=function(){this.__data__=[],this.size=0}},4125:(e,t,r)=>{var n=r(8470),o=Array.prototype.splice;e.exports=function(e){var t=this.__data__,r=n(t,e);return!(r<0||(r==t.length-1?t.pop():o.call(t,r,1),--this.size,0))}},2117:(e,t,r)=>{var n=r(8470);e.exports=function(e){var t=this.__data__,r=n(t,e);return r<0?void 0:t[r][1]}},7518:(e,t,r)=>{var n=r(8470);e.exports=function(e){return n(this.__data__,e)>-1}},4705:(e,t,r)=>{var n=r(8470);e.exports=function(e,t){var r=this.__data__,o=n(r,e);return o<0?(++this.size,r.push([e,t])):r[o][1]=t,this}},4785:(e,t,r)=>{var n=r(1989),o=r(8407),a=r(7071);e.exports=function(){this.size=0,this.__data__={hash:new n,map:new(a||o),string:new n}}},1285:(e,t,r)=>{var n=r(5050);e.exports=function(e){var t=n(this,e).delete(e);return this.size-=t?1:0,t}},6e3:(e,t,r)=>{var n=r(5050);e.exports=function(e){return n(this,e).get(e)}},9916:(e,t,r)=>{var n=r(5050);e.exports=function(e){return n(this,e).has(e)}},5265:(e,t,r)=>{var n=r(5050);e.exports=function(e,t){var r=n(this,e),o=r.size;return r.set(e,t),this.size+=r.size==o?0:1,this}},8776:e=>{e.exports=function(e){var t=-1,r=Array(e.size);return e.forEach((function(e,n){r[++t]=[n,e]})),r}},4536:(e,t,r)=>{var n=r(852)(Object,"create");e.exports=n},6916:(e,t,r)=>{var n=r(5569)(Object.keys,Object);e.exports=n},1167:(e,t,r)=>{e=r.nmd(e);var n=r(1957),o=t&&!t.nodeType&&t,a=o&&e&&!e.nodeType&&e,i=a&&a.exports===o&&n.process,s=function(){try{return a&&a.require&&a.require("util").types||i&&i.binding&&i.binding("util")}catch(e){}}();e.exports=s},2333:e=>{var t=Object.prototype.toString;e.exports=function(e){return t.call(e)}},5569:e=>{e.exports=function(e,t){return function(r){return e(t(r))}}},5639:(e,t,r)=>{var n=r(1957),o="object"==typeof self&&self&&self.Object===Object&&self,a=n||o||Function("return this")();e.exports=a},619:e=>{e.exports=function(e){return this.__data__.set(e,"__lodash_hash_undefined__"),this}},2385:e=>{e.exports=function(e){return this.__data__.has(e)}},1814:e=>{e.exports=function(e){var t=-1,r=Array(e.size);return e.forEach((function(e){r[++t]=e})),r}},7465:(e,t,r)=>{var n=r(8407);e.exports=function(){this.__data__=new n,this.size=0}},3779:e=>{e.exports=function(e){var t=this.__data__,r=t.delete(e);return this.size=t.size,r}},7599:e=>{e.exports=function(e){return this.__data__.get(e)}},4758:e=>{e.exports=function(e){return this.__data__.has(e)}},4309:(e,t,r)=>{var n=r(8407),o=r(7071),a=r(3369);e.exports=function(e,t){var r=this.__data__;if(r instanceof n){var i=r.__data__;if(!o||i.length<199)return i.push([e,t]),this.size=++r.size,this;r=this.__data__=new a(i)}return r.set(e,t),this.size=r.size,this}},346:e=>{var t=Function.prototype.toString;e.exports=function(e){if(null!=e){try{return t.call(e)}catch(e){}try{return e+""}catch(e){}}return""}},7813:e=>{e.exports=function(e,t){return e===t||e!=e&&t!=t}},5694:(e,t,r)=>{var n=r(9454),o=r(7005),a=Object.prototype,i=a.hasOwnProperty,s=a.propertyIsEnumerable,u=n(function(){return arguments}())?n:function(e){return o(e)&&i.call(e,"callee")&&!s.call(e,"callee")};e.exports=u},1469:e=>{var t=Array.isArray;e.exports=t},8612:(e,t,r)=>{var n=r(3560),o=r(1780);e.exports=function(e){return null!=e&&o(e.length)&&!n(e)}},4144:(e,t,r)=>{e=r.nmd(e);var n=r(5639),o=r(5062),a=t&&!t.nodeType&&t,i=a&&e&&!e.nodeType&&e,s=i&&i.exports===a?n.Buffer:void 0,u=(s?s.isBuffer:void 0)||o;e.exports=u},8446:(e,t,r)=>{var n=r(939);e.exports=function(e,t){return n(e,t)}},3560:(e,t,r)=>{var n=r(4239),o=r(3218);e.exports=function(e){if(!o(e))return!1;var t=n(e);return"[object Function]"==t||"[object GeneratorFunction]"==t||"[object AsyncFunction]"==t||"[object Proxy]"==t}},1780:e=>{e.exports=function(e){return"number"==typeof e&&e>-1&&e%1==0&&e<=9007199254740991}},3218:e=>{e.exports=function(e){var t=typeof e;return null!=e&&("object"==t||"function"==t)}},7005:e=>{e.exports=function(e){return null!=e&&"object"==typeof e}},6719:(e,t,r)=>{var n=r(8749),o=r(1717),a=r(1167),i=a&&a.isTypedArray,s=i?o(i):n;e.exports=s},3674:(e,t,r)=>{var n=r(4636),o=r(280),a=r(8612);e.exports=function(e){return a(e)?n(e):o(e)}},479:e=>{e.exports=function(){return[]}},5062:e=>{e.exports=function(){return!1}},75:function(e){(function(){var t,r,n,o,a,i;"undefined"!=typeof performance&&null!==performance&&performance.now?e.exports=function(){return performance.now()}:"undefined"!=typeof process&&null!==process&&process.hrtime?(e.exports=function(){return(t()-a)/1e6},r=process.hrtime,o=(t=function(){var e;return 1e9*(e=r())[0]+e[1]})(),i=1e9*process.uptime(),a=o-i):Date.now?(e.exports=function(){return Date.now()-n},n=Date.now()):(e.exports=function(){return(new Date).getTime()-n},n=(new Date).getTime())}).call(this)},2703:(e,t,r)=>{"use strict";var n=r(414);function o(){}function a(){}a.resetWarningCache=o,e.exports=function(){function e(e,t,r,o,a,i){if(i!==n){var s=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw s.name="Invariant Violation",s}}function t(){return e}e.isRequired=e;var r={array:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:t,element:e,elementType:e,instanceOf:t,node:e,objectOf:t,oneOf:t,oneOfType:t,shape:t,exact:t,checkPropTypes:a,resetWarningCache:o};return r.PropTypes=r,r}},5697:(e,t,r)=>{e.exports=r(2703)()},414:e=>{"use strict";e.exports="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"},4087:(e,t,r)=>{for(var n=r(75),o="undefined"==typeof window?r.g:window,a=["moz","webkit"],i="AnimationFrame",s=o["request"+i],u=o["cancel"+i]||o["cancelRequest"+i],c=0;!s&&c<a.length;c++)s=o[a[c]+"Request"+i],u=o[a[c]+"Cancel"+i]||o[a[c]+"CancelRequest"+i];if(!s||!u){var p=0,l=0,f=[];s=function(e){if(0===f.length){var t=n(),r=Math.max(0,16.666666666666668-(t-p));p=r+t,setTimeout((function(){var e=f.slice(0);f.length=0;for(var t=0;t<e.length;t++)if(!e[t].cancelled)try{e[t].callback(p)}catch(e){setTimeout((function(){throw e}),0)}}),Math.round(r))}return f.push({handle:++l,callback:e,cancelled:!1}),l},u=function(e){for(var t=0;t<f.length;t++)f[t].handle===e&&(f[t].cancelled=!0)}}e.exports=function(e){return s.call(o,e)},e.exports.cancel=function(){u.apply(o,arguments)},e.exports.polyfill=function(e){e||(e=o),e.requestAnimationFrame=s,e.cancelAnimationFrame=u}},8156:t=>{"use strict";t.exports=e}},r={};function n(e){var o=r[e];if(void 0!==o)return o.exports;var a=r[e]={id:e,loaded:!1,exports:{}};return t[e].call(a.exports,a,a.exports,n),a.loaded=!0,a.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.nmd=e=>(e.paths=[],e.children||(e.children=[]),e);var o={};return(()=>{"use strict";n.d(o,{default:()=>y});var e=n(8156),t=n.n(e),r=(n(5697),n(7403)),a=n(8446),i=n.n(a);function s(e){return s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s(e)}function u(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function c(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function p(e,t){return p=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},p(e,t)}function l(e,t){if(t&&("object"===s(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return f(e)}function f(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function v(e){return v=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},v(e)}function d(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var h=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&p(e,t)}(y,e);var n,o,a,s,h=(a=y,s=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,t=v(a);if(s){var r=v(this).constructor;e=Reflect.construct(t,arguments,r)}else e=t.apply(this,arguments);return l(this,e)});function y(){var e;u(this,y);for(var t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];return d(f(e=h.call.apply(h,[this].concat(r))),"state",{instance:null}),e}return n=y,(o=[{key:"componentDidMount",value:function(){var e=this,t=new r.default(this.typewriter,this.props.options);this.setState({instance:t},(function(){var r=e.props.onInit;r&&r(t)}))}},{key:"componentDidUpdate",value:function(e){i()(this.props.options,e.options)||this.setState({instance:new r.default(this.typewriter,this.props.options)})}},{key:"componentWillUnmount",value:function(){this.state.instance&&this.state.instance.stop()}},{key:"render",value:function(){var e=this,r=this.props.component;return t().createElement(r,{ref:function(t){return e.typewriter=t},className:"Typewriter","data-testid":"typewriter-wrapper"})}}])&&c(n.prototype,o),y}(e.Component);h.defaultProps={component:"div"};const y=h})(),o.default})()}));