import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js groups", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/groups.tex");
	migrateFixtureFile(fixtureFile, "groups.tex", {
		strategy: "snapshot-only"
	});
});