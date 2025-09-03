import { LaTeX } from './latex.ltx';
import { diacritics, symbols } from './symbols';
import { makeLengthClass } from './types';

const Macros = LaTeX;

// Modern Array extension with proper typing
declare global {
  interface Array<T> {
    top: T;
  }
}

Object.defineProperty(Array.prototype, 'top', {
  enumerable: false,
  configurable: true,
  get<T>(this: T[]): T {
    return this[this.length - 1];
  },
  set<T>(this: T[], v: T): void {
    this[this.length - 1] = v;
  }
});
// Type definitions
interface GeneratorOptions {
  documentClass?: any;
  precision?: number;
  CustomMacros?: any;
}

interface StackFrame {
  attrs: {
    fontFamily?: string;
    fontWeight?: string;
    fontShape?: string;
    fontSize?: string;
    textDecoration?: string;
  };
  align: any;
  currentlabel: {
    id: string;
    label: any;
  };
  lengths: Map<string, any>;
}

export class Generator {
  static displayName = 'Generator';
  
  documentClass: any = null;
  documentTitle: string | null = null;
  _options: GeneratorOptions;
  _macros: Record<string, Function> = {};
  _stack: StackFrame[] = [];
  _groups: number[] = [];
  _continue: boolean | number = false;
  _labels: Map<string, any> = new Map();
  _refs: Map<string, any[]> = new Map();
  _counters: Map<string, number> = new Map();
  _resets: Map<string, string[]> = new Map();
  _marginpars: any[] = [];
  Length: any = null;
  _uid: number = 1;
  _curArgs: any[] = [];
  
  constructor(options: GeneratorOptions = {}) {
    this._options = options;
    this._macros = {};
    this._stack = [];
    this._groups = [];
    this._labels = new Map();
    this._refs = new Map();
    this._counters = new Map();
    this._resets = new Map();
    this._marginpars = [];
    this.reset();
  }

  reset() {
    this.Length = makeLengthClass(this);
    this.documentClass = this._options.documentClass;
    this.documentTitle = "untitled";
    this._uid = 1;
    Object.keys(this._macros).forEach(key => delete this._macros[key]);
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
  }

  nextId() {
    return this._uid++;
  }

  round(num: number) {
    const factor = Math.pow(10, this._options.precision);
    return Math.round(num * factor) / factor;
  }

  error(e: string) {
    error(e);
  }

  setErrorFn(e: (msg: string) => never) {
    error = e;
  }

  location(): any {
    error("location function not set!");
    return { end: { offset: 0 } }; // This should be overridden by actual implementation
  }

  setTitle(title: any) {
    return this.documentTitle = title.textContent;
  }

  hasSymbol(name: string) {
    return Macros.symbols.has(name);
  }

  symbol(name: string) {
    if (!this.hasSymbol(name)) {
      this.error("no such symbol: " + name);
    }
    return Macros.symbols.get(name);
  }

  hasMacro(name: string) {
    return typeof this._macros[name] === "function" && !deepEq$(name, "constructor", '===') && (this._macros.hasOwnProperty(name) || Macros.prototype.hasOwnProperty(name));
  }

  isHmode(marco: string) {
    const ref$ = LaTeX.args[marco];
    return (ref$ != null ? ref$[0] : undefined) === 'H' || !LaTeX.args[marco];
  }

  isVmode(marco: string) {
    const ref$ = LaTeX.args[marco];
    return (ref$ != null ? ref$[0] : undefined) === 'V';
  }

  isHVmode(marco: string) {
    const ref$ = LaTeX.args[marco];
    return (ref$ != null ? ref$[0] : undefined) === 'HV';
  }

  isPreamble(marco: string) {
    const ref$ = LaTeX.args[marco];
    return (ref$ != null ? ref$[0] : undefined) === 'P';
  }
  macro(name: string, args: any[]) {
    if (symbols.has(name)) {
      return [this.createText(symbols.get(name))];
    }
    const result = this._macros[name].apply(this._macros, args);
    return result != null ? result.filter((x: any) => {
      return x != undefined;
    }).map((x: any) => {
      if (typeof x === 'string' || x instanceof String) {
        return this.createText(String(x));
      } else {
        return this.addAttributes(x);
      }
    }) : undefined;
  }

