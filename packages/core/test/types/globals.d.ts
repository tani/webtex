import type { expect as bunExpect, test as bunTest } from "bun:test";
import type { Browser } from "playwright";

declare global {
  var expect: typeof bunExpect;
  var test: typeof bunTest;
  var chrome: Browser;
  var firefox: Browser;
  var takeScreenshot: (html: string, filename: string) => Promise<void>;
}
