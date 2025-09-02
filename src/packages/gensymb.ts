import he from 'he';
var export$;
export { export$ as Gensymb }
'use strict';
var Gensymb;
export$ = Gensymb = (function(){
  Gensymb.displayName = 'Gensymb';
  var args, symbols, prototype = Gensymb.prototype, constructor = Gensymb;
  args = Gensymb.args = {};
  function Gensymb(generator, options){}
  symbols = Gensymb.symbols = new Map([['degree', he.decode('&deg;')], ['celsius', '\u2103'], ['perthousand', he.decode('&permil;')], ['ohm', '\u2126'], ['micro', he.decode('&mu;')]]);
  return Gensymb;
}());