import type { DocumentClassGenerator } from "../interfaces";
import { Base } from "./base";

export class Article extends Base {
  static displayName = "Article";
  static css = "css/article.css";
  static args = {
    ...Base.args,
    tableofcontents: ["V"],
    abstract: ["V"],
    appendix: ["V"],
  };

  protected declare g: DocumentClassGenerator;

  constructor(
    generator: DocumentClassGenerator,
    options?: Map<string, unknown>,
  ) {
    super(generator, options);
    this.g = generator;
    this.g.setCounter("secnumdepth", 3);
    this.g.setCounter("tocdepth", 3);
  }

  refname(): string[] {
    return ["References"];
  }

  tableofcontents(): Element[] {
    const head = this.section(true, undefined, this.g.macro("contentsname"));
    const toc = this.g._toc ? [this.g._toc] : [];
    return head.concat(toc);
  }

  abstract(): Element[] {
    this.g.setFontSize?.("small");
    this.g.enterGroup?.();
    this.g.setFontWeight?.("bf");
    const head = this.g.create(
      this.g.list,
      this.g.macro("abstractname"),
      "center",
    );
    this.g.exitGroup?.();
    return [head].concat(this.quotation());
  }

  endabstract(): void {
    this.endquotation();
  }

  appendix(): void {
    this.g.setCounter("section", 0);
    this.g.setCounter("subsection", 0);
    this.thesection = () => {
      return [this.g.Alph(this.g.counter("section"))];
    };
  }

  // Method that will be dynamically overridden in appendix()
  thesection(): string[] {
    return super.thesection();
  }

  // Methods inherited from Base or provided via macros; type-only declarations
  declare section: (
    starred?: boolean,
    toc?: unknown,
    title?: unknown,
  ) => Element[];
  declare quotation: () => Element[];
  declare endquotation: () => void;
}
