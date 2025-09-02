var export$,CustomMacros;
export { export$ as CustomMacros }
export { CustomMacros as default }
var CustomMacros;
export$ = CustomMacros = (function(){
  CustomMacros.displayName = 'CustomMacros';
  var args, prototype = CustomMacros.prototype, constructor = CustomMacros;
  function CustomMacros(generator){
    this.g = generator;
  }
  args = CustomMacros.args = {};
  args['myMacro'] = ['H', 'o?'];
  CustomMacros.prototype['myMacro'] = function(o){
    return ["-", o, "-"];
  };
  return CustomMacros;
}());