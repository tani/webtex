import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js mathematical expressions", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/math.tex");
	migrateFixtureFile(fixtureFile, "math.tex", {
		strategy: "snapshot-only"
	});
});