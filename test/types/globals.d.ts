import type { expect as vitestExpect, test as vitestTest } from "vitest";
import type { Browser } from "playwright";

declare global {
	var expect: typeof vitestExpect;
	var test: typeof vitestTest;
	var chrome: Browser;
	var firefox: Browser;
	var takeScreenshot: (html: string, filename: string) => Promise<void>;
}
