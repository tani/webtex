export class Multicol {
  static displayName = 'Multicol';
  static args: Record<string, any> = {};

  g: any;

  constructor(generator: any, options?: any[]) {
    this.g = generator;
  }

  multicols(cols: number, pre?: any): any[] {
    return [pre, this.g.create(this.g.multicols(cols))];
  }
}

// Set up args for the methods
Multicol.args['multicols'] = ['V', 'n', 'o?', 'o?'];