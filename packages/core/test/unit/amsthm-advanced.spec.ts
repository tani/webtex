import { describe, expect, test } from "vitest";
import { HtmlGenerator, parse } from "../../src/index";

describe("amsthm advanced features", () => {
  const renderDocument = (latex: string) => {
    const generator = new HtmlGenerator({ hyphenate: false });
    return parse(latex, { generator }).htmlDocument();
  };

  test("\newtheorem defines custom environments with numbering", () => {
    const doc = renderDocument(`\\documentclass{article}
\\usepackage{amsthm}
\\newtheorem{claim}{Claim}
\\begin{document}
\\begin{claim}
Custom content
\\end{claim}
\\end{document}`);

    const claim = doc.querySelector(".amsthm-plain");
    expect(claim).not.toBeNull();

    const header = claim?.querySelector(".amsthm-plain-header");
    expect(header?.textContent).toContain("Claim 1.");
    expect((claim as Element | null)?.id).toBe("claim-1");
  });

  test("\\swapnumbers places the number before the theorem name", () => {
    const doc = renderDocument(`\\documentclass{article}
\\usepackage{amsthm}
\\swapnumbers
\\newtheorem{numfirst}{Number First}
\\begin{document}
\\begin{numfirst}
Number precedes the name
\\end{numfirst}
\\end{document}`);

    const env = doc.querySelector(".amsthm-plain");
    const header = env?.querySelector(".amsthm-plain-header");
    expect(header?.textContent?.trim()).toMatch(/^1 Number First\./);
  });

  test("custom theorem styles update punctuation and note formatting", () => {
    const doc = renderDocument(`\\documentclass{article}
\\usepackage{amsthm}
\\newtheoremstyle{colon}{0pt}{0pt}{\\normalfont}{}{\\bfseries}{:}{ }{}
\\theoremstyle{colon}
\\newtheorem{colonthm}{Lemma}
\\begin{document}
\\begin{colonthm}[Sketch]
Styled content
\\end{colonthm}
\\end{document}`);

    const env = doc.querySelector(".amsthm-colon");
    expect(env).not.toBeNull();

    const header = env?.querySelector(".amsthm-colon-header");
    expect(header?.textContent).toContain("Lemma 1 (Sketch):");
  });

  test("proof environments manage automatic and inline QED symbols", () => {
    const baseDoc = renderDocument(`\\documentclass{article}
\\usepackage{amsthm}
\\begin{document}
\\begin{proof}
The claim follows immediately.
\\end{proof}
\\end{document}`);

    const baseProof = baseDoc.querySelector(".amsthm-proof");
    const baseQeds = baseProof?.querySelectorAll(".amsthm-qed");
    expect(baseQeds?.length).toBe(1);
    const baseQedClass = baseQeds?.[0]?.getAttribute("class") ?? "";
    expect(baseQedClass).toContain("amsthm-qed-block");

    const inlineDoc = renderDocument(`\\documentclass{article}
\\usepackage{amsthm}
\\begin{document}
\\begin{proof}[Sketch]
The claim follows immediately. \\qedhere
\\end{proof}
\\end{document}`);

    const inlineProof = inlineDoc.querySelector(".amsthm-proof");
    const proofHeader = inlineProof?.querySelector(".amsthm-proof-header");
    expect(proofHeader?.textContent).toContain("Proof (Sketch).");

    const inlineQeds = inlineProof?.querySelectorAll(".amsthm-qed");
    expect(inlineQeds?.length).toBe(1);
    const inlineQedClass = inlineQeds?.[0]?.getAttribute("class") ?? "";
    expect(inlineQedClass).toContain("amsthm-qed-inline");
  });
});
