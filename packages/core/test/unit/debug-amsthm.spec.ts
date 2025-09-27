import { expect, test } from "vitest";
import { HtmlGenerator, parse } from "../../src/index";

test("Debug amsthm - multiple theorem styles from fixture", async () => {
  const generator = new HtmlGenerator({ hyphenate: false });

  // This is copied from the amsthm.tex fixture
  const input = `\\documentclass{article}
\\usepackage{amsthm}
\\theoremstyle{plain}
\\newtheorem{theorem}{Theorem}
\\newtheorem{lemma}[theorem]{Lemma}

\\theoremstyle{definition}
\\newtheorem{definition}{Definition}
\\newtheorem{example}{Example}

\\theoremstyle{remark}
\\newtheorem{remark}{Remark}

\\begin{document}
\\begin{theorem}
This is a theorem in plain style.
\\end{theorem}

\\begin{lemma}
This is a lemma sharing the theorem counter.
\\end{lemma}

\\begin{definition}
This is a definition in definition style.
\\end{definition}

\\begin{example}
This is an example in definition style.
\\end{example}

\\begin{remark}
This is a remark in remark style.
\\end{remark}
\\end{document}`;

  try {
    const doc = parse(input, { generator }).htmlDocument();
    const html = doc.documentElement.outerHTML;

    // Basic checks
    expect(html).toContain("Theorem");
    expect(html).toContain("Lemma");

    // Check for numbering issues
    const theoremMatch = html.match(/Theorem (\d+)/);
    const lemmaMatch = html.match(/Lemma (\d+)/);

    expect(theoremMatch).not.toBeNull();
    expect(lemmaMatch).not.toBeNull();

    if (theoremMatch && lemmaMatch) {
      // If shared counter works correctly, theorem should be 1 and lemma should be 2
      expect(theoremMatch[1]).toBe("1");
      expect(lemmaMatch[1]).toBe("2");
    }
  } catch (e) {
    console.error("Parse error:", e);
    throw e;
  }
});
