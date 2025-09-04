import path from "node:path";
import { describe } from "vitest";
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js text parsing (migrated to snapshots)", () => {
	describe("Phase 1: Preserve original tests + add snapshots", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/text.tex");
		migrateFixtureFile(fixtureFile, "text.tex", {
			strategy: "preserve",
			nameSuffix: " (migrated)"
		});
	});
});