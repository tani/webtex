import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page,
} from "playwright";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { loadLatexCodeCases } from "../utils/latex-code-loader";
import { renderLatexToStandaloneHtml } from "../utils/render";

const allCases = loadLatexCodeCases();
const visualCases = allCases.filter((testCase) => !testCase.allowFailure);

let browser: Browser | undefined;
let context: BrowserContext | undefined;
let page: Page | undefined;

const viewport = {
  width: 1024,
  height: 768,
} as const;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baselineDirectory = path.resolve(__dirname, "latex-code");
// Small tolerance keeps visual regressions stable across Linux and macOS renders.
const pixelmatchThreshold = 0.1;
const maxPixelDifferenceRatio = 0.001;

const shouldUpdateSnapshots = (): boolean => {
  const state = expect.getState();
  const snapshotState = state.snapshotState as unknown;
  if (
    snapshotState &&
    typeof snapshotState === "object" &&
    "_updateSnapshot" in snapshotState &&
    typeof (snapshotState as { _updateSnapshot: unknown })._updateSnapshot ===
      "string"
  ) {
    return (
      (snapshotState as { _updateSnapshot: string })._updateSnapshot !== "none"
    );
  }
  const mode = process.env.VITEST_UPDATE_SNAPSHOT;
  if (!mode) {
    return false;
  }
  return mode !== "none" && mode !== "0" && mode.toLowerCase() !== "false";
};

beforeAll(async () => {
  browser = await chromium.launch();
  context = await browser.newContext({ viewport });
  page = await context.newPage();
  if (shouldUpdateSnapshots()) {
    await fs.mkdir(baselineDirectory, { recursive: true });
  }
});

afterAll(async () => {
  await page?.close();
  await context?.close();
  await browser?.close();
});

const groupByCategory = new Map<string, typeof visualCases>();
for (const testCase of visualCases) {
  const category = testCase.groups[1] ?? "misc";
  if (!groupByCategory.has(category)) {
    groupByCategory.set(category, []);
  }
  groupByCategory.get(category)?.push(testCase);
}

for (const [category, cases] of groupByCategory) {
  describe(`latex_code.yml visual regression (${category})`, () => {
    cases.forEach((testCase) => {
      test(`[${testCase.id}] ${testCase.name}`, async () => {
        if (!page) {
          throw new Error("Playwright page not initialized");
        }
        const html = renderLatexToStandaloneHtml(testCase.latex);
        await page.setContent(html, { waitUntil: "networkidle" });
        await page.waitForTimeout(50);
        const screenshot = await page.screenshot({
          type: "png",
          fullPage: true,
        });
        const baselinePath = path.join(baselineDirectory, `${testCase.id}.png`);
        const updateSnapshots = shouldUpdateSnapshots();
        let baseline: Buffer | undefined;
        try {
          baseline = await fs.readFile(baselinePath);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            throw error;
          }
        }

        if (updateSnapshots || !baseline) {
          await fs.mkdir(baselineDirectory, { recursive: true });
          await fs.writeFile(baselinePath, screenshot);
          expect(screenshot.length).toBeGreaterThan(0);
          return;
        }

        const baselinePng = PNG.sync.read(baseline);
        const screenshotPng = PNG.sync.read(screenshot);

        expect(baselinePng.width).toBe(screenshotPng.width);
        expect(baselinePng.height).toBe(screenshotPng.height);

        const diffPixelCount = pixelmatch(
          baselinePng.data,
          screenshotPng.data,
          undefined,
          baselinePng.width,
          baselinePng.height,
          {
            threshold: pixelmatchThreshold,
            includeAA: true,
          },
        );
        const pixelCount = baselinePng.width * baselinePng.height;
        expect(pixelCount).toBeGreaterThan(0);
        const diffRatio = diffPixelCount / pixelCount;

        expect(diffRatio).toBeLessThanOrEqual(maxPixelDifferenceRatio);
      }, 30_000);
    });
  });
}

if (visualCases.length === 0) {
  describe.skip("latex_code.yml visual regression", () => {
    test("no cases available", () => {
      expect.fail("Expected latex_code.yml to provide at least one test case");
    });
  });
}
