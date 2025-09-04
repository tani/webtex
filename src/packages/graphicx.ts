var export$;
export { export$ as Graphicx }
'use strict';
var Graphicx;
export$ = Graphicx = (function(){
  Graphicx.displayName = 'Graphicx';
  var args, prototype = Graphicx.prototype, constructor = Graphicx;
  args = Graphicx.args = {};
  function Graphicx(generator, options){}
  args['rotatebox'] = ['H', 'kv?', 'n', 'hg'];
  Graphicx.prototype['rotatebox'] = function(kvl, angle, text){};
  args['scalebox'] = ['H', 'n', 'n?', 'g'];
  Graphicx.prototype['scalebox'] = function(hsc, vsc, text){};
  args['reflectbox'] = ['H', 'g'];
  Graphicx.prototype['reflectbox'] = function(text){
    return this['scalebox'](-1, 1, text);
  };
  args['resizebox'] = ['H', 's', 'l', 'l', 'g'];
  Graphicx.prototype['resizebox'] = function(s, hl, vl, text){};
  args['graphicspath'] = ['HV', 'gl'];
  Graphicx.prototype['graphicspath'] = function(paths){};
  args['includegraphics'] = ['H', 's', 'kv?', 'kv?', 'k'];
  Graphicx.prototype['includegraphics'] = function(s, kvl, kvl2, file){
    return [this.g.createImage(kvl.get("width"), kvl.get("height"), file)];
  };
  return Graphicx;
}());