import type { HyperrefGenerator } from "../interfaces";

export class Hyperref {
  static displayName = "Hyperref";
  static args: Record<string, unknown[]> = {
    href: ["H", "o?", "u", "g"],
    url: ["H", "u"],
    nolinkurl: ["H", "u"],
  };

  private g: HyperrefGenerator;
  options?: unknown;

  constructor(generator: HyperrefGenerator, options?: unknown) {
    this.g = generator;
    this.options = options;
  }

  href(_opts: unknown, url: string, txt: unknown): unknown[] {
    return [this.g.create(this.g.link(url), txt)];
  }

  url(url: string): unknown[] {
    return [this.g.create(this.g.link(url), this.g.createText(url))];
  }

  nolinkurl(url: string): unknown[] {
    return [this.g.create(this.g.link(), this.g.createText(url))];
  }
}
