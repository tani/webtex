import { Report } from './report';

export class Book extends Report {
  static displayName = 'Book';
  static css = "css/book.css";
  static args = Report.args;
  
  private '@mainmatter': boolean = true;

  constructor(generator: any, options: any) {
    super(generator, options);
    this['@mainmatter'] = true;
  }

  chapter(s?: boolean, toc?: any, ttl?: any): any[] {
    return [this.g.startsection('chapter', 0, s || !this["@mainmatter"], toc, ttl)];
  }

  frontmatter(): void {
    this['@mainmatter'] = false;
  }

  mainmatter(): void {
    this['@mainmatter'] = true;
  }

  backmatter(): void {
    this['@mainmatter'] = false;
  }
}

// Set up static args configuration
const args = Book.args;
args['part'] = args['chapter'] = ['V', 's', 'X', 'o?', 'g'];
args['frontmatter'] = args['mainmatter'] = args['backmatter'] = ['V'];