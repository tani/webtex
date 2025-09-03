# Agent Guide

## Repository Architecture
- `src/` – TypeScript source files.
- `lib/` – helper scripts and templates used during build.
- `dist/` – generated output after running `npm run build`.
- `test/` – Mocha test suite; some tests rely on Puppeteer for screenshot comparisons.
- `bin/` – command line entry point produced during build.

## Setting up Puppeteer Dependencies
This project uses Puppeteer for screenshot-based tests. Ensure the following steps before running tests:
1. Install Node dependencies: `npm install`.
2. Install required system packages for Chromium:
   ```bash
   apt-get update
   apt-get install -y \
     libatk1.0-0 libatk-bridge2.0-0 libcups2 libdbus-1-3 \
     libgdk-pixbuf-2.0-0 libgtk-3-0 libnspr4 libnss3 \
     libxcomposite1 libxdamage1 libxrandr2 libxss1 \
     libpangocairo-1.0-0 libx11-xcb1 libxtst6 libxi6 libgbm1 \
     libasound2t64
   ```
3. Build the project: `npm run build`.
4. Run tests: `npm test`.

## Recommended Documentation
- [Project README](README.md) for usage and overview.
- [Puppeteer documentation](https://pptr.dev/) for browser automation.
- [Mocha documentation](https://mochajs.org/) for the test framework.
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) for language features.

