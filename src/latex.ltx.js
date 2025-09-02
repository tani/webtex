import { symbols } from './symbols';
import { Vector } from './types';
import builtinDocumentclasses from './documentclasses';
import builtinPackages from './packages';
import assign from 'lodash/assign';
import assignIn from 'lodash/assignIn';
var export$;
export { export$ as LaTeX }
var LaTeX, slice$ = [].slice, arrayFrom$ = Array.from || function(x){return slice$.call(x);};
export$ = LaTeX = (function(){
  LaTeX.displayName = 'LaTeX';
  var providedPackages, args, x$, i$, y$, ref$, len$, z$, z1$, z2$, z3$, z4$, z5$, z6$, z7$, z8$, z9$, z10$, z11$, z12$, z13$, z14$, z15$, prototype = LaTeX.prototype, constructor = LaTeX;
  providedPackages = ['calc', 'pspicture', 'picture', 'pict2e', 'keyval', 'comment'];
  LaTeX.prototype._title = null;
  LaTeX.prototype._author = null;
  LaTeX.prototype._date = null;
  LaTeX.prototype._thanks = null;
  function LaTeX(generator, CustomMacros){
    var ref$;
    if (CustomMacros) {
      assignIn(this, new CustomMacros(generator));
      assign(args, CustomMacros.args);
      if ((ref$ = CustomMacros.symbols) != null) {
        ref$.forEach(function(value, key){
          return symbols.set(key, value);
        });
      }
    }
    this.g = generator;
    this.g.newCounter('secnumdepth');
    this.g.newCounter('tocdepth');
    this.g.newCounter('footnote');
    this.g.newCounter('mpfootnote');
    this.g.newCounter('@listdepth');
    this.g.newCounter('@itemdepth');
    this.g.newCounter('@enumdepth');
    this.g.newLength('@@size');
    this.g.newLength('unitlength');
    this.g.setLength('unitlength', new this.g.Length(1, "pt"));
    this.g.newLength('@wholewidth');
    this.g.setLength('@wholewidth', new this.g.Length(0.4, "pt"));
    this.g.newLength('paperheight');
    this.g.newLength('paperwidth');
    this.g.newLength('oddsidemargin');
    this.g.newLength('evensidemargin');
    this.g.newLength('textheight');
    this.g.newLength('textwidth');
    this.g.newLength('marginparwidth');
    this.g.newLength('marginparsep');
    this.g.newLength('marginparpush');
    this.g.newLength('columnwidth');
    this.g.newLength('columnsep');
    this.g.newLength('columnseprule');
    this.g.newLength('linewidth');
    this.g.newLength('leftmargin');
    this.g.newLength('rightmargin');
    this.g.newLength('listparindent');
    this.g.newLength('itemindent');
    this.g.newLength('labelwidth');
    this.g.newLength('labelsep');
    this.g.newLength('leftmargini');
    this.g.newLength('leftmarginii');
    this.g.newLength('leftmarginiii');
    this.g.newLength('leftmarginiv');
    this.g.newLength('leftmarginv');
    this.g.newLength('leftmarginvi');
    this.g.newLength('fboxrule');
    this.g.newLength('fboxsep');
    this.g.newLength('tabbingsep');
    this.g.newLength('arraycolsep');
    this.g.newLength('tabcolsep');
    this.g.newLength('arrayrulewidth');
    this.g.newLength('doublerulesep');
    this.g.newLength('footnotesep');
    this.g.newLength('topmargin');
    this.g.newLength('headheight');
    this.g.newLength('headsep');
    this.g.newLength('footskip');
    this.g.newLength('topsep');
    this.g.newLength('partopsep');
    this.g.newLength('itemsep');
    this.g.newLength('parsep');
    this.g.newLength('floatsep');
    this.g.newLength('textfloatsep');
    this.g.newLength('intextsep');
    this.g.newLength('dblfloatsep');
    this.g.newLength('dbltextfloatsep');
  }
  LaTeX.symbols = symbols;
  args = LaTeX.args = {};
  args['empty'] = ['HV'];
  LaTeX.prototype['empty'] = function(){};
  LaTeX.prototype['TeX'] = function(){
    var tex, e;
    this.g.enterGroup();
    tex = this.g.create(this.g.inline);
    tex.setAttribute('class', 'tex');
    tex.appendChild(this.g.createText('T'));
    e = this.g.create(this.g.inline, this.g.createText('e'), 'e');
    tex.appendChild(e);
    tex.appendChild(this.g.createText('X'));
    this.g.exitGroup();
    return [tex];
  };
  LaTeX.prototype['LaTeX'] = function(){
    var latex, a, e;
    this.g.enterGroup();
    latex = this.g.create(this.g.inline);
    latex.setAttribute('class', 'latex');
    latex.appendChild(this.g.createText('L'));
    a = this.g.create(this.g.inline, this.g.createText('a'), 'a');
    latex.appendChild(a);
    latex.appendChild(this.g.createText('T'));
    e = this.g.create(this.g.inline, this.g.createText('e'), 'e');
    latex.appendChild(e);
    latex.appendChild(this.g.createText('X'));
    this.g.exitGroup();
    return [latex];
  };
  LaTeX.prototype['today'] = function(){
    return [new Date().toLocaleDateString('en', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })];
  };
  LaTeX.prototype['newline'] = function(){
    return [this.g.create(this.g.linebreak)];
  };
  LaTeX.prototype['negthinspace'] = function(){
    return [this.g.create(this.g.inline, undefined, 'negthinspace')];
  };
  args['par'] = ['V'];
  args['item'] = ['V'];
  args['onecolumn'] = ['V'];
  LaTeX.prototype['onecolumn'] = function(){};
  args['twocolumn'] = ['V', 'o?'];
  LaTeX.prototype['twocolumn'] = function(){};
  x$ = args;
  x$['smallbreak'] = x$['medbreak'] = x$['bigbreak'] = ['V'];
  LaTeX.prototype['smallbreak'] = function(){
    return [this.g.createVSpaceSkip("smallskip")];
  };
  LaTeX.prototype['medbreak'] = function(){
    return [this.g.createVSpaceSkip("medskip")];
  };
  LaTeX.prototype['bigbreak'] = function(){
    return [this.g.createVSpaceSkip("bigskip")];
  };
  args['addvspace'] = ['V', 'l'];
  LaTeX.prototype['addvspace'] = function(l){
    return this.g.createVSpace(l);
  };
  args['marginpar'] = ['H', 'g'];
  LaTeX.prototype['marginpar'] = function(txt){
    return [this.g.marginpar(txt)];
  };
  LaTeX.prototype['abstractname'] = function(){
    return ["Abstract"];
  };
  args['title'] = ['HV', 'g'];
  args['author'] = ['HV', 'g'];
  args['and'] = ['H'];
  args['date'] = ['HV', 'g'];
  args['thanks'] = ['HV', 'g'];
  LaTeX.prototype['title'] = function(t){
    this._title = t;
  };
  LaTeX.prototype['author'] = function(a){
    this._author = a;
  };
  LaTeX.prototype['date'] = function(d){
    this._date = d;
  };
  LaTeX.prototype['and'] = function(){
    return this.g.macro('quad');
  };
  LaTeX.prototype['thanks'] = LaTeX['footnote'];
  for (i$ = 0, len$ = (ref$ = ['rm', 'sf', 'tt', 'md', 'bf', 'up', 'it', 'sl', 'sc', 'normal']).length; i$ < len$; ++i$) {
    y$ = ref$[i$];
    args['text' + y$] = ['H', 'X', 'g'];
  }
  LaTeX.prototype['textrm'] = function(arg){
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontFamily("rm");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  };
  LaTeX.prototype['textsf'] = function(arg){
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontFamily("sf");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  };
  LaTeX.prototype['texttt'] = function(arg){
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontFamily("tt");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  };
  LaTeX.prototype['textmd'] = function(arg){
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontWeight("md");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  };
  LaTeX.prototype['textbf'] = function(arg){
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontWeight("bf");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  };
  LaTeX.prototype['textup'] = function(arg){
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontShape("up");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  };
  LaTeX.prototype['textit'] = function(arg){
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontShape("it");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  };
  LaTeX.prototype['textsl'] = function(arg){
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontShape("sl");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  };
  LaTeX.prototype['textsc'] = function(arg){
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontShape("sc");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  };
  LaTeX.prototype['textnormal'] = function(arg){
    if (arguments.length === 0) {
      this.g.enterGroup();
      this.g.setFontFamily("rm");
      this.g.setFontWeight("md");
      return this.g.setFontShape("up");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  };
  args['emph'] = ['H', 'X', 'g'];
  LaTeX.prototype['emph'] = function(arg){
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontShape("em");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  };
  for (i$ = 0, len$ = (ref$ = ['rm', 'sf', 'tt']).length; i$ < len$; ++i$) {
    z$ = ref$[i$];
    args[z$ + "family"] = ['HV'];
  }
  for (i$ = 0, len$ = (ref$ = ['md', 'bf']).length; i$ < len$; ++i$) {
    z1$ = ref$[i$];
    args[z1$ + "series"] = ['HV'];
  }
  for (i$ = 0, len$ = (ref$ = ['up', 'it', 'sl', 'sc']).length; i$ < len$; ++i$) {
    z2$ = ref$[i$];
    args[z2$ + "shape"] = ['HV'];
  }
  for (i$ = 0, len$ = (ref$ = ['normalfont', 'em']).length; i$ < len$; ++i$) {
    z3$ = ref$[i$];
    args[z3$] = ['HV'];
  }
  for (i$ = 0, len$ = (ref$ = ['tiny', 'scriptsize', 'footnotesize', 'small', 'normalsize', 'large', 'Large', 'LARGE', 'huge', 'Huge']).length; i$ < len$; ++i$) {
    z4$ = ref$[i$];
    args[z4$] = ['HV'];
  }
  LaTeX.prototype['rmfamily'] = function(){
    this.g.setFontFamily("rm");
  };
  LaTeX.prototype['sffamily'] = function(){
    this.g.setFontFamily("sf");
  };
  LaTeX.prototype['ttfamily'] = function(){
    this.g.setFontFamily("tt");
  };
  LaTeX.prototype['mdseries'] = function(){
    this.g.setFontWeight("md");
  };
  LaTeX.prototype['bfseries'] = function(){
    this.g.setFontWeight("bf");
  };
  LaTeX.prototype['upshape'] = function(){
    this.g.setFontShape("up");
  };
  LaTeX.prototype['itshape'] = function(){
    this.g.setFontShape("it");
  };
  LaTeX.prototype['slshape'] = function(){
    this.g.setFontShape("sl");
  };
  LaTeX.prototype['scshape'] = function(){
    this.g.setFontShape("sc");
  };
  LaTeX.prototype['normalfont'] = function(){
    this.g.setFontFamily("rm");
    this.g.setFontWeight("md");
    this.g.setFontShape("up");
  };
  for (i$ = 0, len$ = (ref$ = ['tiny', 'scriptsize', 'footnotesize', 'small', 'normalsize', 'large', 'Large', 'LARGE', 'huge', 'Huge']).length; i$ < len$; ++i$) {
    z5$ = ref$[i$];
    prototype[z5$] = fn$(z5$);
  }
  LaTeX.prototype['em'] = function(){
    this.g.setFontShape("em");
  };
  LaTeX.prototype['theenumi'] = function(){
    return [this.g.arabic(this.g.counter('enumi'))];
  };
  LaTeX.prototype['theenumii'] = function(){
    return [this.g.alph(this.g.counter('enumii'))];
  };
  LaTeX.prototype['theenumiii'] = function(){
    return [this.g.roman(this.g.counter('enumiii'))];
  };
  LaTeX.prototype['theenumiv'] = function(){
    return [this.g.Alph(this.g.counter('enumiv'))];
  };
  LaTeX.prototype['labelenumi'] = function(){
    return this.theenumi().concat(".");
  };
  LaTeX.prototype['labelenumii'] = function(){
    return ["("].concat(arrayFrom$(this.theenumii()), [")"]);
  };
  LaTeX.prototype['labelenumiii'] = function(){
    return this.theenumiii().concat(".");
  };
  LaTeX.prototype['labelenumiv'] = function(){
    return this.theenumiv().concat(".");
  };
  LaTeX.prototype['p@enumii'] = function(){
    return this.theenumi();
  };
  LaTeX.prototype['p@enumiii'] = function(){
    return this.theenumi().concat("(", this.theenumii(), ")");
  };
  LaTeX.prototype['p@enumiv'] = function(){
    return this["p@enumiii"]().concat(this.theenumiii());
  };
  LaTeX.prototype['labelitemi'] = function(){
    return [this.g.symbol('textbullet')];
  };
  LaTeX.prototype['labelitemii'] = function(){
    this.normalfont();
    this.bfseries();
    return [this.g.symbol('textendash')];
  };
  LaTeX.prototype['labelitemiii'] = function(){
    return [this.g.symbol('textasteriskcentered')];
  };
  LaTeX.prototype['labelitemiv'] = function(){
    return [this.g.symbol('textperiodcentered')];
  };
  z6$ = args;
  z6$['centering'] = z6$['raggedright'] = z6$['raggedleft'] = ['HV'];
  LaTeX.prototype['centering'] = function(){
    this.g.setAlignment("centering");
  };
  LaTeX.prototype['raggedright'] = function(){
    this.g.setAlignment("raggedright");
  };
  LaTeX.prototype['raggedleft'] = function(){
    this.g.setAlignment("raggedleft");
  };
  z7$ = args;
  z7$['center'] = z7$['flushleft'] = z7$['flushright'] = ['V'];
  LaTeX.prototype['center'] = function(){
    this.g.startlist();
    return [this.g.create(this.g.list, null, "center")];
  };
  LaTeX.prototype['endcenter'] = function(){
    this.g.endlist();
  };
  LaTeX.prototype['flushleft'] = function(){
    this.g.startlist();
    return [this.g.create(this.g.list, null, "flushleft")];
  };
  LaTeX.prototype['endflushleft'] = function(){
    this.g.endlist();
  };
  LaTeX.prototype['flushright'] = function(){
    this.g.startlist();
    return [this.g.create(this.g.list, null, "flushright")];
  };
  LaTeX.prototype['endflushright'] = function(){
    this.g.endlist();
  };
  z8$ = args;
  z8$['titlepage'] = ['V'];
  LaTeX.prototype['titlepage'] = function(){
    return [this.g.create(this.g.titlepage)];
  };
  z9$ = args;
  z9$['quote'] = z9$['quotation'] = z9$['verse'] = ['V'];
  LaTeX.prototype['quote'] = function(){
    this.g.startlist();
    return [this.g.create(this.g.quote)];
  };
  LaTeX.prototype['endquote'] = function(){
    this.g.endlist();
  };
  LaTeX.prototype['quotation'] = function(){
    this.g.startlist();
    return [this.g.create(this.g.quotation)];
  };
  LaTeX.prototype['endquotation'] = function(){
    this.g.endlist();
  };
  LaTeX.prototype['verse'] = function(){
    this.g.startlist();
    return [this.g.create(this.g.verse)];
  };
  LaTeX.prototype['endverse'] = function(){
    this.g.endlist();
  };
  args['itemize'] = ['V', 'X', 'items'];
  LaTeX.prototype['itemize'] = function(items){
    var label, this$ = this;
    if (arguments.length === 0) {
      this.g.startlist();
      this.g.stepCounter('@itemdepth');
      if (this.g.counter('@itemdepth') > 4) {
        this.g.error("too deeply nested");
      }
      return;
    }
    label = "labelitem" + this.g.roman(this.g.counter('@itemdepth'));
    return [this.g.create(this.g.unorderedList, items.map(function(item){
      var makelabel;
      this$.g.enterGroup();
      makelabel = this$.g.create(this$.g.itemlabel, this$['llap'](item.label !== null
        ? item.label
        : this$.g.macro(label)));
      this$.g.exitGroup();
      return this$.g.create(this$.g.listitem, [makelabel, item.text]);
    }))];
  };
  LaTeX.prototype['enditemize'] = function(){
    this.g.endlist();
    this.g.setCounter('@itemdepth', this.g.counter('@itemdepth') - 1);
  };
  args['enumerate'] = ['V', 'X', 'enumitems'];
  LaTeX.prototype['enumerate'] = function(items){
    var itemCounter, this$ = this;
    if (arguments.length === 0) {
      this.g.startlist();
      this.g.stepCounter('@enumdepth');
      if (this.g.counter('@enumdepth') > 4) {
        this.g.error("too deeply nested");
      }
      return;
    }
    itemCounter = "enum" + this.g.roman(this.g.counter('@enumdepth'));
    this.g.setCounter(itemCounter, 0);
    return [this.g.create(this.g.orderedList, items.map(function(item){
      var label, makelabel;
      label = this$.g.create(this$.g.inline, item.label.node);
      if (item.label.id) {
        label.id = item.label.id;
      }
      makelabel = this$.g.create(this$.g.itemlabel, this$['llap'](label));
      return this$.g.create(this$.g.listitem, [makelabel, item.text]);
    }))];
  };
  LaTeX.prototype['endenumerate'] = function(){
    this.g.endlist();
    this.g.setCounter('@enumdepth', this.g.counter('@enumdepth') - 1);
  };
  args['description'] = ['V', 'X', 'items'];
  LaTeX.prototype['description'] = function(items){
    var this$ = this;
    if (arguments.length === 0) {
      this.g.startlist();
      return;
    }
    return [this.g.create(this.g.descriptionList, items.map(function(item){
      var dt, dd;
      dt = this$.g.create(this$.g.term, item.label);
      dd = this$.g.create(this$.g.description, item.text);
      return this$.g.createFragment([dt, dd]);
    }))];
  };
  LaTeX.prototype['enddescription'] = function(){
    this.g.endlist();
  };
  args['picture'] = ['H', 'v', 'v?', 'h'];
  LaTeX.prototype['picture'] = function(size, offset, content){
    return [this.g.createPicture(size, offset, content)];
  };
  args['hspace'] = ['H', 's', 'l'];
  LaTeX.prototype['hspace'] = function(s, l){
    return [this.g.createHSpace(l)];
  };
  args['label'] = ['HV', 'g'];
  LaTeX.prototype['label'] = function(label){
    this.g.setLabel(label.textContent);
  };
  args['ref'] = ['H', 'g'];
  LaTeX.prototype['ref'] = function(label){
    return [this.g.ref(label.textContent)];
  };
  z10$ = args;
  z10$['llap'] = z10$['rlap'] = z10$['clap'] = z10$['smash'] = z10$['hphantom'] = z10$['vphantom'] = z10$['phantom'] = ['H', 'hg'];
  LaTeX.prototype['llap'] = function(txt){
    return [this.g.create(this.g.inline, txt, "hbox llap")];
  };
  LaTeX.prototype['rlap'] = function(txt){
    return [this.g.create(this.g.inline, txt, "hbox rlap")];
  };
  LaTeX.prototype['clap'] = function(txt){
    return [this.g.create(this.g.inline, txt, "hbox clap")];
  };
  LaTeX.prototype['smash'] = function(txt){
    return [this.g.create(this.g.inline, txt, "hbox smash")];
  };
  LaTeX.prototype['hphantom'] = function(txt){
    return [this.g.create(this.g.inline, txt, "phantom hbox smash")];
  };
  LaTeX.prototype['vphantom'] = function(txt){
    return [this.g.create(this.g.inline, txt, "phantom hbox rlap")];
  };
  LaTeX.prototype['phantom'] = function(txt){
    return [this.g.create(this.g.inline, txt, "phantom hbox")];
  };
  args['underline'] = ['H', 'hg'];
  LaTeX.prototype['underline'] = function(txt){
    return [this.g.create(this.g.inline, txt, "hbox underline")];
  };
  args['mbox'] = ['H', 'hg'];
  LaTeX.prototype['mbox'] = function(txt){
    return this.makebox(undefined, undefined, undefined, txt);
  };
  args['makebox'] = ['H', 'v?', 'l?', 'i?', 'hg'];
  LaTeX.prototype['makebox'] = function(vec, width, pos, txt){
    if (vec) {
      if (width && pos) {
        this.g.error("expected \\makebox(width,height)[position]{text} but got two optional arguments!");
      }
      pos = width;
      return [txt];
    } else {
      return this._box(width, pos, txt, "hbox");
    }
  };
  args['fbox'] = ['H', 'hg'];
  args['framebox'] = ['H', 'v?', 'l?', 'i?', 'hg'];
  LaTeX.prototype['fbox'] = function(txt){
    return this.framebox(undefined, undefined, undefined, txt);
  };
  LaTeX.prototype['framebox'] = function(vec, width, pos, txt){
    if (vec) {
      if (width && pos) {
        return this.g.error("expected \\framebox(width,height)[position]{text} but got two optional arguments!");
      }
    } else {
      if (txt.hasAttribute != null && !width && !pos && !this.g.hasAttribute(txt, "frame")) {
        this.g.addAttribute(txt, "frame");
        return [txt];
      } else {
        return this._box(width, pos, txt, "hbox frame");
      }
    }
  };
  LaTeX.prototype._box = function(width, pos, txt, classes){
    var content, box;
    if (width) {
      if (!pos) {
        pos = "c";
      }
      switch (pos) {
      case "s":
        classes += " stretch";
        break;
      case "c":
        classes += " clap";
        break;
      case "l":
        classes += " rlap";
        break;
      case "r":
        classes += " llap";
        break;
      default:
        this.g.error("unknown position: " + pos);
      }
    }
    content = this.g.create(this.g.inline, txt);
    box = this.g.create(this.g.inline, content, classes);
    if (width) {
      box.setAttribute("style", "width:" + width.value);
    }
    return [box];
  };
  args['parbox'] = ['H', 'i?', 'l?', 'i?', 'l', 'g'];
  LaTeX.prototype['parbox'] = function(pos, height, innerPos, width, txt){
    var classes, style, content, box;
    if (!pos) {
      pos = "c";
    }
    if (!innerPos) {
      innerPos = pos;
    }
    classes = "parbox";
    style = "width:" + width.value + ";";
    if (height) {
      classes += " pbh";
      style += "height:" + height.value + ";";
    }
    switch (pos) {
    case "c":
      classes += " p-c";
      break;
    case "t":
      classes += " p-t";
      break;
    case "b":
      classes += " p-b";
      break;
    default:
      this.g.error("unknown position: " + pos);
    }
    switch (innerPos) {
    case "s":
      classes += " stretch";
      break;
    case "c":
      classes += " p-cc";
      break;
    case "t":
      classes += " p-ct";
      break;
    case "b":
      classes += " p-cb";
      break;
    default:
      this.g.error("unknown inner-pos: " + innerPos);
    }
    content = this.g.create(this.g.inline, txt);
    box = this.g.create(this.g.inline, content, classes);
    box.setAttribute("style", style);
    return [box];
  };
  /*
  \shortstack[pos]{...\\...\\...}, pos: r,l,c (horizontal alignment)
  
  
  \begin{minipage}[pos][height][inner-pos]{width}
  */;
  z11$ = args;
  z11$['thicklines'] = ['HV'];
  z11$['thinlines'] = ['HV'];
  z11$['linethickness'] = ['HV', 'l'];
  z11$['arrowlength'] = ['HV', 'l'];
  LaTeX.prototype['thinlines'] = function(){
    this.g.setLength('@wholewidth', new this.g.Length(0.4, "pt"));
  };
  LaTeX.prototype['thicklines'] = function(){
    this.g.setLength('@wholewidth', new this.g.Length(0.8, "pt"));
  };
  LaTeX.prototype['linethickness'] = function(l){
    if (l.unit !== "sp") {
      this.g.error("relative units for \\linethickness not supported!");
    }
    this.g.setLength('@wholewidth', l);
  };
  LaTeX.prototype['arrowlength'] = function(l){
    this.g.setLength('@arrowlength', l);
  };
  LaTeX.prototype['maxovalrad'] = function(){
    return "20pt";
  };
  LaTeX.prototype['qbeziermax'] = function(){
    return 500;
  };
  args['dashbox'] = ['H', 'cl', 'v', 'i?', 'g'];
  args['frame'] = ['H', 'hg'];
  LaTeX.prototype['frame'] = function(txt){
    var el, w;
    el = this.g.create(this.g.inline, txt, "hbox pframe");
    w = this.g.length('@wholewidth');
    el.setAttribute("style", "border-width:" + w.value);
    return [el];
  };
  args['put'] = ['H', 'v', 'g', 'is'];
  LaTeX.prototype['put'] = function(v, obj){
    var wrapper, strut;
    wrapper = this.g.create(this.g.inline, obj, "put-obj");
    if (v.y.cmp(this.g.Length.zero) >= 0) {
      wrapper.setAttribute("style", "left:" + v.x.value);
      if (v.y.cmp(this.g.Length.zero) > 0) {
        strut = this.g.create(this.g.inline, undefined, "strut");
        strut.setAttribute("style", "height:" + v.y.value);
      }
    } else {
      wrapper.setAttribute("style", "left:" + v.x.value + ";bottom:" + v.y.value);
    }
    return this.rlap(this.g.create(this.g.inline, [wrapper, strut], "picture"));
  };
  args['multiput'] = ['H', 'v', 'v', 'n', 'g'];
  LaTeX.prototype['multiput'] = function(v, dv, n, obj){
    var res, i$, i;
    res = [];
    for (i$ = 0; i$ < n; ++i$) {
      i = i$;
      res = res.concat(this['put'](v.add(dv.mul(i)), obj.cloneNode(true)));
    }
    return res;
  };
  args['qbezier'] = ['H', 'n?', 'v', 'v', 'v'];
  LaTeX.prototype['qbezier'] = function(N, v1, v, v2){
    return [this._path("M" + v1.x.pxpct + "," + v1.y.pxpct + " Q" + v.x.pxpct + "," + v.y.pxpct + " " + v2.x.pxpct + "," + v2.y.pxpct, N)];
  };
  args['cbezier'] = ['H', 'n?', 'v', 'v', 'v', 'v'];
  LaTeX.prototype['cbezier'] = function(N, v1, v, v2, v3){
    return [this._path("M" + v1.x.pxpct + "," + v1.y.pxpct + " C" + v.x.pxpct + "," + v.y.pxpct + " " + v2.x.pxpct + "," + v2.y.pxpct + " " + v3.x.pxpct + "," + v3.y.pxpct, N)];
  };
  LaTeX.prototype._path = function(p, N){
    var linethickness, svg, draw, path, pw, lenSection, bbox;
    linethickness = this.g.length('@wholewidth');
    svg = this.g.create(this.g.inline, undefined, "picture-object");
    draw = this.g.SVG().addTo(svg);
    path = draw.path(p).stroke({
      color: "#000",
      width: linethickness.value
    }).fill('none');
    if (N > 0) {
      N = Math.min(N, this['qbeziermax']() - 1);
      pw = linethickness.px;
      lenSection = (path.length() - (N + 1) * pw) / N;
      if (lenSection > 0) {
        path.stroke({
          dasharray: pw + " " + this.g.round(lenSection)
        });
      }
    }
    bbox = path.bbox();
    bbox.x -= linethickness.px;
    bbox.y -= linethickness.px;
    bbox.width += linethickness.px * 2;
    bbox.height += linethickness.px * 2;
    svg.setAttribute("style", "left:" + this.g.round(bbox.x) + "px;bottom:" + this.g.round(bbox.y) + "px");
    draw.size(this.g.round(bbox.width) + "px", this.g.round(bbox.height) + "px").viewbox(this.g.round(bbox.x), this.g.round(bbox.y), this.g.round(bbox.width), this.g.round(bbox.height));
    draw.flip('y', 0);
    return this.g.create(this.g.inline, svg, "picture");
  };
  args['circle'] = ['H', 's', 'cl'];
  LaTeX.prototype['circle'] = function(s, d){
    var svg, linethickness, draw, offset;
    d = d.abs();
    svg = this.g.create(this.g.inline, undefined, "picture-object");
    linethickness = this.g.length('@wholewidth');
    draw = this.g.SVG().addTo(svg);
    if (s) {
      offset = d.div(2).mul(-1).value;
      draw.size(d.value, d.value).stroke({
        color: "#000",
        width: "0"
      }).circle(d.value).cx(d.div(2).value).cy(d.div(2).value).fill("");
    } else {
      offset = d.div(2).add(linethickness).mul(-1).value;
      draw.size(d.add(linethickness.mul(2)).value, d.add(linethickness.mul(2)).value).stroke({
        color: "#000",
        width: linethickness.value
      }).circle(d.value).cx(d.div(2).add(linethickness).value).cy(d.div(2).add(linethickness).value).fill("none");
    }
    svg.setAttribute("style", "left:" + offset + ";bottom:" + offset);
    draw.flip('y', 0);
    return [this.g.create(this.g.inline, svg, "picture")];
  };
  args['line'] = ['H', 'v', 'cl'];
  LaTeX.prototype['line'] = function(v, l){
    return [this._line.apply(this, this._slopeLengthToCoords(v, l))];
  };
  args['vector'] = ['H', 'v', 'cl'];
  LaTeX.prototype['vector'] = function(v, l){
    return [this._vector.apply(this, this._slopeLengthToCoords(v, l))];
  };
  args['Line'] = ['H', 'v', 'v'];
  LaTeX.prototype['Line'] = function(vs, ve){
    return [this._line(vs, ve)];
  };
  args['Vector'] = ['H', 'v', 'v'];
  LaTeX.prototype['Vector'] = function(vs, ve){
    return [this._vector(vs, ve)];
  };
  LaTeX.prototype._slopeLengthToCoords = function(v, l){
    var ref$, linethickness, zero, x, y;
    if (v.x.value === (ref$ = v.y.value) && ref$ === 0) {
      this.g.error("illegal slope (0,0)");
    }
    if (v.x.unit !== v.y.unit || v.x.unit !== "sp") {
      this.g.error("relative units not allowed for slope");
    }
    linethickness = this.g.length('@wholewidth');
    zero = new this.g.Length(0, l.unit);
    if (v.x.px === 0) {
      x = zero;
      y = l;
    } else {
      x = l;
      y = x.mul(Math.abs(v.y.ratio(v.x)));
    }
    if (v.x.cmp(zero) < 0) {
      x = x.mul(-1);
    }
    if (v.y.cmp(zero) < 0) {
      y = y.mul(-1);
    }
    return [new Vector(zero, zero), new Vector(x, y)];
  };
  LaTeX.prototype._line = function(vs, ve){
    var svg, draw, linethickness, bbox;
    if (vs.x.unit !== vs.y.unit || vs.x.unit !== "sp") {
      this.g.error("relative units not allowed for line");
    }
    if (ve.x.unit !== ve.y.unit || ve.x.unit !== "sp") {
      this.g.error("relative units not allowed for line");
    }
    svg = this.g.create(this.g.inline, undefined, "picture-object");
    draw = this.g.SVG().addTo(svg);
    linethickness = this.g.length('@wholewidth');
    bbox = draw.line(vs.x.px, vs.y.px, ve.x.px, ve.y.px).stroke({
      color: "#000",
      width: linethickness.value
    }).bbox();
    bbox.x -= linethickness.px;
    bbox.y -= linethickness.px;
    bbox.width += linethickness.px * 2;
    bbox.height += linethickness.px * 2;
    if (bbox.x > 0 || bbox.y > 0) {
      console.error("line: bbox.x/y > 0!!", bbox.x, bbox.y);
    }
    svg.setAttribute("style", "left:" + this.g.round(bbox.x) + "px;bottom:" + this.g.round(bbox.y) + "px");
    draw.size(this.g.round(bbox.width) + "px", this.g.round(bbox.height) + "px").viewbox(this.g.round(bbox.x), this.g.round(bbox.y), this.g.round(bbox.width), this.g.round(bbox.height));
    draw.flip('y', 0);
    return this.g.create(this.g.inline, svg, "picture");
  };
  LaTeX.prototype._vector = function(vs, ve){
    var linethickness, svg, draw, hl, hw, max, hhl, al, s, bbox, this$ = this;
    if (vs.x.unit !== vs.y.unit || vs.x.unit !== "sp") {
      this.g.error("relative units not allowed for vector");
    }
    if (ve.x.unit !== ve.y.unit || ve.x.unit !== "sp") {
      this.g.error("relative units not allowed for vector");
    }
    linethickness = this.g.length('@wholewidth');
    svg = this.g.create(this.g.inline, undefined, "picture-object");
    draw = this.g.SVG();
    hl = 6.5;
    hw = 3.9;
    max = new this.g.Length(0.6, "pt");
    if (linethickness.cmp(max) < 0) {
      hl = this.g.round(hl * max.ratio(linethickness));
      hw = this.g.round(hw * max.ratio(linethickness));
    }
    hhl = linethickness.mul(hl / 2);
    al = ve.sub(vs).norm();
    if (al.cmp(hhl) < 0) {
      s = ve.shift_start(hhl);
    } else {
      s = new Vector(this.g.Length.zero, this.g.Length.zero);
    }
    ve = ve.shift_end(hhl.mul(-1));
    bbox = draw.line(s.x.px, s.y.px, ve.x.px, ve.y.px).stroke({
      color: "#000",
      width: linethickness.value
    }).marker('end', hl, hw, function(marker){
      return marker.path("M0,0 Q" + this$.g.round(2 * hl / 3) + "," + this$.g.round(hw / 2) + " " + hl + "," + this$.g.round(hw / 2) + " Q" + this$.g.round(2 * hl / 3) + "," + this$.g.round(hw / 2) + " 0," + hw + " z");
    }).bbox();
    bbox.x -= linethickness.px + hhl.px;
    bbox.y -= linethickness.px + hhl.px;
    bbox.width += linethickness.px + hhl.px * 2;
    bbox.height += linethickness.px + hhl.px * 2;
    if (bbox.x > 0 || bbox.y > 0) {
      console.error("vector: bbox.x/y > 0!!", bbox.x, bbox.y);
    }
    svg.setAttribute("style", "left:" + this.g.round(bbox.x) + "px;bottom:" + this.g.round(bbox.y) + "px");
    draw.size(this.g.round(bbox.width) + "px", this.g.round(bbox.height) + "px").viewbox(this.g.round(bbox.x), this.g.round(bbox.y), this.g.round(bbox.width), this.g.round(bbox.height));
    draw.flip('y', 0);
    draw.addTo(svg);
    return this.g.create(this.g.inline, svg, "picture");
  };
  args['oval'] = ['H', 'cl?', 'v', 'i?'];
  LaTeX.prototype['oval'] = function(maxrad, size, part){
    var linethickness, rad, draw, oval, rect, bbox, clip, svg;
    linethickness = this.g.length('@wholewidth');
    if (!maxrad) {
      maxrad = new this.g.Length(20, "px");
    }
    if (!part) {
      part = "";
    }
    if (size.x.cmp(size.y) < 0) {
      rad = size.x.div(2);
    } else {
      rad = size.y.div(2);
    }
    if (maxrad.cmp(rad) < 0) {
      rad = maxrad;
    }
    draw = this.g.SVG();
    oval = draw.rect(size.x.value, size.y.value).radius(rad.value).move(size.x.div(-2).value, size.y.div(-2).value).stroke({
      color: "#000",
      width: linethickness.value
    }).fill("none");
    rect = {
      x: size.x.div(-2).sub(linethickness),
      y: size.y.div(-2).sub(linethickness),
      w: size.x.add(linethickness.mul(2)),
      h: size.y.add(linethickness.mul(2))
    };
    if (part.includes('l')) {
      rect = this._intersect(rect, {
        x: size.x.div(-2).sub(linethickness),
        y: size.y.div(-2).sub(linethickness),
        w: size.x.div(2).add(linethickness),
        h: size.y.add(linethickness.mul(2))
      });
    }
    if (part.includes('t')) {
      rect = this._intersect(rect, {
        x: size.x.div(-2).sub(linethickness),
        y: size.y.div(-2).sub(linethickness),
        w: size.x.add(linethickness.mul(2)),
        h: size.y.div(2).add(linethickness)
      });
    }
    if (part.includes('r')) {
      rect = this._intersect(rect, {
        x: this.g.Length.zero,
        y: size.y.div(-2).sub(linethickness),
        w: size.x.div(2).add(linethickness),
        h: size.y.add(linethickness.mul(2))
      });
    }
    if (part.includes('b')) {
      rect = this._intersect(rect, {
        x: size.x.div(-2).sub(linethickness),
        y: this.g.Length.zero,
        w: size.x.add(linethickness.mul(2)),
        h: size.y.div(2).add(linethickness)
      });
    }
    bbox = oval.bbox();
    bbox.x -= linethickness.px;
    bbox.y -= linethickness.px;
    bbox.width += linethickness.px * 2;
    bbox.height += linethickness.px * 2;
    if (bbox.x > 0 || bbox.y > 0) {
      console.error("oval: bbox.x/y > 0!!", bbox.x, bbox.y);
    }
    clip = draw.clip().add(draw.rect(rect.w.value, rect.h.value).move(rect.x.value, rect.y.value));
    clip.flip('y', 0);
    oval.clipWith(clip);
    svg = this.g.create(this.g.inline, undefined, "picture-object");
    svg.setAttribute("style", "left:" + this.g.round(bbox.x) + "px;bottom:" + this.g.round(bbox.y) + "px");
    draw.size(this.g.round(bbox.width) + "px", this.g.round(bbox.height) + "px").viewbox(this.g.round(bbox.x), this.g.round(bbox.y), this.g.round(bbox.width), this.g.round(bbox.height));
    draw.flip('y', 0);
    draw.addTo(svg);
    return [this.g.create(this.g.inline, svg, "picture")];
  };
  LaTeX.prototype._intersect = function(r1, r2){
    return {
      x: this.g.Length.max(r1.x, r2.x),
      y: this.g.Length.max(r1.y, r2.y),
      w: this.g.Length.max(this.g.Length.zero, this.g.Length.min(r1.x.add(r1.w), r2.x.add(r2.w)).sub(this.g.Length.max(r1.x, r2.x))),
      h: this.g.Length.max(this.g.Length.zero, this.g.Length.min(r1.y.add(r1.h), r2.y.add(r2.h)).sub(this.g.Length.max(r1.y, r2.y)))
    };
  };
  args['newlength'] = ['HV', 'm'];
  LaTeX.prototype['newlength'] = function(id){
    this.g.newLength(id);
  };
  args['setlength'] = ['HV', 'm', 'l'];
  LaTeX.prototype['setlength'] = function(id, l){
    this.g.setLength(id, l);
  };
  args['addtolength'] = ['HV', 'm', 'l'];
  LaTeX.prototype['addtolength'] = function(id, l){
    this.g.setLength(id, this.g.length(id).add(l));
  };
  args['newcounter'] = ['HV', 'i', 'i?'];
  LaTeX.prototype['newcounter'] = function(c, p){
    this.g.newCounter(c, p);
  };
  args['stepcounter'] = ['HV', 'i'];
  LaTeX.prototype['stepcounter'] = function(c){
    this.g.stepCounter(c);
  };
  args['addtocounter'] = ['HV', 'i', 'n'];
  LaTeX.prototype['addtocounter'] = function(c, n){
    this.g.setCounter(c, this.g.counter(c) + n);
  };
  args['setcounter'] = ['HV', 'i', 'n'];
  LaTeX.prototype['setcounter'] = function(c, n){
    this.g.setCounter(c, n);
  };
  args['refstepcounter'] = ['H', 'i'];
  LaTeX.prototype['refstepcounter'] = function(c){
    this.g.stepCounter(c);
    return [this.g.refCounter(c)];
  };
  z12$ = args;
  z12$['alph'] = z12$['Alph'] = z12$['arabic'] = z12$['roman'] = z12$['Roman'] = z12$['fnsymbol'] = ['H', 'i'];
  LaTeX.prototype['alph'] = function(c){
    return [this.g['alph'](this.g.counter(c))];
  };
  LaTeX.prototype['Alph'] = function(c){
    return [this.g['Alph'](this.g.counter(c))];
  };
  LaTeX.prototype['arabic'] = function(c){
    return [this.g['arabic'](this.g.counter(c))];
  };
  LaTeX.prototype['roman'] = function(c){
    return [this.g['roman'](this.g.counter(c))];
  };
  LaTeX.prototype['Roman'] = function(c){
    return [this.g['Roman'](this.g.counter(c))];
  };
  LaTeX.prototype['fnsymbol'] = function(c){
    return [this.g['fnsymbol'](this.g.counter(c))];
  };
  args['input'] = ['V', 'g'];
  LaTeX.prototype['input'] = function(file){};
  args['include'] = ['V', 'g'];
  LaTeX.prototype['include'] = function(file){};
  args['documentclass'] = ['P', 'kv?', 'k', 'k?'];
  LaTeX.prototype['documentclass'] = function(options, documentclass, version){
    var Class, Export, e;
    this['documentclass'] = function(){
      this.g.error("Two \\documentclass commands. The document may only declare one class.");
    };
    Class = builtinDocumentclasses[documentclass];
    if (!Class) {
      try {
        Export = require("./documentclasses/" + documentclass);
        Class = Export['default'] || Export[Object.getOwnPropertyNames(Export)[0]];
      } catch (e$) {
        e = e$;
        console.error("error loading documentclass \"" + documentclass + "\": " + e);
        throw new Error("error loading documentclass \"" + documentclass + "\"");
      }
    }
    this.g.documentClass = new Class(this.g, options);
    assignIn(this, this.g.documentClass);
    assign(args, Class.args);
  };
  args['usepackage'] = ['P', 'kv?', 'csv', 'k?'];
  LaTeX.prototype['usepackage'] = function(opts, packages, version){
    var options, i$, len$, pkg, Package, Export, ref$, e;
    options = Object.assign({}, this.g.documentClass.options, opts);
    for (i$ = 0, len$ = packages.length; i$ < len$; ++i$) {
      pkg = packages[i$];
      if (providedPackages.includes(pkg)) {
        continue;
      }
      Package = builtinPackages[pkg];
      try {
        if (!Package) {
          Export = require("./packages/" + pkg);
          Package = Export['default'] || Export[Object.getOwnPropertyNames(Export)[0]];
        }
        assignIn(this, new Package(this.g, options));
        assign(args, Package.args);
        if ((ref$ = Package.symbols) != null) {
          ref$.forEach(fn$);
        }
      } catch (e$) {
        e = e$;
        console.error("error loading package \"" + pkg + "\": " + e);
      }
    }
    function fn$(value, key){
      return symbols.set(key, value);
    }
  };
  args['includeonly'] = ['P', 'csv'];
  LaTeX.prototype['includeonly'] = function(filelist){};
  args['makeatletter'] = ['P'];
  LaTeX.prototype['makeatletter'] = function(){};
  args['makeatother'] = ['P'];
  LaTeX.prototype['makeatother'] = function(){};
  z13$ = args;
  z13$['pagestyle'] = ['HV', 'i'];
  LaTeX.prototype['pagestyle'] = function(s){};
  z14$ = args;
  z14$['linebreak'] = ['HV', 'n?'];
  z14$['nolinebreak'] = ['HV', 'n?'];
  z14$['fussy'] = ['HV'];
  z14$['sloppy'] = ['HV'];
  LaTeX.prototype['linebreak'] = function(o){};
  LaTeX.prototype['nolinebreak'] = function(o){};
  LaTeX.prototype['fussy'] = function(){};
  LaTeX.prototype['sloppy'] = function(){};
  z15$ = args;
  z15$['pagebreak'] = ['HV', 'n?'];
  z15$['nopagebreak'] = ['HV', 'n?'];
  z15$['samepage'] = ['HV'];
  z15$['enlargethispage'] = ['HV', 's', 'l'];
  z15$['newpage'] = ['HV'];
  z15$['clearpage'] = ['HV'];
  z15$['cleardoublepage'] = ['HV'];
  z15$['vfill'] = ['HV'];
  z15$['thispagestyle'] = ['HV', 'i'];
  LaTeX.prototype['pagebreak'] = function(o){};
  LaTeX.prototype['nopagebreak'] = function(o){};
  LaTeX.prototype['samepage'] = function(){};
  LaTeX.prototype['enlargethispage'] = function(s, l){};
  LaTeX.prototype['newpage'] = function(){};
  LaTeX.prototype['clearpage'] = function(){};
  LaTeX.prototype['cleardoublepage'] = function(){};
  LaTeX.prototype['vfill'] = function(){};
  LaTeX.prototype['thispagestyle'] = function(s){};
  return LaTeX;
  function fn$(f){
    return function(){
      return this.g.setFontSize(f);
    };
  }
}());