// Global takeScreenshot function using Playwright

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "playwright";

(globalThis as any).takeScreenshot = async (html: string, filename: string) => {
	// Add .png extension if not present
	const screenshotPath = filename.endsWith(".png")
		? filename
		: `${filename}.png`;
	console.log(`Taking screenshot for: ${screenshotPath}`);

	const browser = await chromium.launch();
	const page = await browser.newPage();

	// Set up the page with CSS and HTML
	const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css">
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

	await browser.close();
};
