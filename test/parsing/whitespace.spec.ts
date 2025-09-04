import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js whitespace", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/whitespace.tex");
	migrateFixtureFile(fixtureFile, "whitespace.tex", {
		strategy: "snapshot-only"
	});
});