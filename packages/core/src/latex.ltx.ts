// Native JavaScript replacements for lodash functions
const assign = Object.assign;
const assignIn = (target: object, ...sources: object[]): object => {
  const tgt = target as Record<string, unknown>;
  sources.forEach((source) => {
    if (source) {
      const src = source as Record<string, unknown>;
      for (const key in src) {
        if (Object.hasOwn(src, key)) {
          tgt[key] = src[key];
        }
      }
    }
  });
  return target;
};

import builtinDocumentclasses from "./documentclasses";
import type { Length } from "./interfaces";
import builtinPackages from "./packages";
import { symbols } from "./symbols";
import { Vector } from "./types";

interface Generator {
  newCounter(name: string, parent?: string): void;
  newLength(name: string): void;
  setLength(name: string, value: Length): void;
  stepCounter(name: string): void;
  counter(name: string): number;
  setCounter(name: string, value: number): void;
  refCounter(name: string, id?: string): Node;
  enterGroup(copyAttrs?: boolean): void;
  exitGroup(): void;
  setFontFamily(family: string): void;
  setFontWeight(weight: string): void;
  setFontShape(shape: string): void;
  setFontSize(size: string): void;
  setTextDecoration(decoration: string): void;
  setAlignment(alignment: string): void;
  startlist(): boolean;
  endlist(): void;
  continue(): void;
  error(message: string): unknown;
  create(type: string, children?: unknown, classes?: string): HTMLElement;
  createText(text: string): Text;
  createVSpaceSkip(skip: string): HTMLElement;
  createVSpace(length: Length): HTMLElement;
  createHSpace(length: Length): HTMLElement;
  createPicture(size: unknown, offset: unknown, content: unknown): HTMLElement;
  marginpar(text: unknown): unknown;
  setLabel(label: string): void;
  ref(label: string): Node;
  addAttributes(node: unknown): unknown;
  createFragment(children?: unknown[]): DocumentFragment;
  hasAttribute(node: Element, attr: string): boolean;
  addAttribute(node: Element, attr: string, value?: unknown): void;
  SVG(): SvgDrawing;
  Length: {
    new (value: number, unit: string): Length;
    max(...lengths: Length[]): Length;
    min(...lengths: Length[]): Length;
    zero: Length;
  };
  length(name: string): Length;
  round(value: number): number;
  alph(num: number): string;
  Alph(num: number): string;
  arabic(num: number): string;
  roman(num: number): string;
  Roman(num: number): string;
  fnsymbol(num: number): string;
  symbol(name: string): string;
  macro(name: string, args?: unknown[]): unknown[];
  inline: string;
  block: string;
  linebreak: string;
  list: string;
  unorderedList: string;
  orderedList: string;
  descriptionList: string;
  listitem: string;
  term: string;
  description: string;
  titlepage: string;
  itemlabel: string;
  quote: string;
  quotation: string;
  verse: string;
  documentClass: { options?: Record<string, unknown> } | null;
}

interface Rect {
  x: Length;
  y: Length;
  w: Length;
  h: Length;
}

interface SvgPath {
  stroke(opts: {
    color?: string;
    width?: string | number;
    dasharray?: string;
  }): SvgPath;
  fill(fill: string): SvgPath;
  length(): number;
  bbox(): { x: number; y: number; width: number; height: number };
}

interface SvgDrawing {
  line(x1: number, y1: number, x2: number, y2: number): SvgDrawing;
  rect(width: number | string, height: number | string): SvgDrawing;
  radius(r: number | string): SvgDrawing;
  move(x: number | string, y: number | string): SvgDrawing;
  stroke(opts: { color: string; width: string | number }): SvgDrawing;
  fill(fill: string): SvgDrawing;
  bbox(): { x: number; y: number; width: number; height: number };
  size(width: string, height: string): SvgDrawing;
  viewbox(x: number, y: number, width: number, height: number): SvgDrawing;
  flip(axis: string, offset: number): SvgDrawing;
  marker(
    type: string,
    hl: number,
    hw: number,
    cb: (marker: unknown) => unknown,
  ): SvgDrawing;
  path(d: string): SvgPath;
  addTo(el: HTMLElement): SvgDrawing;
  circle(d: string | number): SvgDrawing;
  cx(x: string | number): SvgDrawing;
  cy(y: string | number): SvgDrawing;
  clip(): SvgDrawing;
  add(node: unknown): SvgDrawing;
  clipWith(node: unknown): void;
}

interface CustomMacroConstructor {
  new (g: unknown): Record<string, unknown>;
  args?: Record<string, unknown[]>;
  symbols?: Map<string, string>;
}

const providedPackages = [
  "calc",
  "pspicture",
  "picture",
  "pict2e",
  "keyval",
  "comment",
];

export class LaTeX {
  public static symbols = symbols;
  public static args: Record<string, unknown[]> = {};

  protected g: Generator;

  constructor(generator: Generator, CustomMacros?: CustomMacroConstructor) {
    if (CustomMacros) {
      assignIn(this, new CustomMacros(generator));
      assign(LaTeX.args, CustomMacros.args);
      if (CustomMacros.symbols) {
        CustomMacros.symbols.forEach((value: string, key: string) => {
          symbols.set(key, value);
        });
      }
    }

    this.g = generator;
    this.setupCounters();
    this.setupLengths();
    this.setupArgs();
  }

  private setupCounters(): void {
    this.g.newCounter("secnumdepth");
    this.g.newCounter("tocdepth");
    this.g.newCounter("footnote");
    this.g.newCounter("mpfootnote");
    this.g.newCounter("@listdepth");
    this.g.newCounter("@itemdepth");
    this.g.newCounter("@enumdepth");
  }

  private setupLengths(): void {
    const lengths = [
      "@@size",
      "unitlength",
      "@wholewidth",
      "paperheight",
      "paperwidth",
      "oddsidemargin",
      "evensidemargin",
      "textheight",
      "textwidth",
      "marginparwidth",
      "marginparsep",
      "marginparpush",
      "columnwidth",
      "columnsep",
      "columnseprule",
      "linewidth",
      "leftmargin",
      "rightmargin",
      "listparindent",
      "itemindent",
      "labelwidth",
      "labelsep",
      "leftmargini",
      "leftmarginii",
      "leftmarginiii",
      "leftmarginiv",
      "leftmarginv",
      "leftmarginvi",
      "fboxrule",
      "fboxsep",
      "tabbingsep",
      "arraycolsep",
      "tabcolsep",
      "arrayrulewidth",
      "doublerulesep",
      "footnotesep",
      "topmargin",
      "headheight",
      "headsep",
      "footskip",
      "topsep",
      "partopsep",
      "itemsep",
      "parsep",
      "floatsep",
      "textfloatsep",
      "intextsep",
      "dblfloatsep",
      "dbltextfloatsep",
    ];

    for (const length of lengths) {
      this.g.newLength(length);
    }

    this.g.setLength("unitlength", new this.g.Length(1, "pt"));
    this.g.setLength("@wholewidth", new this.g.Length(0.4, "pt"));
  }

