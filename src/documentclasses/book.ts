import { Report } from './report';

interface Generator {
  newCounter(name: string, resetBy?: string): void;
  addToReset(counter: string, resetBy: string): void;
  setLength(name: string, value: any): void;
  length(name: string): any;
  Length: any;
  setCounter(name: string, value: number): void;
  counter(name: string): number;
  arabic(value: number): string;
  Roman(value: number): string;
  Alph(value: number): string;
  startsection(type: string, level: number, starred: boolean, toc?: any, title?: any): any;
  setTitle(title: any): void;
  create(element: any, content: any, className?: string): any;
  createVSpace(length: any): any;
  macro(name: string): any;
  title: any;
  author: any;
  date: any;
  list: any;
  _toc: any;
  setFontSize(size: string): void;
  enterGroup(): void;
  exitGroup(): void;
  setFontWeight(weight: string): void;
}

export class Book extends Report {
  static displayName = 'Book';
  static css = "css/book.css";
  static args = {
    ...Report.args,
    'part': ['V', 's', 'X', 'o?', 'g'],
    'chapter': ['V', 's', 'X', 'o?', 'g'],
    'frontmatter': ['V'],
    'mainmatter': ['V'],
    'backmatter': ['V']
  };

  private '@mainmatter': boolean = true;
  protected g: Generator;

  constructor(generator: Generator, options?: any) {
    super(generator, options);
    this['@mainmatter'] = true;
  }

  chapter(s: boolean, toc?: any, ttl?: any): any[] {
    return [this.g.startsection('chapter', 0, s || !this['@mainmatter'], toc, ttl)];
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