import { expect, test } from "bun:test";
import { registerWindow, SVG } from "@svgdotjs/svg.js";
import { createHTMLWindow } from "svgdom";
import { HtmlGenerator, parse } from "../../dist/webtex";

// Set up DOM for Node.js environment
const window = createHTMLWindow() as Window & typeof globalThis;
const globalWithDom = globalThis as typeof globalThis & {
	window: Window & typeof globalThis;
	document: Document;
};
globalWithDom.window = window;
globalWithDom.document = window.document;

function resetSvgIds() {
	const proto = HtmlGenerator.prototype as typeof HtmlGenerator.prototype & {
		SVG?: typeof SVG;
	};
	delete proto.SVG;
	proto.SVG = SVG;
	return registerWindow(window, document);
}

/**
 * Create a snapshot test for LaTeX content
 */
export function createLatexSnapshot(name: string, latex: string) {
	test(name, () => {
		resetSvgIds();
		const generator = new HtmlGenerator({ hyphenate: false });
		const doc = parse(latex, { generator });
		const html = doc.domFragment().innerHTML;
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
		const html = generator.htmlDocument().documentElement.outerHTML;
		expect(html).toMatchSnapshot();
	});
}
