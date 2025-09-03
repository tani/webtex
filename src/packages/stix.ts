import he from 'he';

export class Stix {
  static displayName = 'Stix';
  static args: Record<string, any> = {};
  static symbols = new Map([
    ['checkmark', he.decode('&check;')]
  ]);

  g: any;

  constructor(generator: any, options?: any[]) {
    this.g = generator;
    
    // Define KaTeX symbols in constructor to match original behavior
    generator.KaTeX.__defineSymbol("math", "main", "textord", "\u2664", "\\varspadesuit", true);
    generator.KaTeX.__defineSymbol("math", "main", "textord", "\u2665", "\\varheartsuit", true);
    generator.KaTeX.__defineSymbol("math", "main", "textord", "\u2666", "\\vardiamondsuit", true);
    generator.KaTeX.__defineSymbol("math", "main", "textord", "\u2667", "\\varclubsuit", true);
  }
}