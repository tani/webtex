'use strict';

export class Base {
  static displayName = 'Base';
  static args: any = {};
  
  public options = new Map();
  public g: any;
  private _title: any = null;
  private _author: any = null;
  private _date: any = null;
  private _thanks: any = null;

  constructor(generator: any, options?: any) {
    this.g = generator;
    if (options) {
      this.options = options;
    }
    
    this.g.newCounter('part');
    this.g.newCounter('section');
    this.g.newCounter('subsection', 'section');
    this.g.newCounter('subsubsection', 'subsection');
    this.g.newCounter('paragraph', 'subsubsection');
    this.g.newCounter('subparagraph', 'paragraph');
    this.g.newCounter('figure');
    this.g.newCounter('table');
    this.g.setLength('paperheight', new this.g.Length(11, "in"));
    this.g.setLength('paperwidth', new this.g.Length(8.5, "in"));
    this.g.setLength('@@size', new this.g.Length(10, "pt"));
    
    this.options.forEach((v: any, k: string) => {
      let tmp: any, value: number;
      switch (k) {
      case "oneside":
        break;
      case "twoside":
        break;
      case "onecolumn":
        break;
      case "twocolumn":
        break;
      case "titlepage":
        break;
      case "notitlepage":
        break;
      case "fleqn":
        break;
      case "leqno":
        break;
      case "a4paper":
        this.g.setLength('paperheight', new this.g.Length(297, "mm"));
        return this.g.setLength('paperwidth', new this.g.Length(210, "mm"));
      case "a5paper":
        this.g.setLength('paperheight', new this.g.Length(210, "mm"));
        return this.g.setLength('paperwidth', new this.g.Length(148, "mm"));
      case "b5paper":
        this.g.setLength('paperheight', new this.g.Length(250, "mm"));
        return this.g.setLength('paperwidth', new this.g.Length(176, "mm"));
      case "letterpaper":
        this.g.setLength('paperheight', new this.g.Length(11, "in"));
        return this.g.setLength('paperwidth', new this.g.Length(8.5, "in"));
      case "legalpaper":
        this.g.setLength('paperheight', new this.g.Length(14, "in"));
        return this.g.setLength('paperwidth', new this.g.Length(8.5, "in"));
      case "executivepaper":
        this.g.setLength('paperheight', new this.g.Length(10.5, "in"));
        return this.g.setLength('paperwidth', new this.g.Length(7.25, "in"));
      case "landscape":
        tmp = this.g.length('paperheight');
        this.g.setLength('paperheight', this.g.length('paperwidth'));
        return this.g.setLength('paperwidth', tmp);
      default:
        value = parseFloat(k);
        if (!isNaN(value) && k.endsWith("pt") && String(value) === k.substring(0, k.length - 2)) {
          return this.g.setLength('@@size', new this.g.Length(value, "pt"));
        }
      }
    });
    
    const pt345 = new this.g.Length(345, "pt");
    const inch = new this.g.Length(1, "in");
    let textwidth = this.g.length('paperwidth').sub(inch.mul(2));
    if (textwidth.cmp(pt345) === 1) {
      textwidth = pt345;
    }
    this.g.setLength('textwidth', textwidth);
    this.g.setLength('marginparsep', new this.g.Length(11, "pt"));
    this.g.setLength('marginparpush', new this.g.Length(5, "pt"));
    
    const margins = this.g.length('paperwidth').sub(this.g.length('textwidth'));
    const oddsidemargin = margins.mul(0.5).sub(inch);
    let marginparwidth = margins.mul(0.5).sub(this.g.length('marginparsep')).sub(inch.mul(0.8));
    if (marginparwidth.cmp(inch.mul(2)) === 1) {
      marginparwidth = inch.mul(2);
    }
    this.g.setLength('oddsidemargin', oddsidemargin);
    this.g.setLength('marginparwidth', marginparwidth);
  }

  contentsname(): string[] {
    return ["Contents"];
  }

  listfigurename(): string[] {
    return ["List of Figures"];
  }

  listtablename(): string[] {
    return ["List of Tables"];
  }

  partname(): string[] {
    return ["Part"];
  }

  figurename(): string[] {
    return ["Figure"];
  }

  tablename(): string[] {
    return ["Table"];
  }

  appendixname(): string[] {
    return ["Appendix"];
  }

  indexname(): string[] {
    return ["Index"];
  }

  part(s?: boolean, toc?: any, ttl?: any): any[] {
    return [this.g.startsection('part', 0, s, toc, ttl)];
  }

  section(s?: boolean, toc?: any, ttl?: any): any[] {
    return [this.g.startsection('section', 1, s, toc, ttl)];
  }

  subsection(s?: boolean, toc?: any, ttl?: any): any[] {
    return [this.g.startsection('subsection', 2, s, toc, ttl)];
  }

  subsubsection(s?: boolean, toc?: any, ttl?: any): any[] {
    return [this.g.startsection('subsubsection', 3, s, toc, ttl)];
  }

  paragraph(s?: boolean, toc?: any, ttl?: any): any[] {
    return [this.g.startsection('paragraph', 4, s, toc, ttl)];
  }

  subparagraph(s?: boolean, toc?: any, ttl?: any): any[] {
    return [this.g.startsection('subparagraph', 5, s, toc, ttl)];
  }

  thepart(): string[] {
    return [this.g.Roman(this.g.counter('part'))];
  }

  thesection(): string[] {
    return [this.g.arabic(this.g.counter('section'))];
  }

  thesubsection(): string[] {
    return this.thesection().concat("." + this.g.arabic(this.g.counter('subsection')));
  }

  thesubsubsection(): string[] {
    return this.thesubsection().concat("." + this.g.arabic(this.g.counter('subsubsection')));
  }

  theparagraph(): string[] {
    return this.thesubsubsection().concat("." + this.g.arabic(this.g.counter('paragraph')));
  }

  thesubparagraph(): string[] {
    return this.theparagraph().concat("." + this.g.arabic(this.g.counter('subparagraph')));
  }

  maketitle(): any[] {
    this.g.setTitle(this._title);
    const title = this.g.create(this.g.title, this._title);
    const author = this.g.create(this.g.author, this._author);
    const date = this.g.create(this.g.date, this._date ? this._date : this.g.macro('today'));
    const maketitle = this.g.create(this.g.list, [
      this.g.createVSpace(new this.g.Length(2, "em")), 
      title, 
      this.g.createVSpace(new this.g.Length(1.5, "em")), 
      author, 
      this.g.createVSpace(new this.g.Length(1, "em")), 
      date, 
      this.g.createVSpace(new this.g.Length(1.5, "em"))
    ], "center");
    
    this.g.setCounter('footnote', 0);
    this._title = null;
    this._author = null;
    this._date = null;
    this._thanks = null;
    
    (this as any)['title'] = (this as any)['author'] = (this as any)['date'] = (this as any)['thanks'] = (this as any)['and'] = (this as any)['maketitle'] = function(){};
    return [maketitle];
  }
}

// Set up static args configuration
const args = Base.args;
args['part'] = args['section'] = args['subsection'] = args['subsubsection'] = args['paragraph'] = args['subparagraph'] = ['V', 's', 'X', 'o?', 'g'];
args['maketitle'] = ['V'];