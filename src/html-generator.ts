import { Generator } from './generator';
import { ligatures, diacritics } from './symbols';
import { SVG } from '@svgdotjs/svg.js';
import katex from 'katex/dist/katex.mjs';
import Hypher from 'hypher';
import hEn from 'hyphenation.en-us';
import he from 'he';
import flattenDeep from 'lodash/flattenDeep';
import compact from 'lodash/compact';
var export$;
export { export$ as HtmlGenerator }
var HtmlGenerator;
he.decode.options.strict = true;
export$ = HtmlGenerator = (function(superclass){
  var create, blockRegex, isBlockLevel, appendChildren, debugDOM, debugNode, debugNodes, debugNodeContent, prototype = extend$((import$(HtmlGenerator, superclass).displayName = 'HtmlGenerator', HtmlGenerator), superclass).prototype, constructor = HtmlGenerator;
  HtmlGenerator.prototype.sp = ' ';
  HtmlGenerator.prototype.brsp = '\u200B ';
  HtmlGenerator.prototype.nbsp = he.decode("&nbsp;");
  HtmlGenerator.prototype.visp = he.decode("&blank;");
  HtmlGenerator.prototype.zwnj = he.decode("&zwnj;");
  HtmlGenerator.prototype.shy = he.decode("&shy;");
  HtmlGenerator.prototype.thinsp = he.decode("&thinsp;");
  create = function(type, classes){
    var el;
    el = document.createElement(type);
    if (classes) {
      el.setAttribute("class", classes);
    }
    return el;
  };
  blockRegex = /^(address|blockquote|body|center|dir|div|dl|fieldset|form|h[1-6]|hr|isindex|menu|noframes|noscript|ol|p|pre|table|ul|dd|dt|frameset|li|tbody|td|tfoot|th|thead|tr|html)$/i;
  isBlockLevel = function(el){
    return blockRegex.test(el.nodeName);
  };
  HtmlGenerator.prototype.inline = "span";
  HtmlGenerator.prototype.block = "div";
  HtmlGenerator.prototype.titlepage = function(){
    return create(this.block, "titlepage");
  };
  HtmlGenerator.prototype.title = function(){
    return create(this.block, "title");
  };
  HtmlGenerator.prototype.author = function(){
    return create(this.block, "author");
  };
  HtmlGenerator.prototype.date = function(){
    return create(this.block, "date");
  };
  HtmlGenerator.prototype.abstract = function(){
    return create(this.block, "abstract");
  };
  HtmlGenerator.prototype.part = "part";
  HtmlGenerator.prototype.chapter = "h1";
  HtmlGenerator.prototype.section = "h2";
  HtmlGenerator.prototype.subsection = "h3";
  HtmlGenerator.prototype.subsubsection = "h4";
  HtmlGenerator.prototype.paragraph = "h5";
  HtmlGenerator.prototype.subparagraph = "h6";
  HtmlGenerator.prototype.linebreak = "br";
  HtmlGenerator.prototype.par = "p";
  HtmlGenerator.prototype.list = function(){
    return create(this.block, "list");
  };
  HtmlGenerator.prototype.unorderedList = function(){
    return create("ul", "list");
  };
  HtmlGenerator.prototype.orderedList = function(){
    return create("ol", "list");
  };
  HtmlGenerator.prototype.descriptionList = function(){
    return create("dl", "list");
  };
  HtmlGenerator.prototype.listitem = "li";
  HtmlGenerator.prototype.term = "dt";
  HtmlGenerator.prototype.description = "dd";
  HtmlGenerator.prototype.itemlabel = function(){
    return create(this.inline, "itemlabel");
  };
  HtmlGenerator.prototype.quote = function(){
    return create(this.block, "list quote");
  };
  HtmlGenerator.prototype.quotation = function(){
    return create(this.block, "list quotation");
  };
  HtmlGenerator.prototype.verse = function(){
    return create(this.block, "list verse");
  };
  HtmlGenerator.prototype.multicols = function(c){
    var this$ = this;
    return function(){
      var el;
      el = create(this$.block, "multicols");
      el.setAttribute("style", "column-count:" + c);
      return el;
    };
  };
  HtmlGenerator.prototype.anchor = function(id){
    return function(){
      var el;
      el = document.createElement("a");
      if (id != null) {
        el.id = id;
      }
      return el;
    };
  };
  HtmlGenerator.prototype.link = function(url){
    return function(){
      var el;
      el = document.createElement("a");
      if (url) {
        el.setAttribute("href", url);
      }
      return el;
    };
  };
  HtmlGenerator.prototype.verb = function(){
    return create("code", "tt");
  };
  HtmlGenerator.prototype.verbatim = "pre";
  HtmlGenerator.prototype.img = "img";
  HtmlGenerator.prototype.image = function(width, height, url){
    var this$ = this;
    return function(){
      var el;
      el = create(this$.img);
      el.src = url;
      el.height = height;
      el.width = width;
      return el;
    };
  };
  HtmlGenerator.prototype.picture = function(){
    return create(this.inline, "picture");
  };
  HtmlGenerator.prototype.pictureCanvas = function(){
    return create(this.inline, "picture-canvas");
  };
  HtmlGenerator.prototype.SVG = function() {
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
  HtmlGenerator.prototype.KaTeX = katex;
  HtmlGenerator.prototype._dom = null;
  function HtmlGenerator(options){
    this.pictureCanvas = bind$(this, 'pictureCanvas', prototype);
    this.picture = bind$(this, 'picture', prototype);
    this.image = bind$(this, 'image', prototype);
    this.verb = bind$(this, 'verb', prototype);
    this.link = bind$(this, 'link', prototype);
    this.anchor = bind$(this, 'anchor', prototype);
    this.multicols = bind$(this, 'multicols', prototype);
    this.verse = bind$(this, 'verse', prototype);
    this.quotation = bind$(this, 'quotation', prototype);
    this.quote = bind$(this, 'quote', prototype);
    this.itemlabel = bind$(this, 'itemlabel', prototype);
    this.descriptionList = bind$(this, 'descriptionList', prototype);
    this.orderedList = bind$(this, 'orderedList', prototype);
    this.unorderedList = bind$(this, 'unorderedList', prototype);
    this.list = bind$(this, 'list', prototype);
    this.abstract = bind$(this, 'abstract', prototype);
    this.date = bind$(this, 'date', prototype);
    this.author = bind$(this, 'author', prototype);
    this.title = bind$(this, 'title', prototype);
    this.titlepage = bind$(this, 'titlepage', prototype);
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
  HtmlGenerator.prototype.reset = function(){
    superclass.prototype.reset.call(this);
    this._dom = document.createDocumentFragment();
  };
  HtmlGenerator.prototype.character = function(c){
    return c;
  };
  HtmlGenerator.prototype.textquote = function(q){
    switch (q) {
    case '`':
      return this.symbol('textquoteleft');
    case '\'':
      return this.symbol('textquoteright');
    }
  };
  HtmlGenerator.prototype.hyphen = function(){
    if (this._activeAttributeValue('fontFamily') === 'tt') {
      return '-';
    } else {
      return he.decode("&hyphen;");
    }
  };
  HtmlGenerator.prototype.ligature = function(l){
    if (this._activeAttributeValue('fontFamily') === 'tt') {
      return l;
    } else {
      return ligatures.get(l);
    }
  };
  HtmlGenerator.prototype.hasDiacritic = function(d){
    return diacritics.has(d);
  };
  HtmlGenerator.prototype.diacritic = function(d, c){
    if (!c) {
      return diacritics.get(d)[1];
    } else {
      return c + diacritics.get(d)[0];
    }
  };
  HtmlGenerator.prototype.controlSymbol = function(c){
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
  };
  /* @return the HTMLDocument for use as a standalone webpage
   * @param baseURL the base URL to use to build an absolute URL
   */
  HtmlGenerator.prototype.htmlDocument = function(baseURL){
    var doc, charset, ref$, base;
    doc = document.implementation.createHTMLDocument(this.documentTitle);
    charset = document.createElement("meta");
    charset.setAttribute("charset", "UTF-8");
    doc.head.appendChild(charset);
    if (!baseURL) {
      baseURL = (ref$ = window.location) != null ? ref$.href : void 8;
    }
    if (baseURL) {
      base = document.createElement("base");
      base.href = baseURL;
      doc.head.appendChild(base);
      doc.head.appendChild(this.stylesAndScripts(baseURL));
    } else {
      doc.head.appendChild(this.stylesAndScripts());
    }
    doc.body.appendChild(this.domFragment());
    this.applyLengthsAndGeometryToDom(doc.documentElement);
    return doc;
  };
  /* @return a DocumentFragment consisting of stylesheets and scripts */
  HtmlGenerator.prototype.stylesAndScripts = function(baseURL){
    var el, createStyleSheet, createScript, i$, ref$, len$, style;
    el = document.createDocumentFragment();
    createStyleSheet = function(url){
      var link;
      link = document.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = url;
      return link;
    };
    createScript = function(url){
      var script;
      script = document.createElement("script");
      script.src = url;
      return script;
    };
    if (baseURL) {
      el.appendChild(createStyleSheet(new URL("css/katex.css", baseURL).toString()));
      el.appendChild(createStyleSheet(new URL(this.documentClass.constructor.css, baseURL).toString()));
      for (i$ = 0, len$ = (ref$ = this._options.styles).length; i$ < len$; ++i$) {
        style = ref$[i$];
        el.appendChild(createStyleSheet(new URL(style, baseURL).toString()));
      }
      el.appendChild(createScript(new URL("js/base.js", baseURL).toString()));
    } else {
      el.appendChild(createStyleSheet("css/katex.css"));
      el.appendChild(createStyleSheet(this.documentClass.constructor.css));
      for (i$ = 0, len$ = (ref$ = this._options.styles).length; i$ < len$; ++i$) {
        style = ref$[i$];
        el.appendChild(createStyleSheet(style));
      }
      el.appendChild(createScript("js/base.js"));
    }
    return el;
  };
  /* @return DocumentFragment, the full page without stylesheets or scripts */
  HtmlGenerator.prototype.domFragment = function(){
    var el;
    el = document.createDocumentFragment();
    el.appendChild(this.create(this.block, this._dom, "body"));
    if (this._marginpars.length) {
      el.appendChild(this.create(this.block, this.create(this.block, this._marginpars, "marginpar"), "margin-right"));
    }
    return el;
  };
  /* write the TeX lengths and page geometry to the DOM */
  HtmlGenerator.prototype.applyLengthsAndGeometryToDom = function(el){
    var twp, mlwp, mrwp, mpwp;
    el.style.setProperty('--size', this.length('@@size').value);
    twp = 100 * this.length('textwidth').ratio(this.length('paperwidth'));
    mlwp = 100 * this.length('oddsidemargin').add(new this.Length(1, "in")).ratio(this.length('paperwidth'));
    mrwp = Math.max(100 - twp - mlwp, 0);
    el.style.setProperty('--textwidth', this.round(twp) + "%");
    el.style.setProperty('--marginleftwidth', this.round(mlwp) + "%");
    el.style.setProperty('--marginrightwidth', this.round(mrwp) + "%");
    if (mrwp > 0) {
      mpwp = 100 * 100 * this.length('marginparwidth').ratio(this.length('paperwidth')) / mrwp;
      el.style.setProperty('--marginparwidth', this.round(mpwp) + "%");
    } else {
      el.style.setProperty('--marginparwidth', "0px");
    }
    el.style.setProperty('--marginparsep', this.length('marginparsep').value);
    el.style.setProperty('--marginparpush', this.length('marginparpush').value);
  };
  HtmlGenerator.prototype.createDocument = function(fs){
    appendChildren(this._dom, fs);
  };
  HtmlGenerator.prototype.create = function(type, children, classes){
    var el;
    classes == null && (classes = "");
    if (typeof type === "function") {
      el = type();
      if (el.hasAttribute("class")) {
        classes = el.getAttribute("class") + " " + classes;
      }
    } else {
      el = document.createElement(type);
    }
    if (this.alignment()) {
      classes += " " + this.alignment();
    }
    if (this._continue && this.location().end.offset > this._continue) {
      classes = classes + " continue";
      this['break']();
    }
    if (classes.trim()) {
      el.setAttribute("class", classes.replace(/\s+/g, ' ').trim());
    }
    return appendChildren(el, children);
  };
  HtmlGenerator.prototype.createText = function(t){
    if (!t) {
      return;
    }
    return this.addAttributes(document.createTextNode(this._options.hyphenate ? this._h.hyphenateText(t) : t));
  };
  HtmlGenerator.prototype.createVerbatim = function(t){
    if (!t) {
      return;
    }
    return document.createTextNode(t);
  };
  HtmlGenerator.prototype.createFragment = function(){
    var children, f;
    children = compact(flattenDeep(arguments));
    if (arguments.length > 0 && (!children || !children.length)) {
      return;
    }
    if (children.length === 1 && children[0].nodeType) {
      return children[0];
    }
    f = document.createDocumentFragment();
    return appendChildren(f, children);
  };
  HtmlGenerator.prototype.createImage = function(width, height, url){
    return this.create(this.image(width, height, url));
  };
  HtmlGenerator.prototype.createPicture = function(size, offset, content){
    var canvas, pic;
    canvas = this.create(this.pictureCanvas);
    appendChildren(canvas, content);
    if (offset) {
      canvas.setAttribute("style", "left:" + offset.x.mul(-1).value + ";bottom:" + offset.y.mul(-1).value);
    }
    pic = this.create(this.picture);
    pic.appendChild(canvas);
    pic.setAttribute("style", "width:" + size.x.value + ";height:" + size.y.value);
    return pic;
  };
  HtmlGenerator.prototype.createVSpaceSkip = function(skip){
    var span;
    span = document.createElement("span");
    span.setAttribute("class", "vspace " + skip);
    return span;
  };
  HtmlGenerator.prototype.createVSpaceSkipInline = function(skip){
    var span;
    span = document.createElement("span");
    span.setAttribute("class", "vspace-inline " + skip);
    return span;
  };
  HtmlGenerator.prototype.createVSpace = function(length){
    var span;
    span = document.createElement("span");
    span.setAttribute("class", "vspace");
    span.setAttribute("style", "margin-bottom:" + length.value);
    return span;
  };
  HtmlGenerator.prototype.createVSpaceInline = function(length){
    var span;
    span = document.createElement("span");
    span.setAttribute("class", "vspace-inline");
    span.setAttribute("style", "margin-bottom:" + length.value);
    return span;
  };
  HtmlGenerator.prototype.createBreakSpace = function(length){
    var span;
    span = document.createElement("span");
    span.setAttribute("class", "breakspace");
    span.setAttribute("style", "margin-bottom:" + length.value);
    return this.addAttributes(span);
  };
  HtmlGenerator.prototype.createHSpace = function(length){
    var span;
    span = document.createElement("span");
    span.setAttribute("style", "margin-right:" + length.value);
    return span;
  };
  HtmlGenerator.prototype.parseMath = function(math, display){
    var f;
    f = document.createDocumentFragment();
    katex.render(math, f, {
      displayMode: !!display,
      throwOnError: false
    });
    return f;
  };
  HtmlGenerator.prototype.addAttribute = function(el, attrs){
    if (el.hasAttribute("class")) {
      attrs = el.getAttribute("class") + " " + attrs;
    }
    el.setAttribute("class", attrs);
  };
  HtmlGenerator.prototype.hasAttribute = function(el, attr){
    return el.hasAttribute("class") && RegExp('\\b' + attr + '\\b').test(el.getAttribute("class"));
  };
  HtmlGenerator.prototype.addAttributes = function(nodes){
    var attrs;
    attrs = this._inlineAttributes();
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
      return nodes.map(function(node){
        return this.create(this.inline, node, attrs);
      });
    } else {
      console.warn("addAttributes got an unknown/unsupported argument:", nodes);
    }
    return nodes;
  };
  appendChildren = function(parent, children){
    var i$, to$, i;
    if (children) {
      if (Array.isArray(children)) {
        for (i$ = 0, to$ = children.length; i$ <= to$; ++i$) {
          i = i$;
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
  debugDOM = function(oParent, oCallback){
    var oNode;
    if (oParent.hasChildNodes()) {
      oNode = oParent.firstChild;
      for (; oNode; oNode = oNode.nextSibling) {
        debugDOM(oNode, oCallback);
      }
    }
    oCallback.call(oParent);
  };
  debugNode = function(n){
    if (!n) {
      return;
    }
    if (typeof n.nodeName != "undefined") {
      console.log(n.nodeName + ":", n.textContent);
    } else {
      console.log("not a node:", n);
    }
  };
  debugNodes = function(l){
    var i$, len$, n;
    for (i$ = 0, len$ = l.length; i$ < len$; ++i$) {
      n = l[i$];
      debugNode(n);
    }
  };
  debugNodeContent = function(){
    if (this.nodeValue) {
      console.log(this.nodeValue);
    }
  };
  return HtmlGenerator;
}(Generator));
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
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