  private setupArgs(): void {
    const args = LaTeX.args;

    // Basic commands
    args.empty = ["HV"];
    args.par = ["V"];
    args.item = ["V"];
    args.onecolumn = ["V"];
    args.twocolumn = ["V", "o?"];

    // Space and break commands
    args.smallbreak = args.medbreak = args.bigbreak = ["V"];
    args.addvspace = ["V", "l"];
    args.marginpar = ["H", "g"];

    // Document structure - title/author/date handled by document class
    args.and = ["H"];
    args.thanks = ["HV", "g"];

    // Font commands
    const fontCommands = [
      "rm",
      "sf",
      "tt",
      "md",
      "bf",
      "up",
      "it",
      "sl",
      "sc",
      "normal",
    ];
    for (const cmd of fontCommands) {
      args[`text${cmd}`] = ["H", "X", "g"];
    }
    args.emph = ["H", "X", "g"];

    // Font family commands
    const fontFamilies = ["rm", "sf", "tt"];
    for (const family of fontFamilies) {
      args[`${family}family`] = ["HV"];
    }

    // Font weight commands
    const fontWeights = ["md", "bf"];
    for (const weight of fontWeights) {
      args[`${weight}series`] = ["HV"];
    }

    // Font shape commands
    const fontShapes = ["up", "it", "sl", "sc"];
    for (const shape of fontShapes) {
      args[`${shape}shape`] = ["HV"];
    }

    // General font commands
    args.normalfont = args.em = ["HV"];

    // Font size commands
    const fontSizes = [
      "tiny",
      "scriptsize",
      "footnotesize",
      "small",
      "normalsize",
      "large",
      "Large",
      "LARGE",
      "huge",
      "Huge",
    ];
    for (const size of fontSizes) {
      args[size] = ["HV"];
    }

    // Alignment commands
    args.centering = args.raggedright = args.raggedleft = ["HV"];
    args.center = args.flushleft = args.flushright = ["V"];

    // Environment commands
    args.titlepage = ["V"];
    args.quote = args.quotation = args.verse = ["V"];
    args.itemize = ["V", "X", "items"];
    args.enumerate = ["V", "X", "enumitems"];
    args.description = ["V", "X", "items"];

    // Picture commands
    args.picture = ["H", "v", "v?", "h"];
    args.hspace = ["H", "s", "l"];

    // Reference commands
    args.label = ["HV", "g"];
    args.ref = ["H", "g"];

    // Box commands
    args.llap =
      args.rlap =
      args.clap =
      args.smash =
      args.hphantom =
      args.vphantom =
      args.phantom =
        ["H", "hg"];
    args.underline = ["H", "hg"];
    args.mbox = ["H", "hg"];
    args.makebox = ["H", "v?", "l?", "i?", "hg"];
    args.fbox = ["H", "hg"];
    args.framebox = ["H", "v?", "l?", "i?", "hg"];
    args.parbox = ["H", "i?", "l?", "i?", "l", "g"];

    // Drawing commands
    args.thicklines = args.thinlines = ["HV"];
    args.linethickness = args.arrowlength = ["HV", "l"];
    args.dashbox = ["H", "cl", "v", "i?", "g"];
    args.frame = ["H", "hg"];
    args.put = ["H", "v", "g", "is"];
    args.multiput = ["H", "v", "v", "n", "g"];
    args.qbezier = ["H", "n?", "v", "v", "v"];
    args.cbezier = ["H", "n?", "v", "v", "v", "v"];
    args.circle = ["H", "s", "cl"];
    args.line = ["H", "v", "cl"];
    args.vector = ["H", "v", "cl"];
    args.Line = ["H", "v", "v"];
    args.Vector = ["H", "v", "v"];
    args.oval = ["H", "cl?", "v", "i?"];

    // Length commands
    args.newlength = ["HV", "m"];
    args.setlength = ["HV", "m", "l"];
    args.addtolength = ["HV", "m", "l"];

    // Counter commands
    args.newcounter = ["HV", "i", "i?"];
    args.stepcounter = ["HV", "i"];
    args.addtocounter = ["HV", "i", "n"];
    args.setcounter = ["HV", "i", "n"];
    args.refstepcounter = ["H", "i"];
    args.alph =
      args.Alph =
      args.arabic =
      args.roman =
      args.Roman =
      args.fnsymbol =
        ["H", "i"];

    // Document commands
    args.input = ["V", "g"];
    args.include = ["V", "g"];
    args.documentclass = ["P", "kv?", "k", "k?"];
    args.usepackage = ["P", "kv?", "csv", "k?"];
    args.includeonly = ["P", "csv"];
    args.makeatletter = args.makeatother = ["P"];

    // Page commands
    args.pagestyle = ["HV", "i"];
    args.linebreak = args.nolinebreak = ["HV", "n?"];
    args.fussy = args.sloppy = ["HV"];
    args.pagebreak = args.nopagebreak = ["HV", "n?"];
    args.samepage =
      args.newpage =
      args.clearpage =
      args.cleardoublepage =
      args.vfill =
        ["HV"];
    args.enlargethispage = ["HV", "s", "l"];
    args.thispagestyle = ["HV", "i"];
  }

  // Basic commands
  public empty(): void {}

  public TeX(): unknown[] {
    this.g.enterGroup();
    const tex = this.g.create(this.g.inline);
    tex.setAttribute("class", "tex");
    tex.appendChild(this.g.createText("T"));
    const e = this.g.create(this.g.inline, this.g.createText("e"), "e");
    tex.appendChild(e);
    tex.appendChild(this.g.createText("X"));
    this.g.exitGroup();
    return [tex];
  }

