import { describe } from "bun:test";
import path from "node:path";
import { migrateFixtureFile } from "./lib/fixture-snapshot-runner";

describe("LaTeX.js Parsing Tests", () => {
	// Core LaTeX features
	describe("Text Processing", () => {
		const fixtureFile = path.join(__dirname, "fixtures/text.tex");
		migrateFixtureFile(fixtureFile, "text.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Font Handling", () => {
		const fixtureFile = path.join(__dirname, "fixtures/fonts.tex");
		migrateFixtureFile(fixtureFile, "fonts.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Mathematical Expressions", () => {
		const fixtureFile = path.join(__dirname, "fixtures/math.tex");
		migrateFixtureFile(fixtureFile, "math.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Environments", () => {
		const fixtureFile = path.join(__dirname, "fixtures/environments.tex");
		migrateFixtureFile(fixtureFile, "environments.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Symbols", () => {
		const fixtureFile = path.join(__dirname, "fixtures/symbols.tex");
		migrateFixtureFile(fixtureFile, "symbols.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Boxes", () => {
		const fixtureFile = path.join(__dirname, "fixtures/boxes.tex");
		migrateFixtureFile(fixtureFile, "boxes.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("FBox with verb", () => {
		const fixtureFile = path.join(__dirname, "fixtures/fbox-verb.tex");
		migrateFixtureFile(fixtureFile, "fbox-verb.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Macros", () => {
		const fixtureFile = path.join(__dirname, "fixtures/macros.tex");
		migrateFixtureFile(fixtureFile, "macros.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Spacing", () => {
		const fixtureFile = path.join(__dirname, "fixtures/spacing.tex");
		migrateFixtureFile(fixtureFile, "spacing.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Sectioning", () => {
		const fixtureFile = path.join(__dirname, "fixtures/sectioning.tex");
		migrateFixtureFile(fixtureFile, "sectioning.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Groups", () => {
		const fixtureFile = path.join(__dirname, "fixtures/groups.tex");
		migrateFixtureFile(fixtureFile, "groups.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Counters", () => {
		const fixtureFile = path.join(__dirname, "fixtures/counters.tex");
		migrateFixtureFile(fixtureFile, "counters.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Label References", () => {
		const fixtureFile = path.join(__dirname, "fixtures/label-ref.tex");
		migrateFixtureFile(fixtureFile, "label-ref.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Layout & Margin Notes", () => {
		const fixtureFile = path.join(__dirname, "fixtures/layout-marginpar.tex");
		migrateFixtureFile(fixtureFile, "layout-marginpar.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Whitespace", () => {
		const fixtureFile = path.join(__dirname, "fixtures/whitespace.tex");
		migrateFixtureFile(fixtureFile, "whitespace.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Preamble", () => {
		const fixtureFile = path.join(__dirname, "fixtures/preamble.tex");
		migrateFixtureFile(fixtureFile, "preamble.tex", {
			strategy: "snapshot-only",
		});
	});

	describe("Picture Environment", () => {
		const fixtureFile = path.join(__dirname, "fixtures/picture.tex");
		migrateFixtureFile(fixtureFile, "picture.tex", {
			strategy: "snapshot-only",
		});
	});

	// Package tests
	describe("Packages", () => {
		describe("Hyperref", () => {
			const fixtureFile = path.join(
				__dirname,
				"fixtures/packages/hyperref.tex",
			);
			migrateFixtureFile(fixtureFile, "packages/hyperref.tex", {
				strategy: "snapshot-only",
			});
		});

		describe("XColor", () => {
			const fixtureFile = path.join(__dirname, "fixtures/packages/xcolor.tex");
			migrateFixtureFile(fixtureFile, "packages/xcolor.tex", {
				strategy: "snapshot-only",
			});
		});

		describe("Bussproofs", () => {
			const fixtureFile = path.join(
				__dirname,
				"fixtures/packages/bussproofs.tex",
			);
			migrateFixtureFile(fixtureFile, "packages/bussproofs.tex", {
				strategy: "snapshot-only",
			});
		});

		describe("Amsmath", () => {
			const fixtureFile = path.join(__dirname, "fixtures/packages/amsmath.tex");
			migrateFixtureFile(fixtureFile, "packages/amsmath.tex", {
				strategy: "snapshot-only",
			});
		});
	});
});
