import type { PackageGenerator } from "../interfaces";

export interface AmsmathGenerator extends PackageGenerator {
  parseMath(math: string, display?: boolean): unknown;
}

export class Amsmath {
  static displayName = "Amsmath";
  static environments: Record<string, unknown[]> = {
    align: ["HV"],
    "align*": ["HV"],
    gather: ["HV"],
    "gather*": ["HV"],
    equation: ["HV"],
    "equation*": ["HV"],
    multline: ["HV"],
    "multline*": ["HV"],
    eqnarray: ["HV"],
  };

  private g: AmsmathGenerator;

  constructor(generator: AmsmathGenerator, _options?: unknown) {
    this.g = generator;
  }

  private parseEnvironment(env: string, content: unknown): unknown[] {
    const envContent = typeof content === "string" ? content : "";
    const math = `\\begin{${env}}${envContent}\\end{${env}}`;
    const mathNode = this.g.parseMath(math, true);
    return [mathNode];
  }

  align(content: unknown): unknown[] {
    return this.parseEnvironment("align", content);
  }

  "align*"(content: unknown): unknown[] {
    return this.parseEnvironment("align*", content);
  }

  gather(content: unknown): unknown[] {
    return this.parseEnvironment("gather", content);
  }

  "gather*"(content: unknown): unknown[] {
    return this.parseEnvironment("gather*", content);
  }

  equation(content: unknown): unknown[] {
    return this.parseEnvironment("equation", content);
  }

  "equation*"(content: unknown): unknown[] {
    return this.parseEnvironment("equation*", content);
  }

  multline(content: unknown): unknown[] {
    return this.parseEnvironment("multline", content);
  }

  "multline*"(content: unknown): unknown[] {
    return this.parseEnvironment("multline*", content);
  }

  eqnarray(content: unknown): unknown[] {
    return this.parseEnvironment("eqnarray", content);
  }
}