  beginArgs(macro: string) {
    const that = LaTeX.args[macro];
    this._curArgs.push(that
      ? {
        name: macro,
        args: that.slice(1),
        parsed: []
      }
      : {
        args: [],
        parsed: []
      });
  }

  selectArgsBranch(nextChar: string) {
    const optArgs = ['o?', 'i?', 'k?', 'kv?', 'n?', 'l?', 'c-ml?', 'cl?'];
    if (Array.isArray(this._curArgs.top.args[0])) {
      const branches = this._curArgs.top.args[0];
      for (let i = 0, len = branches.length; i < len; ++i) {
        const b = branches[i];
        if ((nextChar === '[' && in$(b[0], optArgs)) || (nextChar === '{' && !in$(b[0], optArgs))) {
          this._curArgs.top.args.shift();
          this._curArgs.top.args.unshift(...b);
          return true;
        }
      }
    }
  }
  nextArg(arg: string) {
    if (this._curArgs.top.args[0] === arg) {
      this._curArgs.top.args.shift();
      return true;
    }
  }

  argError(m: string) {
    return error("macro \\" + this._curArgs.top.name + ": " + m);
  }

  addParsedArg(a: any) {
    this._curArgs.top.parsed.push(a);
  }

  parsedArgs() {
    return this._curArgs.top.parsed;
  }

  preExecMacro() {
    this.macro(this._curArgs.top.name, this.parsedArgs());
  }

  endArgs() {
    const x = this._curArgs.pop();
    x.args.length === 0 || error("grammar error: arguments for " + x.name + " have not been parsed: " + x.args);
    return x.parsed;
  }
  begin(env_id: string) {
    if (!this.hasMacro(env_id)) {
      error("unknown environment: " + env_id);
    }
    this.startBalanced();
    this.enterGroup();
    this.beginArgs(env_id);
  }

  end(id: string, end_id: string) {
    let end;
    if (id !== end_id) {
      error("environment '" + id + "' is missing its end, found '" + end_id + "' instead");
    }
    if (this.hasMacro("end" + id)) {
      end = this.macro("end" + id, []);
    }
    this.exitGroup();
    this.isBalanced() || error(id + ": groups need to be balanced in environments!");
    this.endBalanced();
    return end;
  }
  enterGroup(copyAttrs: boolean = false) {
    this._stack.push({
      attrs: copyAttrs
        ? Object.assign({}, this._stack.top.attrs)
        : {},
      align: null,
      currentlabel: Object.assign({}, this._stack.top.currentlabel),
      lengths: new Map(this._stack.top.lengths)
    });
    ++this._groups.top;
  }

  exitGroup() {
    --this._groups.top >= 0 || error("there is no group to end here");
    this._stack.pop();
  }

  startBalanced() {
    this._groups.push(0);
  }

  endBalanced() {
    this._groups.pop();
    return this._groups.length;
  }

  isBalanced() {
    return this._groups.top === 0;
  }
  continue() {
    this._continue = this.location().end.offset;
  }

  break() {
    if (typeof this._continue === 'number' && this.location().end.offset > this._continue) {
      this._continue = false;
    }
  }

  setAlignment(align: any) {
    this._stack.top.align = align;
  }

  alignment() {
    return this._stack.top.align;
  }
  setFontFamily(family: string) {
    this._stack.top.attrs.fontFamily = family;
  }

  setFontWeight(weight: string) {
    this._stack.top.attrs.fontWeight = weight;
  }

  setFontShape(shape: string) {
    if (shape === "em") {
      if (this._activeAttributeValue("fontShape") === "it") {
        shape = "up";
      } else {
        shape = "it";
      }
    }
    this._stack.top.attrs.fontShape = shape;
  }

  setFontSize(size: string) {
    this._stack.top.attrs.fontSize = size;
  }

  setTextDecoration(decoration: string) {
    this._stack.top.attrs.textDecoration = decoration;
  }
  _inlineAttributes() {
    const cur = this._stack.top.attrs;
    return [cur.fontFamily, cur.fontWeight, cur.fontShape, cur.fontSize, cur.textDecoration].join(' ').replace(/\s+/g, ' ').trim();
  }

