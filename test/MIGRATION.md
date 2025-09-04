# Fixture to Snapshot Migration Guide

This guide explains how to migrate existing fixture tests to use Vitest snapshot testing, providing better regression detection and maintenance.

## Migration Strategies

### 1. **Preserve Strategy** (Recommended for Gradual Migration)
Keeps original fixture assertions AND adds snapshot testing for future migration.

```typescript
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

migrateFixtureFile(fixtureFile, "test.tex", {
	strategy: "preserve",     // Keep both assertions + snapshots
	nameSuffix: " (preserve)" // Identify in test output
});
```

**Benefits:**
- ✅ Zero risk - original tests preserved
- ✅ Gradual migration path
- ✅ Snapshots available for future use
- ❌ Slight test duplication

### 2. **Snapshot-Only Strategy** (Full Migration)
Completely replaces fixture assertions with snapshot testing.

```typescript
migrateFixtureFile(fixtureFile, "test.tex", {
	strategy: "snapshot-only", // Pure snapshot testing
	nameSuffix: " (snapshot)"
});
```

**Benefits:**
- ✅ Clean, modern test approach
- ✅ Better diff visualization
- ✅ Automatic HTML output verification
- ❌ Requires confidence in existing fixtures

### 3. **Verify Strategy** (Safety Net)
Uses snapshots as primary verification, falls back to fixtures on failure.

```typescript
migrateFixtureFile(fixtureFile, "test.tex", {
	strategy: "verify",       // Snapshot-first with fixture fallback
	nameSuffix: " (verify)"
});
```

**Benefits:**
- ✅ Snapshot testing benefits
- ✅ Safety net for edge cases
- ✅ Clear migration path
- ❌ More complex error handling

### 4. **Hybrid Strategy** (Enhanced Original Tests)
Uses enhanced fixture runner to add snapshots alongside existing tests.

```typescript
import { runFixture } from "../lib/fixture-runner";

loadFixture(fixtureFile).fixtures.forEach((fixture: any) => {
	runFixture(fixture, "test.tex", {
		generateSnapshots: true,    // Add snapshots to existing tests
		snapshotSuffix: " (hybrid)" // Identify snapshot tests
	});
});
```

**Benefits:**
- ✅ Minimal code changes
- ✅ Preserves existing test structure
- ✅ Easy to enable/disable snapshots
- ❌ Not a full migration

## Migration Process

### Phase 1: Add Snapshot Generation
Start by adding snapshots to existing tests without changing assertions:

```typescript
// Original test file: test/parsing/fonts.spec.ts
loadFixture(fixtureFile).fixtures.forEach((fixture: any) => {
	runFixture(fixture, "fonts.tex", {
		generateSnapshots: true,
		snapshotSuffix: " (migrating)"
	});
});
```

### Phase 2: Create Parallel Snapshot Tests  
Create new test files using snapshot-only strategy:

```typescript
// New file: test/parsing/fonts-snapshots.spec.ts
migrateFixtureFile(fixtureFile, "fonts.tex", {
	strategy: "snapshot-only"
});
```

### Phase 3: Verify and Replace
Once confident in snapshot tests, replace original fixture tests:

1. **Run both versions** to ensure identical behavior
2. **Update references** in test suites
3. **Remove original fixture files** when no longer needed

## Complete Migration Example

### Before (Traditional Fixtures)
```typescript
// test/parsing/math.spec.ts
import { runFixture } from "../lib/fixture-runner";

describe("LaTeX.js math parsing", () => {
	loadFixture(fixtureFile).fixtures.forEach((fixture: any) => {
		runFixture(fixture, "math.tex"); // Traditional assertion
	});
});
```

### After (Snapshot Testing)
```typescript
// test/parsing/math-snapshots.spec.ts  
import { migrateFixtureFile } from "../lib/fixture-snapshot-runner";

describe("LaTeX.js math parsing (snapshots)", () => {
	migrateFixtureFile(fixtureFile, "math.tex", {
		strategy: "snapshot-only"
	});
});
```

