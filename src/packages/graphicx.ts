export class Graphicx {
  static displayName = 'Graphicx';
  static args: Record<string, any> = {};

  g: any;

  constructor(generator: any, options?: any[]) {
    this.g = generator;
  }

  rotatebox(kvl: any, angle: any, text: any): void {}

  scalebox(hsc: number, vsc: number, text: any): void {}

  reflectbox(text: any): any {
    return this.scalebox(-1, 1, text);
  }

  resizebox(s: any, hl: any, vl: any, text: any): void {}

  graphicspath(paths: any[]): void {}

  includegraphics(s: any, kvl: any, kvl2: any, file: string): any[] {
    return [this.g.createImage(kvl.get("width"), kvl.get("height"), file)];
  }
}

// Set up args for the methods
Graphicx.args['rotatebox'] = ['H', 'kv?', 'n', 'hg'];
Graphicx.args['scalebox'] = ['H', 'n', 'n?', 'g'];
Graphicx.args['reflectbox'] = ['H', 'g'];
Graphicx.args['resizebox'] = ['H', 's', 'l', 'l', 'g'];
Graphicx.args['graphicspath'] = ['HV', 'gl'];
Graphicx.args['includegraphics'] = ['H', 's', 'kv?', 'kv?', 'k'];