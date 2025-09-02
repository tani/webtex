import { Base } from './base';
var export$;
export { export$ as Report }
var Report;
export$ = Report = (function(superclass){
  var args, x$, prototype = extend$((import$(Report, superclass).displayName = 'Report', Report), superclass).prototype, constructor = Report;
  Report.css = "css/book.css";
  function Report(generator, options){
    Report.superclass.apply(this, arguments);
    this.g.newCounter('chapter');
    this.g.addToReset('section', 'chapter');
    this.g.setCounter('secnumdepth', 2);
    this.g.setCounter('tocdepth', 2);
    this.g.addToReset('figure', 'chapter');
    this.g.addToReset('table', 'chapter');
    this.g.addToReset('footnote', 'chapter');
  }
  Report.prototype['chaptername'] = function(){
    return ["Chapter"];
  };
  Report.prototype['bibname'] = function(){
    return ["Bibliography"];
  };
  args = Report.args = Base.args;
  x$ = args;
  x$['part'] = x$['chapter'] = ['V', 's', 'X', 'o?', 'g'];
  Report.prototype['part'] = function(s, toc, ttl){
    return [this.g.startsection('part', -1, s, toc, ttl)];
  };
  Report.prototype['chapter'] = function(s, toc, ttl){
    return [this.g.startsection('chapter', 0, s, toc, ttl)];
  };
  Report.prototype['thechapter'] = function(){
    return [this.g.arabic(this.g.counter('chapter'))];
  };
  Report.prototype['thesection'] = function(){
    return this.thechapter().concat("." + this.g.arabic(this.g.counter('section')));
  };
  Report.prototype['thefigure'] = function(){
    return (this.g.counter('chapter') > 0
      ? this.thechapter().concat(".")
      : []).concat(this.g.arabic(this.g.counter('figure')));
  };
  Report.prototype['thetable'] = function(){
    return (this.g.counter('chapter') > 0
      ? this.thechapter().concat(".")
      : []).concat(this.g.arabic(this.g.counter('table')));
  };
  args['tableofcontents'] = ['V'];
  Report.prototype['tableofcontents'] = function(){
    return this.chapter(true, undefined, this.g.macro('contentsname')).concat([this.g._toc]);
  };
  args['abstract'] = ['V'];
  Report.prototype['abstract'] = function(){
    var head;
    this.g.setFontSize("small");
    this.g.enterGroup();
    this.g.setFontWeight("bf");
    head = this.g.create(this.g.list, this.g.macro("abstractname"), "center");
    this.g.exitGroup();
    return [head].concat(this.quotation());
  };
  Report.prototype['endabstract'] = function(){
    this.endquotation();
  };
  args['appendix'] = ['V'];
  Report.prototype['appendix'] = function(){
    this.g.setCounter('chapter', 0);
    this.g.setCounter('section', 0);
    this['chaptername'] = this['appendixname'];
    this['thechapter'] = function(){
      return [this.g.Alph(this.g.counter('chapter'))];
    };
  };
  return Report;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}