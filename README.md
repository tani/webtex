# WebTeX

[![CI](https://github.com/tani/webtex/actions/workflows/ci.yml/badge.svg)](https://github.com/tani/webtex/actions/workflows/ci.yml)

A JavaScript LaTeX to HTML5 translator monorepo - WebTeX fork with enhanced features for modern web development.

## Features

- **Complete LaTeX-to-web pipeline** with support for mathematical expressions via MathJax
- **Document classes** - article, book, report 
- **LaTeX packages** - amsthm, graphicx, hyperref, and more
- **Visual regression testing** with Playwright for UI consistency
- **TypeScript-first** development with strict type safety
- **Live preview** VS Code extension for real-time LaTeX editing

## Packages

- **[packages/core](packages/core)** - WebTeX core library (`webtex`) for LaTeX to HTML5 translation
- **[packages/vscode](packages/vscode)** - VS Code extension (`webtex-preview`) for live LaTeX preview

## Quick Start

### Installation

```bash
# Install as npm package
npm install webtex

# Or use with bun
bun add webtex
```

### Basic Usage

```javascript
import { LaTeX } from 'webtex';

const latex = new LaTeX();
const html = latex.parse('\\documentclass{article}\\begin{document}Hello World!\\end{document}');
console.log(html);
```

### Command Line

```bash
# Install globally
npm install -g webtex

# Convert LaTeX file to HTML
webtex input.tex output.html
```

## Development

### Prerequisites

- **Node.js >= 22.0** (required)
- **Bun** (recommended package manager)
- **VS Code** (for extension development)

### Setup

```bash
# Clone the repository
git clone https://github.com/tani/webtex.git
cd webtex

# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test

# Quality assurance (run before committing)
bun run lint
bun run typecheck
```

### Monorepo Commands

```bash
# Core library development
bun run build:core         # Build core package
bun run test:core          # Test core package  
bun run dev:core           # Watch mode for core

# VS Code extension development
bun run build:vscode       # Build extension
bun run dev:vscode         # Watch mode for extension
bun run test:vscode        # Test extension

# All packages
bun run build              # Build all packages
bun run test               # Test all packages
bun run clean              # Clean build artifacts
```

### Testing

The project includes comprehensive testing infrastructure:

```bash
# Unit and integration tests
bun test

# Visual regression tests (requires Playwright)
bunx playwright install
bun test test/visual/

# API tests
bun test test/api.ts

# CLI tests  
bun test test/cli.ts
```

### Code Quality

Before committing, ensure all quality checks pass:

```bash
bun run lint              # Biome linting and formatting
bun run typecheck         # TypeScript type checking
bun run build             # Build verification
bun test                  # Full test suite
```

## Architecture

### Build System

- **TypeScript** - Strict type safety and modern JavaScript features
- **Vite** - Fast build tool with HMR support
- **Vitest** - Unit testing integrated with Vite
- **Biome** - Lightning-fast linting and formatting
- **PegJS** - LaTeX grammar parser with custom Vite plugin

### Workspace Structure

This monorepo uses Bun workspaces for dependency management:

```
webtex/
├── packages/
│   ├── core/              # Core WebTeX library
│   │   ├── src/           # TypeScript source
│   │   ├── dist/          # Built output
│   │   └── test/          # Test suites
│   └── vscode/            # VS Code extension
│       ├── src/           # Extension source
│       └── out/           # Built extension
├── .github/workflows/     # CI/CD configuration
└── bun.lock              # Dependency lockfile
```

## Contributing

1. **Fork the repository** and create a feature branch
2. **Make changes** following the TypeScript coding standards
3. **Run quality checks**: `bun run lint && bun run typecheck && bun run build && bun test`
4. **Submit a pull request** with a clear description

### TypeScript Guidelines

- **Never use `any`** - Use `unknown` for unknown types
- **Minimize `as` casting** - Prefer type guards and proper interfaces  
- **Explicit return types** for all public methods
- **Strict null safety** with optional chaining and nullish coalescing

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Projects

- [LaTeX.js](https://github.com/michael-brade/LaTeX.js) - Original LaTeX.js project
- [MathJax](https://www.mathjax.org/) - Mathematical notation rendering
- [Playwright](https://playwright.dev/) - End-to-end testing framework