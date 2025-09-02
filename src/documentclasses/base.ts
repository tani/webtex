var export$;
export { export$ as Base }
'use strict';
var Base;
export$ = Base = (function(){
  Base.displayName = 'Base';
  var args, x$, prototype = Base.prototype, constructor = Base;
  args = Base.args = {};
  Base.prototype.options = new Map;
  function Base(generator, options){
    var pt345, inch, textwidth, margins, oddsidemargin, marginparwidth, this$ = this;
    this.g = generator;
    if (options) {
      this.options = options;
    }
    this.g.newCounter('part');
    this.g.newCounter('section');
    this.g.newCounter('subsection', 'section');
    this.g.newCounter('subsubsection', 'subsection');
    this.g.newCounter('paragraph', 'subsubsection');
    this.g.newCounter('subparagraph', 'paragraph');
    this.g.newCounter('figure');
    this.g.newCounter('table');
    this.g.setLength('paperheight', new this.g.Length(11, "in"));
    this.g.setLength('paperwidth', new this.g.Length(8.5, "in"));
    this.g.setLength('@@size', new this.g.Length(10, "pt"));
    this.options.forEach(function(v, k){
      var tmp, value;
      switch (k) {
      case "oneside":
        break;
      case "twoside":
        break;
      case "onecolumn":
        break;
      case "twocolumn":
        break;
      case "titlepage":
        break;
      case "notitlepage":
        break;
      case "fleqn":
        break;
      case "leqno":
        break;
      case "a4paper":
        this$.g.setLength('paperheight', new this$.g.Length(297, "mm"));
        return this$.g.setLength('paperwidth', new this$.g.Length(210, "mm"));
      case "a5paper":
        this$.g.setLength('paperheight', new this$.g.Length(210, "mm"));
        return this$.g.setLength('paperwidth', new this$.g.Length(148, "mm"));
      case "b5paper":
        this$.g.setLength('paperheight', new this$.g.Length(250, "mm"));
        return this$.g.setLength('paperwidth', new this$.g.Length(176, "mm"));
      case "letterpaper":
        this$.g.setLength('paperheight', new this$.g.Length(11, "in"));
        return this$.g.setLength('paperwidth', new this$.g.Length(8.5, "in"));
      case "legalpaper":
        this$.g.setLength('paperheight', new this$.g.Length(14, "in"));
        return this$.g.setLength('paperwidth', new this$.g.Length(8.5, "in"));
      case "executivepaper":
        this$.g.setLength('paperheight', new this$.g.Length(10.5, "in"));
        return this$.g.setLength('paperwidth', new this$.g.Length(7.25, "in"));
      case "landscape":
        tmp = this$.g.length('paperheight');
        this$.g.setLength('paperheight', this$.g.length('paperwidth'));
        return this$.g.setLength('paperwidth', tmp);
      default:
        value = parseFloat(k);
        if (!isNaN(value) && k.endsWith("pt") && String(value) === k.substring(0, k.length - 2)) {
          return this$.g.setLength('@@size', new this$.g.Length(value, "pt"));
        }
      }
    });
    pt345 = new this.g.Length(345, "pt");
    inch = new this.g.Length(1, "in");
    textwidth = this.g.length('paperwidth').sub(inch.mul(2));
    if (textwidth.cmp(pt345) === 1) {
      textwidth = pt345;
    }
    this.g.setLength('textwidth', textwidth);
    this.g.setLength('marginparsep', new this.g.Length(11, "pt"));
    this.g.setLength('marginparpush', new this.g.Length(5, "pt"));
    margins = this.g.length('paperwidth').sub(this.g.length('textwidth'));
    oddsidemargin = margins.mul(0.5).sub(inch);
    marginparwidth = margins.mul(0.5).sub(this.g.length('marginparsep')).sub(inch.mul(0.8));
    if (marginparwidth.cmp(inch.mul(2)) === 1) {
      marginparwidth = inch.mul(2);
    }
    this.g.setLength('oddsidemargin', oddsidemargin);
    this.g.setLength('marginparwidth', marginparwidth);
  }
  Base.prototype['contentsname'] = function(){
    return ["Contents"];
  };
  Base.prototype['listfigurename'] = function(){
    return ["List of Figures"];
  };
  Base.prototype['listtablename'] = function(){
    return ["List of Tables"];
  };
  Base.prototype['partname'] = function(){
    return ["Part"];
  };
  Base.prototype['figurename'] = function(){
    return ["Figure"];
  };
  Base.prototype['tablename'] = function(){
    return ["Table"];
  };
  Base.prototype['appendixname'] = function(){
    return ["Appendix"];
  };
  Base.prototype['indexname'] = function(){
    return ["Index"];
  };
  x$ = args;
  x$['part'] = x$['section'] = x$['subsection'] = x$['subsubsection'] = x$['paragraph'] = x$['subparagraph'] = ['V', 's', 'X', 'o?', 'g'];
  Base.prototype['part'] = function(s, toc, ttl){
    return [this.g.startsection('part', 0, s, toc, ttl)];
  };
  Base.prototype['section'] = function(s, toc, ttl){
    return [this.g.startsection('section', 1, s, toc, ttl)];
  };
  Base.prototype['subsection'] = function(s, toc, ttl){
    return [this.g.startsection('subsection', 2, s, toc, ttl)];
  };
  Base.prototype['subsubsection'] = function(s, toc, ttl){
    return [this.g.startsection('subsubsection', 3, s, toc, ttl)];
  };
  Base.prototype['paragraph'] = function(s, toc, ttl){
    return [this.g.startsection('paragraph', 4, s, toc, ttl)];
  };
  Base.prototype['subparagraph'] = function(s, toc, ttl){
    return [this.g.startsection('subparagraph', 5, s, toc, ttl)];
  };
  Base.prototype['thepart'] = function(){
    return [this.g.Roman(this.g.counter('part'))];
  };
  Base.prototype['thesection'] = function(){
    return [this.g.arabic(this.g.counter('section'))];
  };
  Base.prototype['thesubsection'] = function(){
    return this.thesection().concat("." + this.g.arabic(this.g.counter('subsection')));
  };
  Base.prototype['thesubsubsection'] = function(){
    return this.thesubsection().concat("." + this.g.arabic(this.g.counter('subsubsection')));
  };
  Base.prototype['theparagraph'] = function(){
    return this.thesubsubsection().concat("." + this.g.arabic(this.g.counter('paragraph')));
  };
  Base.prototype['thesubparagraph'] = function(){
    return this.theparagraph().concat("." + this.g.arabic(this.g.counter('subparagraph')));
  };
  args['maketitle'] = ['V'];
  Base.prototype['maketitle'] = function(){
    var title, author, date, that, maketitle;
    this.g.setTitle(this._title);
    title = this.g.create(this.g.title, this._title);
    author = this.g.create(this.g.author, this._author);
    date = this.g.create(this.g.date, (that = this._date)
      ? that
      : this.g.macro('today'));
    maketitle = this.g.create(this.g.list, [this.g.createVSpace(new this.g.Length(2, "em")), title, this.g.createVSpace(new this.g.Length(1.5, "em")), author, this.g.createVSpace(new this.g.Length(1, "em")), date, this.g.createVSpace(new this.g.Length(1.5, "em"))], "center");
    this.g.setCounter('footnote', 0);
    this._title = null;
    this._author = null;
    this._date = null;
    this._thanks = null;
    this['title'] = this['author'] = this['date'] = this['thanks'] = this['and'] = this['maketitle'] = function(){};
    return [maketitle];
  };
  return Base;
}());