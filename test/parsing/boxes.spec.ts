import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js boxes", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/boxes.tex");
	migrateFixtureFile(fixtureFile, "boxes.tex", {
		strategy: "snapshot-only"
	});
});