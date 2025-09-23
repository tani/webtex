import { describe, expect, test } from "vitest";
import { loadLatexCodeCases } from "../utils/latex-code-loader";
import { renderLatexToHtml } from "../utils/render";

const allCases = loadLatexCodeCases();
const renderableCases = allCases.filter((testCase) => !testCase.allowFailure);

const groupByCategory = new Map<string, typeof renderableCases>();

for (const testCase of renderableCases) {
  const category = testCase.groups[1] ?? "misc";
  if (!groupByCategory.has(category)) {
    groupByCategory.set(category, []);
  }
  groupByCategory.get(category)?.push(testCase);
}

for (const [category, cases] of groupByCategory) {
  describe(`latex_code.yml html snapshots (${category})`, () => {
    cases.forEach((testCase) => {
      test(`[${testCase.id}] ${testCase.name}`, () => {
        const html = renderLatexToHtml(testCase.latex);
        expect(html).toMatchSnapshot();
      });
    });
  });
}

if (renderableCases.length === 0) {
  describe.skip("latex_code.yml html snapshots", () => {
    test("no cases available", () => {
      expect.fail("Expected latex_code.yml to provide at least one test case");
    });
  });
}
