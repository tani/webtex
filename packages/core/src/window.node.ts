import { createHTMLWindow } from "svgdom";

const window = createHTMLWindow();
const document = window.document;

interface GlobalWithDOM {
  window: typeof window;
  document: typeof document;
}

const globalScope = globalThis as typeof globalThis & GlobalWithDOM;
globalScope.window = window;
globalScope.document = document;

export { window, document };
