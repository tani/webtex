import { describe, expect, test } from "vitest";
import { HtmlGenerator, parse } from "../../src/index";

const renderDocument = (latex: string): string => {
  const generator = new HtmlGenerator({ hyphenate: false });
  const document = parse(latex, { generator }).htmlDocument();
  return document.documentElement.outerHTML;
};

describe("minted package", () => {
  test("renders highlighted code block", () => {
    const html = renderDocument(`\\documentclass{article}
\\usepackage{minted}
\\begin{document}
\\begin{minted}{javascript}
const answer = 42;
console.log(answer);
\\end{minted}
\\end{document}`);

    expect(html).toMatchSnapshot();
    expect(html).toContain("shiki");
    expect(html).toContain("minted-block");
  });

  test("applies line numbers when requested", () => {
    const html = renderDocument(`\\documentclass{article}
\\usepackage{minted}
\\begin{document}
\\begin{minted}[linenos,theme=github-light]{python}
def greet(name):
    print(f"Hello, {name}!")

if __name__ == "__main__":
    greet("WebTeX")
\\end{minted}
\\end{document}`);

    expect(html).toMatchSnapshot();
    expect(html).toContain("data-line-number");
    expect(html).toContain("minted-with-line-numbers");
  });
});
