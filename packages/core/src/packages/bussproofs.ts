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

  prooftree(content: unknown): unknown[] {
    const proofContent = typeof content === "string" ? content : "";
    const proof = `\\begin{prooftree}${proofContent}\\end{prooftree}`;
    const mathContent = this.g.parseMath(proof, true);
    return [mathContent];
  }
}
