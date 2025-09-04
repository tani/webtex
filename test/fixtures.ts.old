import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { registerWindow } from "@svgdotjs/svg.js";
import decache from "decache";
import he from "he";
import slugify from "slugify";
import { createHTMLWindow } from "svgdom";
import { describe, expect, test } from "vitest";
import { HtmlGenerator, parse } from "../dist/latex";
import { load as loadFixture } from "./lib/load-fixtures";

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

const subdirs: string[] = [];

describe("LaTeX.js fixtures", () => {
	const fixturesPath = path.join(__dirname, "fixtures");
	fs.readdirSync(fixturesPath).forEach((name) => {
		const fixtureFile = path.join(fixturesPath, name);
		const stat = fs.statSync(fixtureFile);
		if (stat.isDirectory()) {
			subdirs.push(name);
			return;
		}
		describe(name, () => {
			loadFixture(fixtureFile).fixtures.forEach((fixture: any) => {
				runFixture(fixture, name);
			});
		});
	});
	subdirs.forEach((dir) => {
		describe(dir, () => {
			fs.readdirSync(path.join(fixturesPath, dir)).forEach((name) => {
				describe(name, () => {
					const fixtureFile = path.join(fixturesPath, dir, name);
					loadFixture(fixtureFile).fixtures.forEach((fixture: any) => {
						runFixture(fixture, `${dir} - ${name}`);
					});
				});
			});
		});
	});
});

function runFixture(fixture: any, name: string) {
	let _test: any = test;
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
				"html",
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
	if (screenshot) {
		_test("   - screenshot", async () => {
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
				"screenshots",
				slugify(`${name} ${fixture.header}`, {
					remove: /[*+~()'"!:@,{}\\]/g,
				}),
			);
			await takeScreenshot(htmlDoc.documentElement.outerHTML, filename);
		});
	}
}

function _latexScreenshot(source: string, filename: string) {
	const child = spawn(path.join(__dirname, "latex2png.sh"), [
		`${filename}.latex.png`,
	]);
	let _stdout = "";
	let stderr = "";
	child.stdout.on("data", (data) => {
		_stdout += data.toString();
	});
	child.stderr.on("data", (data) => {
		stderr += data.toString();
	});
	child.on("exit", (code, _signal) => {
		if (code !== 0) {
			console.warn(`latex screenshot failed: ${code}`);
			return console.log(`#### std err output: ${stderr}`);
		}
	});
	child.on("error", (err) => {
		child.removeAllListeners("exit");
		return console.warn(`latex screenshot failed: ${err}`);
	});
	child.stdin.write(source);
	return child.stdin.end();
}
