import { Base } from './base';

export class Report extends Base {
  static displayName = 'Report';
  static css = "css/book.css";
  static args = Base.args;

  constructor(generator: any, options: any) {
    super(generator, options);
    this.g.newCounter('chapter');
    this.g.addToReset('section', 'chapter');
    this.g.setCounter('secnumdepth', 2);
    this.g.setCounter('tocdepth', 2);
    this.g.addToReset('figure', 'chapter');
    this.g.addToReset('table', 'chapter');
    this.g.addToReset('footnote', 'chapter');
  }

  chaptername(): string[] {
    return ["Chapter"];
  }

  bibname(): string[] {
    return ["Bibliography"];
  }

  part(s?: boolean, toc?: any, ttl?: any): any[] {
    return [this.g.startsection('part', -1, s, toc, ttl)];
  }

  chapter(s?: boolean, toc?: any, ttl?: any): any[] {
    return [this.g.startsection('chapter', 0, s, toc, ttl)];
  }

  thechapter(): string[] {
    return [this.g.arabic(this.g.counter('chapter'))];
  }

  thesection(): string[] {
    return this.thechapter().concat("." + this.g.arabic(this.g.counter('section')));
  }

  thefigure(): string[] {
    return (this.g.counter('chapter') > 0
      ? this.thechapter().concat(".")
      : []).concat(this.g.arabic(this.g.counter('figure')));
  }

  thetable(): string[] {
    return (this.g.counter('chapter') > 0
      ? this.thechapter().concat(".")
      : []).concat(this.g.arabic(this.g.counter('table')));
  }

  tableofcontents(): any[] {
    return this.chapter(true, undefined, this.g.macro('contentsname')).concat([this.g._toc]);
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
    this.g.setCounter('chapter', 0);
    this.g.setCounter('section', 0);
    (this as any)['chaptername'] = (this as any)['appendixname'];
    (this as any)['thechapter'] = function(this: Report) {
      return [this.g.Alph(this.g.counter('chapter'))];
    };
  }
}

// Set up static args configuration
const args = Report.args;
args['part'] = args['chapter'] = ['V', 's', 'X', 'o?', 'g'];
args['tableofcontents'] = ['V'];
args['abstract'] = ['V'];
args['appendix'] = ['V'];