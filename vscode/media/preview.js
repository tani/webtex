// Webview-side renderer: compiles LaTeX with WebTeX and posts errors to VS Code.
const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

function extractBodyContent(htmlDoc) {
  const start = htmlDoc.search(/<body[^>]*>/i);
  const end = htmlDoc.search(/<\/body>/i);
  if (start >= 0 && end > start) {
    const afterStart = htmlDoc.indexOf('>', start) + 1;
    return htmlDoc.slice(afterStart, end);
  }
  return htmlDoc;
}

function extractRootStyle(htmlDoc) {
  const htmlTagMatch = htmlDoc.match(/<html[^>]*>/i);
  if (!htmlTagMatch) return '';
  const tag = htmlTagMatch[0];
  const styleMatch = tag.match(/style=("([^"]*)"|'([^']*)')/i);
  if (!styleMatch) return '';
  const styleValue = styleMatch[2] || styleMatch[3] || '';
  return styleValue;
}

function updateHtml(html, rootStyle) {
  const container = document.body;
  if (!container || typeof html !== 'string') return;
  try {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    if (typeof rootStyle === 'string' && rootStyle.length) {
      try { document.documentElement.style.cssText = rootStyle; } catch (_) {}
    }
    container.innerHTML = html;
    if (typeof window.scrollTo === 'function') window.scrollTo(scrollX, scrollY);
  } catch (e) {
    console.error('Update HTML error:', e);
  }
}

function compileAndRender(latex) {
  const api = (typeof window !== 'undefined' && window.__WebTeX) ? window.__WebTeX : null;
  if (!api) {
    console.error('WebTeX module is not loaded');
    return;
  }
  const { HtmlGenerator, parse } = api;
  try {
    const g = new HtmlGenerator({ documentClass: 'article' });
    parse(latex, { generator: g });
    const full = g.htmlDocumentString();
    const body = extractBodyContent(full);
    const rootStyle = extractRootStyle(full);
    updateHtml(body, rootStyle);
    if (vscode) vscode.postMessage({ type: 'compileSuccess' });
  } catch (err) {
    // Forward error details to the extension for diagnostics
    const payload = {
      type: 'compileError',
      error: {
        message: (err && err.message) ? String(err.message) : 'WebTeX conversion error',
        location: err && err.location ? err.location : undefined
      }
    };
    if (vscode) vscode.postMessage(payload);
  }
}

function scrollToLine(line) {
  // Try exact match first
  let target = document.querySelector('[data-source-line="' + line + '"]');
  if (!target) {
    // Simple fallback: pick the last element with data-source-line <= line
    let best = null;
    let bestLine = -Infinity;
    const nodes = document.querySelectorAll('[data-source-line]');
    nodes.forEach((el) => {
      const n = Number(el.getAttribute('data-source-line'));
      if (Number.isFinite(n) && n <= line && n > bestLine) {
        bestLine = n;
        best = el;
      }
    });
    target = best;
  }
  if (target && typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ behavior: 'instant', block: 'center' });
  }
}

window.addEventListener('message', (event) => {
  const msg = event && event.data ? event.data : {};
  if (msg.type === 'setLatex' && typeof msg.text === 'string') {
    compileAndRender(msg.text);
    return;
  }
  if (msg.type === 'scrollToLine' && Number.isFinite(msg.line)) {
    scrollToLine(Number(msg.line));
  }
});
