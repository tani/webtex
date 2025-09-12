import type { MulticolGenerator } from "../interfaces";

export class Multicol {
  static displayName = "Multicol";
  static args: Record<string, unknown[]> = {
    multicols: ["V", "n", "o?", "o?"],
  };

  private g: MulticolGenerator;
  options?: unknown;

  constructor(generator: MulticolGenerator, options?: unknown) {
    this.g = generator;
    this.options = options;
  }

  multicols(cols: number, pre?: unknown): unknown[] {
    return [pre, this.g.create(this.g.multicols(cols))];
  }
}
