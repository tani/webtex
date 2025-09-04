import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js text processing", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/text.tex");
	migrateFixtureFile(fixtureFile, "text.tex", {
		strategy: "snapshot-only"
	});
});