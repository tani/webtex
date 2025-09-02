import he from 'he';
var export$;
export { export$ as Stix }
'use strict';
var Stix;
export$ = Stix = (function(){
  Stix.displayName = 'Stix';
  var args, symbols, prototype = Stix.prototype, constructor = Stix;
  args = Stix.args = {};
  function Stix(generator, options){
    generator.KaTeX.__defineSymbol("math", "main", "textord", "\u2664", "\\varspadesuit", true);
    generator.KaTeX.__defineSymbol("math", "main", "textord", "\u2665", "\\varheartsuit", true);
    generator.KaTeX.__defineSymbol("math", "main", "textord", "\u2666", "\\vardiamondsuit", true);
    generator.KaTeX.__defineSymbol("math", "main", "textord", "\u2667", "\\varclubsuit", true);
  }
  symbols = Stix.symbols = new Map([['checkmark', he.decode('&check;')]]);
  return Stix;
}());