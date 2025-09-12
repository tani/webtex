import { test, expect } from "bun:test";
import { HtmlGenerator, parse } from "../src/index";

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
    
    console.log("Generated HTML for multiple theorem styles:");
    console.log(html);
    
    // Basic checks
    expect(html).toContain("Theorem");
    expect(html).toContain("Lemma");
    
    // Check for numbering issues
    const theoremMatch = html.match(/Theorem (\d+)/);
    const lemmaMatch = html.match(/Lemma (\d+)/);
    
    console.log("Theorem number:", theoremMatch?.[1]);
    console.log("Lemma number:", lemmaMatch?.[1]);
    
    if (theoremMatch && lemmaMatch) {
      console.log(`Theorem: ${theoremMatch[1]}, Lemma: ${lemmaMatch[1]}`);
      // If shared counter works correctly, lemma should be 2
      console.log("Expected: Theorem 1, Lemma 2 (shared counter)");
    }
    
  } catch (e) {
    console.error("Parse error:", e);
    throw e;
  }
});