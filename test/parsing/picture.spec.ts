import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js picture", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/picture.tex");
	migrateFixtureFile(fixtureFile, "picture.tex", {
		strategy: "snapshot-only"
	});
});