import type { PackageGenerator } from "../interfaces";

export interface BussproofsGenerator extends PackageGenerator {
  parseMath(math: string, display?: boolean): unknown;
}

export class Bussproofs {
  static displayName = "Bussproofs";
  static environments: Record<string, unknown[]> = {
    prooftree: ["HV"],
  };

  private g: BussproofsGenerator;

  constructor(generator: BussproofsGenerator, _options?: unknown) {
    this.g = generator;
  }

  private renderProoftree(content: string): unknown {
    const math = `\\begin{prooftree}${content}\\end{prooftree}`;
    return this.g.parseMath(math, true);
  }

  prooftree(content: unknown): unknown[] {
    const envContent = typeof content === "string" ? content : "";
    if (envContent.length === 0) {
      return [];
    }

    const node = this.renderProoftree(envContent);
    return node ? [node] : [];
  }
}

export default Bussproofs;
