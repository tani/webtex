// Global takeScreenshot function using Playwright

import { afterAll } from "bun:test";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { type Browser, chromium, type Page } from "playwright";

interface ScreenshotGlobal {
  takeScreenshot?: (html: string, filename: string) => Promise<void>;
}

const screenshotGlobal = globalThis as ScreenshotGlobal;
let browser: Browser | undefined;
let page: Page | undefined;

screenshotGlobal.takeScreenshot = async (
  html: string,
  filename: string,
): Promise<void> => {
  // Add .png extension if not present
  const screenshotPath = filename.endsWith(".png")
    ? filename
    : `${filename}.png`;
  console.log(`Taking screenshot for: ${screenshotPath}`);

  if (!browser || !page) {
    browser = await chromium.launch();
    page = await browser.newPage();
  }

  // Set up the page with CSS and HTML
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 20px; font-family: 'Computer Modern', serif; }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;

  await page.setContent(fullHtml);

  // Ensure directory exists
  mkdirSync(dirname(screenshotPath), { recursive: true });

  // Take screenshot
  await page.screenshot({ path: screenshotPath, fullPage: true });
};

afterAll(async () => {
  await browser?.close();
});
