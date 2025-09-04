var export$;
export { export$ as Hyperref }
'use strict';
var Hyperref;
export$ = Hyperref = (function(){
  Hyperref.displayName = 'Hyperref';
  var args, prototype = Hyperref.prototype, constructor = Hyperref;
  args = Hyperref.args = {};
  function Hyperref(generator, options){}
  args['href'] = ['H', 'o?', 'u', 'g'];
  Hyperref.prototype['href'] = function(opts, url, txt){
    return [this.g.create(this.g.link(url), txt)];
  };
  args['url'] = ['H', 'u'];
  Hyperref.prototype['url'] = function(url){
    return [this.g.create(this.g.link(url), this.g.createText(url))];
  };
  args['nolinkurl'] = ['H', 'u'];
  Hyperref.prototype['nolinkurl'] = function(url){
    return [this.g.create(this.g.link(), this.g.createText(url))];
  };
  return Hyperref;
}());