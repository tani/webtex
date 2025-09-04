import { LaTeX } from './latex.ltx';
import { diacritics, symbols } from './symbols';
import { makeLengthClass } from './types';

const Macros = LaTeX;

// Extend Array prototype with top getter/setter for stack operations
Object.defineProperty(Array.prototype, 'top', {
  enumerable: false,
  configurable: true,
  get: function() {
    return this[this.length - 1];
  },
  set: function(v) {
    this[this.length - 1] = v;
  }
});

interface StackFrame {
  attrs: {
    fontFamily?: string;
    fontWeight?: string;
    fontShape?: string;
    fontSize?: string;
    textDecoration?: string;
  };
  align: string | null;
  currentlabel: {
    id: string;
    label: Node;
  };
  lengths: Map<string, any>;
}

interface ArgumentFrame {
  name?: string;
  args: any[];
  parsed: any[];
}

// Modern deep equality function
const deepEqual = (a: any, b: any, type: string = '==='): boolean => {
  if (a == null || b == null) return a === b;
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  
  const className = Object.prototype.toString.call(a);
  if (Object.prototype.toString.call(b) !== className) return false;
  
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
  
  if (typeof a != 'object' || typeof b != 'object') return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (type === '===') return a.length === b.length;
    if (type === '<==') return a.length <= b.length;
    if (type === '<<=') return a.length < b.length;
    
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (type === '===') return keysA.length === keysB.length;
  if (type === '<==') return keysA.length <= keysB.length;
  if (type === '<<=') return keysA.length < keysB.length;
  
  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
  }
  
  return true;
};

// Helper function to check if value is in array
const includes = <T>(value: T, array: T[]): boolean => {
  return array.includes(value);
};

// Roman numeral conversion helper
const romanize = (num: number, lookup: [string, number][]): string => {
  let roman = "";
  for (const [letter, value] of lookup) {
    while (num >= value) {
      roman += letter;
      num -= value;
    }
  }
  return roman;
};

let errorFn = (e: string) => {
  console.error(e);
  throw new Error(e);
};

export class Generator {
  public documentClass: string | null = null;
  public documentTitle: string | null = null;
  public Length: any = null;

  protected _options: any = null;
  protected _macros: any = null;
  protected _stack: StackFrame[] = [];
  protected _groups: number[] = [];
  protected _continue: boolean | number = false;
  protected _labels: Map<string, any> = new Map();
  protected _refs: Map<string, any[]> = new Map();
  protected _counters: Map<string, number> = new Map();
  protected _resets: Map<string, string[]> = new Map();
  protected _marginpars: any[] = [];
  protected _uid: number = 1;
  protected _curArgs: ArgumentFrame[] = [];

  constructor(options?: any) {
    this._options = options;
  }

  public reset(): void {
    this.Length = makeLengthClass(this);
    this.documentClass = this._options?.documentClass || null;
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
    
    this._macros = new Macros(this as any, this._options?.CustomMacros);
  }

  public nextId(): number {
    return this._uid++;
  }

  public round(num: number): number {
    const factor = Math.pow(10, this._options?.precision || 3);
    return Math.round(num * factor) / factor;
  }

  public error(e: string): any {
    return errorFn(e);
  }

  public setErrorFn(e: (msg: string) => never): void {
    errorFn = e;
  }

  public location(): any {
    errorFn("location function not set!");
  }

  public setTitle(title: any): void {
    this.documentTitle = title.textContent;
  }

  public hasSymbol(name: string): boolean {
    return (Macros as any).symbols.has(name);
  }

  public symbol(name: string): string {
    if (!this.hasSymbol(name)) {
      this.error("no such symbol: " + name);
    }
    return (Macros as any).symbols.get(name);
  }

  public hasMacro(name: string): boolean {
    return typeof this._macros[name] === "function" && 
           !deepEqual(name, "constructor", '===') && 
           (this._macros.hasOwnProperty(name) || Macros.prototype.hasOwnProperty(name));
  }

  public isHmode(macro: string): boolean {
    const args = (Macros as any).args[macro];
    return (args?.[0] === 'H') || !args;
  }

  public isVmode(macro: string): boolean {
    const args = (Macros as any).args[macro];
    return args?.[0] === 'V';
  }

  public isHVmode(macro: string): boolean {
    const args = (Macros as any).args[macro];
    return args?.[0] === 'HV';
  }

  public isPreamble(macro: string): boolean {
    const args = (Macros as any).args[macro];
    return args?.[0] === 'P';
  }

