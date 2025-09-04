import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js macros", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/macros.tex");
	migrateFixtureFile(fixtureFile, "macros.tex", {
		strategy: "snapshot-only"
	});
});