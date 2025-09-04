import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import pkg from "../../package.json";
import { create as cmd } from "../lib/cmd";

const binFile = path.resolve(pkg.bin[pkg.name]);
const latexjs = cmd(binFile);

// Helper to create and cleanup temp files
let tempFiles: Array<() => void> = [];

function createTempFile(
	content: string,
	postfix: string = ".tex",
): { name: string } {
	const fileName = path.join(
		tmpdir(),
		`snapshot-test-${randomUUID()}${postfix}`,
	);
	fs.writeFileSync(fileName, content);

	const cleanup = () => {
		try {
			if (fs.existsSync(fileName)) {
				fs.unlinkSync(fileName);
			}
		} catch (_error) {
			// Ignore cleanup errors
		}
	};

	tempFiles.push(cleanup);
	return { name: fileName };
}

afterEach(() => {
	// Clean up all temp files
	for (const cleanup of tempFiles) {
		cleanup();
	}
	tempFiles = [];
});

describe("LaTeX.js CLI Output Snapshots", () => {
	test("help output snapshot", async () => {
		const result = await latexjs.execute(["-h"]);
		expect(result.stdout).toMatchSnapshot("cli-help-output.txt");
	});

	test("version output snapshot", async () => {
		const result = await latexjs.execute(["-v"]);
		expect(result.stdout).toMatchSnapshot("cli-version-output.txt");
	});

	test("simple LaTeX compilation snapshot", async () => {
		const tmpFile = createTempFile("Hello \\LaTeX{} world!");
		const outputFile = createTempFile("", ".html");

		await latexjs.execute([tmpFile.name, "-o", outputFile.name]);
		const output = fs.readFileSync(outputFile.name, "utf8");

		// Normalize paths and timestamps that might vary
		const normalizedOutput = output
			.replace(/<!--.*?-->/g, "") // Remove comments that might contain timestamps
			.replace(/\s+/g, " ") // Normalize whitespace
			.trim();

		expect(normalizedOutput).toMatchSnapshot("simple-latex-compilation.html");
	});

	test("math LaTeX compilation snapshot", async () => {
		const mathContent = `
\\documentclass{article}
\\begin{document}
\\section{Math Examples}

Inline math: $E = mc^2$

Display math:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

More math: $\\sum_{n=1}^{10} n = 55$ and $\\frac{a}{b} = c$.

\\end{document}
		`.trim();

		const tmpFile = createTempFile(mathContent);
		const outputFile = createTempFile("", ".html");

		await latexjs.execute([tmpFile.name, "-o", outputFile.name]);
		const output = fs.readFileSync(outputFile.name, "utf8");

		// Normalize the output
		const normalizedOutput = output
			.replace(/<!--.*?-->/g, "")
			.replace(/\s+/g, " ")
			.trim();

		expect(normalizedOutput).toMatchSnapshot("math-latex-compilation.html");
	});

	test("complex document compilation snapshot", async () => {
		const complexContent = `
\\documentclass{article}

\\begin{document}

\\section{Introduction}
This is a \\textbf{comprehensive} test document with \\textit{various} formatting.

\\subsection{Lists}
\\begin{itemize}
\\item First item with $math = x^2$
\\item Second item
\\begin{enumerate}
\\item Nested numbered item
\\item Another nested item
\\end{enumerate}
\\item Final item
\\end{itemize}

\\subsection{Mathematical Content}
The quadratic formula is:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

\\section{Conclusion}
This demonstrates \\LaTeX{} compilation to HTML.

\\end{document}
		`.trim();

		const tmpFile = createTempFile(complexContent);
		const outputFile = createTempFile("", ".html");

		await latexjs.execute([tmpFile.name, "-o", outputFile.name]);
		const output = fs.readFileSync(outputFile.name, "utf8");

		// Normalize the output
		const normalizedOutput = output
			.replace(/<!--.*?-->/g, "")
			.replace(/\s+/g, " ")
			.trim();

		expect(normalizedOutput).toMatchSnapshot(
			"complex-document-compilation.html",
		);
	});

	describe("Error output snapshots", () => {
		test("macro error snapshot", async () => {
			const tmpFile = createTempFile("\\invalidcommand{test}");

			try {
				await latexjs.execute([tmpFile.name]);
				expect.fail("Should have thrown an error");
			} catch (result: any) {
				// Normalize file paths in error messages
				const normalizedError = result.stderr
					.replace(/\/[^\s]+\/([^/]+\.tex)/g, "/$1") // Remove full paths, keep filename
					.replace(/\d+ms/g, "Xms") // Normalize timing
					.trim();

				expect(normalizedError).toMatchSnapshot("macro-error-output.txt");
			}
		});

		test("syntax error snapshot", async () => {
			const tmpFile = createTempFile("This is text with { unmatched braces");

			try {
				await latexjs.execute([tmpFile.name]);
				expect.fail("Should have thrown an error");
			} catch (result: any) {
				const normalizedError = result.stderr
					.replace(/\/[^\s]+\/([^/]+\.tex)/g, "/$1")
					.replace(/\d+ms/g, "Xms")
					.trim();

				expect(normalizedError).toMatchSnapshot("syntax-error-output.txt");
			}
		});
	});
});
