import he from 'he';

export class Gensymb {
  static displayName = 'Gensymb';
  static args: Record<string, any> = {};
  static symbols = new Map([
    ['degree', he.decode('&deg;')], ['celsius', '\u2103'], 
    ['perthousand', he.decode('&permil;')], ['ohm', '\u2126'], 
    ['micro', he.decode('&mu;')]
  ]);

  g: any;

  constructor(generator: any, options?: any[]) {
    this.g = generator;
  }
}