  public macro(name: string, args: any[]): any[] | undefined {
    if (symbols.has(name)) {
      return [this.createText(symbols.get(name))];
    }
    
    const result = this._macros[name]?.apply(this._macros, args);
    return result?.filter((x: any) => x !== undefined).map((x: any) => {
      if (typeof x === 'string' || x instanceof String) {
        return this.createText(x.toString());
      } else {
        return this.addAttributes(x);
      }
    });
  }

  public beginArgs(macro: string): void {
    const macroArgs = (Macros as any).args[macro];
    this._curArgs.push(macroArgs ? {
      name: macro,
      args: macroArgs.slice(1),
      parsed: []
    } : {
      args: [],
      parsed: []
    });
  }

  public selectArgsBranch(nextChar: string): boolean {
    const optArgs = ['o?', 'i?', 'k?', 'kv?', 'n?', 'l?', 'c-ml?', 'cl?'];
    
    if (Array.isArray((this._curArgs as any).top.args[0])) {
      const branches = (this._curArgs as any).top.args[0];
      
      for (const branch of branches) {
        if ((nextChar === '[' && includes(branch[0], optArgs)) || 
            (nextChar === '{' && !includes(branch[0], optArgs))) {
          (this._curArgs as any).top.args.shift();
          (this._curArgs as any).top.args.unshift(...branch);
          return true;
        }
      }
    }
    return false;
  }

  public nextArg(arg: string): boolean {
    if ((this._curArgs as any).top.args[0] === arg) {
      (this._curArgs as any).top.args.shift();
      return true;
    }
    return false;
  }

  public argError(m: string): void {
    errorFn("macro \\" + (this._curArgs as any).top.name + ": " + m);
  }

  public addParsedArg(a: any): void {
    (this._curArgs as any).top.parsed.push(a);
  }

  public parsedArgs(): any[] {
    return (this._curArgs as any).top.parsed;
  }

  public preExecMacro(): void {
    this.macro((this._curArgs as any).top.name, this.parsedArgs());
  }

  public endArgs(): any[] {
    const frame = this._curArgs.pop()!;
    if (frame.args.length !== 0) {
      errorFn("grammar error: arguments for " + frame.name + " have not been parsed: " + frame.args);
    }
    return frame.parsed;
  }

  public begin(env_id: string): void {
    if (!this.hasMacro(env_id)) {
      errorFn("unknown environment: " + env_id);
    }
    this.startBalanced();
    this.enterGroup();
    this.beginArgs(env_id);
  }

  public end(id: string, end_id: string): any {
    if (id !== end_id) {
      errorFn("environment '" + id + "' is missing its end, found '" + end_id + "' instead");
    }
    
    let endResult;
    if (this.hasMacro("end" + id)) {
      endResult = this.macro("end" + id, []);
    }
    
    this.exitGroup();
    if (!this.isBalanced()) {
      errorFn(id + ": groups need to be balanced in environments!");
    }
    this.endBalanced();
    return endResult;
  }

  public enterGroup(copyAttrs: boolean = false): void {
    this._stack.push({
      attrs: copyAttrs ? Object.assign({}, (this._stack as any).top.attrs) : {},
      align: null,
      currentlabel: Object.assign({}, (this._stack as any).top.currentlabel),
      lengths: new Map((this._stack as any).top.lengths)
    });
    ++(this._groups as any).top;
  }

  public exitGroup(): void {
    if (--(this._groups as any).top < 0) {
      errorFn("there is no group to end here");
    }
    this._stack.pop();
  }

  public startBalanced(): void {
    this._groups.push(0);
  }

  public endBalanced(): number {
    this._groups.pop();
    return this._groups.length;
  }

  public isBalanced(): boolean {
    return (this._groups as any).top === 0;
  }

  public continue(): void {
    this._continue = (this.location() as any).end.offset;
  }

  public break(): void {
    if ((this.location() as any).end.offset > this._continue) {
      this._continue = false;
    }
  }

  public setAlignment(align: string): void {
    (this._stack as any).top.align = align;
  }

  public alignment(): string | null {
    return (this._stack as any).top.align;
  }

  public setFontFamily(family: string): void {
    (this._stack as any).top.attrs.fontFamily = family;
  }

  public setFontWeight(weight: string): void {
    (this._stack as any).top.attrs.fontWeight = weight;
  }

  public setFontShape(shape: string): void {
    if (shape === "em") {
      if (this._activeAttributeValue("fontShape") === "it") {
        shape = "up";
      } else {
        shape = "it";
      }
    }
    (this._stack as any).top.attrs.fontShape = shape;
  }

