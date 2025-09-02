var export$;
export { export$ as XColor }
'use strict';
var XColor;
export$ = XColor = (function(){
  XColor.displayName = 'XColor';
  var args, colors, prototype = XColor.prototype, constructor = XColor;
  args = XColor.args = {};
  colors = XColor.colors = new Map([["red", {}], ["green", {}], ["blue", {}], ["cyan", {}], ["magenta", {}], ["yellow", {}], ["black", {}], ["gray", {}], ["white", {}], ["darkgray", {}], ["lightgray", {}], ["brown", {}], ["lime", {}], ["olive", {}], ["orange", {}], ["pink", {}], ["purple", {}], ["teal", {}], ["violet", {}]]);
  function XColor(generator, options){
    var i$, ref$, len$, opt;
    this.g = generator;
    if (options) {
      this.options = options;
    }
    for (i$ = 0, len$ = (ref$ = this.options).length; i$ < len$; ++i$) {
      opt = ref$[i$];
      opt = Object.keys(opt)[0];
      switch (opt) {
      case "natural":
        break;
      case "rgb":
        break;
      case "cmy":
        break;
      case "cmyk":
        break;
      case "hsb":
        break;
      case "gray":
        break;
      case "RGB":
        break;
      case "HTML":
        break;
      case "HSB":
        break;
      case "Gray":
        break;
      case "monochrome":
        break;
      case "dvipsnames":
        break;
      case "dvipsnames*":
        break;
      case "svgnames":
        break;
      case "svgnames*":
        break;
      case "x11names":
        break;
      case "x11names*":
        break;
      default:

      }
    }
  }
  args['definecolorset'] = ['P', 'i?', 'c-ml', 'ie', 'ie', 'c-ssp'];
  XColor.prototype['definecolorset'] = function(type, models, hd, tl, setspec){
    var i$, len$, spec;
    if (type !== null && type !== "named" && type !== "ps") {
      this.g.error("unknown color type");
    }
    if (!hd) {
      hd = "";
    }
    if (!tl) {
      tl = "";
    }
    for (i$ = 0, len$ = setspec.length; i$ < len$; ++i$) {
      spec = setspec[i$];
      this.definecolor(type, hd + spec.name + tl, models, spec.speclist);
    }
  };
  args['definecolor'] = ['P', 'i?', 'i', 'c-ml', 'c-spl'];
  XColor.prototype['definecolor'] = function(type, name, models, colorspec){
    var color, i$, ref$, len$, i, model;
    if (type !== null && type !== "named" && type !== "ps") {
      this.g.error("unknown color type");
    }
    if (models.models.length !== colorspec.length) {
      this.g.error("color models and specs don't match");
    }
    color = {};
    for (i$ = 0, len$ = (ref$ = models.models).length; i$ < len$; ++i$) {
      i = i$;
      model = ref$[i$];
      color[model] = colorspec[i];
    }
    colors.set(name, color);
  };
  args['color'] = ["HV", [['c-ml?', 'c-spl'], ['c']]];
  XColor.prototype['color'] = function(){
    if (arguments.length === 1) {
      console.log("got color expression");
    } else {
      console.log("got model/color spec");
    }
  };
  args['textcolor'] = ["HV", [['c-ml?', 'c-spl'], ['c']], "g"];
  XColor.prototype['textcolor'] = function(){
    if (arguments.length === 2) {
      return;
    }
  };
  args['colorbox'] = ['H', 'i?', 'c', 'g'];
  XColor.prototype['colorbox'] = function(model, color, text){};
  args['fcolorbox'] = ['H', 'i?', 'c', 'c', 'g'];
  XColor.prototype['fcolorbox'] = function(model, color, text){};
  return XColor;
}());