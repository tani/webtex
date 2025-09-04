import { describe } from "vitest";
import {
	createDocumentSnapshot,
	createLatexSnapshot,
} from "../lib/snapshot-runner";

describe("LaTeX.js Core Features Snapshots", () => {
	describe("Basic Text Processing", () => {
		createLatexSnapshot(
			"simple paragraph",
			"This is a simple paragraph with some text.",
		);

		createLatexSnapshot(
			"multiple paragraphs",
			`First paragraph with text.

Second paragraph after blank line.

Third paragraph here.`,
		);

		createLatexSnapshot(
			"line breaks",
			"First line\\\\Second line\\newline Third line\\par Fourth paragraph.",
		);
	});

	describe("Text Formatting", () => {
		createLatexSnapshot(
			"font commands",
			"\\textbf{Bold text} and \\textit{italic text} and \\texttt{monospace}.",
		);

		createLatexSnapshot(
			"emphasis nesting",
			"Normal \\emph{emphasized \\emph{double emphasized} text} here.",
		);

		createLatexSnapshot(
			"font sizes",
			"\\tiny{tiny} \\small{small} \\normalsize{normal} \\large{large} \\Large{Large} \\huge{huge}",
		);
	});

	describe("Mathematical Expressions", () => {
		createLatexSnapshot(
			"inline math",
			"The equation $E = mc^2$ is famous, and so is $\\pi \\approx 3.14$.",
		);

		createLatexSnapshot(
			"display math",
			"$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$",
		);

		createLatexSnapshot(
			"math symbols",
			"$\\alpha + \\beta = \\gamma$, $\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$",
		);
	});

	describe("Lists and Environments", () => {
		createLatexSnapshot(
			"itemize list",
			`\\begin{itemize}
\\item First item
\\item Second item with \\textbf{bold}
\\item Third item
\\end{itemize}`,
		);

		createLatexSnapshot(
			"enumerate list",
			`\\begin{enumerate}
\\item Numbered item
\\item Another numbered item
\\item Final numbered item
\\end{enumerate}`,
		);

		createLatexSnapshot(
			"nested lists",
			`\\begin{itemize}
\\item Outer item 1
\\begin{enumerate}
\\item Inner numbered 1
\\item Inner numbered 2
\\end{enumerate}
\\item Outer item 2
\\end{itemize}`,
		);

		createLatexSnapshot(
			"description list",
			`\\begin{description}
\\item[Term 1] Definition of first term
\\item[Term 2] Definition of second term  
\\item[\\textbf{Bold Term}] Definition with formatting
\\end{description}`,
		);
	});

	describe("Special Characters and Symbols", () => {
		createLatexSnapshot(
			"special chars",
			"Special: \\$ \\& \\% \\# \\{ \\} \\_ \\textbackslash",
		);

		createLatexSnapshot(
			"accents and international",
			"Caf\\'e, na\\\"ive, Sch\\\"on, r\\'esum\\'e",
		);

		createLatexSnapshot(
			"tex symbols",
			"\\LaTeX{} and \\TeX{} symbols, also \\copyright{} and \\textregistered{}",
		);
	});

	describe("Document Structure", () => {
		createLatexSnapshot(
			"section headers",
			`\\section{Main Section}
Some content here.

\\subsection{Subsection}
More content here.

\\subsubsection{Sub-subsection}
Final content.`,
		);

		createLatexSnapshot(
			"quotes",
			`\\begin{quote}
This is a block quote with some text.
\\end{quote}`,
		);
	});

	describe("Full Document Snapshots", () => {
		createDocumentSnapshot(
			"complete article",
			`\\documentclass{article}
\\begin{document}

\\section{Introduction}
This is a complete document with \\textbf{formatting} and $math = equations$.

\\begin{itemize}
\\item List item 1
\\item List item 2  
\\end{itemize}

\\end{document}`,
		);

		createDocumentSnapshot(
			"math heavy document",
			`\\documentclass{article}
\\begin{document}
\\section{Mathematics}

Inline math: $\\alpha + \\beta = \\gamma$

Display math:
$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$

More equations: $E = mc^2$ and $F = ma$.
\\end{document}`,
		);
	});
});