  public LaTeX(): unknown[] {
    this.g.enterGroup();
    const latex = this.g.create(this.g.inline);
    latex.setAttribute("class", "latex");
    latex.appendChild(this.g.createText("L"));
    const a = this.g.create(this.g.inline, this.g.createText("a"), "a");
    latex.appendChild(a);
    latex.appendChild(this.g.createText("T"));
    const e = this.g.create(this.g.inline, this.g.createText("e"), "e");
    latex.appendChild(e);
    latex.appendChild(this.g.createText("X"));
    this.g.exitGroup();
    return [latex];
  }

  public today(): string[] {
    return [
      new Date().toLocaleDateString("en", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    ];
  }

  public newline(): unknown[] {
    return [this.g.create(this.g.linebreak)];
  }

  public negthinspace(): unknown[] {
    return [this.g.create(this.g.inline, undefined, "negthinspace")];
  }

  public onecolumn(): void {}
  public twocolumn(): void {}

  // Break commands
  public smallbreak(): unknown[] {
    return [this.g.createVSpaceSkip("smallskip")];
  }

  public medbreak(): unknown[] {
    return [this.g.createVSpaceSkip("medskip")];
  }

  public bigbreak(): unknown[] {
    return [this.g.createVSpaceSkip("bigskip")];
  }

  public addvspace(l: Length): HTMLElement {
    return this.g.createVSpace(l);
  }

  public marginpar(txt: unknown): unknown[] {
    return [this.g.marginpar(txt)];
  }

  public abstractname(): string[] {
    return ["Abstract"];
  }

  // Document structure methods are handled by document classes

  public and(): unknown[] {
    return this.g.macro("quad");
  }

  public thanks(_text: unknown): unknown {
    // TODO: Implement footnote functionality
    return [];
  }

  // Font commands
  public textrm(arg?: unknown): unknown {
    if (arg === undefined) {
      this.g.enterGroup();
      return this.g.setFontFamily("rm");
    } else {
      const result = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [result];
    }
  }

  public textsf(arg?: unknown): unknown {
    if (arg === undefined) {
      this.g.enterGroup();
      return this.g.setFontFamily("sf");
    } else {
      const result = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [result];
    }
  }

  public texttt(arg?: unknown): unknown {
    if (arg === undefined) {
      this.g.enterGroup();
      return this.g.setFontFamily("tt");
    } else {
      const result = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [result];
    }
  }

  public textmd(arg?: unknown): unknown {
    if (arg === undefined) {
      this.g.enterGroup();
      return this.g.setFontWeight("md");
    } else {
      const result = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [result];
    }
  }

  public textbf(arg?: unknown): unknown {
    if (arg === undefined) {
      this.g.enterGroup();
      return this.g.setFontWeight("bf");
    } else {
      const result = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [result];
    }
  }

  public textup(arg?: unknown): unknown {
    if (arg === undefined) {
      this.g.enterGroup();
      return this.g.setFontShape("up");
    } else {
      const result = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [result];
    }
  }

  public textit(arg?: unknown): unknown {
    if (arg === undefined) {
      this.g.enterGroup();
      return this.g.setFontShape("it");
    } else {
      const result = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [result];
    }
  }

  public textsl(arg?: unknown): unknown {
    if (arg === undefined) {
      this.g.enterGroup();
      return this.g.setFontShape("sl");
    } else {
      const result = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [result];
    }
  }

  public textsc(arg?: unknown): unknown {
    if (arg === undefined) {
      this.g.enterGroup();
      return this.g.setFontShape("sc");
    } else {
      const result = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [result];
    }
  }

  public textnormal(arg?: unknown): unknown {
    if (arg === undefined) {
      this.g.enterGroup();
      this.g.setFontFamily("rm");
      this.g.setFontWeight("md");
      return this.g.setFontShape("up");
    } else {
      const result = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [result];
    }
  }

  public emph(arg?: unknown): unknown {
    if (arg === undefined) {
      this.g.enterGroup();
      return this.g.setFontShape("em");
    } else {
      const result = this.g.addAttributes(arg);
      this.g.exitGroup();
      return [result];
    }
  }

  // Font family commands
  public rmfamily(): void {
    this.g.setFontFamily("rm");
  }

  public sffamily(): void {
    this.g.setFontFamily("sf");
  }

  public ttfamily(): void {
    this.g.setFontFamily("tt");
  }

  // Font weight commands
  public mdseries(): void {
    this.g.setFontWeight("md");
  }

  public bfseries(): void {
    this.g.setFontWeight("bf");
  }

  // Font shape commands
  public upshape(): void {
    this.g.setFontShape("up");
  }

  public itshape(): void {
    this.g.setFontShape("it");
  }

  public slshape(): void {
    this.g.setFontShape("sl");
  }

  public scshape(): void {
    this.g.setFontShape("sc");
  }

  public normalfont(): void {
    this.g.setFontFamily("rm");
    this.g.setFontWeight("md");
    this.g.setFontShape("up");
  }

  public em(): void {
    this.g.setFontShape("em");
  }

  // Font size commands
  public tiny(): void {
    this.g.setFontSize("tiny");
  }
  public scriptsize(): void {
    this.g.setFontSize("scriptsize");
  }
  public footnotesize(): void {
    this.g.setFontSize("footnotesize");
  }
  public small(): void {
    this.g.setFontSize("small");
  }
  public normalsize(): void {
    this.g.setFontSize("normalsize");
  }
  public large(): void {
    this.g.setFontSize("large");
  }
  public Large(): void {
    this.g.setFontSize("Large");
  }
  public LARGE(): void {
    this.g.setFontSize("LARGE");
  }
  public huge(): void {
    this.g.setFontSize("huge");
  }
  public Huge(): void {
    this.g.setFontSize("Huge");
  }

  // Enumeration commands
  public theenumi(): string[] {
    return [this.g.arabic(this.g.counter("enumi"))];
  }

  public theenumii(): string[] {
    return [this.g.alph(this.g.counter("enumii"))];
  }

  public theenumiii(): string[] {
    return [this.g.roman(this.g.counter("enumiii"))];
  }

  public theenumiv(): string[] {
    return [this.g.Alph(this.g.counter("enumiv"))];
  }

  public labelenumi(): unknown[] {
    return this.theenumi().concat(".");
  }

  public labelenumii(): unknown[] {
    return ["("].concat(Array.from(this.theenumii()), [")"]);
  }

  public labelenumiii(): unknown[] {
    return this.theenumiii().concat(".");
  }

  public labelenumiv(): unknown[] {
    return this.theenumiv().concat(".");
  }

  public "p@enumii"(): unknown[] {
    return this.theenumi();
  }

  public "p@enumiii"(): unknown[] {
    return this.theenumi().concat("(", this.theenumii(), ")");
  }

  public "p@enumiv"(): unknown[] {
    return this["p@enumiii"]().concat(this.theenumiii());
  }

  // List item labels
  public labelitemi(): string[] {
    return [this.g.symbol("textbullet")];
  }

  public labelitemii(): string[] {
    this.normalfont();
    this.bfseries();
    return [this.g.symbol("textendash")];
  }

  public labelitemiii(): string[] {
    return [this.g.symbol("textasteriskcentered")];
  }

  public labelitemiv(): string[] {
    return [this.g.symbol("textperiodcentered")];
  }

  // Alignment commands
  public centering(): void {
    this.g.setAlignment("centering");
  }

  public raggedright(): void {
    this.g.setAlignment("raggedright");
  }

  public raggedleft(): void {
    this.g.setAlignment("raggedleft");
  }

  // Environment commands
  public center(): unknown[] {
    this.g.startlist();
    return [this.g.create(this.g.list, null, "center")];
  }

  public endcenter(): void {
    this.g.endlist();
  }

  public flushleft(): unknown[] {
    this.g.startlist();
    return [this.g.create(this.g.list, null, "flushleft")];
  }

  public endflushleft(): void {
    this.g.endlist();
  }

  public flushright(): unknown[] {
    this.g.startlist();
    return [this.g.create(this.g.list, null, "flushright")];
  }

  public endflushright(): void {
    this.g.endlist();
  }

  public titlepage(): unknown[] {
    return [this.g.create(this.g.titlepage)];
  }

  public quote(): unknown[] {
    this.g.startlist();
    return [this.g.create(this.g.quote)];
  }

  public endquote(): void {
    this.g.endlist();
  }

  public quotation(): unknown[] {
    this.g.startlist();
    return [this.g.create(this.g.quotation)];
  }

  public endquotation(): void {
    this.g.endlist();
  }

  public verse(): unknown[] {
    this.g.startlist();
    return [this.g.create(this.g.verse)];
  }

  public endverse(): void {
    this.g.endlist();
  }

  // List environments
  public itemize(items?: { label: unknown; text: unknown }[]): unknown {
    if (items === undefined) {
      this.g.startlist();
      this.g.stepCounter("@itemdepth");
      if (this.g.counter("@itemdepth") > 4) {
        this.g.error("too deeply nested");
      }
      return undefined;
    }

    const label = `labelitem${this.g.roman(this.g.counter("@itemdepth"))}`;
    return [
      this.g.create(
        this.g.unorderedList,
        items?.map((item) => {
          this.g.enterGroup();
          const makelabel = this.g.create(
            this.g.itemlabel,
            this.llap(item.label !== null ? item.label : this.g.macro(label)),
          );
          this.g.exitGroup();
          return this.g.create(this.g.listitem, [makelabel, item.text]);
        }),
      ),
    ];
  }

  public enditemize(): void {
    this.g.endlist();
    this.g.setCounter("@itemdepth", this.g.counter("@itemdepth") - 1);
  }

  public enumerate(
    items?: { label: { node: Element; id?: string }; text: unknown }[],
  ): unknown {
    if (items === undefined) {
      this.g.startlist();
      this.g.stepCounter("@enumdepth");
      if (this.g.counter("@enumdepth") > 4) {
        this.g.error("too deeply nested");
      }
      return undefined;
    }

    const itemCounter = `enum${this.g.roman(this.g.counter("@enumdepth"))}`;
    this.g.setCounter(itemCounter, 0);
    return [
      this.g.create(
        this.g.orderedList,
        items?.map((item) => {
          const label = this.g.create(this.g.inline, item.label.node);
          if (item.label.id) {
            label.id = item.label.id;
          }
          const makelabel = this.g.create(this.g.itemlabel, this.llap(label));
          return this.g.create(this.g.listitem, [makelabel, item.text]);
        }),
      ),
    ];
  }

  public endenumerate(): void {
    this.g.endlist();
    this.g.setCounter("@enumdepth", this.g.counter("@enumdepth") - 1);
  }

  public description(items?: { label: unknown; text: unknown }[]): unknown {
    if (items === undefined) {
      this.g.startlist();
      return undefined;
    }

    return [
      this.g.create(
        this.g.descriptionList,
        items?.map((item) => {
          const dt = this.g.create(this.g.term, item.label);
          const dd = this.g.create(this.g.description, item.text);
          return this.g.createFragment([dt, dd]);
        }),
      ),
    ];
  }

  public enddescription(): void {
    this.g.endlist();
  }

  // Picture commands
  public picture(
    size: unknown,
    offset?: unknown,
    content?: unknown,
  ): HTMLElement[] {
    return [this.g.createPicture(size, offset, content)];
  }

  public hspace(_s: unknown, l: Length): HTMLElement[] {
    return [this.g.createHSpace(l)];
  }

  // Reference commands
  public label(label: { textContent: string }): void {
    this.g.setLabel(label.textContent);
  }

  public ref(label: { textContent: string }): Node[] {
    return [this.g.ref(label.textContent)];
  }

  // Box commands
  public llap(txt: unknown): unknown[] {
    return [this.g.create(this.g.inline, txt, "hbox llap")];
  }

  public rlap(txt: unknown): unknown[] {
    return [this.g.create(this.g.inline, txt, "hbox rlap")];
  }

  public clap(txt: unknown): unknown[] {
    return [this.g.create(this.g.inline, txt, "hbox clap")];
  }

  public smash(txt: unknown): unknown[] {
    return [this.g.create(this.g.inline, txt, "hbox smash")];
  }

  public hphantom(txt: unknown): unknown[] {
    return [this.g.create(this.g.inline, txt, "phantom hbox smash")];
  }

  public vphantom(txt: unknown): unknown[] {
    return [this.g.create(this.g.inline, txt, "phantom hbox rlap")];
  }

  public phantom(txt: unknown): unknown[] {
    return [this.g.create(this.g.inline, txt, "phantom hbox")];
  }

  public underline(txt: unknown): unknown[] {
    return [this.g.create(this.g.inline, txt, "hbox underline")];
  }

  public mbox(txt: unknown): unknown[] {
    return this.makebox(undefined, undefined, undefined, txt);
  }

  public makebox(
    vec?: unknown,
    width?: Length | string,
    pos?: string,
    txt?: unknown,
  ): unknown[] {
    if (vec) {
      if (width && pos) {
        return this.g.error(
          "expected \\makebox(width,height)[position]{text} but got two optional arguments!",
        ) as unknown[];
      }
      pos = width as string;
      return [txt];
    } else {
      return this._box(width as Length | undefined, pos, txt, "hbox");
    }
  }

  public fbox(txt: unknown): unknown[] {
    return this.framebox(undefined, undefined, undefined, txt);
  }

  public framebox(
    vec?: unknown,
    width?: Length | string,
    pos?: string,
    txt?: unknown,
  ): unknown[] {
    // Case 1: vector mode — validate optional args and exit early
    if (vec) {
      if (width && pos) {
        return this.g.error(
          "expected \\framebox(width,height)[position]{text} but got two optional arguments!",
        ) as unknown[];
      }
      return []; // handled elsewhere
    }

    // --- Helpers ---
    const getFirstElement = (node: unknown): Element | undefined => {
      if (Array.isArray(node)) return getFirstElement(node[0]);

      if (typeof node === "object" && node !== null) {
        if ("hasAttribute" in node) return node as Element;

        if ("firstElementChild" in node) {
          const child = (node as ParentNode).firstElementChild;
          return child ? getFirstElement(child) : undefined;
        }
      }
      return undefined;
    };

    const countElements = (node: unknown): number => {
      if (Array.isArray(node)) return node.length;
      if (
        typeof node === "object" &&
        node !== null &&
        "childElementCount" in node
      ) {
        return (node as ParentNode).childElementCount || 1;
      }
      return 1;
    };

    // --- Main logic ---
    const target = getFirstElement(txt);
    const elementCount = countElements(txt);

    const canAddFrame =
      !width &&
      !pos &&
      target &&
      elementCount === 1 &&
      !this.g.hasAttribute(target, "frame");

    if (canAddFrame) {
      this.g.addAttribute(target, "frame");
      return Array.isArray(txt) ? txt : [txt];
    }

    return this._box(width as Length | undefined, pos, txt, "hbox frame");
  }

  private _box(
    width: Length | undefined,
    pos: string | undefined,
    txt: unknown,
    classes: string,
  ): unknown[] {
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
          this.g.error(`unknown position: ${pos}`);
      }
    }

