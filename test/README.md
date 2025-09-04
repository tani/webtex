# Test Structure

This directory contains the reorganized test suite for LaTeX.js, organized into logical modules while preserving all existing tests.

## Test Organization

### Core Test Suites
- **`api.ts`** - Node.js API compatibility tests (4 tests)
- **`cli.ts`** - Command-line interface tests (6 tests) 

### Parsing Tests (`/parsing/`)
Domain-specific LaTeX parsing and rendering tests organized by functionality:

- **`text.spec.ts`** - Text processing and paragraphs
- **`fonts.spec.ts`** - Font commands and sizing
- **`math.spec.ts`** - Mathematical expressions
- **`environments.spec.ts`** - LaTeX environments (lists, quotes, etc.)
- **`symbols.spec.ts`** - Special symbols and characters
- **`boxes.spec.ts`** - Box layouts and positioning
- **`macros.spec.ts`** - Custom macro definitions
- **`spacing.spec.ts`** - Spacing and layout commands
- **`sectioning.spec.ts`** - Document structure commands
- **`groups.spec.ts`** - Group processing
- **`counters.spec.ts`** - Counter handling
- **`label-ref.spec.ts`** - Cross-references
- **`layout-marginpar.spec.ts`** - Page layout and margin notes
- **`whitespace.spec.ts`** - Whitespace handling
- **`preamble.spec.ts`** - Document preamble processing
- **`picture.spec.ts`** - Picture environment
- **`packages/`** - Package-specific tests
  - **`hyperref.spec.ts`** - Hyperref package
  - **`xcolor.spec.ts`** - Color package

### Visual Tests (`/visual/`)
- **`screenshots.spec.ts`** - Screenshot regression tests for visual output

### Shared Utilities (`/lib/`)
- **`fixture-runner.ts`** - Shared fixture test runner
- **`load-fixtures.ts`** - Fixture file parser
- **`cmd.ts`** - CLI testing utilities
- **`setup.ts`** - Global test setup (DOM, screenshots)

## Running Tests

### All Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:ui            # UI mode
npm run test:coverage      # With coverage
```

### Granular Test Execution
```bash
npm run test:api           # API tests only
npm run test:cli           # CLI tests only  
npm run test:parsing       # All parsing tests
npm run test:visual        # Visual/screenshot tests
npm run test:screenshots   # Screenshot tests only
```

### Individual Test Categories
```bash
npx vitest test/parsing/math.spec.ts        # Math parsing tests
npx vitest test/parsing/environments.spec.ts # Environment tests
npx vitest test/visual/screenshots.spec.ts   # Screenshot tests
```

## Test Count
- **~150 total tests** preserved from original structure
- Organized across ~20 test files for better maintainability
- All fixture-based tests maintained with exact same logic
- Screenshot tests separated but fully preserved

## Migration Notes
- **`fixtures.ts`** functionality distributed across parsing modules
- Screenshot tests moved to dedicated visual test suite  
- All test logic and assertions identical to original
- Improved parallel execution and development workflow