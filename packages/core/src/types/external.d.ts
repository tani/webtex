declare module "hyphenation.en-us" {
  const patterns: unknown;
  export default patterns;
}

declare module "hypher" {
  export default class Hypher {
    constructor(patterns: unknown);
    hyphenate(word: string): string[];
    hyphenateText(text: string): string;
    patterns: unknown;
  }
}

declare module "svgdom" {
  export function createHTMLWindow(title?: string): Window & typeof globalThis;
}

declare module "mathjax/adaptors/liteDOM.js";
declare module "xyjax/build/xypic.js";
declare module "mathjax/tex-svg-full.js";
