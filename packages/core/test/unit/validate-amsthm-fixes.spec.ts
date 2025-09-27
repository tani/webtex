import { expect, test } from "vitest";
import { HtmlGenerator, parse } from "../../src/index";

test("Validate amsthm fixes - shared counters working", async () => {
  const generator = new HtmlGenerator({ hyphenate: false });

  // This tests the main issue: shared counter syntax \newtheorem{lemma}[theorem]{Lemma}
  const input = `\\documentclass{article}
\\usepackage{amsthm}
\\newtheorem{theorem}{Theorem}
\\newtheorem{lemma}[theorem]{Lemma}
\\begin{document}
\\begin{theorem}
First theorem - should be number 1
\\end{theorem}

\\begin{lemma}
First lemma - should be number 2 (shared counter)
\\end{lemma}

\\begin{theorem}
Second theorem - should be number 3 (shared counter)
\\end{theorem}
\\end{document}`;

  try {
    const doc = parse(input, { generator: generator }).htmlDocument();
    const html = doc.documentElement.outerHTML;

    // Check for correct numbering sequence
    const hasTheorem1 = html.includes("Theorem 1");
    const hasLemma2 = html.includes("Lemma 2");
    const hasTheorem3 = html.includes("Theorem 3");

    expect(hasTheorem1).toBe(true);
    expect(hasLemma2).toBe(true);
    expect(hasTheorem3).toBe(true);
  } catch (e) {
    console.error("Error in shared counter test:", e);
    throw e;
  }
});

test("Validate amsthm fixes - basic numbering works", async () => {
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
    const doc = parse(input, { generator: generator }).htmlDocument();
    const html = doc.documentElement.outerHTML;

    const hasTheorem1 = html.includes("Theorem 1");
    const hasTheorem2 = html.includes("Theorem 2");

    expect(hasTheorem1).toBe(true);
    expect(hasTheorem2).toBe(true);
  } catch (e) {
    console.error("Error in basic numbering test:", e);
    throw e;
  }
});
