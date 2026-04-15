# Test Diagnostic Guide

## What This Guide Covers

This guide explains how to verify test health, identify failures quickly, and validate that the toolkit is functioning as intended.

## Current Baseline

- Test files: 11
- Test cases: 17
- Expected status: all passing

## Core Commands

Run the standard sequence:

```bash
npm run lint
npm run build
npm test
```

Run the combined verification:

```bash
npm run check
```

Run detailed output:

```bash
npm run test:verbose
```

## Diagnostic Scripts

### Pre-test validation

```bash
node scripts/pre-test-check.cjs
```

Checks:

- Fixture directories and key files exist.
- TypeScript config files parse correctly.
- Test files are present.
- Required tooling packages are installed.

### Test status report

```bash
node scripts/test-status.cjs
```

Outputs:

- Overall pass/fail summary.
- Per-file execution timing.
- Category-level summary.

## What To Check When Editor Shows Warnings

### Node module and __dirname warnings in tests

Symptoms:

- Cannot find module fs or path.
- Cannot find name __dirname.

Verify:

- tsconfig includes Node types.
- Test files are included in type-check config.

### Markdownlint warnings in docs

Symptoms:

- MD022, MD031, MD032, MD040, MD060.

Fix pattern:

- Add blank lines around headings/lists/fenced blocks.
- Specify code fence language.
- Use consistent table formatting.

## Per-Test Intent

- cli-routing.test.ts: command tree integrity.
- config.test.ts: threshold and rule config merge behavior.
- engine.test.ts: fixture-based gate engine result integrity.
- metrics.test.ts: metric calculations from fixture data.
- provider-selection.test.ts: provider factory creation and validation.
- quality-provenance.test.ts: unsupported claims and duplicate source rules.
- pipeline-malformed-results.test.ts: malformed URL resilience.
- report-generation.test.ts: markdown report structure.
- design-research.test.ts: design-query parsing and output flow.
- research-integration.test.ts: end-to-end research pipeline behavior.
- run-storage.test.ts: persistence roundtrip and cleanup.

## Fixture Requirements

### tests/fixtures/newsletter/

- index.json
- sources.json
- pages.json
- summaries.json
- gate.json

### tests/fixtures/gates-edge/

- index.json
- sources.json
- pages.json
- summaries.json
- gate.json

## Fast Triage Flow

1. Run `npm run lint`.
2. Run `npm run build`.
3. Run `npm test`.
4. If failing, run `npm run test:verbose`.
5. Use fixture checks for integration failures.

## Expected Healthy Output

- Lint exits with code 0.
- Build exits with code 0.
- Tests show all files passing and all cases passing.