  _activeAttributeValue(attr: string) {
    for (let i = this._stack.length - 1; i >= 0; --i) {
      const level = i;
      const that = this._stack[level].attrs[attr];
      if (that) {
        return that;
      }
    }
  }
  startsection(sec: string, level: number, star: boolean, toc: any, ttl: any) {
    let chaphead, el;
    if (toc == ttl && ttl == undefined) {
      if (!star && this.counter("secnumdepth") >= level) {
        this.stepCounter(sec);
        this.refCounter(sec, "sec-" + this.nextId());
      }
      return;
    }
    if (!star && this.counter("secnumdepth") >= level) {
      if (sec === 'chapter') {
        chaphead = this.create(this.block, (this.macro('chaptername', []) || []).concat(this.createText(this.symbol('space')), (this.macro('the' + sec, []) || [])));
        el = this.create(this[sec], [chaphead, ttl]);
      } else {
        el = this.create(this[sec], (this.macro('the' + sec, []) || []).concat(this.createText(this.symbol('quad')), ttl));
      }
      const ref$ = this._stack.top.currentlabel.id;
      if (ref$ != null) {
        el.id = ref$;
      }
    } else {
      el = this.create(this[sec], ttl);
    }
    return el;
  }
  startlist() {
    this.stepCounter('@listdepth');
    if (this.counter('@listdepth') > 6) {
      error("too deeply nested");
    }
    return true;
  }

  endlist() {
    this.setCounter('@listdepth', this.counter('@listdepth') - 1);
    this.continue();
  }
  newLength(l: string) {
    if (this.hasLength(l)) {
      error("length " + l + " already defined!");
    }
    this._stack.top.lengths.set(l, this.Length.zero);
  }

  hasLength(l: string) {
    return this._stack.top.lengths.has(l);
  }

  setLength(id: string, length: any) {
    if (!this.hasLength(id)) {
      error("no such length: " + id);
    }
    this._stack.top.lengths.set(id, length);
  }

  length(l: string) {
    if (!this.hasLength(l)) {
      error("no such length: " + l);
    }
    return this._stack.top.lengths.get(l);
  }

  theLength(id: string) {
    const l = this.create(this.inline, undefined, "the");
    l.setAttribute("display-var", id);
    return l;
  }
  newCounter(c: string, parent?: string) {
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
    this._macros['the' + c] = () => {
      return [this.arabic(this.counter(c))];
    };
  }

  hasCounter(c: string) {
    return this._counters.has(c);
  }

  setCounter(c: string, v: number) {
    if (!this.hasCounter(c)) {
      error("no such counter: " + c);
    }
    this._counters.set(c, v);
  }

  stepCounter(c: string) {
    this.setCounter(c, this.counter(c) + 1);
    this.clearCounter(c);
  }

  counter(c: string) {
    if (!this.hasCounter(c)) {
      error("no such counter: " + c);
    }
    return this._counters.get(c);
  }
  refCounter(c: string, id?: string) {
    let el;
    if (!id) {
      id = c + "-" + this.nextId();
      el = this.create(this.anchor(id));
    }
    this._stack.top.currentlabel = {
      id: id,
      label: this.createFragment(Array.from(this.hasMacro('p@' + c)
        ? this.macro('p@' + c, [])
        : []).concat(Array.from(this.macro('the' + c, []) || [])))
    };
    return el;
  }

  addToReset(c: string, parent: string) {
    if (!this.hasCounter(parent)) {
      error("no such counter: " + parent);
    }
    if (!this.hasCounter(c)) {
      error("no such counter: " + c);
    }
    this._resets.get(parent).push(c);
  }

  clearCounter(c: string) {
    const ref$ = this._resets.get(c);
    for (let i = 0, len = ref$.length; i < len; ++i) {
      const r = ref$[i];
      this.clearCounter(r);
      this.setCounter(r, 0);
    }
  }
  alph(num: number) {
    return String.fromCharCode(96 + num);
  }

  Alph(num: number) {
    return String.fromCharCode(64 + num);
  }

  arabic(num: number) {
    return String(num);
  }

