# LaTeX.js - Claude Code Configuration

This file contains configuration and context for Claude Code to work effectively with the LaTeX.js project.

## Project Overview

LaTeX.js is a JavaScript LaTeX to HTML5 translator that converts LaTeX documents into HTML while preserving formatting and mathematical expressions.

## Key Scripts

- `npm run build` - Clean build of the entire project
- `npm run build:check` - Build only if dist/ doesn't exist
- `npm run test` - Run all tests (includes prebuild check)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:*` - Specific test suites (api, cli, parsing, integration, visual, screenshots)
- `npm run lint` - Run Biome linting
- `npm run typecheck` - TypeScript type checking

## Test Commands and Build Dependencies

All test commands automatically check and build the project if needed via pretest hooks:
- Tests require the `dist/` directory to exist
- Use `build:check` for efficient rebuilds (only when needed)
- The main build process handles TypeScript compilation, asset copying, and PegJS grammar generation

## Important Notes

- Must avoid using `any` type. Use `unknown` type
- Intensively use `interface` rather than class
- Consider to use `<T>` type parameter for similar types
- Before commit, run `npm typecheck`, `npm run build`, `npm test`, and `npm lint`

## Playwright Setup

For visual regression tests and screenshot testing:
- Run `npx playwright install-deps` to install system dependencies
- Run `npx playwright install` to install browser binaries
- Visual tests are in `test/visual/` and generate screenshots for comparison
- CI automatically caches Playwright dependencies for faster builds

## Build System

- **Vite** for building and bundling
- **Vitest** for testing (integrated with Vite config)
- **PegJS** for LaTeX grammar parsing (custom vite plugin)
- **TypeScript** for type safety
- **Biome** for linting and formatting

## Architecture

- `src/` - Source TypeScript files
- `dist/` - Built output (generated)
- `test/` - Test files
- `lib/` - Build utilities and plugins
- `bin/latex.js` - CLI entry point

## CI/CD

The GitHub Actions workflow includes:
- Node.js 22.x
- Effective caching for npm, Playwright, and build outputs
- Linting, type checking, building, and testing

## Important Notes

- Project uses ES modules (`"type": "module"`)
- Custom vite plugin for PegJS grammar compilation
- Integrated vite/vitest configuration
- Smart build checking prevents unnecessary rebuilds
- Visual regression testing with Playwright screenshots