import path from "node:path";
import { describe } from "vitest";
import { load as loadFixture } from "../lib/load-fixtures";
import { runFixture } from "../lib/fixture-runner";

describe("LaTeX.js spacing parsing", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/spacing.tex");
	loadFixture(fixtureFile).fixtures.forEach((fixture: any) => {
		runFixture(fixture, "spacing.tex");
	});
});