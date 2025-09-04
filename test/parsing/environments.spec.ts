import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js environments", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/environments.tex");
	migrateFixtureFile(fixtureFile, "environments.tex", {
		strategy: "snapshot-only"
	});
});