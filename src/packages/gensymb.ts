import he from 'he';

interface Generator {
  // Basic generator interface for packages
}

export class Gensymb {
  static displayName = 'Gensymb';
  static args: Record<string, any[]> = {};

  static symbols = new Map([
    ['degree', he.decode('&deg;')], 
    ['celsius', '\u2103'], 
    ['perthousand', he.decode('&permil;')], 
    ['ohm', '\u2126'], 
    ['micro', he.decode('&mu;')]
  ]);

  private g: Generator;
  private options?: any;

  constructor(generator: Generator, options?: any) {
    this.g = generator;
    this.options = options;
  }
}