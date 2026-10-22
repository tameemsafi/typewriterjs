export const EVENT_NAMES = {
  TYPE_CHARACTER: 'TYPE_CHARACTER',
  REMOVE_CHARACTER: 'REMOVE_CHARACTER',
  REMOVE_ALL: 'REMOVE_ALL',
  REMOVE_LAST_VISIBLE_NODE: 'REMOVE_LAST_VISIBLE_NODE',
  PAUSE_FOR: 'PAUSE_FOR',
  CALL_FUNCTION: 'CALL_FUNCTION',
  ADD_HTML_TAG_ELEMENT: 'ADD_HTML_TAG_ELEMENT',
  CHANGE_DELETE_SPEED: 'CHANGE_DELETE_SPEED',
  CHANGE_DELAY: 'CHANGE_DELAY',
  CHANGE_CURSOR: 'CHANGE_CURSOR',
  PASTE_STRING: 'PASTE_STRING',
  CLEAR: 'CLEAR',
  MOVE_CURSOR: 'MOVE_CURSOR',
  MOVE_CURSOR_TO: 'MOVE_CURSOR_TO',
};

export const CURSOR_POSITIONS = {
  START: 'start',
  END: 'end',
};

export const VISIBLE_NODE_TYPES = {
  HTML_TAG: 'HTML_TAG',
  TEXT_NODE: 'TEXT_NODE',
}

export const NATURAL_TYPING_DELAY = { min: 120, max: 160 };

export const NATURAL_DELETE_DELAY = { min: 40, max: 80 };

export const STYLES = `.Typewriter__cursor{-webkit-animation:Typewriter-cursor 1s infinite;animation:Typewriter-cursor 1s infinite;margin-left:1px}@-webkit-keyframes Typewriter-cursor{0%{opacity:0}50%{opacity:1}100%{opacity:0}}@keyframes Typewriter-cursor{0%{opacity:0}50%{opacity:1}100%{opacity:0}}`;