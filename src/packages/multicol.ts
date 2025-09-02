var export$;
export { export$ as Multicol }
'use strict';
var Multicol;
export$ = Multicol = (function(){
  Multicol.displayName = 'Multicol';
  var args, prototype = Multicol.prototype, constructor = Multicol;
  args = Multicol.args = {};
  function Multicol(generator, options){}
  args['multicols'] = ['V', 'n', 'o?', 'o?'];
  Multicol.prototype['multicols'] = function(cols, pre){
    return [pre, this.g.create(this.g.multicols(cols))];
  };
  return Multicol;
}());