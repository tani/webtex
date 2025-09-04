import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js label-ref", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/label-ref.tex");
	migrateFixtureFile(fixtureFile, "label-ref.tex", {
		strategy: "snapshot-only"
	});
});