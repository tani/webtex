# WebTeX Monorepo

A JavaScript LaTeX to HTML5 translator monorepo containing the core library and VS Code extension.

## Packages

- **[packages/core](packages/core)** - WebTeX core library for LaTeX to HTML5 translation
- **[packages/vscode](packages/vscode)** - VS Code extension for live LaTeX preview

## Development

### Prerequisites

- Node.js >= 22.0
- Bun (recommended package manager)

### Setup

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test

# Lint and type check
bun run lint
bun run typecheck
```

### Package-specific commands

```bash
# Core package
bun run build:core
bun run test:core
bun run dev:core

# VSCode extension
bun run build:vscode
bun run dev:vscode
```

### Workspace Structure

This monorepo uses Bun workspaces to manage dependencies and inter-package relationships. The VSCode extension automatically references the core library as a workspace dependency.

## License

MIT