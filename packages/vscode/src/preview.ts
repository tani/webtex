// Webview-side renderer: compiles LaTeX with WebTeX and posts errors to VS Code.
import morphdom from "morphdom";

// VS Code API declaration for webviews
interface VSCodeAPI {
  postMessage: (message: unknown) => void;
}

declare global {
  interface Window {
    __WebTeX?: {
      HtmlGenerator: new (options: {
        documentClass?: string;
      }) => {
        htmlDocumentString: () => string;
      };
      parse: (latex: string, options: { generator: unknown }) => void;
    };
  }
  function acquireVsCodeApi(): VSCodeAPI;
}

// Message types for communication with the extension
interface SetLatexMessage {
  type: "setLatex";
  text: string;
}

interface ScrollToLineMessage {
  type: "scrollToLine";
  line: number;
}

interface CompileSuccessMessage {
  type: "compileSuccess";
}

interface CompileErrorMessage {
  type: "compileError";
  error: {
    message?: string;
    location?: {
      start?: { line?: number; column?: number };
      end?: { line?: number; column?: number };
    };
  };
}

type IncomingMessage = SetLatexMessage | ScrollToLineMessage;

const vscode =
  typeof acquireVsCodeApi === "function" ? acquireVsCodeApi() : null;

function extractBodyContent(htmlDoc: string): string {
  const start = htmlDoc.search(/<body[^>]*>/i);
  const end = htmlDoc.search(/<\/body>/i);
  if (start >= 0 && end > start) {
    const afterStart = htmlDoc.indexOf(">", start) + 1;
    return htmlDoc.slice(afterStart, end);
  }
  return htmlDoc;
}

function extractRootStyle(htmlDoc: string): string {
  const htmlTagMatch = htmlDoc.match(/<html[^>]*>/i);
  if (!htmlTagMatch) return "";
  const tag = htmlTagMatch[0];
  const styleMatch = tag.match(/style=("([^"]*)"|'([^']*)')/i);
  if (!styleMatch) return "";
  const styleValue = styleMatch[2] || styleMatch[3] || "";
  return styleValue;
}

function updateHtml(html: string, rootStyle: string): void {
  const container = document.body;
  if (!container || typeof html !== "string") return;

  try {
    // Apply root styles if provided
    if (typeof rootStyle === "string" && rootStyle.length) {
      try {
        document.documentElement.style.cssText = rootStyle;
      } catch (_) {
        // Ignore style application errors
      }
    }

    // Create a temporary container with the new HTML
    const tempContainer = document.createElement("body");
    tempContainer.innerHTML = html;

    // Use morphdom to efficiently update the DOM
    // This preserves scroll position and only updates changed elements
    morphdom(container, tempContainer, {
      childrenOnly: true,
      onBeforeElUpdated: (fromEl, toEl) => {
        // Preserve scroll position for elements with scroll
        if (fromEl.scrollTop > 0) {
          (toEl as HTMLElement).scrollTop = fromEl.scrollTop;
        }
        if (fromEl.scrollLeft > 0) {
          (toEl as HTMLElement).scrollLeft = fromEl.scrollLeft;
        }
        return true;
      },
    });
  } catch (e) {
    console.error("Update HTML error:", e);
    // Fallback to innerHTML if morphdom fails
    container.innerHTML = html;
  }
}

function compileAndRender(latex: string): void {
  const api = window?.__WebTeX;
  if (!api) {
    console.error("WebTeX module is not loaded");
    return;
  }

  const { HtmlGenerator, parse } = api;

  try {
    const g = new HtmlGenerator({ documentClass: "article" });
    parse(latex, { generator: g });
    const full = g.htmlDocumentString();
    const body = extractBodyContent(full);
    const rootStyle = extractRootStyle(full);
    updateHtml(body, rootStyle);

    if (vscode) {
      const message: CompileSuccessMessage = { type: "compileSuccess" };
      vscode.postMessage(message);
    }
  } catch (err) {
    // Forward error details to the extension for diagnostics
    const error = err as { message?: string; location?: unknown };
    const payload: CompileErrorMessage = {
      type: "compileError",
      error: {
        message: error?.message
          ? String(error.message)
          : "WebTeX conversion error",
        location: error?.location as CompileErrorMessage["error"]["location"],
      },
    };
    if (vscode) {
      vscode.postMessage(payload);
    }
  }
}

function scrollToLine(line: number): void {
  // Try exact match first
  let target: Element | null = document.querySelector(
    `[data-source-line="${line}"]`,
  );

  if (!target) {
    // Simple fallback: pick the last element with data-source-line <= line
    let best: Element | null = null;
    let bestLine = -Infinity;
    const nodes = document.querySelectorAll("[data-source-line]");
    nodes.forEach((el: Element) => {
      const n = Number(el.getAttribute("data-source-line"));
      if (Number.isFinite(n) && n <= line && n > bestLine) {
        bestLine = n;
        best = el;
      }
    });
    target = best;
  }

  if (target && typeof target.scrollIntoView === "function") {
    target.scrollIntoView({ behavior: "instant", block: "center" });
  }
}

window.addEventListener("message", (event: MessageEvent) => {
  const msg = event?.data as IncomingMessage | undefined;
  if (!msg) return;

  if (msg.type === "setLatex" && typeof msg.text === "string") {
    compileAndRender(msg.text);
    return;
  }

  if (msg.type === "scrollToLine" && Number.isFinite(msg.line)) {
    scrollToLine(Number(msg.line));
  }
});
