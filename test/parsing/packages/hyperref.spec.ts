import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../../lib/fixture-snapshot-runner";

describe("LaTeX.js hyperref package", () => {
	const fixtureFile = path.join(__dirname, "../../fixtures/packages/hyperref.tex");
	migrateFixtureFile(fixtureFile, "packages/hyperref.tex", {
		strategy: "snapshot-only"
	});
});