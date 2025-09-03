import { Generator } from './generator';
import { ligatures, diacritics } from './symbols';
import { SVG } from '@svgdotjs/svg.js';
import katex from 'katex/dist/katex.mjs';
import Hypher from 'hypher';
import hEn from 'hyphenation.en-us';
import he from 'he';
import flattenDeep from 'lodash/flattenDeep';
import compact from 'lodash/compact';
he.decode.options.strict = true;

// Utility functions
const create = (type: string, classes?: string): HTMLElement => {
  const el = document.createElement(type);
  if (classes) {
    el.setAttribute("class", classes);
  }
  return el;
};

const blockRegex = /^(address|blockquote|body|center|dir|div|dl|fieldset|form|h[1-6]|hr|isindex|menu|noframes|noscript|ol|p|pre|table|ul|dd|dt|frameset|li|tbody|td|tfoot|th|thead|tr|html)$/i;

const isBlockLevel = (el: Element): boolean => {
  return blockRegex.test(el.nodeName);
};

const appendChildren = (parent: Element | DocumentFragment, children: any): Element | DocumentFragment => {
  if (children) {
    if (Array.isArray(children)) {
      for (let i = 0; i <= children.length; ++i) {
        if (children[i] != null) {
          parent.appendChild(children[i]);
        }
      }
    } else {
      parent.appendChild(children);
    }
  }
  return parent;
};

const debugDOM = (oParent: Element, oCallback: Function): void => {
  if (oParent.hasChildNodes()) {
    let oNode = oParent.firstChild;
    for (; oNode; oNode = oNode.nextSibling) {
      debugDOM(oNode as Element, oCallback);
    }
  }
  oCallback.call(oParent);
};

const debugNode = (n: any): void => {
  if (!n) {
    return;
  }
  if (typeof n.nodeName != "undefined") {
    console.log(n.nodeName + ":", n.textContent);
  } else {
    console.log("not a node:", n);
  }
};

const debugNodes = (l: any[]): void => {
  for (const n of l) {
    debugNode(n);
  }
};

const debugNodeContent = function(this: any): void {
  if (this.nodeValue) {
    console.log(this.nodeValue);
  }
};

export class HtmlGenerator extends Generator {
  static displayName = 'HtmlGenerator';
  sp = ' ';
  brsp = '\u200B ';
  nbsp = he.decode("&nbsp;");
  visp = he.decode("&blank;");
  zwnj = he.decode("&zwnj;");
  shy = he.decode("&shy;");
  thinsp = he.decode("&thinsp;");
  get inline(): string {
    return "span";
  }
  
