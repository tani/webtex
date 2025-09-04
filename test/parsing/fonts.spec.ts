import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js font handling", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/fonts.tex");
	migrateFixtureFile(fixtureFile, "fonts.tex", {
		strategy: "snapshot-only"
	});
});