import { describe, expect, it, vi } from "vitest";
import { document, HtmlGenerator, parse, window } from "../src/index.ts";

void window;
void document;

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
