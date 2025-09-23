import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerWindow, SVG } from "@svgdotjs/svg.js";
import {
  document,
  HtmlGenerator,
  parse,
  window,
} from "../../dist/node/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "../../../..");
const cssDirectory = path.resolve(repoRoot, "packages/core/dist/css");

const defaultPackages = `\\usepackage{amsmath}
\\usepackage{amsthm}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{graphicx}
\\usepackage{bussproofs}
\\usepackage{minted}
`;

const stripDocumentclass = (latex: string): string =>
  latex.replace(/\\documentclass[^\n]*\n?/g, "");

const wrapLatex = (latex: string): string => {
  const beginIndex = latex.indexOf("\\begin{document}");
  const endIndex = latex.lastIndexOf("\\end{document}");
  const docclassMatch = latex.match(/\\documentclass[^\n]*/);
  const docclassLine = docclassMatch?.[0] ?? "\\documentclass{article}";

  if (beginIndex !== -1 && endIndex !== -1 && endIndex > beginIndex) {
    let preambleContent = stripDocumentclass(latex.slice(0, beginIndex));
    const bodyPrelude: string[] = [];

    const moveToBodyPatterns: RegExp[] = [
      /\\newtheorem\*?\{[^}]+\}[^\n]*\n?/g,
      /\\theoremstyle\{[^}]+\}\n?/g,
      /\\numberwithin\{[^}]+\}\{[^}]+\}\n?/g,
    ];

    moveToBodyPatterns.forEach((pattern) => {
      preambleContent = preambleContent.replace(pattern, (match) => {
        bodyPrelude.push(match.trim());
        return "\n";
      });
    });

    const packageLines: string[] = [];

    preambleContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .forEach((line) => {
        if (line.length === 0 || line.startsWith("%")) {
          return;
        }
        packageLines.push(line);
      });

    const bodyContent = latex.slice(
      beginIndex + "\\begin{document}".length,
      endIndex,
    );

    const mergedBodySource = `${bodyPrelude.join("\n")}
${bodyContent}`;
    const mergedBody = mergedBodySource.trim();
    const extraPackages =
      packageLines.length > 0 ? `${packageLines.join("\n")}\n` : "";
    const prefix = `${docclassLine}\n${defaultPackages}${extraPackages}`;

    return `${prefix}\\begin{document}
${mergedBody}
\\end{document}`;
  }

  if (/\\documentclass/.test(latex)) {
    const withoutDocclass = stripDocumentclass(latex).trim();
    return `${docclassLine}\n${defaultPackages}\\begin{document}
${withoutDocclass}
\\end{document}`;
  }

  if (/\\begin\{document\}/.test(latex)) {
    return `${docclassLine}\n${defaultPackages}${latex}`;
  }

  return `${docclassLine}\n${defaultPackages}\\begin{document}
${latex}
\\end{document}`;
};

const resetSvgIds = (): void => {
  const prototype =
    HtmlGenerator.prototype as typeof HtmlGenerator.prototype & {
      SVG?: typeof SVG;
    };
  delete prototype.SVG;
  prototype.SVG = SVG;
  registerWindow(window, document);
};

const loadCssBundle = (): string | undefined => {
  try {
    const entries = readdirSync(cssDirectory, { withFileTypes: true });
    const cssFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
      .map((entry) => entry.name)
      .sort();

    if (cssFiles.length === 0) {
      return undefined;
    }

    return cssFiles
      .map((fileName) =>
        readFileSync(path.join(cssDirectory, fileName), "utf8"),
      )
      .join("\n");
  } catch (error) {
    if (error instanceof Error) {
      console.warn(
        `Unable to read CSS bundle for screenshot tests: ${error.message}`,
      );
    }
    return undefined;
  }
};

export const inlineCss = loadCssBundle();

export const renderLatexToHtml = (latex: string): string => {
  resetSvgIds();
  const normalized = wrapLatex(latex);
  if (process.env.DEBUG_LATEX_RENDER === "1") {
    console.warn("[latex-code] normalized latex:\n", normalized);
  }
  const generator = new HtmlGenerator({ hyphenate: false });
  const doc = parse(normalized, { generator });
  const fragment = doc.domFragment();
  const htmlDoc = generator.htmlDocument();
  if (process.env.DEBUG_LATEX_RENDER === "1") {
    console.warn("[latex-code] fragment children:", fragment.childNodes.length);
    fragment.childNodes.forEach((node) => {
      const serialized =
        "outerHTML" in node && typeof node.outerHTML === "string"
          ? node.outerHTML
          : node.textContent;
      console.warn("[latex-code] child:", serialized);
    });
  }
  const body = htmlDoc.querySelector(".body");
  if (body) {
    const imported = Array.from(fragment.childNodes).map((node) =>
      node.cloneNode(true),
    );

    const replacement: Node[] = [];
    imported.forEach((node) => {
      if (node.nodeType === 1) {
        const element = node as Node & {
          getAttribute?: (name: string) => string | null;
          childNodes: NodeListOf<Node>;
        };
        const classAttr = element.getAttribute?.("class") ?? "";
        const hasBodyClass = classAttr.split(/\s+/).includes("body");
        if (hasBodyClass) {
          Array.from(element.childNodes).forEach((child) => {
            replacement.push(child.cloneNode(true));
          });
          return;
        }
      }
      replacement.push(node.cloneNode(true));
    });

    body.replaceChildren(...replacement);
  }
  return htmlDoc.documentElement.outerHTML;
};

export const renderLatexToStandaloneHtml = (latex: string): string => {
  const raw = renderLatexToHtml(latex).replace(/<link[^>]*>/g, "");
  if (!inlineCss) {
    return raw;
  }
  const stylesheetTag = `<style>${inlineCss}</style>`;
  if (raw.includes("</head>")) {
    return raw.replace("</head>", `${stylesheetTag}</head>`);
  }
  return `<head>${stylesheetTag}</head>${raw}`;
};