    const content = this.g.create(this.g.inline, txt);
    const box = this.g.create(this.g.inline, content, classes);
    if (width) {
      box.setAttribute("style", `width:${width.value}`);
    }
    return [box];
  }

  public parbox(
    pos?: string,
    height?: Length,
    innerPos?: string,
    width?: Length,
    txt?: unknown,
  ): unknown[] {
    if (!pos) pos = "c";
    if (!innerPos) innerPos = pos;

    let classes = "parbox";
    let style = width ? `width:${width.value};` : "";

    if (height) {
      classes += " pbh";
      style += `height:${height.value};`;
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
        this.g.error(`unknown position: ${pos}`);
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
        this.g.error(`unknown inner-pos: ${innerPos}`);
    }

    const content = this.g.create(this.g.inline, txt);
    const box = this.g.create(this.g.inline, content, classes);
    box.setAttribute("style", style);
    return [box];
  }

  // Drawing commands
  public thinlines(): void {
    this.g.setLength("@wholewidth", new this.g.Length(0.4, "pt"));
  }

  public thicklines(): void {
    this.g.setLength("@wholewidth", new this.g.Length(0.8, "pt"));
  }

  public linethickness(l: Length): void {
    if (l.unit !== "sp") {
      this.g.error("relative units for \\linethickness not supported!");
    }
    this.g.setLength("@wholewidth", l);
  }

  public arrowlength(l: Length): void {
    this.g.setLength("@arrowlength", l);
  }

  public maxovalrad(): string {
    return "20pt";
  }

  public qbeziermax(): number {
    return 500;
  }

  public frame(txt: unknown): unknown[] {
    const el = this.g.create(this.g.inline, txt, "hbox pframe");
    const w = this.g.length("@wholewidth");
    el.setAttribute("style", `border-width:${w.value}`);
    return [el];
  }

  public put(v: Vector<Length>, obj: Element): unknown[] {
    const wrapper = this.g.create(this.g.inline, obj, "put-obj");
    let strut: HTMLElement | undefined;

    if (v.y.cmp(this.g.Length.zero) >= 0) {
      wrapper.setAttribute("style", `left:${v.x.value}`);
      if (v.y.cmp(this.g.Length.zero) > 0) {
        strut = this.g.create(this.g.inline, undefined, "strut");
        strut.setAttribute("style", `height:${v.y.value}`);
      }
    } else {
      wrapper.setAttribute("style", `left:${v.x.value};bottom:${v.y.value}`);
    }

    return this.rlap(this.g.create(this.g.inline, [wrapper, strut], "picture"));
  }

  public multiput(
    v: Vector<Length>,
    dv: Vector<Length>,
    n: number,
    obj: Element,
  ): unknown[] {
    const res: unknown[] = [];
    for (let i = 0; i < n; i++) {
      res.push(...this.put(v.add(dv.mul(i)), obj.cloneNode(true) as Element));
    }
    return res;
  }

  public qbezier(
    N: number | undefined,
    v1: Vector<Length>,
    v: Vector<Length>,
    v2: Vector<Length>,
  ): unknown[] {
    return [
      this._path(
        "M" +
          v1.x.pxpct +
          "," +
          v1.y.pxpct +
          " Q" +
          v.x.pxpct +
          "," +
          v.y.pxpct +
          " " +
          v2.x.pxpct +
          "," +
          v2.y.pxpct,
        N,
      ),
    ];
  }

  public cbezier(
    N: number | undefined,
    v1: Vector<Length>,
    v: Vector<Length>,
    v2: Vector<Length>,
    v3: Vector<Length>,
  ): unknown[] {
    return [
      this._path(
        "M" +
          v1.x.pxpct +
          "," +
          v1.y.pxpct +
          " C" +
          v.x.pxpct +
          "," +
          v.y.pxpct +
          " " +
          v2.x.pxpct +
          "," +
          v2.y.pxpct +
          " " +
          v3.x.pxpct +
          "," +
          v3.y.pxpct,
        N,
      ),
    ];
  }

  private _path(p: string, N?: number): HTMLElement {
    const linethickness = this.g.length("@wholewidth");
    const svg = this.g.create(this.g.inline, undefined, "picture-object");
    const draw = this.g.SVG().addTo(svg);
    const path = draw
      .path(p)
      .stroke({
        color: "#000",
        width: linethickness.value,
      })
      .fill("none");

    if (N && N > 0) {
      const maxN = Math.min(N, this.qbeziermax() - 1);
      const pw = linethickness.px;
      const lenSection = (path.length() - (maxN + 1) * pw) / maxN;
      if (lenSection > 0) {
        path.stroke({
          dasharray: `${pw} ${this.g.round(lenSection)}`,
        });
      }
    }

    const bbox = path.bbox();
    bbox.x -= linethickness.px;
    bbox.y -= linethickness.px;
    bbox.width += linethickness.px * 2;
    bbox.height += linethickness.px * 2;

    svg.setAttribute(
      "style",
      "left:" +
        this.g.round(bbox.x) +
        "px;bottom:" +
        this.g.round(bbox.y) +
        "px",
    );
    draw
      .size(`${this.g.round(bbox.width)}px`, `${this.g.round(bbox.height)}px`)
      .viewbox(
        this.g.round(bbox.x),
        this.g.round(bbox.y),
        this.g.round(bbox.width),
        this.g.round(bbox.height),
      );
    draw.flip("y", 0);

    return this.g.create(this.g.inline, svg, "picture");
  }

  public circle(s: boolean, d: Length): unknown[] {
    d = d.abs();
    const svg = this.g.create(this.g.inline, undefined, "picture-object");
    const linethickness = this.g.length("@wholewidth");
    const draw = this.g.SVG().addTo(svg);
    let offset: string;

    if (s) {
      offset = d.div(2).mul(-1).value;
      draw
        .size(d.value, d.value)
        .stroke({ color: "#000", width: "0" })
        .circle(d.value)
        .cx(d.div(2).value)
        .cy(d.div(2).value)
        .fill("");
    } else {
      offset = d.div(2).add(linethickness).mul(-1).value;
      draw
        .size(
          d.add(linethickness.mul(2)).value,
          d.add(linethickness.mul(2)).value,
        )
        .stroke({ color: "#000", width: linethickness.value })
        .circle(d.value)
        .cx(d.div(2).add(linethickness).value)
        .cy(d.div(2).add(linethickness).value)
        .fill("none");
    }

    svg.setAttribute("style", `left:${offset};bottom:${offset}`);
    draw.flip("y", 0);
    return [this.g.create(this.g.inline, svg, "picture")];
  }

  public line(v: Vector<Length>, l: Length): unknown[] {
    return [this._line(...this._slopeLengthToCoords(v, l))];
  }

  public vector(v: Vector<Length>, l: Length): unknown[] {
    return [this._vector(...this._slopeLengthToCoords(v, l))];
  }

  public Line(vs: Vector<Length>, ve: Vector<Length>): unknown[] {
    return [this._line(vs, ve)];
  }

  public Vector(vs: Vector<Length>, ve: Vector<Length>): unknown[] {
    return [this._vector(vs, ve)];
  }

  private _slopeLengthToCoords(
    v: Vector<Length>,
    l: Length,
  ): [Vector<Length>, Vector<Length>] {
    if (v.x.px === 0 && v.y.px === 0) {
      this.g.error("illegal slope (0,0)");
    }

    if (v.x.unit !== v.y.unit || v.x.unit !== "sp") {
      this.g.error("relative units not allowed for slope");
    }

    const _linethickness = this.g.length("@wholewidth");
    const zero = new this.g.Length(0, l.unit);
    let x: Length, y: Length;

    if (v.x.px === 0) {
      x = zero;
      y = l;
    } else {
      x = l;
      y = x.mul(Math.abs(v.y.ratio(v.x)));
    }

    if (v.x.cmp(zero) < 0) x = x.mul(-1);
    if (v.y.cmp(zero) < 0) y = y.mul(-1);

    return [new Vector(zero, zero), new Vector(x, y)];
  }

  public _line(vs: Vector<Length>, ve: Vector<Length>): HTMLElement {
    if (vs.x.unit !== vs.y.unit || vs.x.unit !== "sp") {
      this.g.error("relative units not allowed for line");
    }
    if (ve.x.unit !== ve.y.unit || ve.x.unit !== "sp") {
      this.g.error("relative units not allowed for line");
    }

    const svg = this.g.create(this.g.inline, undefined, "picture-object");
    const draw = this.g.SVG().addTo(svg);
    const linethickness = this.g.length("@wholewidth");
    const bbox = draw
      .line(vs.x.px, vs.y.px, ve.x.px, ve.y.px)
      .stroke({ color: "#000", width: linethickness.value })
      .bbox();

    bbox.x -= linethickness.px;
    bbox.y -= linethickness.px;
    bbox.width += linethickness.px * 2;
    bbox.height += linethickness.px * 2;

    if (bbox.x > 0 || bbox.y > 0) {
      console.error("line: bbox.x/y > 0!!", bbox.x, bbox.y);
    }

    svg.setAttribute(
      "style",
      "left:" +
        this.g.round(bbox.x) +
        "px;bottom:" +
        this.g.round(bbox.y) +
        "px",
    );
    draw
      .size(`${this.g.round(bbox.width)}px`, `${this.g.round(bbox.height)}px`)
      .viewbox(
        this.g.round(bbox.x),
        this.g.round(bbox.y),
        this.g.round(bbox.width),
        this.g.round(bbox.height),
      );
    draw.flip("y", 0);

    return this.g.create(this.g.inline, svg, "picture");
  }

  public _vector(vs: Vector<Length>, ve: Vector<Length>): HTMLElement {
    if (vs.x.unit !== vs.y.unit || vs.x.unit !== "sp") {
      this.g.error("relative units not allowed for vector");
    }
    if (ve.x.unit !== ve.y.unit || ve.x.unit !== "sp") {
      this.g.error("relative units not allowed for vector");
    }

    const linethickness = this.g.length("@wholewidth");
    const svg = this.g.create(this.g.inline, undefined, "picture-object");
    const draw = this.g.SVG();

    let hl = 6.5;
    let hw = 3.9;
    const max = new this.g.Length(0.6, "pt");

    if (linethickness.cmp(max) < 0) {
      hl = this.g.round(hl * max.ratio(linethickness));
      hw = this.g.round(hw * max.ratio(linethickness));
    }

    const hhl = linethickness.mul(hl / 2);
    const al = ve.sub(vs).norm();
    let s: Vector<Length>;

    if (al.cmp(hhl) < 0) {
      s = ve.shift_start(hhl);
    } else {
      s = new Vector(this.g.Length.zero, this.g.Length.zero);
    }

    ve = ve.shift_end(hhl.mul(-1));
    const bbox = draw
      .line(s.x.px, s.y.px, ve.x.px, ve.y.px)
      .stroke({ color: "#000", width: linethickness.value })
      .marker("end", hl, hw, (marker: unknown) => {
        return (marker as { path: (d: string) => unknown }).path(
          "M0,0 Q" +
            this.g.round((2 * hl) / 3) +
            "," +
            this.g.round(hw / 2) +
            " " +
            hl +
            "," +
            this.g.round(hw / 2) +
            " Q" +
            this.g.round((2 * hl) / 3) +
            "," +
            this.g.round(hw / 2) +
            " 0," +
            hw +
            " z",
        );
      })
      .bbox();

    bbox.x -= linethickness.px + hhl.px;
    bbox.y -= linethickness.px + hhl.px;
    bbox.width += linethickness.px + hhl.px * 2;
    bbox.height += linethickness.px + hhl.px * 2;

    if (bbox.x > 0 || bbox.y > 0) {
      console.error("vector: bbox.x/y > 0!!", bbox.x, bbox.y);
    }

    svg.setAttribute(
      "style",
      "left:" +
        this.g.round(bbox.x) +
        "px;bottom:" +
        this.g.round(bbox.y) +
        "px",
    );
    draw
      .size(`${this.g.round(bbox.width)}px`, `${this.g.round(bbox.height)}px`)
      .viewbox(
        this.g.round(bbox.x),
        this.g.round(bbox.y),
        this.g.round(bbox.width),
        this.g.round(bbox.height),
      );
    draw.flip("y", 0);
    draw.addTo(svg);

    return this.g.create(this.g.inline, svg, "picture");
  }

  public oval(
    maxrad?: Length,
    size?: Vector<Length>,
    part?: string,
  ): unknown[] {
    const linethickness = this.g.length("@wholewidth");
    if (!maxrad) maxrad = new this.g.Length(20, "px");
    if (!part) part = "";
    const sizeVec = size as Vector<Length>;

    let rad =
      sizeVec.x.cmp(sizeVec.y) < 0 ? sizeVec.x.div(2) : sizeVec.y.div(2);
    if (maxrad.cmp(rad) < 0) rad = maxrad;

    const draw = this.g.SVG();
    const oval = draw
      .rect(sizeVec.x.value, sizeVec.y.value)
      .radius(rad.value)
      .move(sizeVec.x.div(-2).value, sizeVec.y.div(-2).value)
      .stroke({ color: "#000", width: linethickness.value })
      .fill("none");

    let rect: Rect = {
      x: sizeVec.x.div(-2).sub(linethickness),
      y: sizeVec.y.div(-2).sub(linethickness),
      w: sizeVec.x.add(linethickness.mul(2)),
      h: sizeVec.y.add(linethickness.mul(2)),
    };

    if (part.includes("l")) {
      rect = this._intersect(rect, {
        x: sizeVec.x.div(-2).sub(linethickness),
        y: sizeVec.y.div(-2).sub(linethickness),
        w: sizeVec.x.div(2).add(linethickness),
        h: sizeVec.y.add(linethickness.mul(2)),
      });
    }

    if (part.includes("t")) {
      rect = this._intersect(rect, {
        x: sizeVec.x.div(-2).sub(linethickness),
        y: sizeVec.y.div(-2).sub(linethickness),
        w: sizeVec.x.add(linethickness.mul(2)),
        h: sizeVec.y.div(2).add(linethickness),
      });
    }

    if (part.includes("r")) {
      rect = this._intersect(rect, {
        x: this.g.Length.zero,
        y: sizeVec.y.div(-2).sub(linethickness),
        w: sizeVec.x.div(2).add(linethickness),
        h: sizeVec.y.add(linethickness.mul(2)),
      });
    }

    if (part.includes("b")) {
      rect = this._intersect(rect, {
        x: sizeVec.x.div(-2).sub(linethickness),
        y: this.g.Length.zero,
        w: sizeVec.x.add(linethickness.mul(2)),
        h: sizeVec.y.div(2).add(linethickness),
      });
    }

    const bbox = oval.bbox();
    bbox.x -= linethickness.px;
    bbox.y -= linethickness.px;
    bbox.width += linethickness.px * 2;
    bbox.height += linethickness.px * 2;

    if (bbox.x > 0 || bbox.y > 0) {
      console.error("oval: bbox.x/y > 0!!", bbox.x, bbox.y);
    }

    const clip = draw
      .clip()
      .add(
        draw.rect(rect.w.value, rect.h.value).move(rect.x.value, rect.y.value),
      );
    clip.flip("y", 0);
    oval.clipWith(clip);

    const svg = this.g.create(this.g.inline, undefined, "picture-object");
    svg.setAttribute(
      "style",
      "left:" +
        this.g.round(bbox.x) +
        "px;bottom:" +
        this.g.round(bbox.y) +
        "px",
    );
    draw
      .size(`${this.g.round(bbox.width)}px`, `${this.g.round(bbox.height)}px`)
      .viewbox(
        this.g.round(bbox.x),
        this.g.round(bbox.y),
        this.g.round(bbox.width),
        this.g.round(bbox.height),
      );
    draw.flip("y", 0);
    draw.addTo(svg);

    return [this.g.create(this.g.inline, svg, "picture")];
  }

  private _intersect(r1: Rect, r2: Rect): Rect {
    return {
      x: this.g.Length.max(r1.x, r2.x),
      y: this.g.Length.max(r1.y, r2.y),
      w: this.g.Length.max(
        this.g.Length.zero,
        this.g.Length.min(r1.x.add(r1.w), r2.x.add(r2.w)).sub(
          this.g.Length.max(r1.x, r2.x),
        ),
      ),
      h: this.g.Length.max(
        this.g.Length.zero,
        this.g.Length.min(r1.y.add(r1.h), r2.y.add(r2.h)).sub(
          this.g.Length.max(r1.y, r2.y),
        ),
      ),
    };
  }

  // Length commands
  public newlength(id: string): void {
    this.g.newLength(id);
  }

  public setlength(id: string, l: Length): void {
    this.g.setLength(id, l);
  }

  public addtolength(id: string, l: Length): void {
    this.g.setLength(id, this.g.length(id).add(l));
  }

  // Counter commands
  public newcounter(c: string, p?: string): void {
    this.g.newCounter(c, p);
  }

  public stepcounter(c: string): void {
    this.g.stepCounter(c);
  }

  public addtocounter(c: string, n: number): void {
    this.g.setCounter(c, this.g.counter(c) + n);
  }

  public setcounter(c: string, n: number): void {
    this.g.setCounter(c, n);
  }

  public refstepcounter(c: string): Node[] {
    this.g.stepCounter(c);
    return [this.g.refCounter(c)];
  }

  // Counter representation commands
  public alph(c: string): string[] {
    return [this.g.alph(this.g.counter(c))];
  }

  public Alph(c: string): string[] {
    return [this.g.Alph(this.g.counter(c))];
  }

  public arabic(c: string): string[] {
    return [this.g.arabic(this.g.counter(c))];
  }

  public roman(c: string): string[] {
    return [this.g.roman(this.g.counter(c))];
  }

  public Roman(c: string): string[] {
    return [this.g.Roman(this.g.counter(c))];
  }

  public fnsymbol(c: string): string[] {
    return [this.g.fnsymbol(this.g.counter(c))];
  }

  // File commands
  public input(_file: unknown): void {}
  public include(_file: unknown): void {}

  // Document class command
  public documentclass(
    options?: unknown,
    documentclass?: string,
    _version?: string,
  ): void {
    this.documentclass = function () {
      this.g.error(
        "Two \\documentclass commands. The document may only declare one class.",
      );
    };

    if (!documentclass) {
      throw new Error("documentclass is required");
    }
    const Class = (
      builtinDocumentclasses as Record<
        string,
        new (
          ...args: unknown[]
        ) => unknown
      >
    )[documentclass];
    if (!Class) {
      try {
        // Note: Dynamic import converted to error for missing documentclass
        // This maintains synchronous behavior while eliminating require()
        console.error(
          `error loading documentclass "${documentclass}": documentclass not found in built-in classes`,
        );
        throw new Error(
          `documentclass "${documentclass}" not found. Available classes: ${Object.keys(builtinDocumentclasses).join(", ")}`,
        );
      } catch (e) {
        console.error(`error loading documentclass "${documentclass}": ${e}`);
        throw new Error(`error loading documentclass "${documentclass}"`);
      }
    }

    this.g.documentClass = new Class(this.g, options) as unknown as {
      options?: Record<string, unknown>;
    };
    assignIn(this, this.g.documentClass as object);

    // Copy prototype methods (for ES6 classes) - walk the entire prototype chain
    // Collect all methods, starting from most specific to least specific
    const methods: Record<string, (...args: unknown[]) => unknown> = {};
    let proto = Object.getPrototypeOf(this.g.documentClass);
    while (proto && proto.constructor !== Object) {
      const methodNames = Object.getOwnPropertyNames(proto).filter(
        (name) => name !== "constructor" && typeof proto[name] === "function",
      );
      for (const methodName of methodNames) {
        // Only add if not already collected (preserves most specific version)
        if (!(methodName in methods)) {
          methods[methodName] = proto[methodName];
        }
      }
      proto = Object.getPrototypeOf(proto);
    }

    // Now bind and copy all collected methods - ALWAYS override existing methods
    for (const methodName in methods) {
      // Always override, don't check if it exists
      const self = this as unknown as Record<string, unknown>;
      const dc = this.g.documentClass;
      if (!dc) {
        throw new Error("documentClass not initialized");
      }
      const fn = methods[methodName];
      if (typeof fn === "function") {
        self[methodName] = fn.bind(dc as object);
      }
    }

    assign(
      LaTeX.args,
      (Class as unknown as { args?: Record<string, unknown[]> }).args ?? {},
    );
  }

  // Package command
  public usepackage(
    opts?: Record<string, unknown>,
    packages?: string[],
    _version?: string,
  ): void {
    const options = Object.assign({}, this.g.documentClass?.options, opts);

    for (const pkg of packages || []) {
      if (providedPackages.includes(pkg)) {
        continue;
      }

      const Package = (
        builtinPackages as Record<
          string,
          (new (
            ...args: unknown[]
          ) => unknown) & {
            args?: Record<string, unknown[]>;
            symbols?: Map<string, string>;
          }
        >
      )[pkg];

      if (!Package) {
        console.warn(
          `package "${pkg}" not found. Available packages: ${Object.keys(builtinPackages).join(", ")}`,
        );
        continue;
      }

      try {
        const packageInstance = new Package(this.g, options);

        // Copy instance properties
        assignIn(this, packageInstance as object);

        // Copy prototype methods (for ES6 classes)
        const proto = Object.getPrototypeOf(packageInstance);
        const methodNames = Object.getOwnPropertyNames(proto).filter(
          (name) => name !== "constructor" && typeof proto[name] === "function",
        );

        for (const methodName of methodNames) {
          if (!(methodName in this)) {
            const self = this as unknown as Record<string, unknown>;
            self[methodName] = (
              (packageInstance as unknown as Record<string, unknown>)[
                methodName
              ] as (...a: unknown[]) => unknown
            ).bind(packageInstance);
          }
        }

        assign(LaTeX.args, Package.args);
        if (Package.symbols) {
          Package.symbols.forEach((value: string, key: string) => {
            symbols.set(key, value);
          });
        }
      } catch (e) {
        console.error(`error loading package "${pkg}": ${e}`);
      }
    }
  }

  public includeonly(_filelist: string[]): void {}
  public makeatletter(): void {}
  public makeatother(): void {}

  // Page style commands
  public pagestyle(_s: string): void {}

  // Line break commands
  public linebreak(_o?: number): void {}
  public nolinebreak(_o?: number): void {}
  public fussy(): void {}
  public sloppy(): void {}

  // Page break commands
  public pagebreak(_o?: number): void {}
  public nopagebreak(_o?: number): void {}
  public samepage(): void {}
  public enlargethispage(_s: boolean, _l: unknown): void {}
  public newpage(): void {}
  public clearpage(): void {}
  public cleardoublepage(): void {}
  public vfill(): void {}
  public thispagestyle(_s: string): void {}
}
