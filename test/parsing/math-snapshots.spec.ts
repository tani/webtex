import path from "node:path";
import { describe } from "vitest";
import { load as loadFixture } from "../lib/load-fixtures";
import { runSnapshotFixture, createLatexSnapshot } from "../lib/snapshot-runner";

describe("LaTeX.js math parsing with snapshots", () => {
	describe("Fixture-based snapshot tests", () => {
		const fixtureFile = path.join(__dirname, "../fixtures/math.tex");
		loadFixture(fixtureFile).fixtures.forEach((fixture: any) => {
			runSnapshotFixture(fixture, "math.tex", { nameSuffix: " (snapshot)" });
		});
	});

	describe("Additional math snapshot tests", () => {
		createLatexSnapshot(
			"complex fractions",
			"$\\frac{\\frac{a}{b}}{\\frac{c}{d}} = \\frac{a \\cdot d}{b \\cdot c}$"
		);

		createLatexSnapshot(
			"matrix notation",
			"$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$"
		);

		createLatexSnapshot(
			"summation and limits",
			"$\\sum_{k=0}^{n} \\binom{n}{k} x^k = (1+x)^n$"
		);

		createLatexSnapshot(
			"integrals with bounds",
			"$\\int_0^1 \\int_0^1 x^2 + y^2 \\, dx \\, dy$"
		);

		createLatexSnapshot(
			"greek letters and operators",
			"$\\alpha \\beta \\gamma \\Delta \\nabla \\partial \\infty \\pm \\times \\div$"
		);

		createLatexSnapshot(
			"subscripts and superscripts",
			"$x_1^2 + x_2^2 + \\cdots + x_n^2 = ||\\mathbf{x}||^2$"
		);

		createLatexSnapshot(
			"roots and powers",
			"$\\sqrt{x^2 + y^2} = \\sqrt[3]{x^3 + y^3 + z^3}$"
		);
	});
});