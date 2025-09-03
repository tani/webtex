export class Echo {
  static displayName = 'Echo';
  static args: Record<string, any> = {};

  g: any;

  constructor(generator: any, options?: any[]) {
    this.g = generator;
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
    const result: any[] = ["+", g1, "+"];
    if (o) {
      result.push("-", o, "-");
    }
    result.push("+", g2, "+");
    return result;
  }
}

// Set up args for the methods
Echo.args.gobbleO = ['H', 'o?'];
Echo.args.echoO = ['H', 'o?'];
Echo.args.echoOGO = ['H', 'o?', 'g', 'o?'];
Echo.args.echoGOG = ['H', 'g', 'o?', 'g'];