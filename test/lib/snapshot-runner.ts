import { registerWindow } from "@svgdotjs/svg.js";
import decache from "decache";
import he from "he";
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

interface SnapshotOptions {
	/**
	 * Whether to normalize whitespace in snapshots
	 * @default true
	 */
	normalizeWhitespace?: boolean;
	
	/**
	 * Whether to normalize SVG IDs for consistent snapshots
	 * @default true
	 */
	normalizeSvgIds?: boolean;

	/**
	 * Custom snapshot name suffix
	 */
	nameSuffix?: string;
}

/**
 * Enhanced fixture runner with snapshot testing support
 * Provides both traditional assertion and snapshot verification
 */
export function runSnapshotFixture(fixture: any, name: string, options: SnapshotOptions = {}) {
	const {
		normalizeWhitespace = true,
		normalizeSvgIds = true,
		nameSuffix = ""
	} = options;

	let _test: any = test;

	// Handle test modifiers
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

	const testName = `${fixture.header || `fixture number ${fixture.id}`}${nameSuffix}`;
	
	_test(testName, async () => {
		resetSvgIds();
		let htmlOutput: string;

		try {
			const generator = parse(fixture.source, {
				generator: new HtmlGenerator({
					hyphenate: false,
				}),
			});
			const div = document.createElement("div");
			div.appendChild(generator.domFragment().cloneNode(true));
			htmlOutput = div.innerHTML;
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

		// Normalize output for consistent snapshots
		if (normalizeWhitespace) {
			htmlOutput = he.decode(htmlOutput.replace(/\r\n|\n|\r/g, ""));
		}
		
		if (normalizeSvgIds) {
			// Normalize SVG marker and clipPath IDs for consistent testing
			htmlOutput = htmlOutput.replace(/SvgjsMarker\d+/g, "SvgjsMarkerNORM");
			htmlOutput = htmlOutput.replace(/SvgjsClipPath\d+/g, "SvgjsClipPathNORM");
		}

		// Create snapshot with descriptive name
		expect(htmlOutput).toMatchSnapshot(`${name.replace(/[/.]/g, "_")}-${testName.replace(/[^a-zA-Z0-9]/g, "_")}.html`);
		
		// Also verify against expected result if available for regression testing
		if (fixture.result) {
			let expectedOutput = fixture.result;
			if (normalizeWhitespace) {
				expectedOutput = he.decode(expectedOutput.replace(/\r\n|\n|\r/g, ""));
			}
			if (normalizeSvgIds) {
				expectedOutput = expectedOutput.replace(/SvgjsMarker\d+/g, "SvgjsMarkerNORM");
				expectedOutput = expectedOutput.replace(/SvgjsClipPath\d+/g, "SvgjsClipPathNORM");
			}
			expect(htmlOutput).toBe(expectedOutput);
		}
	});
}

/**
 * Create snapshot test for LaTeX source without fixture format
 */
export function createLatexSnapshot(testName: string, latexSource: string, options: SnapshotOptions = {}) {
	const {
		normalizeWhitespace = true,
		normalizeSvgIds = true,
		nameSuffix = ""
	} = options;

	test(`${testName}${nameSuffix}`, async () => {
		resetSvgIds();
		let htmlOutput: string;

		const generator = parse(latexSource, {
			generator: new HtmlGenerator({
				hyphenate: false,
			}),
		});
		const div = document.createElement("div");
		div.appendChild(generator.domFragment().cloneNode(true));
		htmlOutput = div.innerHTML;

		// Normalize output
		if (normalizeWhitespace) {
			htmlOutput = he.decode(htmlOutput.replace(/\r\n|\n|\r/g, ""));
		}
		if (normalizeSvgIds) {
			htmlOutput = htmlOutput.replace(/SvgjsMarker\d+/g, "SvgjsMarkerNORM");
			htmlOutput = htmlOutput.replace(/SvgjsClipPath\d+/g, "SvgjsClipPathNORM");
		}

		expect(htmlOutput).toMatchSnapshot(`${testName.replace(/[^a-zA-Z0-9]/g, "_")}.html`);
	});
}

/**
 * Create document-level snapshot (full HTML document)
 */
export function createDocumentSnapshot(testName: string, latexSource: string, options: SnapshotOptions = {}) {
	const { nameSuffix = "" } = options;

	test(`${testName}${nameSuffix}`, async () => {
		resetSvgIds();
		
		const htmlDoc = parse(latexSource, {
			generator: new HtmlGenerator({
				hyphenate: false,
			}),
		}).htmlDocument();

		// Get the complete HTML document
		const fullHtml = htmlDoc.documentElement.outerHTML;
		
		expect(fullHtml).toMatchSnapshot(`${testName.replace(/[^a-zA-Z0-9]/g, "_")}_document.html`);
	});
}