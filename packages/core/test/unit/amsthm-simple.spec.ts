import { expect, test } from "vitest";
import { HtmlGenerator, parse } from "../../src/index";

test("Simple amsthm test - basic theorem", async () => {
  const generator = new HtmlGenerator({ hyphenate: false });

  const input = `\\documentclass{article}
\\usepackage{amsthm}
\\newtheorem{theorem}{Theorem}
\\begin{document}
\\begin{theorem}
First theorem
\\end{theorem}
\\end{document}`;

  try {
    const doc = parse(input, { generator }).htmlDocument();
    const html = doc.documentElement.outerHTML;

    // Should contain theorem text
    expect(html).toContain("First theorem");
  } catch (e) {
    console.error("Parse error:", e);
    throw e;
  }
});

test("Simple amsthm test - check number counter", async () => {
  const generator = new HtmlGenerator({ hyphenate: false });

  const input = `\\documentclass{article}
\\usepackage{amsthm}
\\newtheorem{theorem}{Theorem}
\\begin{document}
\\begin{theorem}
First theorem
\\end{theorem}
\\begin{theorem}
Second theorem
\\end{theorem}
\\end{document}`;

  try {
    const doc = parse(input, { generator }).htmlDocument();
    const html = doc.documentElement.outerHTML;

    // Check for theorem numbering
    const hasFirstNumber = html.includes("Theorem 1") || html.includes("1.");
    const hasSecondNumber = html.includes("Theorem 2") || html.includes("2.");

    if (!hasFirstNumber && !hasSecondNumber) {
      console.error("No theorem numbering found in HTML");
    }

    expect(hasFirstNumber || hasSecondNumber).toBe(true);
  } catch (e) {
    console.error("Parse error:", e);
    throw e;
  }
});
