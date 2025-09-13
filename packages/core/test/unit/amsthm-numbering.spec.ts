import { expect, test } from "vitest";
import { HtmlGenerator, parse } from "../../src/index";

test("Amsthm theorem numbering - basic sequential numbering", async () => {
  const generator = new HtmlGenerator({ hyphenate: false });

  const input = `
\\documentclass{article}
\\usepackage{amsthm}
\\begin{document}
\\newtheorem{theorem}{Theorem}
\\begin{theorem}
First theorem
\\end{theorem}
\\begin{theorem}
Second theorem
\\end{theorem}
\\begin{theorem}
Third theorem
\\end{theorem}
\\end{document}`;

  const doc = parse(input, { generator }).htmlDocument();
  const html = doc.documentElement.outerHTML;

  // Should have three theorems numbered 1, 2, 3
  expect(html).toContain("Theorem 1");
  expect(html).toContain("Theorem 2");
  expect(html).toContain("Theorem 3");
});

test("Amsthm theorem numbering - multiple environment types", async () => {
  const generator = new HtmlGenerator({ hyphenate: false });

  const input = `
\\documentclass{article}
\\usepackage{amsthm}
\\begin{document}
\\newtheorem{theorem}{Theorem}
\\newtheorem{lemma}{Lemma}
\\newtheorem{corollary}{Corollary}
\\begin{theorem}
First theorem
\\end{theorem}
\\begin{lemma}
First lemma
\\end{lemma}
\\begin{theorem}
Second theorem
\\end{theorem}
\\begin{corollary}
First corollary
\\end{corollary}
\\end{document}`;

  const doc = parse(input, { generator }).htmlDocument();
  const html = doc.documentElement.outerHTML;

  // Each environment should have its own counter
  expect(html).toContain("Theorem 1");
  expect(html).toContain("Lemma 1");
  expect(html).toContain("Theorem 2");
  expect(html).toContain("Corollary 1");
});

test("Amsthm theorem numbering - shared counters", async () => {
  const generator = new HtmlGenerator({ hyphenate: false });

  const input = `
\\documentclass{article}
\\usepackage{amsthm}
\\begin{document}
\\newtheorem{theorem}{Theorem}
\\newtheorem{lemma}[theorem]{Lemma}
\\newtheorem{corollary}[theorem]{Corollary}
\\begin{theorem}
First theorem
\\end{theorem}
\\begin{lemma}
First lemma (should be numbered 2)
\\end{lemma}
\\begin{theorem}
Second theorem (should be numbered 3)
\\end{theorem}
\\begin{corollary}
First corollary (should be numbered 4)
\\end{corollary}
\\end{document}`;

  const doc = parse(input, { generator }).htmlDocument();
  const html = doc.documentElement.outerHTML;

  // All should share the same counter sequence
  expect(html).toContain("Theorem 1");
  expect(html).toContain("Lemma 2");
  expect(html).toContain("Theorem 3");
  expect(html).toContain("Corollary 4");
});

test("Amsthm theorem numbering - hierarchical numbering with sections", async () => {
  const generator = new HtmlGenerator({ hyphenate: false });

  const input = `
\\documentclass{article}
\\usepackage{amsthm}
\\begin{document}
\\newtheorem{theorem}{Theorem}[section]
\\section{First Section}
\\begin{theorem}
First theorem in section 1
\\end{theorem}
\\begin{theorem}
Second theorem in section 1
\\end{theorem}
\\section{Second Section}
\\begin{theorem}
First theorem in section 2 (should reset to 1)
\\end{theorem}
\\end{document}`;

  const doc = parse(input, { generator }).htmlDocument();
  const html = doc.documentElement.outerHTML;

  // Should be numbered hierarchically: section.theorem
  expect(html).toContain("Theorem 1.1");
  expect(html).toContain("Theorem 1.2");
  expect(html).toContain("Theorem 2.1");
});

test("Amsthm theorem numbering - unnumbered theorems", async () => {
  const generator = new HtmlGenerator({ hyphenate: false });

  const input = `
\\documentclass{article}
\\usepackage{amsthm}
\\begin{document}
\\newtheorem{theorem}{Theorem}
\\newtheorem*{remark}{Theorem}
\\begin{theorem}
Numbered theorem
\\end{theorem}
\\begin{remark}
Unnumbered theorem
\\end{remark}
\\begin{theorem}
Another numbered theorem
\\end{theorem}
\\end{document}`;

  const doc = parse(input, { generator }).htmlDocument();
  const html = doc.documentElement.outerHTML;

  // Should have numbered and unnumbered versions
  expect(html).toContain("Theorem 1.");
  expect(html).toContain("Theorem."); // Unnumbered (remark with Theorem display name)
  expect(html).toContain("Theorem 2.");
});

test("Amsthm theorem numbering - with optional titles", async () => {
  const generator = new HtmlGenerator({ hyphenate: false });

  const input = `
\\documentclass{article}
\\usepackage{amsthm}
\\begin{document}
\\newtheorem{theorem}{Theorem}
\\begin{theorem}
Theorem without title
\\end{theorem}
\\begin{theorem}[Important Result]
Theorem with title
\\end{theorem}
\\end{document}`;

  const doc = parse(input, { generator }).htmlDocument();
  const html = doc.documentElement.outerHTML;

  expect(html).toContain("Theorem 1.");
  expect(html).toContain("Theorem 2 (Important Result).");
});

test("Amsthm proof environment", async () => {
  const generator = new HtmlGenerator({ hyphenate: false });

  const input = `
\\documentclass{article}
\\usepackage{amsthm}
\\begin{document}
\\begin{proof}
This is a proof.
\\end{proof}
\\begin{proof}[Proof of Main Theorem]
This is a proof with custom label.
\\end{proof}
\\end{document}`;

  const doc = parse(input, { generator }).htmlDocument();
  const html = doc.documentElement.outerHTML;

  expect(html).toContain("Proof.");
  expect(html).toContain("Proof of Main Theorem.");
});

test("Amsthm theorem styles", async () => {
  const generator = new HtmlGenerator({ hyphenate: false });

  const input = `
\\documentclass{article}
\\usepackage{amsthm}
\\begin{document}
\\theoremstyle{plain}
\\newtheorem{theorem}{Theorem}
\\theoremstyle{definition}
\\newtheorem{definition}{Definition}
\\theoremstyle{remark}
\\newtheorem{remark}{Remark}
\\begin{theorem}
Plain style theorem
\\end{theorem}
\\begin{definition}
Definition style
\\end{definition}
\\begin{remark}
Remark style
\\end{remark}
\\end{document}`;

  const doc = parse(input, { generator }).htmlDocument();
  const html = doc.documentElement.outerHTML;

  // Check that different styles are applied
  expect(html).toContain("amsthm-plain-header");
  expect(html).toContain("amsthm-definition-header");
  expect(html).toContain("amsthm-remark-header");
});
