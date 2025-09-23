# WebTeX Test Suite

This package now ships with a streamlined Vitest setup made up of:

- **Unit tests (`test/unit/`)** – legacy behavioural coverage for the parser, CLI, amsthm helpers, etc.
- **HTML snapshot tests (`test/snapshots/latex-code-html.spec.ts`)** – automatically render every entry in `latex_code.yml` and store the generated HTML.
- **Visual regression tests (`test/visual/latex-code-regression.spec.ts`)** – Playwright-driven screenshots for the same `latex_code.yml` cases.

Supporting assets live under `test/fixtures/`, `test/lib/`, `test/utils/`, and `test/types/`.

## Running Tests

```bash
npm run -w packages/core test          # run unit, snapshot, and visual suites
npm run -w packages/core test -- --update   # rebuild snapshots and PNG baselines
npm run -w packages/core test -- test/unit/parsing.spec.ts          # unit only
npm run -w packages/core test -- test/snapshots/latex-code-html.spec.ts  # HTML snapshots only
npm run -w packages/core test -- test/visual/latex-code-regression.spec.ts  # visual regressions only
```

Snapshots and PNG baselines live next to their respective specs. Use `--update` when you intentionally change output.

## Directory Overview

```
test/
├── fixtures/      # shared LaTeX sources used by unit tests
├── lib/           # helper utilities consumed by unit tests
├── snapshots/     # `latex-code.yml` HTML snapshot spec + __snapshots__
├── types/         # Vitest type declarations
├── unit/          # existing unit specs (api, cli, parsing, amsthm, …)
├── utils/         # shared renderer + YAML loader
└── visual/
    ├── latex-code/                 # generated PNG baselines
    └── latex-code-regression.spec.ts
```

`latex_code.yml` is the single source of truth for snapshot and visual coverage. Add or edit cases there to expand regression coverage.
