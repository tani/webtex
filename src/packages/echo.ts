var export$;
export { export$ as Echo }
'use strict';
var Echo;
export$ = Echo = (function(){
  Echo.displayName = 'Echo';
  var args, prototype = Echo.prototype, constructor = Echo;
  args = Echo.args = {};
  function Echo(generator, options){}
  args.gobbleO = ['H', 'o?'];
  Echo.prototype['gobbleO'] = function(){
    return [];
  };
  args.echoO = ['H', 'o?'];
  Echo.prototype['echoO'] = function(o){
    return ["-", o, "-"];
  };
  args.echoOGO = ['H', 'o?', 'g', 'o?'];
  Echo.prototype['echoOGO'] = function(o1, g, o2){
    var x$;
    x$ = [];
    if (o1) {
      x$.push("-", o1, "-");
    }
    x$.push("+", g, "+");
    if (o2) {
      x$.push("-", o2, "-");
    }
    return x$;
  };
  args.echoGOG = ['H', 'g', 'o?', 'g'];
  Echo.prototype['echoGOG'] = function(g1, o, g2){
    var x$;
    x$ = ["+", g1, "+"];
    if (o) {
      x$.push("-", o, "-");
    }
    x$.push("+", g2, "+");
    return x$;
  };
  return Echo;
}());