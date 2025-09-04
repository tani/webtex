import path from "node:path";
import { describe } from "vitest";
import { load as loadFixture } from "../lib/load-fixtures";
import { runFixture } from "../lib/fixture-runner";

describe("LaTeX.js layout-marginpar parsing", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/layout-marginpar.tex");
	loadFixture(fixtureFile).fixtures.forEach((fixture: any) => {
		runFixture(fixture, "layout-marginpar.tex");
	});
});