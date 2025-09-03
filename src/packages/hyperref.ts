export class Hyperref {
  static displayName = 'Hyperref';
  static args: Record<string, any> = {};

  g: any;

  constructor(generator: any, options?: any[]) {
    this.g = generator;
  }

  href(opts: any, url: string, txt: any): any[] {
    return [this.g.create(this.g.link(url), txt)];
  }

  url(url: string): any[] {
    return [this.g.create(this.g.link(url), this.g.createText(url))];
  }

  nolinkurl(url: string): any[] {
    return [this.g.create(this.g.link(), this.g.createText(url))];
  }
}

// Set up args for the methods
Hyperref.args['href'] = ['H', 'o?', 'u', 'g'];
Hyperref.args['url'] = ['H', 'u'];
Hyperref.args['nolinkurl'] = ['H', 'u'];