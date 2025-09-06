import { describe, expect, it, spyOn } from "bun:test";
import { createHTMLWindow } from "svgdom";
import { HtmlGenerator, parse } from "../src/index.ts";

const window = createHTMLWindow();
(
	globalThis as unknown as {
		window: typeof window;
		document: Document;
	}
).window = window;
(
	globalThis as unknown as {
		window: typeof window;
		document: Document;
	}
).document = window.document;

describe("Unknown package handling", () => {
	it("warns and continues when package is missing", () => {
		const warnSpy = spyOn(console, "warn").mockImplementation((): void => {});
		const generator = new HtmlGenerator({ hyphenate: false });
		parse(
			"\\documentclass{article}\\usepackage{unknown}\\begin{document}\\end{document}",
			{ generator },
		);
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('package "unknown" not found'),
		);
		warnSpy.mockRestore();
	});
});

describe("Verbatim environment error handling", () => {
	it("throws error for mismatched verbatim environment delimiters", () => {
		const generator = new HtmlGenerator({ hyphenate: false });

		expect(() => {
			parse("\\begin{verbatim}content\\end{verbatim*}", { generator });
		}).toThrow("verbatim environment is missing its end delimiter");
	});

	it("throws error for mismatched starred verbatim environment delimiters", () => {
		const generator = new HtmlGenerator({ hyphenate: false });

		expect(() => {
			parse("\\begin{verbatim*}content\\end{verbatim}", { generator });
		}).toThrow("verbatim environment is missing its end delimiter");
	});
});
