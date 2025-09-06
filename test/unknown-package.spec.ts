import { createHTMLWindow } from "svgdom";
import { describe, expect, it, vi } from "vitest";
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
		const warnSpy = vi
			.spyOn(console, "warn")
			.mockImplementation((): void => {});
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
