import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js layout-marginpar", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/layout-marginpar.tex");
	migrateFixtureFile(fixtureFile, "layout-marginpar.tex", {
		strategy: "snapshot-only"
	});
});