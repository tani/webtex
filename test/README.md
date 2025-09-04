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
- **`math-snapshots.spec.ts`** - Mathematical expressions with snapshot testing
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

### Snapshot Tests (`/snapshots/`)
- **`core-features.spec.ts`** - Comprehensive LaTeX feature snapshots
- **`cli-output.spec.ts`** - Command-line interface output snapshots

### Migrated Tests (`/parsing-migrated/`)
- **`migrate-all.spec.ts`** - All fixture tests migrated to snapshot testing (101 tests)

### Shared Utilities (`/lib/`)
- **`fixture-runner.ts`** - Shared fixture test runner (enhanced with snapshot support)
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
npm run test:parsing       # All parsing tests (original fixtures)
npm run test:visual        # Visual/screenshot tests
npm run test:screenshots   # Screenshot tests only
npm run test:snapshots     # Snapshot tests only
npm run test:migrated      # Migrated fixture-to-snapshot tests
```

### Snapshot Test Management
```bash
npm run test:snapshots:update    # Update snapshot tests only
npm run test:migrated:update     # Update migrated fixture snapshots
npm run test:update-snapshots    # Update ALL snapshots in project
```

### Migration Commands
```bash
# Compare original vs migrated tests
npm run test:parsing && npm run test:migrated

# Update snapshots after intentional changes  
npm run test:migrated:update
```

### Individual Test Categories
```bash
npx vitest test/parsing/math.spec.ts        # Math parsing tests
npx vitest test/parsing/environments.spec.ts # Environment tests
npx vitest test/visual/screenshots.spec.ts   # Screenshot tests
```

## Test Count
- **~280 total tests** (original + new snapshot tests)
  - **144 functional tests** - Original fixture-based tests
  - **33 screenshot tests** - Visual regression tests  
  - **101 migrated tests** - Fixture tests converted to snapshots
  - **27 new snapshot tests** - Hand-written snapshot tests
- Organized across ~25 test files for better maintainability
- All fixture-based tests preserved with snapshot equivalents
- Multiple testing strategies available for different use cases

## Migration Notes
- **`fixtures.ts`** functionality distributed across parsing modules
- Screenshot tests moved to dedicated visual test suite  
- **Fixture-to-snapshot migration** tools available for gradual transition
- All test logic and assertions preserved in multiple formats
- Improved parallel execution and development workflow

## Fixture to Snapshot Migration

The project now supports **gradual migration** from fixture-based tests to modern snapshot testing:

### Migration Strategies Available
1. **Preserve:** Keep fixtures + add snapshots (safest)
2. **Hybrid:** Enhanced fixtures with snapshot generation  
3. **Snapshot-only:** Full migration to snapshots (cleanest)
4. **Verify:** Snapshot-first with fixture fallback (balanced)

### Migration Benefits
- ✅ **Better change detection** - Visual diffs in PRs
- ✅ **Easier maintenance** - Automatic snapshot updates
- ✅ **Living documentation** - Snapshots show expected output
- ✅ **Modern tooling** - Better IDE integration

See `test/MIGRATION.md` for detailed migration guide.

## Snapshot Testing Guide

### What are Snapshots?
Snapshot tests capture the output of your code at a point in time. When the test runs, it compares the current output against the stored snapshot. If they differ, the test fails, indicating either a bug or an intentional change.

### Benefits for LaTeX.js
- **HTML Output Verification**: Automatically verify LaTeX→HTML conversion results
- **Regression Detection**: Catch unintended changes in rendered output
- **Documentation**: Snapshots serve as living documentation of expected output
- **Refactoring Safety**: Ensure changes don't break existing functionality

### Snapshot Test Types

#### 1. LaTeX Fragment Snapshots
Test individual LaTeX constructs:

```typescript
import { createLatexSnapshot } from "../lib/snapshot-runner";

createLatexSnapshot(
	"basic math", 
	"$E = mc^2$"
);
```

#### 2. Document Snapshots  
Test complete LaTeX documents:

```typescript
import { createDocumentSnapshot } from "../lib/snapshot-runner";

createDocumentSnapshot(
	"complete article",
	`\\documentclass{article}
\\begin{document}
\\section{Test}
Content here.
\\end{document}`
);
```

#### 3. Fixture-based Snapshots
Enhance existing fixture tests with snapshots:

```typescript
import { runSnapshotFixture } from "../lib/snapshot-runner";

loadFixture(fixtureFile).fixtures.forEach((fixture: any) => {
	runSnapshotFixture(fixture, "math.tex", { nameSuffix: " (snapshot)" });
});
```

#### 4. CLI Output Snapshots
Test command-line interface output:

```typescript
test("help output snapshot", async () => {
	const result = await latexjs.execute(["-h"]);
	expect(result.stdout).toMatchSnapshot("cli-help-output.txt");
});
```

### Creating New Snapshots

1. **Write the test** with expected behavior
2. **Run the test** - it will fail initially
3. **Review the generated snapshot** in `__snapshots__/` folder
4. **Verify the output is correct**
5. **Commit the snapshot** to version control

### Updating Snapshots

When intentional changes affect output:

```bash
# Update specific snapshot tests
npm run test:snapshots:update

# Update all snapshots in the project  
npm run test:update-snapshots

# Update snapshots for a specific file
npx vitest test/snapshots/core-features.spec.ts -u
```

### Snapshot Best Practices

#### Normalization
Always normalize dynamic content:
- File paths → relative paths
- Timestamps → fixed values  
- Random IDs → normalized values
- Whitespace → consistent formatting

#### Descriptive Names
Use clear, descriptive snapshot names:
```typescript
expect(output).toMatchSnapshot("math-complex-fractions.html");
```

#### Small, Focused Snapshots
Create focused snapshots testing specific features rather than large outputs.

#### Review Changes
Always review snapshot changes carefully:
- **Expected changes**: Accept the update
- **Unexpected changes**: Investigate the root cause

### Snapshot File Organization

Snapshots are stored in `__snapshots__/` directories:
```
test/
├── snapshots/
│   ├── __snapshots__/
│   │   ├── core-features.spec.ts.snap
│   │   └── cli-output.spec.ts.snap  
│   ├── core-features.spec.ts
│   └── cli-output.spec.ts
└── parsing/
    ├── __snapshots__/
    │   └── math-snapshots.spec.ts.snap
    └── math-snapshots.spec.ts
```

### Integration with CI/CD

Snapshot tests work seamlessly in CI:
- **Pass**: Output matches stored snapshots
- **Fail**: Output differs, requiring investigation
- **Missing snapshots**: Tests fail, preventing deployment

### Troubleshooting

**Test fails after valid changes?**
```bash
npm run test:snapshots:update
```

**Snapshot too large or unreadable?**
- Break into smaller, focused tests
- Add normalization for dynamic content

**Tests flaky due to environment differences?**
- Normalize file paths, timestamps, IDs
- Use consistent test environments

### Advanced Usage

#### Custom Snapshot Options
```typescript
runSnapshotFixture(fixture, "test.tex", {
	normalizeWhitespace: true,
	normalizeSvgIds: true,
	nameSuffix: " (custom)"
});
```

#### Inline Snapshots
For small outputs, use inline snapshots:
```typescript
expect(result).toMatchInlineSnapshot(`"<p>Hello World</p>"`);
```