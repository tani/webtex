import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../../lib/fixture-snapshot-runner";

describe("LaTeX.js xcolor package", () => {
	const fixtureFile = path.join(__dirname, "../../fixtures/packages/xcolor.tex");
	migrateFixtureFile(fixtureFile, "packages/xcolor.tex", {
		strategy: "snapshot-only"
	});
});