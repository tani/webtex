interface Generator {
  // Basic generator interface for packages
}

export class Echo {
  static displayName = 'Echo';
  static args: Record<string, any[]> = {
    'gobbleO': ['H', 'o?'],
    'echoO': ['H', 'o?'],
    'echoOGO': ['H', 'o?', 'g', 'o?'],
    'echoGOG': ['H', 'g', 'o?', 'g']
  };

  private g: Generator;
  private options?: any;

  constructor(generator: Generator, options?: any) {
    this.g = generator;
    this.options = options;
  }

  gobbleO(): any[] {
    return [];
  }

  echoO(o?: any): any[] {
    return ["-", o, "-"];
  }

  echoOGO(o1?: any, g?: any, o2?: any): any[] {
    const result: any[] = [];
    if (o1) {
      result.push("-", o1, "-");
    }
    result.push("+", g, "+");
    if (o2) {
      result.push("-", o2, "-");
    }
    return result;
  }

  echoGOG(g1: any, o?: any, g2?: any): any[] {
    const result = ["+", g1, "+"];
    if (o) {
      result.push("-", o, "-");
    }
    result.push("+", g2, "+");
    return result;
  }
}