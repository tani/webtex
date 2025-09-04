import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js All Parsing Tests (Migrated to Snapshots)", () => {
	
	describe("Text Processing", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/text.tex");
		migrateFixtureFile(fixtureFile, "text.tex", {
			strategy: "snapshot-only",  // Full migration to snapshots
			nameSuffix: " (snapshot)"
		});
	});

	describe("Font Handling", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/fonts.tex");
		migrateFixtureFile(fixtureFile, "fonts.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Mathematical Expressions", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/math.tex");
		migrateFixtureFile(fixtureFile, "math.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Environments", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/environments.tex");
		migrateFixtureFile(fixtureFile, "environments.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Symbols", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/symbols.tex");
		migrateFixtureFile(fixtureFile, "symbols.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Boxes", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/boxes.tex");
		migrateFixtureFile(fixtureFile, "boxes.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Macros", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/macros.tex");
		migrateFixtureFile(fixtureFile, "macros.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Spacing", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/spacing.tex");
		migrateFixtureFile(fixtureFile, "spacing.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Sectioning", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/sectioning.tex");
		migrateFixtureFile(fixtureFile, "sectioning.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Groups", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/groups.tex");
		migrateFixtureFile(fixtureFile, "groups.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Counters", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/counters.tex");
		migrateFixtureFile(fixtureFile, "counters.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Label References", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/label-ref.tex");
		migrateFixtureFile(fixtureFile, "label-ref.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Layout and Margin", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/layout-marginpar.tex");
		migrateFixtureFile(fixtureFile, "layout-marginpar.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Whitespace", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/whitespace.tex");
		migrateFixtureFile(fixtureFile, "whitespace.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Preamble", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/preamble.tex");
		migrateFixtureFile(fixtureFile, "preamble.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Picture Environment", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/picture.tex");
		migrateFixtureFile(fixtureFile, "picture.tex", {
			strategy: "snapshot-only",
			nameSuffix: " (snapshot)"
		});
	});

	describe("Packages", () => {
		describe("Hyperref Package", () => {
			const fixtureFile = path.join(__dirname, "../fixtures/packages/hyperref.tex");
			migrateFixtureFile(fixtureFile, "packages/hyperref.tex", {
				strategy: "snapshot-only",
				nameSuffix: " (snapshot)"
			});
		});

		describe("XColor Package", () => {
			const fixtureFile = path.join(__dirname, "../fixtures/packages/xcolor.tex");
			migrateFixtureFile(fixtureFile, "packages/xcolor.tex", {
				strategy: "snapshot-only",
				nameSuffix: " (snapshot)"
			});
		});
	});
});