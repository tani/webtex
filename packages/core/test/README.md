# LaTeX.js Test Suite

Simple, maintainable test suite for LaTeX.js using Bun's built-in test runner with snapshot testing for reliable LaTeX→HTML conversion verification.

## Test Organization

### Core Test Suites
- **`api.ts`** - Node.js API compatibility tests (4 tests)
- **`cli.ts`** - Command-line interface tests (6 tests) 
- **`parsing.spec.ts`** - Consolidated LaTeX parsing tests (144 tests)

### Integration Tests (`/integration/`)
High-level feature and output testing:
- **`core-features.spec.ts`** - Comprehensive LaTeX feature snapshots (20 tests)
- **`cli-output.spec.ts`** - Command-line interface output snapshots (7 tests)

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
bun test                    # Run all tests
bun test --watch            # Watch mode
bun test --coverage         # With coverage
```

### Granular Test Execution
```bash
bun test test/api.ts                  # API tests only
bun test test/cli.ts                  # CLI tests only
bun test test/parsing.spec.ts         # LaTeX parsing tests
bun test test/integration/            # Integration tests
bun test test/visual/                 # Visual/screenshot tests
bun test test/visual/screenshots.spec.ts  # Screenshot tests only
```

### Snapshot Test Management
```bash
bun test test/integration/ --update-snapshots   # Update integration snapshots
bun test --update-snapshots                     # Update ALL snapshots in project
```

### Individual Test Categories
```bash
bun test test/parsing.spec.ts                      # All parsing tests
bun test test/integration/core-features.spec.ts    # Core feature tests
bun test test/integration/cli-output.spec.ts       # CLI output tests
```

## Test Count
- **~179 total tests**
  - **144 parsing tests** - Consolidated LaTeX→HTML conversion testing
  - **33 screenshot tests** - Visual regression tests  
  - **27 integration tests** - High-level feature and CLI testing
  - **10 core tests** - API and CLI functionality
- Simple, maintainable structure with consolidated test files
- All LaTeX features covered with automated regression detection
- Modern testing practices with visual diff capabilities

## Migration to Snapshot Testing

This project has been **fully migrated** from fixture-based testing to modern Bun snapshot testing:

### Benefits Achieved
- ✅ **Visual diff reviews** - See exactly what changed in PRs
- ✅ **Automatic snapshot updates** - `bun test --update-snapshots`
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
5. **Updates easily** with `bun test --update-snapshots`

## Test Structure Overview

```
test/
├── parsing.spec.ts       # Consolidated LaTeX parsing tests (144 tests)
├── api.ts               # API tests (4 tests)
├── cli.ts               # CLI tests (6 tests)
├── integration/         # High-level integration tests (27 tests)
│   ├── __snapshots__/   # Integration snapshots
│   ├── core-features.spec.ts # Comprehensive LaTeX features
│   └── cli-output.spec.ts    # CLI output testing
├── visual/              # Visual regression tests (33 tests)
│   └── screenshots.spec.ts   # Screenshot testing
├── fixtures/            # LaTeX test files (.tex)
└── lib/                 # Test utilities and helpers
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
bun test test/integration/ --update-snapshots

# Update all project snapshots
bun test --update-snapshots

# Update specific file snapshots
bun test test/parsing.spec.ts --update-snapshots
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
4. **Update snapshots** - `bun test --update-snapshots`
5. **Commit changes** - Include updated snapshots

### Debugging Test Failures
1. **Check diff output** - Bun's test runner shows exact differences
2. **Review snapshot files** - Located in `__snapshots__/`
3. **Run specific tests** - `bun test path/to/test.spec.ts`
4. **Use watch mode** - `bun test --watch` for live feedback

## CI/CD Integration

Tests work seamlessly in continuous integration:
- **Snapshot mismatches** fail the build
- **Missing snapshots** prevent deployment
- **Visual diffs** in PR reviews show output changes
- **Automatic updates** can be scripted for maintenance

The LaTeX.js test suite now provides **comprehensive coverage** with **modern snapshot testing**, **visual regression detection**, and **easy maintenance** for confident LaTeX→HTML conversion development.