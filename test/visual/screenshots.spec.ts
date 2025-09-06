import fs from "node:fs";
import path from "node:path";
import { registerWindow, SVG } from "@svgdotjs/svg.js";
import decache from "decache";
import slugify from "slugify";
import { createHTMLWindow } from "svgdom";
import { describe, test } from "vitest";
import { HtmlGenerator, parse } from "../../dist/webtex";
import { type FixtureItem, load as loadFixture } from "../lib/load-fixtures";

// Set up DOM for Node.js environment
const window = createHTMLWindow() as Window & typeof globalThis;
const globalWithDom = globalThis as typeof globalThis & {
	window: Window & typeof globalThis;
	document: Document;
};
globalWithDom.window = window;
globalWithDom.document = window.document;

function resetSvgIds() {
	decache("@svgdotjs/svg.js");
	const proto = HtmlGenerator.prototype as typeof HtmlGenerator.prototype & {
		SVG?: typeof SVG;
	};
	delete proto.SVG;
	proto.SVG = SVG;
	return registerWindow(window, document);
}

describe("LaTeX.js screenshot tests", () => {
	const fixturesPath = path.join(__dirname, "../fixtures");
	const subdirs: string[] = [];

	// Process main fixture files
	fs.readdirSync(fixturesPath).forEach((name) => {
		const fixtureFile = path.join(fixturesPath, name);
		const stat = fs.statSync(fixtureFile);
		if (stat.isDirectory()) {
			subdirs.push(name);
			return;
		}
		const fixtures = loadFixture(fixtureFile).fixtures;
		const screenshotFixtures = fixtures.filter(
			(f) => f.header?.charAt(0) === "s",
		);
		if (screenshotFixtures.length > 0) {
			describe(name, () => {
				fixtures.forEach((fixture) => {
					runScreenshotTest(fixture, name);
				});
			});
		}
	});

	// Process subdirectories
	subdirs.forEach((dir) => {
		const dirFixtures: Array<{ name: string; fixtures: FixtureItem[] }> = [];
		fs.readdirSync(path.join(fixturesPath, dir)).forEach((name) => {
			const fixtureFile = path.join(fixturesPath, dir, name);
			const fixtures = loadFixture(fixtureFile).fixtures;
			const screenshotFixtures = fixtures.filter(
				(f) => f.header?.charAt(0) === "s",
			);
			if (screenshotFixtures.length > 0) {
				dirFixtures.push({ name, fixtures });
			}
		});

		if (dirFixtures.length > 0) {
			describe(dir, () => {
				dirFixtures.forEach(({ name, fixtures }) => {
					describe(name, () => {
						fixtures.forEach((fixture) => {
							runScreenshotTest(fixture, `${dir} - ${name}`);
						});
					});
				});
			});
		}
	});
});

function runScreenshotTest(fixture: FixtureItem, name: string) {
	let _test: typeof test = test;
	let screenshot = false;

	if (fixture.header?.charAt(0) === "!") {
		_test = test.skip;
		fixture.header = fixture.header.substr(1);
	} else if (fixture.header?.charAt(0) === "+") {
		_test = test.only;
		fixture.header = fixture.header.substr(1);
	}
	if (fixture.header?.charAt(0) === "s") {
		screenshot = true;
		fixture.header = fixture.header.substr(1);
	}

	// Only create screenshot tests
	if (screenshot) {
		_test(
			`${fixture.header || `fixture number ${fixture.id}`} - screenshot`,
			async () => {
				resetSvgIds();
				const htmlDoc = parse(fixture.source, {
					generator: new HtmlGenerator({
						hyphenate: false,
					}),
				}).htmlDocument();
				const favicon = document.createElement("link");
				favicon.rel = "icon";
				favicon.href = "data:;base64,iVBORw0KGgo=";
				htmlDoc.head.appendChild(favicon);
				const filename = path.join(
					__dirname,
					"../screenshots",
					slugify(`${name} ${fixture.header}`, {
						remove: /[*+~()'"!:@,{}\\]/g,
					}),
				);
				await takeScreenshot(htmlDoc.documentElement.outerHTML, filename);
			},
		);
	}
}
