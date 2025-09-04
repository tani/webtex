import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js sectioning", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/sectioning.tex");
	migrateFixtureFile(fixtureFile, "sectioning.tex", {
		strategy: "snapshot-only"
	});
});