  roman(num: number) {
    const lookup: Array<[string, number]> = [['m', 1000], ['cm', 900], ['d', 500], ['cd', 400], ['c', 100], ['xc', 90], ['l', 50], ['xl', 40], ['x', 10], ['ix', 9], ['v', 5], ['iv', 4], ['i', 1]];
    return this._roman(num, lookup);
  }

  Roman(num: number) {
    const lookup: Array<[string, number]> = [['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]];
    return this._roman(num, lookup);
  }

  private _roman(num: number, lookup: Array<[string, number]>) {
    let roman = "";
    for (let i = 0, len = lookup.length; i < len; ++i) {
      const item = lookup[i];
      while (num >= item[1]) {
        roman += item[0];
        num -= item[1];
      }
    }
    return roman;
  }

  fnsymbol(num: number) {
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
  }
  setLabel(label: string) {
    if (this._labels.has(label)) {
      error("label " + label + " already defined!");
    }
    if (!this._stack.top.currentlabel.id) {
      console.warn("warning: no \\@currentlabel available for label " + label + "!");
    }
    this._labels.set(label, this._stack.top.currentlabel);
    if (this._refs.has(label)) {
      const ref$ = this._refs.get(label);
      for (let i = 0, len = ref$.length; i < len; ++i) {
        const r = ref$[i];
        while (r.firstChild) {
          r.removeChild(r.firstChild);
        }
        r.appendChild(this._stack.top.currentlabel.label.cloneNode(true));
        r.setAttribute("href", "#" + this._stack.top.currentlabel.id);
      }
      this._refs.delete(label);
    }
  }
  ref(label: string) {
    const that = this._labels.get(label);
    if (that) {
      return this.create(this.link("#" + that.id), that.label.cloneNode(true));
    }
    const el = this.create(this.link("#"), this.createText("??"));
    if (!this._refs.has(label)) {
      this._refs.set(label, [el]);
    } else {
      this._refs.get(label).push(el);
    }
    return el;
  }

  logUndefinedRefs() {
    if (this._refs.size === 0) {
      return;
    }
    const keys = this._refs.keys();
    let ref;
    while (!(ref = keys.next()).done) {
      console.warn("warning: reference '" + ref.value + "' undefined");
    }
    console.warn("There were undefined references.");
  }

  marginpar(txt: any) {
    const id = this.nextId();
    const marginPar = this.create(this.block, [this.create(this.inline, null, "mpbaseline"), txt]);
    marginPar.id = id;
    this._marginpars.push(marginPar);
    const marginRef = this.create(this.inline, null, "mpbaseline");
    marginRef.id = "marginref-" + id;
    return marginRef;
  }

  // DOM creation methods - these would need to be implemented based on your DOM structure
  create(elementType: any, content?: any, className?: string): any {
    // Placeholder - implement based on your DOM creation needs
    throw new Error("create method not implemented");
  }

  createText(text: string): any {
    // Placeholder - implement based on your DOM creation needs
    throw new Error("createText method not implemented");
  }

  createFragment(content: any[]): any {
    // Placeholder - implement based on your DOM creation needs
    throw new Error("createFragment method not implemented");
  }

  addAttributes(element: any): any {
    // Placeholder - implement based on your DOM creation needs
    throw new Error("addAttributes method not implemented");
  }

  // Element type properties - these would need to be implemented based on your DOM structure
  get block(): any {
    throw new Error("block property not implemented");
  }

  get inline(): any {
    throw new Error("inline property not implemented");
  }

  anchor(id: string): any {
    throw new Error("anchor method not implemented");
  }

  link(href: string): any {
    throw new Error("link method not implemented");
  }
}

// Global error function
let error = (e: string) => {
  console.error(e);
  throw new Error(e);
};


// Deep equality comparison helper
function deepEq$(x: any, y: any, type: string) {
  const toString = {}.toString;
  const hasOwnProperty = {}.hasOwnProperty;
  const has = (obj: any, key: string) => hasOwnProperty.call(obj, key);
  let first = true;
  return eq(x, y, []);
  
  function eq(a: any, b: any, stack: any[]) {
    let className, length, size, result, alength, blength, key, sizeB;
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

// Array includes helper
function in$(x: any, xs: any[]) {
  let i = -1;
  const l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}