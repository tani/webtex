import { registerWindow } from "@svgdotjs/svg.js";
import decache from "decache";
import { createHTMLWindow } from "svgdom";
import { expect, test } from "vitest";
import { HtmlGenerator, parse } from "../../dist/latex";

// Set up DOM for Node.js environment
const window = createHTMLWindow();
(global as any).window = window;
(global as any).document = window.document;

function resetSvgIds() {
	decache("@svgdotjs/svg.js");
	delete (HtmlGenerator.prototype as any).SVG;
	(HtmlGenerator.prototype as any).SVG = require("@svgdotjs/svg.js").SVG;
	return registerWindow(window as any, document as any);
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
