import { Base } from './base';

interface Generator {
  setCounter(name: string, value: number): void;
  macro(name: string): any;
  create(element: any, content: any, className?: string): any;
  list: any;
  _toc: any;
  setFontSize(size: string): void;
  enterGroup(): void;
  exitGroup(): void;
  setFontWeight(weight: string): void;
  Alph(value: number): string;
  counter(name: string): number;
}

export class Article extends Base {
  static displayName = 'Article';
  static css = "css/article.css";
  static args = {
    ...Base.args,
    'tableofcontents': ['V'],
    'abstract': ['V'],
    'appendix': ['V']
  };

  protected g: Generator;

  constructor(generator: Generator, options?: any) {
    super(generator, options);
    this.g = generator;
    this.g.setCounter('secnumdepth', 3);
    this.g.setCounter('tocdepth', 3);
  }

  refname(): string[] {
    return ["References"];
  }

  tableofcontents(): any[] {
    return this.section(true, undefined, this.g.macro('contentsname')).concat([this.g._toc]);
  }

  abstract(): any[] {
    this.g.setFontSize("small");
    this.g.enterGroup();
    this.g.setFontWeight("bf");
    const head = this.g.create(this.g.list, this.g.macro("abstractname"), "center");
    this.g.exitGroup();
    return [head].concat(this.quotation());
  }

  endabstract(): void {
    this.endquotation();
  }

  appendix(): void {
    this.g.setCounter('section', 0);
    this.g.setCounter('subsection', 0);
    this.thesection = () => {
      return [this.g.Alph(this.g.counter('section'))];
    };
  }

  // Method that will be dynamically overridden in appendix()
  thesection(): string[] {
    return super.thesection ? super.thesection() : [];
  }

  // Methods inherited from Base that need to be available
  section: (starred?: boolean, toc?: any, title?: any) => any[];
  quotation: () => any[];
  endquotation: () => void;
}