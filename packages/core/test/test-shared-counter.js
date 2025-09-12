// Test shared counter functionality directly using the API like the node.js test
import { HtmlGenerator, parse } from "../dist/webtex.node.js";

const input = `\\documentclass{article}
\\usepackage{amsthm}

\\theoremstyle{plain}
\\newtheorem{theorem}{Theorem}
\\newtheorem{lemma}[theorem]{Lemma}

\\begin{document}
\\begin{theorem}
This is a theorem in plain style.
\\end{theorem}

\\begin{lemma}
This is a lemma sharing the theorem counter.
\\end{lemma}

\\begin{theorem}
This is another theorem.
\\end{theorem}
\\end{document}`;

console.log("Testing shared counter functionality...");

try {
  const generator = new HtmlGenerator({ hyphenate: false });
  const doc = parse(input, { generator }).htmlDocument();
  const html = doc.documentElement.outerHTML;

  console.log("Generated HTML:");
  console.log(html);

  // Check for correct numbering
  const theoremMatches = html.match(/Theorem (\d+)/g);
  const lemmaMatches = html.match(/Lemma (\d+)/g);

  console.log("\nFound theorem numbers:", theoremMatches);
  console.log("Found lemma numbers:", lemmaMatches);

  if (theoremMatches && lemmaMatches) {
    console.log("\n✅ SUCCESS: Found theorem and lemma numbering");
    if (
      html.includes("Theorem 1") &&
      html.includes("Lemma 2") &&
      html.includes("Theorem 3")
    ) {
      console.log(
        "✅ PERFECT: Shared counter working correctly - Theorem 1, Lemma 2, Theorem 3",
      );
    } else {
      console.log(
        "⚠️  PARTIAL: Basic numbering works but shared counter might have issues",
      );
    }
  } else {
    console.log("❌ ISSUE: Missing theorem or lemma numbering");
  }
} catch (e) {
  console.error("❌ ERROR:", e);
  process.exit(1);
}