## Migration Commands

### Test Current Migration Status
```bash
# Run original fixture tests
npm run test:parsing

# Run migrated snapshot tests
npm run test:migrated

# Run all snapshots (new + migrated)
npm run test:snapshots
```

### Update Snapshots After Changes
```bash
# Update only migrated fixture snapshots
npm run test:migrated:update

# Update all snapshots in project
npm run test:update-snapshots
```

## Migration Benefits

### Before Migration (Fixture Tests)
```
✓ HTML output verified against expected strings
✓ Precise error messages for mismatches
✗ Manual maintenance of expected output
✗ Hard to review changes
✗ No visual diff capability
```

### After Migration (Snapshot Tests)  
```
✓ HTML output verified against snapshots
✓ Automatic snapshot generation
✓ Visual diff reviews in PRs
✓ Easy snapshot updates
✓ Better change tracking
✓ Living documentation
```

## Best Practices

### 1. Start with Low-Risk Tests
Begin migration with stable, well-understood test modules:
- ✅ `text.tex` - Simple text processing
- ✅ `fonts.tex` - Font commands  
- ⚠️ `picture.tex` - Complex SVG generation
- ❌ `environments.tex` - Has skipped tests

### 2. Validate Before Migration
Always run comparison tests:
```bash
# Ensure original tests pass
npm run test:parsing

# Generate snapshots and verify
npm run test:migrated

# Compare outputs
diff test/parsing/__snapshots__ test/parsing-migrated/__snapshots__
```

### 3. Incremental Migration
Don't migrate everything at once:
1. **Week 1:** Add snapshot generation to existing tests
2. **Week 2:** Create parallel snapshot-only tests  
3. **Week 3:** Validate and switch CI/CD
4. **Week 4:** Remove old fixture tests

### 4. Snapshot Naming Convention
Use consistent naming for easy identification:
```typescript
// Good: Clear, descriptive names
"fonts_tex-emph_command_and_nesting_snapshot.html"
"math_tex-simple_inline_math_migrated.html"

// Bad: Generic names
"snapshot_1.html"
"test.html"
```

## Troubleshooting

### Tests Fail After Migration
```bash
# Check if fixture and snapshot outputs match
npm run test:parsing          # Should pass (fixtures)
npm run test:migrated         # Should pass (snapshots)

# If snapshots fail but fixtures pass, update snapshots
npm run test:migrated:update
```

### Snapshot Files Too Large
Some LaTeX outputs generate very large HTML. Consider:
- Breaking complex tests into smaller parts
- Using `inline snapshots` for small outputs
- Normalizing dynamic content (IDs, timestamps)

### Migration Validation
```bash
# Full test suite should pass with migration
npm test                      # All tests including migrated
npm run test:coverage         # Coverage should be maintained
```

## File Structure After Migration

```
test/
├── parsing/                  # Original fixture tests (gradually removed)
├── parsing-migrated/         # New snapshot-based tests  
├── snapshots/               # Hand-written snapshot tests
├── visual/                  # Screenshot tests
├── fixtures/                # Original .tex fixture files (preserved)
└── lib/
    ├── fixture-runner.ts           # Enhanced with snapshot support
    ├── fixture-snapshot-runner.ts  # Full migration utilities
    ├── snapshot-runner.ts          # Pure snapshot utilities
    └── load-fixtures.ts           # Fixture file parser
```

## Next Steps

1. **Choose your migration strategy** based on risk tolerance
2. **Start with a single test module** (e.g., `text.tex`)
3. **Validate the migration** by comparing outputs
4. **Gradually migrate** remaining modules
5. **Update CI/CD** to use snapshot tests
6. **Remove old fixture tests** when confident

The migration provides a path to modern, maintainable testing while preserving all existing test coverage and behavior.