import fs from "node:fs";
import path from "node:path";
import { registerWindow } from "@svgdotjs/svg.js";
import decache from "decache";
import he from "he";
import slugify from "slugify";
import { createHTMLWindow } from "svgdom";
import { expect, test } from "vitest";
import { HtmlGenerator, parse } from "../../dist/latex";
import { load as loadFixture } from "./load-fixtures";

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

export interface MigrationOptions {
	/**
	 * Migration strategy for fixture tests
	 * - "preserve": Keep original assertions + add snapshots (default)
	 * - "snapshot-only": Replace assertions with snapshots only
	 * - "verify": Use snapshots for verification but keep assertions as backup
	 */
	strategy?: "preserve" | "snapshot-only" | "verify";
	
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

	/**
	 * Generate snapshots from existing fixture expected results
	 * This creates initial snapshots based on fixture.result instead of actual output
	 * Useful for initial migration to ensure continuity
	 */
	useFixtureAsSnapshot?: boolean;
}

/**
 * Migrated fixture runner that combines traditional fixture testing with snapshot testing
 * Provides multiple migration strategies to gradually move from fixtures to snapshots
 */
export function runMigratedFixture(fixture: any, name: string, options: MigrationOptions = {}) {
	const {
		strategy = "preserve",
		normalizeWhitespace = true,
		normalizeSvgIds = true,
		nameSuffix = "",
		useFixtureAsSnapshot = false
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

		// Normalize outputs for consistent comparisons
		let normalizedOutput = htmlOutput;
		let normalizedExpected = fixture.result;

		if (normalizeWhitespace) {
			normalizedOutput = he.decode(normalizedOutput.replace(/\r\n|\n|\r/g, ""));
			if (normalizedExpected) {
				normalizedExpected = he.decode(normalizedExpected.replace(/\r\n|\n|\r/g, ""));
			}
		}
		
		if (normalizeSvgIds) {
			// Normalize SVG marker and clipPath IDs for consistent testing
			normalizedOutput = normalizedOutput.replace(/SvgjsMarker\d+/g, "SvgjsMarkerNORM");
			normalizedOutput = normalizedOutput.replace(/SvgjsClipPath\d+/g, "SvgjsClipPathNORM");
			if (normalizedExpected) {
				normalizedExpected = normalizedExpected.replace(/SvgjsMarker\d+/g, "SvgjsMarkerNORM");
				normalizedExpected = normalizedExpected.replace(/SvgjsClipPath\d+/g, "SvgjsClipPathNORM");
			}
		}

		// Apply migration strategy
		switch (strategy) {
			case "preserve":
				// Keep original assertion + add snapshot for future migration
				if (fixture.result) {
					// Original fixture assertion
					expect(normalizedOutput).toBe(normalizedExpected);
				}
				// Add snapshot for future reference
				expect(normalizedOutput).toMatchSnapshot(
					`${name.replace(/[/.]/g, "_")}-${testName.replace(/[^a-zA-Z0-9]/g, "_")}.html`
				);
				break;

			case "snapshot-only":
				// Replace fixture assertion with snapshot only
				if (useFixtureAsSnapshot && fixture.result) {
					// Use fixture expected result as initial snapshot (migration helper)
					expect(normalizedExpected).toMatchSnapshot(
						`${name.replace(/[/.]/g, "_")}-${testName.replace(/[^a-zA-Z0-9]/g, "_")}.html`
					);
				} else {
					// Use actual output as snapshot
					expect(normalizedOutput).toMatchSnapshot(
						`${name.replace(/[/.]/g, "_")}-${testName.replace(/[^a-zA-Z0-9]/g, "_")}.html`
					);
				}
				break;

			case "verify":
				// Use snapshot as primary verification, fixture as backup
				try {
					expect(normalizedOutput).toMatchSnapshot(
						`${name.replace(/[/.]/g, "_")}-${testName.replace(/[^a-zA-Z0-9]/g, "_")}.html`
					);
				} catch (snapshotError) {
					// If snapshot fails, fall back to fixture assertion with detailed error
					if (fixture.result) {
						try {
							expect(normalizedOutput).toBe(normalizedExpected);
							// If fixture passes but snapshot fails, it means output changed
							throw new Error(`Snapshot verification failed but fixture assertion passed. Output may have changed intentionally. Update snapshots with: npm run test:update-snapshots`);
						} catch (fixtureError) {
							// Both failed, throw original snapshot error
							throw snapshotError;
						}
					} else {
						throw snapshotError;
					}
				}
				break;
		}

		// Legacy HTML file output (for debugging failed fixtures)
		if (strategy === "preserve" && fixture.result && normalizedOutput !== normalizedExpected) {
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
			fs.writeFileSync(filename, normalizedOutput);
		}
	});
}

/**
 * Batch migrate an entire fixture file to snapshot testing
 */
export function migrateFixtureFile(
	fixtureFilePath: string, 
	name: string, 
	options: MigrationOptions = {}
) {
	const fixtures = loadFixture(fixtureFilePath).fixtures;
	
	fixtures.forEach((fixture: any) => {
		runMigratedFixture(fixture, name, options);
	});
}