# LaTeX.js - Claude Code Configuration

This file contains configuration and context for Claude Code to work effectively with the LaTeX.js project.

## Project Overview

**LaTeX.js** is a JavaScript LaTeX to HTML5 translator that converts LaTeX documents into HTML while preserving formatting and mathematical expressions. It provides a complete LaTeX-to-web pipeline with support for:

- Mathematical expressions via MathJax integration
- Document classes (article, book, report)
- LaTeX packages (amsthm, graphicx, hyperref, etc.)
- Visual regression testing with Playwright
- TypeScript-first development approach

## Development Commands

### Build Commands
- `npm run compile` - Clean build of the entire project
- `npm run compile:check` - Build only if `dist/` doesn't exist (efficient rebuilds)
- `npm run clean` - Remove build artifacts

### Testing Commands
- `npm test` - Run all tests (includes prebuild check)
- `npm run test:watch` - Run tests in watch mode
- `npm test test/unit/api.spec.ts` - API functionality tests
- `npm test test/unit/cli.spec.ts` - Command-line interface tests
- `npm test test/unit/parsing.spec.ts` - LaTeX parsing tests
- `npm test test/integration/` - Integration tests
- `npm test test/visual/` - Visual regression tests
- `npm test test/visual/screenshots.spec.ts` - Screenshot comparison tests

### Code Quality Commands
- `npm run lint` - Run Biome linting and formatting
- `npm run typecheck` - TypeScript type checking
- `npm run format` - Format code with Biome

## Build System Architecture

The project uses a modern TypeScript build system with the following components:

### Core Technologies
- **TypeScript** - Type-safe JavaScript with strict mode enabled
- **Vite** - Fast build tool and bundler with HMR support
- **Vitest** - Unit testing framework integrated with Vite
- **Biome** - Fast linter and formatter (replaces ESLint/Prettier)
- **PegJS** - Grammar parser for LaTeX syntax (custom Vite plugin)

### Build Process
1. **TypeScript compilation** - Strict type checking and compilation
2. **Asset copying** - Static assets and CSS files
3. **Grammar generation** - PegJS compiles LaTeX grammar rules
4. **Bundle creation** - Vite creates optimized bundles
5. **Type declaration** - `.d.ts` files for TypeScript consumers

### Test Dependencies
- All test commands automatically check and build if needed via pretest hooks
- Tests require the `dist/` directory to exist
- Use `build:check` for efficient rebuilds (only when needed)

## TypeScript Development Standards

This project follows strict TypeScript guidelines to ensure code quality, maintainability, and type safety.

### 🔒 Type Safety Requirements

#### Prohibited Patterns
- **NEVER use `any` type** - Always use `unknown` for unknown types
- **AVOID `as unknown as` casting** - This completely bypasses type safety
- **MINIMIZE `as` casting** - Use type guards, narrowing, or proper interfaces instead
- **NO unsafe type assertions** - Prefer runtime validation and type guards

#### Recommended Patterns  
```typescript
// ✅ Good: Use unknown and type guards
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  throw new Error('Expected string');
}

// ❌ Bad: Unsafe casting
function processData(data: unknown): string {
  return (data as string).toUpperCase();
}
```

### 🏗️ Architecture Guidelines

#### Type Definitions
- **Prefer `interface` over `class`** for contracts and type definitions
- **Use generic types `<T>`** for reusable components and similar patterns
- **Implement discriminated unions** for type-safe polymorphic behavior
- **Favor composition over inheritance** with interface composition

#### Code Organization
```typescript
// ✅ Good: Interface-based architecture
interface LaTeXGenerator<TNode extends Node = Node> {
  createText(text: string): TNode;
  create(type: string, children?: TNode[]): TNode;
}

// ✅ Good: Generic type usage
class Generator<TNode extends Node> implements LaTeXGenerator<TNode> {
  // Implementation
}
```

### ✅ Code Quality Standards

#### Method Signatures
- **Explicit return types** for all public methods
- **Proper parameter typing** with meaningful names
- **Optional parameters** with default values when appropriate

#### Null Safety
- **Use nullish coalescing** (`??`) for default values
- **Use optional chaining** (`?.`) for safe property access  
- **Explicit null checks** instead of truthy/falsy assumptions

#### Type Narrowing
```typescript
// ✅ Good: Type guards instead of casting
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// ✅ Good: Exhaustive checking
function handleNodeType(type: 'text' | 'element' | 'comment'): void {
  switch (type) {
    case 'text':
      // handle text
      break;
    case 'element':
      // handle element  
      break;
    case 'comment':
      // handle comment
      break;
    default:
      // TypeScript ensures this is unreachable
      const _exhaustive: never = type;
  }
}
```