  get block(): string {
    return "div";
  }
  titlepage = (): HTMLElement => {
    return create(this.block, "titlepage");
  };
  title = (): HTMLElement => {
    return create(this.block, "title");
  };
  author = (): HTMLElement => {
    return create(this.block, "author");
  };
  date = (): HTMLElement => {
    return create(this.block, "date");
  };
  abstract = (): HTMLElement => {
    return create(this.block, "abstract");
  };
  part = "part";
  chapter = "h1";
  section = "h2";
  subsection = "h3";
  subsubsection = "h4";
  paragraph = "h5";
  subparagraph = "h6";
  linebreak = "br";
  par = "p";
  list = (): HTMLElement => {
    return create(this.block, "list");
  };
  unorderedList = (): HTMLElement => {
    return create("ul", "list");
  };
  orderedList = (): HTMLElement => {
    return create("ol", "list");
  };
  descriptionList = (): HTMLElement => {
    return create("dl", "list");
  };
  listitem = "li";
  term = "dt";
  description = "dd";
  itemlabel = (): HTMLElement => {
    return create(this.inline, "itemlabel");
  };
  quote = (): HTMLElement => {
    return create(this.block, "list quote");
  };
  quotation = (): HTMLElement => {
    return create(this.block, "list quotation");
  };
  verse = (): HTMLElement => {
    return create(this.block, "list verse");
  };
  multicols = (c: number) => {
    return (): HTMLElement => {
      const el = create(this.block, "multicols");
      el.setAttribute("style", "column-count:" + c);
      return el;
    };
  };
  anchor = (id?: string) => {
    return (): HTMLAnchorElement => {
      const el = document.createElement("a");
      if (id != null) {
        el.id = id;
      }
      return el;
    };
  };
  link = (url?: string) => {
    return (): HTMLAnchorElement => {
      const el = document.createElement("a");
      if (url) {
        el.setAttribute("href", url);
      }
      return el;
    };
  };
  verb = (): HTMLElement => {
    return create("code", "tt");
  };
  verbatim = "pre";
  img = "img";
  image = (width: number, height: number, url: string) => {
    return (): HTMLImageElement => {
      const el = create(this.img) as HTMLImageElement;
      el.src = url;
      el.height = height;
      el.width = width;
      return el;
    };
  };
  picture = (): HTMLElement => {
    return create(this.inline, "picture");
  };
  pictureCanvas = (): HTMLElement => {
    return create(this.inline, "picture-canvas");
  };
  SVG = () => {
    // Create isolated SVG instance to prevent DOM serialization race conditions
    const svgInstance = SVG();
    // Add namespace attributes immediately to prevent corruption
    if (svgInstance.node) {
      svgInstance.attr({
        'xmlns': 'http://www.w3.org/2000/svg',
        'version': '1.1',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'xmlns:svgjs': 'http://svgjs.dev/svgjs'
      });
    }
    return svgInstance;
  };
  KaTeX = katex;
  _dom: DocumentFragment | null = null;
  _options: any;
  _h?: any;
  constructor(options?: any) {
    super(options);
    this._options = Object.assign({
      documentClass: "article",
      styles: [],
      hyphenate: true,
      languagePatterns: hEn,
      precision: 3
    }, options);
    if (this._options.hyphenate) {
      this._h = new Hypher(this._options.languagePatterns);
    }
    // Note: reset() is already called by the parent Generator constructor
    // Additional DOM setup
    this._dom = document.createDocumentFragment();
  }
  reset(): void {
    super.reset();
    this._dom = document.createDocumentFragment();
  }
  character(c: string): string {
    return c;
  }
  textquote(q: string): string | undefined {
    switch (q) {
    case '`':
      return this.symbol('textquoteleft');
    case '\'':
      return this.symbol('textquoteright');
    }
  }
  hyphen(): string {
    if (this._activeAttributeValue('fontFamily') === 'tt') {
      return '-';
    } else {
      return he.decode("&hyphen;");
    }
  }
  ligature(l: string): string {
    if (this._activeAttributeValue('fontFamily') === 'tt') {
      return l;
    } else {
      return ligatures.get(l);
    }
  }
  hasDiacritic(d: string): boolean {
    return diacritics.has(d);
  }
  diacritic(d: string, c?: string): string {
    if (!c) {
      return diacritics.get(d)[1];
    } else {
      return c + diacritics.get(d)[0];
    }
  }
  controlSymbol(c: string): string {
    switch (c) {
    case '/':
      return this.zwnj;
    case ',':
      return this.thinsp;
    case '-':
      return this.shy;
    case '@':
      return '\u200B';
    default:
      return this.character(c);
    }
  }
  /**
   * @return the HTMLDocument for use as a standalone webpage
   * @param baseURL the base URL to use to build an absolute URL
   */
  htmlDocument(baseURL?: string): Document {
    const doc = document.implementation.createHTMLDocument((this as any).documentTitle);
    const charset = document.createElement("meta");
    charset.setAttribute("charset", "UTF-8");
    doc.head.appendChild(charset);
    if (!baseURL) {
      baseURL = window.location?.href;
    }
    if (baseURL) {
      const base = document.createElement("base");
      base.href = baseURL;
      doc.head.appendChild(base);
      doc.head.appendChild(this.stylesAndScripts(baseURL));
    } else {
      doc.head.appendChild(this.stylesAndScripts());
    }
    doc.body.appendChild(this.domFragment());
    this.applyLengthsAndGeometryToDom(doc.documentElement);
    return doc;
  }
  /** @return a DocumentFragment consisting of stylesheets and scripts */
  stylesAndScripts(baseURL?: string): DocumentFragment {
    const el = document.createDocumentFragment();
    const createStyleSheet = (url: string): HTMLLinkElement => {
      const link = document.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = url;
      return link;
    };
    const createScript = (url: string): HTMLScriptElement => {
      const script = document.createElement("script");
      script.src = url;
      return script;
    };
    if (baseURL) {
      el.appendChild(createStyleSheet(new URL("css/katex.css", baseURL).toString()));
      el.appendChild(createStyleSheet(new URL((this as any).documentClass.constructor.css, baseURL).toString()));
      for (const style of this._options.styles) {
        el.appendChild(createStyleSheet(new URL(style, baseURL).toString()));
      }
      el.appendChild(createScript(new URL("js/base.js", baseURL).toString()));
    } else {
      el.appendChild(createStyleSheet("css/katex.css"));
      el.appendChild(createStyleSheet((this as any).documentClass.constructor.css));
      for (const style of this._options.styles) {
        el.appendChild(createStyleSheet(style));
      }
      el.appendChild(createScript("js/base.js"));
    }
    return el;
  }
  /** @return DocumentFragment, the full page without stylesheets or scripts */
  domFragment(): DocumentFragment {
    const el = document.createDocumentFragment();
    el.appendChild(this.create(this.block, this._dom, "body"));
    if ((this as any)._marginpars.length) {
      el.appendChild(this.create(this.block, this.create(this.block, (this as any)._marginpars, "marginpar"), "margin-right"));
    }
    return el;
  }
  /** write the TeX lengths and page geometry to the DOM */
  applyLengthsAndGeometryToDom(el: HTMLElement): void {
    el.style.setProperty('--size', (this as any).length('@@size').value);
    const twp = 100 * (this as any).length('textwidth').ratio((this as any).length('paperwidth'));
    const mlwp = 100 * (this as any).length('oddsidemargin').add(new (this as any).Length(1, "in")).ratio((this as any).length('paperwidth'));
    const mrwp = Math.max(100 - twp - mlwp, 0);
    el.style.setProperty('--textwidth', (this as any).round(twp) + "%");
    el.style.setProperty('--marginleftwidth', (this as any).round(mlwp) + "%");
    el.style.setProperty('--marginrightwidth', (this as any).round(mrwp) + "%");
    if (mrwp > 0) {
      const mpwp = 100 * 100 * (this as any).length('marginparwidth').ratio((this as any).length('paperwidth')) / mrwp;
      el.style.setProperty('--marginparwidth', (this as any).round(mpwp) + "%");
    } else {
      el.style.setProperty('--marginparwidth', "0px");
    }
    el.style.setProperty('--marginparsep', (this as any).length('marginparsep').value);
    el.style.setProperty('--marginparpush', (this as any).length('marginparpush').value);
  }
  createDocument(fs: any): void {
    appendChildren(this._dom!, fs);
  }
  create(type: string | Function, children?: any, classes: string = ""): Element {
    let el: Element;
    if (typeof type === "function") {
      el = type();
      if (el.hasAttribute("class")) {
        classes = el.getAttribute("class") + " " + classes;
      }
    } else {
      el = document.createElement(type);
    }
    if ((this as any).alignment()) {
      classes += " " + (this as any).alignment();
    }
    if ((this as any)._continue && (this as any).location().end.offset > (this as any)._continue) {
      classes = classes + " continue";
      (this as any)['break']();
    }
    if (classes.trim()) {
      el.setAttribute("class", classes.replace(/\s+/g, ' ').trim());
    }
    return appendChildren(el, children) as Element;
  }
  createText(t: string): Node | undefined {
    if (!t) {
      return;
    }
    return this.addAttributes(document.createTextNode(this._options.hyphenate ? this._h.hyphenateText(t) : t));
  }
  createVerbatim(t: string): Text | undefined {
    if (!t) {
      return;
    }
    return document.createTextNode(t);
  }
  createFragment(...args: any[]): DocumentFragment | Node | undefined {
    const children = compact(flattenDeep(args));
    if (args.length > 0 && (!children || !children.length)) {
      return;
    }
    if (children.length === 1 && children[0].nodeType) {
      return children[0];
    }
    const f = document.createDocumentFragment();
    return appendChildren(f, children) as DocumentFragment;
  }
  createImage(width: number, height: number, url: string): Element {
    return this.create(this.image(width, height, url));
  }
  createPicture(size: any, offset: any, content: any): Element {
    const canvas = this.create(this.pictureCanvas);
    appendChildren(canvas, content);
    if (offset) {
      canvas.setAttribute("style", "left:" + offset.x.mul(-1).value + ";bottom:" + offset.y.mul(-1).value);
    }
    const pic = this.create(this.picture);
    pic.appendChild(canvas);
    pic.setAttribute("style", "width:" + size.x.value + ";height:" + size.y.value);
    return pic;
  }
  createVSpaceSkip(skip: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.setAttribute("class", "vspace " + skip);
    return span;
  }
  createVSpaceSkipInline(skip: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.setAttribute("class", "vspace-inline " + skip);
    return span;
  }
  createVSpace(length: any): HTMLSpanElement {
    const span = document.createElement("span");
    span.setAttribute("class", "vspace");
    span.setAttribute("style", "margin-bottom:" + length.value);
    return span;
  }
  createVSpaceInline(length: any): HTMLSpanElement {
    const span = document.createElement("span");
    span.setAttribute("class", "vspace-inline");
    span.setAttribute("style", "margin-bottom:" + length.value);
    return span;
  }
  createBreakSpace(length: any): any {
    const span = document.createElement("span");
    span.setAttribute("class", "breakspace");
    span.setAttribute("style", "margin-bottom:" + length.value);
    return this.addAttributes(span);
  }
  createHSpace(length: any): HTMLSpanElement {
    const span = document.createElement("span");
    span.setAttribute("style", "margin-right:" + length.value);
    return span;
  }
  parseMath(math: string, display?: boolean): DocumentFragment {
    const f = document.createDocumentFragment();
    katex.render(math, f, {
      displayMode: !!display,
      throwOnError: false
    });
    return f;
  }
  addAttribute(el: Element, attrs: string): void {
    if (el.hasAttribute("class")) {
      attrs = el.getAttribute("class") + " " + attrs;
    }
    el.setAttribute("class", attrs);
  }
  hasAttribute(el: Element, attr: string): boolean {
    return el.hasAttribute("class") && RegExp('\\b' + attr + '\\b').test(el.getAttribute("class") || '');
  }
  addAttributes(nodes: any): any {
    const attrs = (this as any)._inlineAttributes();
    if (!attrs) {
      return nodes;
    }
    if (nodes instanceof window.Element) {
      if (isBlockLevel(nodes)) {
        return this.create(this.block, nodes, attrs);
      } else {
        return this.create(this.inline, nodes, attrs);
      }
    } else if (nodes instanceof window.Text || nodes instanceof window.DocumentFragment) {
      return this.create(this.inline, nodes, attrs);
    } else if (Array.isArray(nodes)) {
      return nodes.map((node: any) => {
        return this.create(this.inline, node, attrs);
      });
    } else {
      console.warn("addAttributes got an unknown/unsupported argument:", nodes);
    }
    return nodes;
  }
}