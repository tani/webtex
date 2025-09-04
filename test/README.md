# LaTeX.js Test Suite

Modern, comprehensive test suite for LaTeX.js using Vitest snapshot testing for reliable LaTeX→HTML conversion verification.

## Test Organization

### Core Test Suites
- **`api.ts`** - Node.js API compatibility tests (4 tests)
- **`cli.ts`** - Command-line interface tests (6 tests) 

### LaTeX Parsing Tests (`/parsing/`)
Snapshot-based tests for LaTeX parsing and HTML rendering:

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

### Feature Tests (`/features/`)
- **`core-features.spec.ts`** - Comprehensive LaTeX feature snapshots
- **`cli-output.spec.ts`** - Command-line interface output snapshots

### Visual Tests (`/visual/`)
- **`screenshots.spec.ts`** - Screenshot regression tests for visual output

### Shared Utilities (`/lib/`)
- **`fixture-snapshot-runner.ts`** - Fixture-to-snapshot migration utilities
- **`snapshot-runner.ts`** - Pure snapshot testing utilities
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
npm run test:parsing       # All LaTeX parsing tests
npm run test:features      # Feature snapshot tests
npm run test:visual        # Visual/screenshot tests
npm run test:screenshots   # Screenshot tests only
```

### Snapshot Test Management
```bash
npm run test:features:update     # Update feature snapshots
npm run test:update-snapshots    # Update ALL snapshots in project
```

### Individual Test Categories
```bash
npx vitest test/parsing/math.spec.ts        # Math parsing tests
npx vitest test/parsing/environments.spec.ts # Environment tests
npx vitest test/features/core-features.spec.ts # Feature tests
```

## Test Count
- **~210 total tests**
  - **144 parsing tests** - LaTeX→HTML conversion with snapshot verification
  - **33 screenshot tests** - Visual regression tests  
  - **27 feature tests** - Hand-written comprehensive feature tests
  - **10 core tests** - API and CLI functionality
- Clean, organized structure with snapshot-based testing
- All LaTeX features covered with automated regression detection
- Modern testing practices with visual diff capabilities

## Migration to Snapshot Testing

This project has been **fully migrated** from fixture-based testing to modern Vitest snapshot testing:

### Benefits Achieved
- ✅ **Visual diff reviews** - See exactly what changed in PRs
- ✅ **Automatic snapshot updates** - `npm run test:update-snapshots`
- ✅ **Living documentation** - Snapshots show expected output
- ✅ **Better regression detection** - Catch unintended HTML changes
- ✅ **Easier maintenance** - No manual fixture updates needed
- ✅ **Modern tooling** - Better IDE integration and test experience

### Snapshot Testing Approach
All LaTeX parsing tests now use **snapshot testing** which:
1. **Captures HTML output** from LaTeX→HTML conversion
2. **Stores snapshots** in `__snapshots__/` directories
3. **Compares future runs** against stored snapshots  
4. **Shows visual diffs** when output changes
5. **Updates easily** with `npm run test:update-snapshots`

## Test Structure Overview

```
test/
├── parsing/              # LaTeX parsing tests (144 tests) 
│   ├── __snapshots__/   # Generated HTML snapshots
│   ├── text.spec.ts     # Text processing
│   ├── math.spec.ts     # Mathematics  
│   ├── environments.spec.ts # LaTeX environments
│   └── ...              # All LaTeX features
├── features/            # Feature tests (27 tests)
│   ├── __snapshots__/   # Feature snapshots
│   ├── core-features.spec.ts # Comprehensive features
│   └── cli-output.spec.ts    # CLI output
├── visual/              # Screenshot tests (33 tests)
│   └── screenshots.spec.ts   # Visual regression
├── fixtures/            # Original .tex test files (preserved)
├── lib/                 # Test utilities and helpers
├── api.ts              # API tests (4 tests)
└── cli.ts              # CLI tests (6 tests)
```

## Snapshot Best Practices

### Creating New Tests
```typescript
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("New LaTeX feature", () => {
	const fixtureFile = path.join(__dirname, "../fixtures/new-feature.tex");
	migrateFixtureFile(fixtureFile, "new-feature.tex", {
		strategy: "snapshot-only"
	});
});
```

### Updating Snapshots
When LaTeX output intentionally changes:
```bash
# Update specific test snapshots
npm run test:features:update

# Update all project snapshots
npm run test:update-snapshots

# Update specific file snapshots  
npx vitest test/parsing/math.spec.ts -u
```

### Reviewing Changes
1. **Run tests** - Failing tests show snapshot mismatches
2. **Review diffs** - Visual diffs show exactly what changed
3. **Verify changes** - Ensure changes are intentional
4. **Update snapshots** - Accept changes with update commands
5. **Commit snapshots** - Include snapshot updates in commits

## Development Workflow

### Adding New LaTeX Features
1. **Create fixture file** - Add `.tex` file to `test/fixtures/`
2. **Create test file** - Use snapshot testing pattern
3. **Run tests** - Generate initial snapshots
4. **Verify output** - Check snapshot files are correct
5. **Commit everything** - Include tests and snapshots

### Modifying LaTeX Output
1. **Make changes** - Modify LaTeX→HTML conversion code
2. **Run tests** - See which snapshots changed
3. **Review diffs** - Verify changes are expected
4. **Update snapshots** - `npm run test:update-snapshots`
5. **Commit changes** - Include updated snapshots

### Debugging Test Failures
1. **Check diff output** - Vitest shows exact differences
2. **Review snapshot files** - Located in `__snapshots__/`
3. **Run specific tests** - `npx vitest path/to/test.spec.ts`
4. **Use watch mode** - `npm run test:watch` for live feedback

## CI/CD Integration

Tests work seamlessly in continuous integration:
- **Snapshot mismatches** fail the build
- **Missing snapshots** prevent deployment
- **Visual diffs** in PR reviews show output changes
- **Automatic updates** can be scripted for maintenance

The LaTeX.js test suite now provides **comprehensive coverage** with **modern snapshot testing**, **visual regression detection**, and **easy maintenance** for confident LaTeX→HTML conversion development.