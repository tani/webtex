import { Base } from './base';

export class Article extends Base {
  static displayName = 'Article';
  static css = "css/article.css";
  static args = Base.args;

  constructor(generator: any, options: any) {
    super(generator, options);
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
    return [head].concat((this as any).quotation());
  }

  endabstract(): void {
    (this as any).endquotation();
  }

  appendix(): void {
    this.g.setCounter('section', 0);
    this.g.setCounter('subsection', 0);
    (this as any)['thesection'] = function(this: Article) {
      return [this.g.Alph(this.g.counter('section'))];
    };
  }
}

// Set up static args configuration
const args = Article.args;
args['tableofcontents'] = ['V'];
args['abstract'] = ['V'];
args['appendix'] = ['V'];