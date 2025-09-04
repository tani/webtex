import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js symbols", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/symbols.tex");
	migrateFixtureFile(fixtureFile, "symbols.tex", {
		strategy: "snapshot-only"
	});
});