import { registerWindow, SVG } from "@svgdotjs/svg.js";
import { expect, test } from "vitest";
import {
  document,
  HtmlGenerator,
  parse,
  window,
} from "../../dist/node/index.js";

function resetSvgIds() {
  const proto = HtmlGenerator.prototype as typeof HtmlGenerator.prototype & {
    SVG?: typeof SVG;
  };
  Reflect.deleteProperty(proto, "SVG");
  proto.SVG = SVG;
  const win = window as unknown as Window & typeof globalThis;
  const doc = document as unknown as Document;
  return registerWindow(win, doc);
}

/**
 * Create a snapshot test for LaTeX content
 */
export function createLatexSnapshot(name: string, latex: string) {
  test(name, () => {
    resetSvgIds();
    const generator = new HtmlGenerator({ hyphenate: false });
    const doc = parse(latex, { generator });
    const fragment = doc.domFragment() as unknown as DocumentFragment;
    const html = (fragment as unknown as { innerHTML: string }).innerHTML;
    expect(html).toMatchSnapshot();
  });
}

/**
 * Create a snapshot test for a complete LaTeX document
 */
export function createDocumentSnapshot(name: string, latex: string) {
  test(name, () => {
    resetSvgIds();
    const generator = new HtmlGenerator({ hyphenate: false });
    const doc = parse(latex, { generator });
    doc.domFragment(); // Trigger rendering
    const htmlDocument = generator.htmlDocument() as unknown as Document;
    const html = htmlDocument.documentElement.outerHTML;
    expect(html).toMatchSnapshot();
  });
}
