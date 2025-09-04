import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js spacing", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/spacing.tex");
	migrateFixtureFile(fixtureFile, "spacing.tex", {
		strategy: "snapshot-only"
	});
});