  public setFontSize(size: string): void {
    (this._stack as any).top.attrs.fontSize = size;
  }

  public setTextDecoration(decoration: string): void {
    (this._stack as any).top.attrs.textDecoration = decoration;
  }

  public _inlineAttributes(): string {
    const cur = (this._stack as any).top.attrs;
    return [cur.fontFamily, cur.fontWeight, cur.fontShape, cur.fontSize, cur.textDecoration]
      .join(' ').replace(/\s+/g, ' ').trim();
  }

  public _activeAttributeValue(attr: string): any {
    for (let i = this._stack.length - 1; i >= 0; i--) {
      const value = this._stack[i].attrs[attr as keyof typeof this._stack[0]['attrs']];
      if (value) {
        return value;
      }
    }
  }

  public startsection(sec: string, level: number, star: boolean, toc?: any, ttl?: any): any {
    if (toc == ttl && ttl == undefined) {
      if (!star && this.counter("secnumdepth") >= level) {
        this.stepCounter(sec);
        this.refCounter(sec, "sec-" + this.nextId());
      }
      return;
    }

    let el;
    if (!star && this.counter("secnumdepth") >= level) {
      if (sec === 'chapter') {
        const chaphead = this.create((this as any).block, 
          this.macro('chaptername', []).concat(
            this.createText(this.symbol('space')), 
            this.macro('the' + sec, [])
          )
        );
        el = this.create((this as any)[sec], [chaphead, ttl]);
      } else {
        el = this.create((this as any)[sec], 
          this.macro('the' + sec, []).concat(
            this.createText(this.symbol('quad')), 
            ttl
          )
        );
      }
      
      const currentId = (this._stack as any).top.currentlabel.id;
      if (currentId != null) {
        el.id = currentId;
      }
    } else {
      el = this.create((this as any)[sec], ttl);
    }
    
    return el;
  }

  public startlist(): boolean {
    this.stepCounter('@listdepth');
    if (this.counter('@listdepth') > 6) {
      errorFn("too deeply nested");
    }
    return true;
  }

  public endlist(): void {
    this.setCounter('@listdepth', this.counter('@listdepth') - 1);
    this.continue();
  }

  public newLength(l: string): void {
    if (this.hasLength(l)) {
      errorFn("length " + l + " already defined!");
    }
    (this._stack as any).top.lengths.set(l, this.Length.zero);
  }

  public hasLength(l: string): boolean {
    return (this._stack as any).top.lengths.has(l);
  }

  public setLength(id: string, length: any): void {
    if (!this.hasLength(id)) {
      errorFn("no such length: " + id);
    }
    (this._stack as any).top.lengths.set(id, length);
  }

  public length(l: string): any {
    if (!this.hasLength(l)) {
      errorFn("no such length: " + l);
    }
    return (this._stack as any).top.lengths.get(l);
  }

  public theLength(id: string): any {
    const l = this.create((this as any).inline, undefined, "the");
    l.setAttribute("display-var", id);
    return l;
  }

  public newCounter(c: string, parent?: string): void {
    if (this.hasCounter(c)) {
      errorFn("counter " + c + " already defined!");
    }
    this._counters.set(c, 0);
    this._resets.set(c, []);
    
    if (parent) {
      this.addToReset(c, parent);
    }
    
    if (this.hasMacro('the' + c)) {
      errorFn("macro \\the" + c + " already defined!");
    }
    
    this._macros['the' + c] = function(this: any) {
      return [this.g.arabic(this.g.counter(c))];
    };
  }

  public hasCounter(c: string): boolean {
    return this._counters.has(c);
  }

  public setCounter(c: string, v: number): void {
    if (!this.hasCounter(c)) {
      errorFn("no such counter: " + c);
    }
    this._counters.set(c, v);
  }

  public stepCounter(c: string): void {
    this.setCounter(c, this.counter(c) + 1);
    this.clearCounter(c);
  }

  public counter(c: string): number {
    if (!this.hasCounter(c)) {
      errorFn("no such counter: " + c);
    }
    return this._counters.get(c)!;
  }

  public refCounter(c: string, id?: string): any {
    let el;
    if (!id) {
      id = c + "-" + this.nextId();
      el = this.create((this as any).anchor(id));
    }
    
    (this._stack as any).top.currentlabel = {
      id: id,
      label: this.createFragment(
        ...(this.hasMacro('p@' + c) ? this.macro('p@' + c, []) || [] : []),
        ...(this.macro('the' + c, []) || [])
      )
    };
    
    return el;
  }

