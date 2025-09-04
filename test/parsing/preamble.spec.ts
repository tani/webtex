import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js preamble", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/preamble.tex");
	migrateFixtureFile(fixtureFile, "preamble.tex", {
		strategy: "snapshot-only"
	});
});