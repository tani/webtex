import fs from "node:fs";
import path from "node:path";
import { registerWindow } from "@svgdotjs/svg.js";
import decache from "decache";
import he from "he";
import slugify from "slugify";
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

export function runFixture(fixture: any, name: string) {
	let _test: any = test;

	if (fixture.header?.charAt(0) === "!") {
		_test = test.skip;
		fixture.header = fixture.header.substr(1);
	} else if (fixture.header?.charAt(0) === "+") {
		_test = test.only;
		fixture.header = fixture.header.substr(1);
	}
	if (fixture.header?.charAt(0) === "s") {
		// Skip the 's' prefix - screenshot tests are handled separately
		fixture.header = fixture.header.substr(1);
	}
	_test(fixture.header || `fixture number ${fixture.id}`, async () => {
		resetSvgIds();
		let htmlIs: string;
		let htmlShould: string;

		try {
			const generator = parse(fixture.source, {
				generator: new HtmlGenerator({
					hyphenate: false,
				}),
			});
			const div = document.createElement("div");
			div.appendChild(generator.domFragment().cloneNode(true));
			htmlIs = div.innerHTML;
			htmlShould = fixture.result;
		} catch (e: any) {
			if (e.location) {
				e.message =
					e.message +
					" at line " +
					e.location.start.line +
					" (column " +
					e.location.start.column +
					"): " +
					fixture.source.split(/\r\n|\n|\r/)[e.location.start.line - 1];
			}
			throw e;
		}
		htmlIs = he.decode(htmlIs.replace(/\r\n|\n|\r/g, ""));
		htmlShould = he.decode(htmlShould.replace(/\r\n|\n|\r/g, ""));

		// Normalize SVG marker and clipPath IDs for consistent testing
		htmlIs = htmlIs.replace(/SvgjsMarker\d+/g, "SvgjsMarkerNORM");
		htmlShould = htmlShould.replace(/SvgjsMarker\d+/g, "SvgjsMarkerNORM");
		htmlIs = htmlIs.replace(/SvgjsClipPath\d+/g, "SvgjsClipPathNORM");
		htmlShould = htmlShould.replace(/SvgjsClipPath\d+/g, "SvgjsClipPathNORM");
		if (htmlIs !== htmlShould) {
			const filename = path.join(
				__dirname,
				"../html",
				slugify(`${name} ${fixture.header}`, {
					remove: /[*+~()'"!:@,{}\\]/g,
				}),
			);
			try {
				fs.mkdirSync(path.dirname(filename));
			} catch (_e) {}
			fs.writeFileSync(filename, htmlIs);
		}
		expect(htmlIs).toBe(htmlShould);
	});
	// Screenshot tests are now handled separately in test/visual/screenshots.spec.ts
}