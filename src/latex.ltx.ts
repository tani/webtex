import { symbols } from './symbols';
import { Vector } from './types';
import builtinDocumentclasses from './documentclasses';
import builtinPackages from './packages';
import assign from 'lodash/assign';
import assignIn from 'lodash/assignIn';

const providedPackages = ['calc', 'pspicture', 'picture', 'pict2e', 'keyval', 'comment'];

class LaTeX {
  static displayName = 'LaTeX';
  static symbols = symbols;
  static args: Record<string, string[]> = {};
  
  _title: any = null;
  _author: any = null;
  _date: any = null;
  _thanks: any = null;
  g: any;
  
  constructor(generator: any, CustomMacros?: any) {
    if (CustomMacros) {
      assignIn(this, new CustomMacros(generator));
      assign(LaTeX.args, CustomMacros.args);
      if (CustomMacros.symbols != null) {
        CustomMacros.symbols.forEach((value: any, key: string) => {
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

  // Basic commands
  empty() {}
  
  TeX() {
    let tex: any, e: any;
    this.g.enterGroup();
    tex = this.g.create(this.g.inline);
    tex.setAttribute('class', 'tex');
    tex.appendChild(this.g.createText('T'));
    e = this.g.create(this.g.inline, this.g.createText('e'), 'e');
    tex.appendChild(e);
    tex.appendChild(this.g.createText('X'));
    this.g.exitGroup();
    return [tex];
  }
  
  LaTeX() {
    let latex: any, a: any, e: any;
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
  }
  
  today() {
    return [new Date().toLocaleDateString('en', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })];
  }
  
  newline() {
    return [this.g.create(this.g.linebreak)];
  }
  
  negthinspace() {
    return [this.g.create(this.g.inline, undefined, 'negthinspace')];
  }

  // Column commands
  onecolumn() {}
  twocolumn() {}

  // Break commands
  smallbreak() {
    return [this.g.createVSpaceSkip("smallskip")];
  }
  
  medbreak() {
    return [this.g.createVSpaceSkip("medskip")];
  }
  
  bigbreak() {
    return [this.g.createVSpaceSkip("bigskip")];
  }

  addvspace(l: any) {
    return this.g.createVSpace(l);
  }
  
  marginpar(txt: any) {
    return [this.g.marginpar(txt)];
  }
  
  abstractname() {
    return ["Abstract"];
  }

  // Title page commands
  title(t: any) {
    this._title = t;
  }
  
  author(a: any) {
    this._author = a;
  }
  
  date(d: any) {
    this._date = d;
  }
  
  and() {
    return this.g.macro('quad');
  }
  
  thanks = (LaTeX as any)['footnote'];

  // Text formatting commands
  textrm(arg?: any) {
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontFamily("rm");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  }
  
  textsf(arg?: any) {
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontFamily("sf");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  }
  
  texttt(arg?: any) {
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontFamily("tt");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  }
  
  textmd(arg?: any) {
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontWeight("md");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  }
  
  textbf(arg?: any) {
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontWeight("bf");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  }
  
  textup(arg?: any) {
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontShape("up");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  }
  
  textit(arg?: any) {
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontShape("it");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  }
  
  textsl(arg?: any) {
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontShape("sl");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  }
  
  textsc(arg?: any) {
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontShape("sc");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  }
  
  textnormal(arg?: any) {
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
  }

  emph(arg?: any) {
    if (arguments.length === 0) {
      this.g.enterGroup();
      return this.g.setFontShape("em");
    } else {
      arg = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [arg];
    }
  }

  // Font family commands
  rmfamily() {
    this.g.setFontFamily("rm");
  }
  
  sffamily() {
    this.g.setFontFamily("sf");
  }
  
  ttfamily() {
    this.g.setFontFamily("tt");
  }
  
  mdseries() {
    this.g.setFontWeight("md");
  }
  
  bfseries() {
    this.g.setFontWeight("bf");
  }
  
  upshape() {
    this.g.setFontShape("up");
  }
  
  itshape() {
    this.g.setFontShape("it");
  }
  
  slshape() {
    this.g.setFontShape("sl");
  }
  
  scshape() {
    this.g.setFontShape("sc");
  }
  
  normalfont() {
    this.g.setFontFamily("rm");
    this.g.setFontWeight("md");
    this.g.setFontShape("up");
  }

  // Font size commands
  tiny() { return this.g.setFontSize('tiny'); }
  scriptsize() { return this.g.setFontSize('scriptsize'); }
  footnotesize() { return this.g.setFontSize('footnotesize'); }
  small() { return this.g.setFontSize('small'); }
  normalsize() { return this.g.setFontSize('normalsize'); }
  large() { return this.g.setFontSize('large'); }
  Large() { return this.g.setFontSize('Large'); }
  LARGE() { return this.g.setFontSize('LARGE'); }
  huge() { return this.g.setFontSize('huge'); }
  Huge() { return this.g.setFontSize('Huge'); }

  em() {
    this.g.setFontShape("em");
  }

  // Enumeration commands
  theenumi() {
    return [this.g.arabic(this.g.counter('enumi'))];
  }
  
  theenumii() {
    return [this.g.alph(this.g.counter('enumii'))];
  }
  
  theenumiii() {
    return [this.g.roman(this.g.counter('enumiii'))];
  }
  
  theenumiv() {
    return [this.g.Alph(this.g.counter('enumiv'))];
  }
  
  labelenumi() {
    return this.theenumi().concat(".");
  }
  
  labelenumii() {
    return ["("].concat(Array.from(this.theenumii()), [")"]);
  }
  
  labelenumiii() {
    return this.theenumiii().concat(".");
  }
  
  labelenumiv() {
    return this.theenumiv().concat(".");
  }
  
  'p@enumii'() {
    return this.theenumi();
  }
  
  'p@enumiii'() {
    return this.theenumi().concat("(", this.theenumii(), ")");
  }
  
  'p@enumiv'() {
    return this["p@enumiii"]().concat(this.theenumiii());
  }

  // List item commands
  labelitemi() {
    return [this.g.symbol('textbullet')];
  }
  
  labelitemii() {
    this.normalfont();
    this.bfseries();
    return [this.g.symbol('textendash')];
  }
  
  labelitemiii() {
    return [this.g.symbol('textasteriskcentered')];
  }
  
  labelitemiv() {
    return [this.g.symbol('textperiodcentered')];
  }

  // Alignment commands
  centering() {
    this.g.setAlignment("centering");
  }
  
  raggedright() {
    this.g.setAlignment("raggedright");
  }
  
  raggedleft() {
    this.g.setAlignment("raggedleft");
  }

  center() {
    this.g.startlist();
    return [this.g.create(this.g.list, null, "center")];
  }
  
  endcenter() {
    this.g.endlist();
  }
  
  flushleft() {
    this.g.startlist();
    return [this.g.create(this.g.list, null, "flushleft")];
  }
  
  endflushleft() {
    this.g.endlist();
  }
  
  flushright() {
    this.g.startlist();
    return [this.g.create(this.g.list, null, "flushright")];
  }
  
  endflushright() {
    this.g.endlist();
  }

  titlepage() {
    return [this.g.create(this.g.titlepage)];
  }

  // Quote environments
  quote() {
    this.g.startlist();
    return [this.g.create(this.g.quote)];
  }
  
  endquote() {
    this.g.endlist();
  }
  
  quotation() {
    this.g.startlist();
    return [this.g.create(this.g.quotation)];
  }
  
  endquotation() {
    this.g.endlist();
  }
  
  verse() {
    this.g.startlist();
    return [this.g.create(this.g.verse)];
  }
  
  endverse() {
    this.g.endlist();
  }

  // List environments
  itemize(items?: any) {
    if (arguments.length === 0) {
      this.g.startlist();
      this.g.stepCounter('@itemdepth');
      if (this.g.counter('@itemdepth') > 4) {
        this.g.error("too deeply nested");
      }
      return;
    }
    const label = "labelitem" + this.g.roman(this.g.counter('@itemdepth'));
    return [this.g.create(this.g.unorderedList, items.map((item: any) => {
      let makelabel: any;
      this.g.enterGroup();
      makelabel = this.g.create(this.g.itemlabel, this['llap'](item.label !== null
        ? item.label
        : this.g.macro(label)));
      this.g.exitGroup();
      return this.g.create(this.g.listitem, [makelabel, item.text]);
    }))]; 
  }
  
  enditemize() {
    this.g.endlist();
    this.g.setCounter('@itemdepth', this.g.counter('@itemdepth') - 1);
  }

  enumerate(items?: any) {
    if (arguments.length === 0) {
      this.g.startlist();
      this.g.stepCounter('@enumdepth');
      if (this.g.counter('@enumdepth') > 4) {
        this.g.error("too deeply nested");
      }
      return;
    }
    const itemCounter = "enum" + this.g.roman(this.g.counter('@enumdepth'));
    this.g.setCounter(itemCounter, 0);
    return [this.g.create(this.g.orderedList, items.map((item: any) => {
      let label: any, makelabel: any;
      label = this.g.create(this.g.inline, item.label.node);
      if (item.label.id) {
        label.id = item.label.id;
      }
      makelabel = this.g.create(this.g.itemlabel, this['llap'](label));
      return this.g.create(this.g.listitem, [makelabel, item.text]);
    }))]; 
  }
  
  endenumerate() {
    this.g.endlist();
    this.g.setCounter('@enumdepth', this.g.counter('@enumdepth') - 1);
  }

  description(items?: any) {
    if (arguments.length === 0) {
      this.g.startlist();
      return;
    }
    return [this.g.create(this.g.descriptionList, items.map((item: any) => {
      let dt: any, dd: any;
      dt = this.g.create(this.g.term, item.label);
      dd = this.g.create(this.g.description, item.text);
      return this.g.createFragment([dt, dd]);
    }))];
  }
  
  enddescription() {
    this.g.endlist();
  }

  // Picture and spacing commands
  picture(size: any, offset?: any, content?: any) {
    return [this.g.createPicture(size, offset, content)];
  }

  hspace(s: any, l: any) {
    return [this.g.createHSpace(l)];
  }

  label(label: any) {
    this.g.setLabel(label.textContent);
  }

  ref(label: any) {
    return [this.g.ref(label.textContent)];
  }

  // Box commands
  llap(txt: any) {
    return [this.g.create(this.g.inline, txt, "hbox llap")];
  }

  rlap(txt: any) {
    return [this.g.create(this.g.inline, txt, "hbox rlap")];
  }

  clap(txt: any) {
    return [this.g.create(this.g.inline, txt, "hbox clap")];
  }

  smash(txt: any) {
    return [this.g.create(this.g.inline, txt, "hbox smash")];
  }

  hphantom(txt: any) {
    return [this.g.create(this.g.inline, txt, "phantom hbox smash")];
  }

  vphantom(txt: any) {
    return [this.g.create(this.g.inline, txt, "phantom hbox rlap")];
  }

  phantom(txt: any) {
    return [this.g.create(this.g.inline, txt, "phantom hbox")];
  }

  underline(txt: any) {
    return [this.g.create(this.g.inline, txt, "hbox underline")];
  }

  mbox(txt: any) {
    return this.makebox(undefined, undefined, undefined, txt);
  }

  makebox(vec?: any, width?: any, pos?: any, txt?: any) {
    if (vec) {
      if (width && pos) {
        this.g.error("expected \\makebox(width,height)[position]{text} but got two optional arguments!");
      }
      pos = width;
      return [txt];
    } else {
      return this._box(width, pos, txt, "hbox");
    }
  }

  fbox(txt: any) {
    return this.framebox(undefined, undefined, undefined, txt);
  }

  framebox(vec?: any, width?: any, pos?: any, txt?: any) {
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
  }

  private _box(width: any, pos: any, txt: any, classes: string) {
    let content: any, box: any;
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
  }

  parbox(pos?: any, height?: any, innerPos?: any, width?: any, txt?: any) {
    let classes: string, style: string, content: any, box: any;
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
  }

  // Picture drawing commands
  thinlines() {
    this.g.setLength('@wholewidth', new this.g.Length(0.4, "pt"));
  }

  thicklines() {
    this.g.setLength('@wholewidth', new this.g.Length(0.8, "pt"));
  }

  linethickness(l: any) {
    if (l.unit !== "sp") {
      this.g.error("relative units for \\linethickness not supported!");
    }
    this.g.setLength('@wholewidth', l);
  }

  arrowlength(l: any) {
    this.g.setLength('@arrowlength', l);
  }

  maxovalrad() {
    return "20pt";
  }

  qbeziermax() {
    return 500;
  }

  frame(txt: any) {
    let el: any, w: any;
    el = this.g.create(this.g.inline, txt, "hbox pframe");
    w = this.g.length('@wholewidth');
    el.setAttribute("style", "border-width:" + w.value);
    return [el];
  }

  put(v: any, obj: any) {
    let wrapper: any, strut: any;
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
  }

  multiput(v: any, dv: any, n: number, obj: any) {
    let res: any[] = [];
    for (let i = 0; i < n; ++i) {
      res = res.concat(this['put'](v.add(dv.mul(i)), obj.cloneNode(true)));
    }
    return res;
  }

  qbezier(N?: number, v1?: any, v?: any, v2?: any) {
    return [this._path("M" + v1.x.pxpct + "," + v1.y.pxpct + " Q" + v.x.pxpct + "," + v.y.pxpct + " " + v2.x.pxpct + "," + v2.y.pxpct, N)];
  }

  cbezier(N?: number, v1?: any, v?: any, v2?: any, v3?: any) {
    return [this._path("M" + v1.x.pxpct + "," + v1.y.pxpct + " C" + v.x.pxpct + "," + v.y.pxpct + " " + v2.x.pxpct + "," + v2.y.pxpct + " " + v3.x.pxpct + "," + v3.y.pxpct, N)];
  }

  private _path(p: string, N?: number) {
    let linethickness: any, svg: any, draw: any, path: any, pw: any, lenSection: any, bbox: any;
    linethickness = this.g.length('@wholewidth');
    svg = this.g.create(this.g.inline, undefined, "picture-object");
    draw = this.g.SVG().addTo(svg);
    path = draw.path(p).stroke({
      color: "#000",
      width: linethickness.value
    }).fill('none');
    if (N && N > 0) {
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
  }

  circle(s?: any, d?: any) {
    let svg: any, linethickness: any, draw: any, offset: any;
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
  }

  line(v: any, l: any) {
    return [this._line.apply(this, this._slopeLengthToCoords(v, l))];
  }

  vector(v: any, l: any) {
    return [this._vector.apply(this, this._slopeLengthToCoords(v, l))];
  }

  Line(vs: any, ve: any) {
    return [this._line(vs, ve)];
  }

  Vector(vs: any, ve: any) {
    return [this._vector(vs, ve)];
  }

  private _slopeLengthToCoords(v: any, l: any) {
    let linethickness: any, zero: any, x: any, y: any;
    if (v.x.value === v.y.value && v.y.value === 0) {
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
  }

  private _line(vs: any, ve: any) {
    let svg: any, draw: any, linethickness: any, bbox: any;
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
  }

  private _vector(vs: any, ve: any) {
    let linethickness: any, svg: any, draw: any, hl: number, hw: number, max: any, hhl: any, al: any, s: any, bbox: any;
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
    }).marker('end', hl, hw, (marker: any) => {
      return marker.path("M0,0 Q" + this.g.round(2 * hl / 3) + "," + this.g.round(hw / 2) + " " + hl + "," + this.g.round(hw / 2) + " Q" + this.g.round(2 * hl / 3) + "," + this.g.round(hw / 2) + " 0," + hw + " z");
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
  }

  oval(maxrad?: any, size?: any, part?: any) {
    let linethickness: any, rad: any, draw: any, oval: any, rect: any, bbox: any, clip: any, svg: any;
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
  }

  private _intersect(r1: any, r2: any) {
    return {
      x: this.g.Length.max(r1.x, r2.x),
      y: this.g.Length.max(r1.y, r2.y),
      w: this.g.Length.max(this.g.Length.zero, this.g.Length.min(r1.x.add(r1.w), r2.x.add(r2.w)).sub(this.g.Length.max(r1.x, r2.x))),
      h: this.g.Length.max(this.g.Length.zero, this.g.Length.min(r1.y.add(r1.h), r2.y.add(r2.h)).sub(this.g.Length.max(r1.y, r2.y)))
    };
  }

  // Length commands
  newlength(id: string) {
    this.g.newLength(id);
  }

  setlength(id: string, l: any) {
    this.g.setLength(id, l);
  }

  addtolength(id: string, l: any) {
    this.g.setLength(id, this.g.length(id).add(l));
  }

  // Counter commands
  newcounter(c: string, p?: string) {
    this.g.newCounter(c, p);
  }

  stepcounter(c: string) {
    this.g.stepCounter(c);
  }

  addtocounter(c: string, n: number) {
    this.g.setCounter(c, this.g.counter(c) + n);
  }

  setcounter(c: string, n: number) {
    this.g.setCounter(c, n);
  }

  refstepcounter(c: string) {
    this.g.stepCounter(c);
    return [this.g.refCounter(c)];
  }

  // Counter formatting commands
  alph(c: string) {
    return [this.g['alph'](this.g.counter(c))];
  }

  Alph(c: string) {
    return [this.g['Alph'](this.g.counter(c))];
  }

  arabic(c: string) {
    return [this.g['arabic'](this.g.counter(c))];
  }

  roman(c: string) {
    return [this.g['roman'](this.g.counter(c))];
  }

  Roman(c: string) {
    return [this.g['Roman'](this.g.counter(c))];
  }

  fnsymbol(c: string) {
    return [this.g['fnsymbol'](this.g.counter(c))];
  }

  // File inclusion commands
  input(file: any) {}

  include(file: any) {}

  // Helper method to instantiate document class without setting up guards
  private _instantiateDocumentClass(options?: any, documentclass?: string, version?: string) {
    let Class: any, Export: any, e: any;
    
    // Use default document class if none specified
    if (!documentclass) {
      documentclass = "article";
    }
    
    Class = builtinDocumentclasses[documentclass!];
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
    assign(LaTeX.args, Class.args);
  }

  // Document structure commands
  documentclass(options?: any, documentclass?: string, version?: string) {
    this['documentclass'] = () => {
      this.g.error("Two \\documentclass commands. The document may only declare one class.");
    };
    
    this._instantiateDocumentClass(options, documentclass, version);
  }

  usepackage(opts?: any, packages?: string[], version?: string) {
    let options: any, pkg: string, Package: any, Export: any;
    options = Object.assign({}, this.g.documentClass.options, opts);
    for (let i = 0; i < packages!.length; ++i) {
      pkg = packages![i];
      if (providedPackages.includes(pkg)) {
        continue;
      }
      Package = builtinPackages[pkg];
      try {
        if (!Package) {
          Export = require("./packages/" + pkg);
          Package = Export['default'];
          if (!Package) {
            // Find first function property that's not __esModule
            const propNames = Object.getOwnPropertyNames(Export);
            const constructorName = propNames.find(name => 
              name !== '__esModule' && typeof Export[name] === 'function'
            );
            Package = constructorName ? Export[constructorName] : null;
          }
        }
        assignIn(this, new Package(this.g, options));
        assign(LaTeX.args, Package.args);
        if (Package.symbols != null) {
          Package.symbols.forEach((value: any, key: string) => {
            return symbols.set(key, value);
          });
        }
      } catch (e) {
        console.error("error loading package \"" + pkg + "\": " + e);
      }
    }
  }

  includeonly(filelist: string[]) {}

  makeatletter() {}

  makeatother() {}

  // Page style commands
  pagestyle(s: string) {}

  // Line breaking commands
  linebreak(o?: number) {}
  nolinebreak(o?: number) {}
  fussy() {}
  sloppy() {}

  // Page breaking commands
  pagebreak(o?: number) {}
  nopagebreak(o?: number) {}
  samepage() {}
  enlargethispage(s?: any, l?: any) {}
  newpage() {}
  clearpage() {}
  cleardoublepage() {}
  vfill() {}
  thispagestyle(s?: string) {}
}

// Initialize static args with required LaTeX command signatures
LaTeX.args['empty'] = ['HV'];
LaTeX.args['par'] = ['V'];
LaTeX.args['item'] = ['V'];
LaTeX.args['onecolumn'] = ['V'];
LaTeX.args['twocolumn'] = ['V', 'o?'];
LaTeX.args['smallbreak'] = LaTeX.args['medbreak'] = LaTeX.args['bigbreak'] = ['V'];
LaTeX.args['addvspace'] = ['V', 'l'];
LaTeX.args['marginpar'] = ['H', 'g'];
LaTeX.args['title'] = ['HV', 'g'];
LaTeX.args['author'] = ['HV', 'g'];
LaTeX.args['and'] = ['H'];
LaTeX.args['date'] = ['HV', 'g'];
LaTeX.args['thanks'] = ['HV', 'g'];

// Text formatting commands
for (const format of ['rm', 'sf', 'tt', 'md', 'bf', 'up', 'it', 'sl', 'sc', 'normal']) {
  LaTeX.args['text' + format] = ['H', 'X', 'g'];
}
LaTeX.args['emph'] = ['H', 'X', 'g'];

// Font family, series, and shape commands
for (const family of ['rm', 'sf', 'tt']) {
  LaTeX.args[family + 'family'] = ['HV'];
}
for (const series of ['md', 'bf']) {
  LaTeX.args[series + 'series'] = ['HV'];
}
for (const shape of ['up', 'it', 'sl', 'sc']) {
  LaTeX.args[shape + 'shape'] = ['HV'];
}
for (const cmd of ['normalfont', 'em']) {
  LaTeX.args[cmd] = ['HV'];
}
for (const size of ['tiny', 'scriptsize', 'footnotesize', 'small', 'normalsize', 'large', 'Large', 'LARGE', 'huge', 'Huge']) {
  LaTeX.args[size] = ['HV'];
}

// Alignment and layout commands
LaTeX.args['centering'] = LaTeX.args['raggedright'] = LaTeX.args['raggedleft'] = ['HV'];
LaTeX.args['center'] = LaTeX.args['flushleft'] = LaTeX.args['flushright'] = ['V'];
LaTeX.args['titlepage'] = ['V'];
LaTeX.args['quote'] = LaTeX.args['quotation'] = LaTeX.args['verse'] = ['V'];
LaTeX.args['itemize'] = ['V', 'X', 'items'];
LaTeX.args['enumerate'] = ['V', 'X', 'enumitems'];
LaTeX.args['description'] = ['V', 'X', 'items'];
LaTeX.args['picture'] = ['H', 'v', 'v?', 'h'];
LaTeX.args['hspace'] = ['H', 's', 'l'];
LaTeX.args['label'] = ['HV', 'g'];
LaTeX.args['ref'] = ['H', 'g'];
LaTeX.args['llap'] = LaTeX.args['rlap'] = LaTeX.args['clap'] = LaTeX.args['smash'] = LaTeX.args['hphantom'] = LaTeX.args['vphantom'] = LaTeX.args['phantom'] = ['H', 'hg'];
LaTeX.args['underline'] = ['H', 'hg'];
LaTeX.args['mbox'] = ['H', 'hg'];
LaTeX.args['makebox'] = ['H', 'v?', 'l?', 'i?', 'hg'];
LaTeX.args['fbox'] = ['H', 'hg'];
LaTeX.args['framebox'] = ['H', 'v?', 'l?', 'i?', 'hg'];
LaTeX.args['parbox'] = ['H', 'i?', 'l?', 'i?', 'l', 'g'];
LaTeX.args['thicklines'] = ['HV'];
LaTeX.args['thinlines'] = ['HV'];
LaTeX.args['linethickness'] = ['HV', 'l'];
LaTeX.args['arrowlength'] = ['HV', 'l'];
LaTeX.args['dashbox'] = ['H', 'cl', 'v', 'i?', 'g'];
LaTeX.args['frame'] = ['H', 'hg'];
LaTeX.args['put'] = ['H', 'v', 'g', 'is'];
LaTeX.args['multiput'] = ['H', 'v', 'v', 'n', 'g'];
LaTeX.args['qbezier'] = ['H', 'n?', 'v', 'v', 'v'];
LaTeX.args['cbezier'] = ['H', 'n?', 'v', 'v', 'v', 'v'];
LaTeX.args['circle'] = ['H', 's', 'cl'];
LaTeX.args['line'] = ['H', 'v', 'cl'];
LaTeX.args['vector'] = ['H', 'v', 'cl'];
LaTeX.args['Line'] = ['H', 'v', 'v'];
LaTeX.args['Vector'] = ['H', 'v', 'v'];
LaTeX.args['oval'] = ['H', 'cl?', 'v', 'i?'];
LaTeX.args['newlength'] = ['HV', 'm'];
LaTeX.args['setlength'] = ['HV', 'm', 'l'];
LaTeX.args['addtolength'] = ['HV', 'm', 'l'];
LaTeX.args['newcounter'] = ['HV', 'i', 'i?'];
LaTeX.args['stepcounter'] = ['HV', 'i'];
LaTeX.args['addtocounter'] = ['HV', 'i', 'n'];
LaTeX.args['setcounter'] = ['HV', 'i', 'n'];
LaTeX.args['refstepcounter'] = ['H', 'i'];
LaTeX.args['alph'] = LaTeX.args['Alph'] = LaTeX.args['arabic'] = LaTeX.args['roman'] = LaTeX.args['Roman'] = LaTeX.args['fnsymbol'] = ['H', 'i'];
LaTeX.args['input'] = ['V', 'g'];
LaTeX.args['include'] = ['V', 'g'];
LaTeX.args['documentclass'] = ['P', 'kv?', 'k', 'k?'];
LaTeX.args['usepackage'] = ['P', 'kv?', 'csv', 'k?'];
LaTeX.args['includeonly'] = ['P', 'csv'];
LaTeX.args['makeatletter'] = ['P'];
LaTeX.args['makeatother'] = ['P'];
LaTeX.args['pagestyle'] = ['HV', 'i'];
LaTeX.args['linebreak'] = ['HV', 'n?'];
LaTeX.args['nolinebreak'] = ['HV', 'n?'];
LaTeX.args['fussy'] = ['HV'];
LaTeX.args['sloppy'] = ['HV'];
LaTeX.args['pagebreak'] = ['HV', 'n?'];
LaTeX.args['nopagebreak'] = ['HV', 'n?'];
LaTeX.args['samepage'] = ['HV'];
LaTeX.args['enlargethispage'] = ['HV', 's', 'l'];
LaTeX.args['newpage'] = ['HV'];
LaTeX.args['clearpage'] = ['HV'];
LaTeX.args['cleardoublepage'] = ['HV'];
LaTeX.args['vfill'] = ['HV'];
LaTeX.args['thispagestyle'] = ['HV', 'i'];

export { LaTeX };