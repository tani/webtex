import * as he from "he";

import type { StixGenerator } from "../interfaces";

export class Stix {
  static displayName = "Stix";
  static args: Record<string, unknown[]> = {};

  static symbols = new Map([["checkmark", he.decode("&check;")]]);

  g: StixGenerator;
  options?: unknown;

  constructor(generator: StixGenerator, options?: unknown) {
    this.g = generator;
    this.options = options;
  }
}
