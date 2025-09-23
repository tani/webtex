// Global takeScreenshot function using Playwright

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page,
} from "playwright";
import { afterAll } from "vitest";
import { inlineCss } from "../utils/render";

interface ScreenshotGlobal {
  takeScreenshot?: (html: string, filename: string) => Promise<void>;
}

const screenshotGlobal = globalThis as ScreenshotGlobal;
let browser: Browser | undefined;
let context: BrowserContext | undefined;
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

  if (!browser) {
    browser = await chromium.launch();
  }
  if (!context) {
    context = await browser.newContext();
  }
  if (!page) {
    page = await context.newPage();
  }

  // Set up the page with CSS and HTML
  const stylesheet = inlineCss ? `<style>${inlineCss}</style>` : "";
  const baseStyles = `
    <style>
      body {
        margin: 20px;
        font-family: 'Computer Modern', serif;
      }
    </style>
  `;
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      ${stylesheet}
      ${baseStyles}
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;

  await page.setContent(fullHtml, { waitUntil: "networkidle" });

  // Ensure directory exists
  mkdirSync(dirname(screenshotPath), { recursive: true });

  // Take screenshot
  await page.screenshot({ path: screenshotPath, fullPage: true });
};

afterAll(async () => {
  await page?.close();
  await context?.close();
  await browser?.close();
});
