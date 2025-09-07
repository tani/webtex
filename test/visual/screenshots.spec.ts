import { describe, test } from "bun:test";
import "../lib/setup";
import fs from "node:fs";
import path from "node:path";
import { registerWindow, SVG } from "@svgdotjs/svg.js";
import slugify from "slugify";
import { document, HtmlGenerator, parse, window } from "../../dist/webtex";
import { type FixtureItem, load as loadFixture } from "../lib/load-fixtures";

function resetSvgIds() {
	const proto = HtmlGenerator.prototype as typeof HtmlGenerator.prototype & {
		SVG?: typeof SVG;
	};
	delete proto.SVG;
	proto.SVG = SVG;
	return registerWindow(window, document);
}

const hasScreenshot =
	typeof (globalThis as { takeScreenshot?: unknown }).takeScreenshot ===
	"function";

(hasScreenshot ? describe : describe.skip)("LaTeX.js screenshot tests", () => {
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
