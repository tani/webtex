import { LaTeX } from './latex.ltx';
import { diacritics, symbols } from './symbols';
import { makeLengthClass } from './types';
var export$;
export { export$ as Generator }
var Macros, Generator, slice$ = [].slice, arrayFrom$ = Array.from || function(x){return slice$.call(x);};
Macros = LaTeX;
Object.defineProperty(Array.prototype, 'top', {
  enumerable: false,
  configurable: true,
  get: function(){
    return this[this.length - 1];
  },
  set: function(v){
    this[this.length - 1] = v;
  }
});
export$ = Generator = (function(){
  Generator.displayName = 'Generator';
  var error, _roman, prototype = Generator.prototype, constructor = Generator;
  Generator.prototype.documentClass = null;
  Generator.prototype.documentTitle = null;
  Generator.prototype._options = null;
  Generator.prototype._macros = null;
  Generator.prototype._stack = null;
  Generator.prototype._groups = null;
  Generator.prototype._continue = false;
  Generator.prototype._labels = null;
  Generator.prototype._refs = null;
  Generator.prototype._counters = null;
  Generator.prototype._resets = null;
  Generator.prototype._marginpars = null;
  Generator.prototype.Length = null;
  Generator.prototype.reset = function(){
    this.Length = makeLengthClass(this);
    this.documentClass = this._options.documentClass;
    this.documentTitle = "untitled";
    this._uid = 1;
    this._macros = {};
    this._curArgs = [];
    this._stack = [{
      attrs: {},
      align: null,
      currentlabel: {
        id: "",
        label: document.createTextNode("")
      },
      lengths: new Map()
    }];
    this._groups = [0];
    this._labels = new Map();
    this._refs = new Map();
    this._marginpars = [];
    this._counters = new Map();
    this._resets = new Map();
    this._continue = false;
    this.newCounter('enumi');
    this.newCounter('enumii');
    this.newCounter('enumiii');
    this.newCounter('enumiv');
    this._macros = new Macros(this, this._options.CustomMacros);
  };
  Generator.prototype.nextId = function(){
    return this._uid++;
  };
  Generator.prototype.round = function(num){
    var factor;
    factor = Math.pow(10, this._options.precision);
    return Math.round(num * factor) / factor;
  };
  error = function(e){
    console.error(e);
    throw new Error(e);
  };
  Generator.prototype.error = function(e){
    error(e);
  };
  Generator.prototype.setErrorFn = function(e){
    error = e;
  };
  Generator.prototype.location = function(){
    error("location function not set!");
  };
  Generator.prototype.setTitle = function(title){
    return this.documentTitle = title.textContent;
  };
  Generator.prototype.hasSymbol = function(name){
    return Macros.symbols.has(name);
  };
  Generator.prototype.symbol = function(name){
    if (!this.hasSymbol(name)) {
      this.error("no such symbol: " + name);
    }
    return Macros.symbols.get(name);
  };
  Generator.prototype.hasMacro = function(name){
    return typeof this._macros[name] === "function" && !deepEq$(name, "constructor", '===') && (this._macros.hasOwnProperty(name) || Macros.prototype.hasOwnProperty(name));
  };
  Generator.prototype.isHmode = function(marco){
    var ref$;
    return ((ref$ = Macros.args[marco]) != null ? ref$[0] : void 8) === 'H' || !Macros.args[marco];
  };
  Generator.prototype.isVmode = function(marco){
    var ref$;
    return ((ref$ = Macros.args[marco]) != null ? ref$[0] : void 8) === 'V';
  };
  Generator.prototype.isHVmode = function(marco){
    var ref$;
    return ((ref$ = Macros.args[marco]) != null ? ref$[0] : void 8) === 'HV';
  };
  Generator.prototype.isPreamble = function(marco){
    var ref$;
    return ((ref$ = Macros.args[marco]) != null ? ref$[0] : void 8) === 'P';
  };
  Generator.prototype.macro = function(name, args){
    var ref$, this$ = this;
    if (symbols.has(name)) {
      return [this.createText(symbols.get(name))];
    }
    return (ref$ = this._macros[name].apply(this._macros, args)) != null ? ref$.filter(function(x){
      return x != undefined;
    }).map(function(x){
      if (typeof x === 'string' || x instanceof String) {
        return this$.createText(x);
      } else {
        return this$.addAttributes(x);
      }
    }) : void 8;
  };
  Generator.prototype.beginArgs = function(macro){
    var that;
    this._curArgs.push((that = Macros.args[macro])
      ? {
        name: macro,
        args: that.slice(1),
        parsed: []
      }
      : {
        args: [],
        parsed: []
      });
  };
  Generator.prototype.selectArgsBranch = function(nextChar){
    var optArgs, branches, i$, len$, b, ref$;
    optArgs = ['o?', 'i?', 'k?', 'kv?', 'n?', 'l?', 'c-ml?', 'cl?'];
    if (Array.isArray(this._curArgs.top.args[0])) {
      branches = this._curArgs.top.args[0];
      for (i$ = 0, len$ = branches.length; i$ < len$; ++i$) {
        b = branches[i$];
        if ((nextChar === '[' && in$(b[0], optArgs)) || (nextChar === '{' && !in$(b[0], optArgs))) {
          this._curArgs.top.args.shift();
          (ref$ = this._curArgs.top.args).unshift.apply(ref$, b);
          return true;
        }
      }
    }
  };
  Generator.prototype.nextArg = function(arg){
    if (this._curArgs.top.args[0] === arg) {
      this._curArgs.top.args.shift();
      return true;
    }
  };
  Generator.prototype.argError = function(m){
    return error("macro \\" + this._curArgs.top.name + ": " + m);
  };
  Generator.prototype.addParsedArg = function(a){
    this._curArgs.top.parsed.push(a);
  };
  Generator.prototype.parsedArgs = function(){
    return this._curArgs.top.parsed;
  };
  Generator.prototype.preExecMacro = function(){
    this.macro(this._curArgs.top.name, this.parsedArgs());
  };
  Generator.prototype.endArgs = function(){
    var x$;
    x$ = this._curArgs.pop();
    x$.args.length === 0 || error("grammar error: arguments for " + x$.name + " have not been parsed: " + x$.args);
    return x$.parsed;
  };
  Generator.prototype.begin = function(env_id){
    if (!this.hasMacro(env_id)) {
      error("unknown environment: " + env_id);
    }
    this.startBalanced();
    this.enterGroup();
    this.beginArgs(env_id);
  };
  Generator.prototype.end = function(id, end_id){
    var end;
    if (id !== end_id) {
      error("environment '" + id + "' is missing its end, found '" + end_id + "' instead");
    }
    if (this.hasMacro("end" + id)) {
      end = this.macro("end" + id);
    }
    this.exitGroup();
    this.isBalanced() || error(id + ": groups need to be balanced in environments!");
    this.endBalanced();
    return end;
  };
  Generator.prototype.enterGroup = function(copyAttrs){
    copyAttrs == null && (copyAttrs = false);
    this._stack.push({
      attrs: copyAttrs
        ? Object.assign({}, this._stack.top.attrs)
        : {},
      align: null,
      currentlabel: Object.assign({}, this._stack.top.currentlabel),
      lengths: new Map(this._stack.top.lengths)
    });
    ++this._groups.top;
  };
  Generator.prototype.exitGroup = function(){
    --this._groups.top >= 0 || error("there is no group to end here");
    this._stack.pop();
  };
  Generator.prototype.startBalanced = function(){
    this._groups.push(0);
  };
  Generator.prototype.endBalanced = function(){
    this._groups.pop();
    return this._groups.length;
  };
  Generator.prototype.isBalanced = function(){
    return this._groups.top === 0;
  };
  Generator.prototype['continue'] = function(){
    this._continue = this.location().end.offset;
  };
  Generator.prototype['break'] = function(){
    if (this.location().end.offset > this._continue) {
      this._continue = false;
    }
  };
  Generator.prototype.setAlignment = function(align){
    this._stack.top.align = align;
  };
  Generator.prototype.alignment = function(){
    return this._stack.top.align;
  };
  Generator.prototype.setFontFamily = function(family){
    this._stack.top.attrs.fontFamily = family;
  };
  Generator.prototype.setFontWeight = function(weight){
    this._stack.top.attrs.fontWeight = weight;
  };
  Generator.prototype.setFontShape = function(shape){
    if (shape === "em") {
      if (this._activeAttributeValue("fontShape") === "it") {
        shape = "up";
      } else {
        shape = "it";
      }
    }
    this._stack.top.attrs.fontShape = shape;
  };
  Generator.prototype.setFontSize = function(size){
    this._stack.top.attrs.fontSize = size;
  };
  Generator.prototype.setTextDecoration = function(decoration){
    this._stack.top.attrs.textDecoration = decoration;
  };
  Generator.prototype._inlineAttributes = function(){
    var cur;
    cur = this._stack.top.attrs;
    return [cur.fontFamily, cur.fontWeight, cur.fontShape, cur.fontSize, cur.textDecoration].join(' ').replace(/\s+/g, ' ').trim();
  };
  Generator.prototype._activeAttributeValue = function(attr){
    var i$, level, that;
    for (i$ = this._stack.length - 1; i$ >= 0; --i$) {
      level = i$;
      if (that = this._stack[level].attrs[attr]) {
        return that;
      }
    }
  };
  Generator.prototype.startsection = function(sec, level, star, toc, ttl){
    var chaphead, el, ref$;
    if (toc == ttl && ttl == undefined) {
      if (!star && this.counter("secnumdepth") >= level) {
        this.stepCounter(sec);
        this.refCounter(sec, "sec-" + this.nextId());
      }
      return;
    }
    if (!star && this.counter("secnumdepth") >= level) {
      if (sec === 'chapter') {
        chaphead = this.create(this.block, this.macro('chaptername').concat(this.createText(this.symbol('space')), this.macro('the' + sec)));
        el = this.create(this[sec], [chaphead, ttl]);
      } else {
        el = this.create(this[sec], this.macro('the' + sec).concat(this.createText(this.symbol('quad')), ttl));
      }
      if ((ref$ = this._stack.top.currentlabel.id) != null) {
        el.id = ref$;
      }
    } else {
      el = this.create(this[sec], ttl);
    }
    return el;
  };
  Generator.prototype.startlist = function(){
    this.stepCounter('@listdepth');
    if (this.counter('@listdepth') > 6) {
      error("too deeply nested");
    }
    return true;
  };
  Generator.prototype.endlist = function(){
    this.setCounter('@listdepth', this.counter('@listdepth') - 1);
    this['continue']();
  };
  Generator.prototype.newLength = function(l){
    if (this.hasLength(l)) {
      error("length " + l + " already defined!");
    }
    this._stack.top.lengths.set(l, this.Length.zero);
  };
  Generator.prototype.hasLength = function(l){
    return this._stack.top.lengths.has(l);
  };
  Generator.prototype.setLength = function(id, length){
    if (!this.hasLength(id)) {
      error("no such length: " + id);
    }
    this._stack.top.lengths.set(id, length);
  };
  Generator.prototype.length = function(l){
    if (!this.hasLength(l)) {
      error("no such length: " + l);
    }
    return this._stack.top.lengths.get(l);
  };
  Generator.prototype.theLength = function(id){
    var l;
    l = this.create(this.inline, undefined, "the");
    l.setAttribute("display-var", id);
    return l;
  };
  Generator.prototype.newCounter = function(c, parent){
    if (this.hasCounter(c)) {
      error("counter " + c + " already defined!");
    }
    this._counters.set(c, 0);
    this._resets.set(c, []);
    if (parent) {
      this.addToReset(c, parent);
    }
    if (this.hasMacro('the' + c)) {
      error("macro \\the" + c + " already defined!");
    }
    this._macros['the' + c] = function(){
      return [this.g.arabic(this.g.counter(c))];
    };
  };
  Generator.prototype.hasCounter = function(c){
    return this._counters.has(c);
  };
  Generator.prototype.setCounter = function(c, v){
    if (!this.hasCounter(c)) {
      error("no such counter: " + c);
    }
    this._counters.set(c, v);
  };
  Generator.prototype.stepCounter = function(c){
    this.setCounter(c, this.counter(c) + 1);
    this.clearCounter(c);
  };
  Generator.prototype.counter = function(c){
    if (!this.hasCounter(c)) {
      error("no such counter: " + c);
    }
    return this._counters.get(c);
  };
  Generator.prototype.refCounter = function(c, id){
    var el;
    if (!id) {
      id = c + "-" + this.nextId();
      el = this.create(this.anchor(id));
    }
    this._stack.top.currentlabel = {
      id: id,
      label: this.createFragment(arrayFrom$(this.hasMacro('p@' + c)
        ? this.macro('p@' + c)
        : []).concat(arrayFrom$(this.macro('the' + c))))
    };
    return el;
  };
  Generator.prototype.addToReset = function(c, parent){
    if (!this.hasCounter(parent)) {
      error("no such counter: " + parent);
    }
    if (!this.hasCounter(c)) {
      error("no such counter: " + c);
    }
    this._resets.get(parent).push(c);
  };
  Generator.prototype.clearCounter = function(c){
    var i$, ref$, len$, r;
    for (i$ = 0, len$ = (ref$ = this._resets.get(c)).length; i$ < len$; ++i$) {
      r = ref$[i$];
      this.clearCounter(r);
      this.setCounter(r, 0);
    }
  };
  Generator.prototype.alph = function(num){
    return String.fromCharCode(96 + num);
  };
  Generator.prototype.Alph = function(num){
    return String.fromCharCode(64 + num);
  };
  Generator.prototype.arabic = function(num){
    return String(num);
  };
  Generator.prototype.roman = function(num){
    var lookup;
    lookup = [['m', 1000], ['cm', 900], ['d', 500], ['cd', 400], ['c', 100], ['xc', 90], ['l', 50], ['xl', 40], ['x', 10], ['ix', 9], ['v', 5], ['iv', 4], ['i', 1]];
    return _roman(num, lookup);
  };
  Generator.prototype.Roman = function(num){
    var lookup;
    lookup = [['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]];
    return _roman(num, lookup);
  };
  _roman = function(num, lookup){
    var roman, i$, len$, i;
    roman = "";
    for (i$ = 0, len$ = lookup.length; i$ < len$; ++i$) {
      i = lookup[i$];
      while (num >= i[1]) {
        roman += i[0];
        num -= i[1];
      }
    }
    return roman;
  };
  Generator.prototype.fnsymbol = function(num){
    switch (num) {
    case 1:
      return this.symbol('textasteriskcentered');
    case 2:
      return this.symbol('textdagger');
    case 3:
      return this.symbol('textdaggerdbl');
    case 4:
      return this.symbol('textsection');
    case 5:
      return this.symbol('textparagraph');
    case 6:
      return this.symbol('textbardbl');
    case 7:
      return this.symbol('textasteriskcentered') + this.symbol('textasteriskcentered');
    case 8:
      return this.symbol('textdagger') + this.symbol('textdagger');
    case 9:
      return this.symbol('textdaggerdbl') + this.symbol('textdaggerdbl');
    default:
      return error("fnsymbol value must be between 1 and 9");
    }
  };
  Generator.prototype.setLabel = function(label){
    var i$, ref$, len$, r;
    if (this._labels.has(label)) {
      error("label " + label + " already defined!");
    }
    if (!this._stack.top.currentlabel.id) {
      console.warn("warning: no \\@currentlabel available for label " + label + "!");
    }
    this._labels.set(label, this._stack.top.currentlabel);
    if (this._refs.has(label)) {
      for (i$ = 0, len$ = (ref$ = this._refs.get(label)).length; i$ < len$; ++i$) {
        r = ref$[i$];
        while (r.firstChild) {
          r.removeChild(r.firstChild);
        }
        r.appendChild(this._stack.top.currentlabel.label.cloneNode(true));
        r.setAttribute("href", "#" + this._stack.top.currentlabel.id);
      }
      this._refs['delete'](label);
    }
  };
  Generator.prototype.ref = function(label){
    var that, el;
    if (that = this._labels.get(label)) {
      return this.create(this.link("#" + that.id), that.label.cloneNode(true));
    }
    el = this.create(this.link("#"), this.createText("??"));
    if (!this._refs.has(label)) {
      this._refs.set(label, [el]);
    } else {
      this._refs.get(label).push(el);
    }
    return el;
  };
  Generator.prototype.logUndefinedRefs = function(){
    var keys, ref;
    if (this._refs.size === 0) {
      return;
    }
    keys = this._refs.keys();
    while (!(ref = keys.next()).done) {
      console.warn("warning: reference '" + ref.value + "' undefined");
    }
    console.warn("There were undefined references.");
  };
  Generator.prototype.marginpar = function(txt){
    var id, marginPar, marginRef;
    id = this.nextId();
    marginPar = this.create(this.block, [this.create(this.inline, null, "mpbaseline"), txt]);
    marginPar.id = id;
    this._marginpars.push(marginPar);
    marginRef = this.create(this.inline, null, "mpbaseline");
    marginRef.id = "marginref-" + id;
    return marginRef;
  };
  function Generator(){}
  return Generator;
}());
function deepEq$(x, y, type){
  var toString = {}.toString, hasOwnProperty = {}.hasOwnProperty,
      has = function (obj, key) { return hasOwnProperty.call(obj, key); };
  var first = true;
  return eq(x, y, []);
  function eq(a, b, stack) {
    var className, length, size, result, alength, blength, r, key, ref, sizeB;
    if (a == null || b == null) { return a === b; }
    if (a.__placeholder__ || b.__placeholder__) { return true; }
    if (a === b) { return a !== 0 || 1 / a == 1 / b; }
    className = toString.call(a);
    if (toString.call(b) != className) { return false; }
    switch (className) {
      case '[object String]': return a == String(b);
      case '[object Number]':
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        return +a == +b;
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') { return false; }
    length = stack.length;
    while (length--) { if (stack[length] == a) { return true; } }
    stack.push(a);
    size = 0;
    result = true;
    if (className == '[object Array]') {
      alength = a.length;
      blength = b.length;
      if (first) {
        switch (type) {
        case '===': result = alength === blength; break;
        case '<==': result = alength <= blength; break;
        case '<<=': result = alength < blength; break;
        }
        size = alength;
        first = false;
      } else {
        result = alength === blength;
        size = alength;
      }
      if (result) {
        while (size--) {
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))){ break; }
        }
      }
    } else {
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) {
        return false;
      }
      for (key in a) {
        if (has(a, key)) {
          size++;
          if (!(result = has(b, key) && eq(a[key], b[key], stack))) { break; }
        }
      }
      if (result) {
        sizeB = 0;
        for (key in b) {
          if (has(b, key)) { ++sizeB; }
        }
        if (first) {
          if (type === '<<=') {
            result = size < sizeB;
          } else if (type === '<==') {
            result = size <= sizeB
          } else {
            result = size === sizeB;
          }
        } else {
          first = false;
          result = size === sizeB;
        }
      }
    }
    stack.pop();
    return result;
  }
}
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}