### 🔍 Quality Assurance Workflow

Before committing ANY changes, run these commands in order:

1. **`npm run lint`** - Fix all linting and formatting issues
2. **`npm run typecheck`** - Resolve all TypeScript compilation errors
3. **`npm run compile`** - Ensure build process completes successfully  
4. **`npm test`** - Verify all tests pass

**Commit only when all four steps pass without errors.**

### ⚠️ Error Handling Standards

- **Use specific error types** instead of generic `Error`
- **Implement proper error boundaries** in components
- **Avoid throwing untyped errors** - always specify error types
- **Document error conditions** in method signatures with `@throws` comments

```typescript
// ✅ Good: Typed error handling
class LaTeXError extends Error {
  constructor(
    message: string,
    public readonly location?: { line: number; column: number }
  ) {
    super(message);
    this.name = 'LaTeXError';
  }
}
```

## Testing Infrastructure

### Visual Regression Testing with Playwright

The project includes comprehensive visual regression testing to ensure UI consistency across changes.

#### Setup Requirements
```bash
# Install system dependencies (Linux/CI)
npx playwright install-deps

# Install browser binaries
npx playwright install
```

#### Test Organization
- **`test/visual/`** - Visual regression test suites
- **`test/screenshots/`** - Generated screenshot comparisons  
- **Automated comparison** - Tests fail if visual differences detected
- **CI integration** - Playwright dependencies cached for faster builds

#### Running Visual Tests
```bash
npm test test/visual/              # Run all visual tests
npm test test/visual/screenshots.spec.ts   # Run screenshot comparison tests
```

### Test Structure
- **Unit tests** - Individual component and function testing
- **Integration tests** - End-to-end LaTeX processing workflows
- **Visual tests** - Screenshot-based regression testing
- **API tests** - Public API interface validation

## Project Structure

### Directory Organization
```
webtex/
├── src/                    # TypeScript source files
│   ├── documentclasses/    # LaTeX document class implementations
│   ├── packages/          # LaTeX package implementations  
│   ├── types/             # TypeScript type definitions
│   └── interfaces.ts      # Core interface definitions
├── dist/                  # Built output (generated, git-ignored)
├── test/                  # Test suites
│   ├── api/              # API functionality tests
│   ├── cli/              # Command-line interface tests
│   ├── integration/      # End-to-end workflow tests
│   └── visual/           # Visual regression tests
├── lib/                   # Build utilities and Vite plugins
└── bin/webtex             # CLI entry point
```

### Key Files
- **`vite.config.ts`** - Build configuration with custom PegJS plugin
- **`tsconfig.json`** - TypeScript configuration with strict mode
- **`biome.json`** - Linting and formatting rules
- **`package.json`** - Dependencies and npm scripts

## Continuous Integration

### GitHub Actions Workflow

The CI pipeline ensures code quality and prevents regressions:

#### Environment
- **Node.js 22.x** - Latest LTS with optimal performance
- **Ubuntu latest** - Stable Linux environment for consistent builds

#### Caching Strategy
- **npm cache** - Speeds up dependency installation
- **Playwright binaries** - Cached browser installations
- **Build artifacts** - Optimized build caching between runs

#### Quality Gates
1. **Dependency installation** - `npm ci` for reproducible installs
2. **Linting** - Biome checks for code style and common issues
3. **Type checking** - TypeScript compilation without emit
4. **Building** - Full project build including asset processing
5. **Testing** - Complete test suite including visual regression

All steps must pass before code can be merged.

## Development Notes

### Module System
- **ES modules** - Project uses `"type": "module"` in package.json
- **Import/export syntax** - Use modern ES module imports throughout
- **Dynamic imports** - Supported for code splitting where beneficial

### Build Optimizations
- **Smart rebuild detection** - `build:check` avoids unnecessary rebuilds
- **Custom Vite plugins** - PegJS grammar compilation integrated
- **Asset processing** - CSS, fonts, and static assets handled automatically
- **Type generation** - `.d.ts` files generated for TypeScript consumers

### Development Workflow
1. **Install dependencies** - `npm install`
2. **Start development** - `npm run compile:check && npm run test:watch`
3. **Code changes** - Edit TypeScript files in `src/`
4. **Quality check** - Run the 4-step quality workflow before committing
5. **Commit** - Use conventional commit messages for changelog generation