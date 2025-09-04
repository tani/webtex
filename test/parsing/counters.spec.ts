import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js counters", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/counters.tex");
	migrateFixtureFile(fixtureFile, "counters.tex", {
		strategy: "snapshot-only"
	});
});