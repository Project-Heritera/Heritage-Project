/*
Im tired of deleting consol.logs just to readd them later when i start debugging again so instead
lets have a function you can use anywhere called debugLog which will only work if a
debug boolean is true, then all you do is make it true here and all of those prints work
*/
const DEBUG = true;
//globalThis so all i have to do is import at root main.jsx and you can use anywhere
export const Debug = {
  log: (...args) => DEBUG && console.log(...args),
  warn: (...args) => DEBUG && console.warn(...args),
  error: (...args) => DEBUG && console.error(...args),
};
globalThis.Debug = Debug;