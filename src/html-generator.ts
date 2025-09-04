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

const blockRegex = /^(address|blockquote|body|center|dir|div|dl|fieldset|form|h[1-6]|hr|isindex|menu|noframes|noscript|ol|p|pre|table|ul|dd|dt|frameset|li|tbody|td|tfoot|th|thead|tr|html)$/i;

const create = (type: string, classes?: string): HTMLElement => {
  const el = document.createElement(type);
  if (classes) {
    el.setAttribute("class", classes);
  }
  return el;
};

const isBlockLevel = (el: Element): boolean => {
  return blockRegex.test(el.nodeName);
};

const appendChildren = (parent: Element | DocumentFragment, children: any): Element | DocumentFragment => {
  if (children) {
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
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
  public sp = ' ';
  public brsp = '\u200B ';
  public nbsp = he.decode("&nbsp;");
  public visp = he.decode("&blank;");
  public zwnj = he.decode("&zwnj;");
  public shy = he.decode("&shy;");
  public thinsp = he.decode("&thinsp;");

  public inline = "span";
  public block = "div";

  public part = "part";
  public chapter = "h1";
  public section = "h2";
  public subsection = "h3";
  public subsubsection = "h4";
  public paragraph = "h5";
  public subparagraph = "h6";
  public linebreak = "br";
  public par = "p";
  public listitem = "li";
  public term = "dt";
  public description = "dd";
  public verbatim = "pre";
  public img = "img";

  private _options: any;
  private _h?: Hypher;
  private _dom: DocumentFragment | null = null;

  constructor(options?: any) {
    super();
    
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
    
    this.reset();
  }

  public titlepage = (): HTMLElement => {
    return create(this.block, "titlepage");
  };

  public title = (): HTMLElement => {
    return create(this.block, "title");
  };

  public author = (): HTMLElement => {
    return create(this.block, "author");
  };

  public date = (): HTMLElement => {
    return create(this.block, "date");
  };

  public abstract = (): HTMLElement => {
    return create(this.block, "abstract");
  };

  public list = (): HTMLElement => {
    return create(this.block, "list");
  };

  public unorderedList = (): HTMLElement => {
    return create("ul", "list");
  };

  public orderedList = (): HTMLElement => {
    return create("ol", "list");
  };

  public descriptionList = (): HTMLElement => {
    return create("dl", "list");
  };

  public itemlabel = (): HTMLElement => {
    return create(this.inline, "itemlabel");
  };

  public quote = (): HTMLElement => {
    return create(this.block, "list quote");
  };

  public quotation = (): HTMLElement => {
    return create(this.block, "list quotation");
  };

  public verse = (): HTMLElement => {
    return create(this.block, "list verse");
  };

  public multicols = (c: number) => {
    return (): HTMLElement => {
      const el = create(this.block, "multicols");
      el.setAttribute("style", "column-count:" + c);
      return el;
    };
  };

  public anchor = (id?: string) => {
    return (): HTMLElement => {
      const el = document.createElement("a");
      if (id != null) {
        el.id = id;
      }
      return el;
    };
  };

  public link = (url?: string) => {
    return (): HTMLElement => {
      const el = document.createElement("a");
      if (url) {
        el.setAttribute("href", url);
      }
      return el;
    };
  };

  public verb = (): HTMLElement => {
    return create("code", "tt");
  };

  public image = (width: number, height: number, url: string) => {
    return (): HTMLElement => {
      const el = create(this.img);
      (el as HTMLImageElement).src = url;
      (el as HTMLImageElement).height = height;
      (el as HTMLImageElement).width = width;
      return el;
    };
  };

  public picture = (): HTMLElement => {
    return create(this.inline, "picture");
  };

  public pictureCanvas = (): HTMLElement => {
    return create(this.inline, "picture-canvas");
  };

  public SVG() {
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
  }

  public KaTeX = katex;

  public reset(): void {
    super.reset();
    this._dom = document.createDocumentFragment();
  }

  public character(c: string): string {
    return c;
  }

  public textquote(q: string): string {
    switch (q) {
      case '`':
        return this.symbol('textquoteleft');
      case '\'':
        return this.symbol('textquoteright');
      default:
        return q;
    }
  }

  public hyphen(): string {
    if (this._activeAttributeValue('fontFamily') === 'tt') {
      return '-';
    } else {
      return he.decode("&hyphen;");
    }
  }

  public ligature(l: string): string {
    if (this._activeAttributeValue('fontFamily') === 'tt') {
      return l;
    } else {
      return ligatures.get(l);
    }
  }

  public hasDiacritic(d: string): boolean {
    return diacritics.has(d);
  }

  public diacritic(d: string, c?: string): string {
    if (!c) {
      return diacritics.get(d)[1];
    } else {
      return c + diacritics.get(d)[0];
    }
  }

  public controlSymbol(c: string): string {
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
  public htmlDocument(baseURL?: string): Document {
    const doc = document.implementation.createHTMLDocument((this as any).documentTitle);
    const charset = document.createElement("meta");
    charset.setAttribute("charset", "UTF-8");
    doc.head.appendChild(charset);

    if (!baseURL) {
      baseURL = (window.location as any)?.href;
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

  /**
   * @return a DocumentFragment consisting of stylesheets and scripts
   */
  public stylesAndScripts(baseURL?: string): DocumentFragment {
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

  /**
   * @return DocumentFragment, the full page without stylesheets or scripts
   */
  public domFragment(): DocumentFragment {
    const el = document.createDocumentFragment();
    el.appendChild(this.create(this.block, this._dom, "body"));
    if ((this as any)._marginpars.length) {
      el.appendChild(this.create(this.block, this.create(this.block, (this as any)._marginpars, "marginpar"), "margin-right"));
    }
    return el;
  }

  /**
   * write the TeX lengths and page geometry to the DOM
   */
  public applyLengthsAndGeometryToDom(el: HTMLElement): void {
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

  public createDocument(fs: any): void {
    appendChildren(this._dom!, fs);
  }

  public create(type: string | Function, children?: any, classes: string = ""): Element {
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

  public createText(t: string): Text | undefined {
    if (!t) {
      return;
    }
    return (this as any).addAttributes(document.createTextNode(this._options.hyphenate ? this._h!.hyphenateText(t) : t));
  }

  public createVerbatim(t: string): Text | undefined {
    if (!t) {
      return;
    }
    return document.createTextNode(t);
  }

  public createFragment(...args: any[]): DocumentFragment | Element | undefined {
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

  public createImage(width: number, height: number, url: string): Element {
    return this.create(this.image(width, height, url));
  }

  public createPicture(size: any, offset: any, content: any): Element {
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

  public createVSpaceSkip(skip: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.setAttribute("class", "vspace " + skip);
    return span;
  }

  public createVSpaceSkipInline(skip: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.setAttribute("class", "vspace-inline " + skip);
    return span;
  }

  public createVSpace(length: any): HTMLSpanElement {
    const span = document.createElement("span");
    span.setAttribute("class", "vspace");
    span.setAttribute("style", "margin-bottom:" + length.value);
    return span;
  }

  public createVSpaceInline(length: any): HTMLSpanElement {
    const span = document.createElement("span");
    span.setAttribute("class", "vspace-inline");
    span.setAttribute("style", "margin-bottom:" + length.value);
    return span;
  }

  public createBreakSpace(length: any): Element {
    const span = document.createElement("span");
    span.setAttribute("class", "breakspace");
    span.setAttribute("style", "margin-bottom:" + length.value);
    return (this as any).addAttributes(span);
  }

  public createHSpace(length: any): HTMLSpanElement {
    const span = document.createElement("span");
    span.setAttribute("style", "margin-right:" + length.value);
    return span;
  }

  public parseMath(math: string, display?: boolean): DocumentFragment {
    const f = document.createDocumentFragment();
    katex.render(math, f, {
      displayMode: !!display,
      throwOnError: false
    });
    return f;
  }

  public addAttribute(el: Element, attrs: string): void {
    if (el.hasAttribute("class")) {
      attrs = el.getAttribute("class") + " " + attrs;
    }
    el.setAttribute("class", attrs);
  }

  public hasAttribute(el: Element, attr: string): boolean {
    return el.hasAttribute("class") && RegExp('\\b' + attr + '\\b').test(el.getAttribute("class")!);
  }

  public addAttributes(nodes: any): any {
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