  public addToReset(c: string, parent: string): void {
    if (!this.hasCounter(parent)) {
      errorFn("no such counter: " + parent);
    }
    if (!this.hasCounter(c)) {
      errorFn("no such counter: " + c);
    }
    this._resets.get(parent)!.push(c);
  }

  public clearCounter(c: string): void {
    const resets = this._resets.get(c);
    if (resets) {
      for (const r of resets) {
        this.clearCounter(r);
        this.setCounter(r, 0);
      }
    }
  }

  public alph(num: number): string {
    return String.fromCharCode(96 + num);
  }

  public Alph(num: number): string {
    return String.fromCharCode(64 + num);
  }

  public arabic(num: number): string {
    return String(num);
  }

  public roman(num: number): string {
    const lookup: [string, number][] = [
      ['m', 1000], ['cm', 900], ['d', 500], ['cd', 400], ['c', 100], 
      ['xc', 90], ['l', 50], ['xl', 40], ['x', 10], ['ix', 9], 
      ['v', 5], ['iv', 4], ['i', 1]
    ];
    return romanize(num, lookup);
  }

  public Roman(num: number): string {
    const lookup: [string, number][] = [
      ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], 
      ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], 
      ['V', 5], ['IV', 4], ['I', 1]
    ];
    return romanize(num, lookup);
  }

  public fnsymbol(num: number): string {
    switch (num) {
      case 1: return this.symbol('textasteriskcentered');
      case 2: return this.symbol('textdagger');
      case 3: return this.symbol('textdaggerdbl');
      case 4: return this.symbol('textsection');
      case 5: return this.symbol('textparagraph');
      case 6: return this.symbol('textbardbl');
      case 7: return this.symbol('textasteriskcentered') + this.symbol('textasteriskcentered');
      case 8: return this.symbol('textdagger') + this.symbol('textdagger');
      case 9: return this.symbol('textdaggerdbl') + this.symbol('textdaggerdbl');
      default: return errorFn("fnsymbol value must be between 1 and 9");
    }
  }

  public setLabel(label: string): void {
    if (this._labels.has(label)) {
      errorFn("label " + label + " already defined!");
    }
    
    if (!(this._stack as any).top.currentlabel.id) {
      console.warn("warning: no \\@currentlabel available for label " + label + "!");
    }
    
    this._labels.set(label, (this._stack as any).top.currentlabel);
    
    if (this._refs.has(label)) {
      const refs = this._refs.get(label)!;
      for (const r of refs) {
        while (r.firstChild) {
          r.removeChild(r.firstChild);
        }
        r.appendChild((this._stack as any).top.currentlabel.label.cloneNode(true));
        r.setAttribute("href", "#" + (this._stack as any).top.currentlabel.id);
      }
      this._refs.delete(label);
    }
  }

  public ref(label: string): any {
    const labelData = this._labels.get(label);
    if (labelData) {
      return this.create((this as any).link("#" + labelData.id), labelData.label.cloneNode(true));
    }
    
    const el = this.create((this as any).link("#"), this.createText("??"));
    if (!this._refs.has(label)) {
      this._refs.set(label, [el]);
    } else {
      this._refs.get(label)!.push(el);
    }
    return el;
  }

  public logUndefinedRefs(): void {
    if (this._refs.size === 0) {
      return;
    }
    
    for (const [key] of this._refs) {
      console.warn("warning: reference '" + key + "' undefined");
    }
    console.warn("There were undefined references.");
  }

  public marginpar(txt: any): any {
    const id = this.nextId();
    const marginPar = this.create((this as any).block, 
      [this.create((this as any).inline, null, "mpbaseline"), txt]
    );
    marginPar.id = id;
    this._marginpars.push(marginPar);
    
    const marginRef = this.create((this as any).inline, null, "mpbaseline");
    marginRef.id = "marginref-" + id;
    return marginRef;
  }

  // These methods are expected to be overridden by subclasses
  public createText(text: string): any {
    throw new Error("createText method must be implemented by subclass");
  }

  public createFragment(...args: any[]): any {
    throw new Error("createFragment method must be implemented by subclass");
  }

  public create(type: any, children?: any, classes?: string): any {
    throw new Error("create method must be implemented by subclass");
  }

  public addAttributes(node: any): any {
    throw new Error("addAttributes method must be implemented by subclass");
  }
}