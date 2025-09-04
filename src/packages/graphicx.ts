interface Generator {
  createImage(width: any, height: any, file: any): any;
}

export class Graphicx {
  static displayName = 'Graphicx';
  static args: Record<string, any[]> = {
    'rotatebox': ['H', 'kv?', 'n', 'hg'],
    'scalebox': ['H', 'n', 'n?', 'g'],
    'reflectbox': ['H', 'g'],
    'resizebox': ['H', 's', 'l', 'l', 'g'],
    'graphicspath': ['HV', 'gl'],
    'includegraphics': ['H', 's', 'kv?', 'kv?', 'k']
  };

  private g: Generator;
  private options?: any;

  constructor(generator: Generator, options?: any) {
    this.g = generator;
    this.options = options;
  }

  rotatebox(kvl: any, angle: any, text: any): any[] {
    return [];
  }

  scalebox(hsc: any, vsc?: any, text?: any): any[] {
    return [];
  }

  reflectbox(text: any): any[] {
    return this.scalebox(-1, 1, text);
  }

  resizebox(s: any, hl: any, vl: any, text: any): any[] {
    return [];
  }

  graphicspath(paths: any): any[] {
    return [];
  }

  includegraphics(s: any, kvl: any, kvl2: any, file: any): any[] {
    return [this.g.createImage(kvl.get("width"), kvl.get("height"), file)];
  }
}