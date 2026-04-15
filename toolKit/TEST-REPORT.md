# Test Diagnostic Report

Generated: 2026-04-15

## Overall Status

| Metric | Value | Status |
| --- | --- | --- |
| Test files | 11 / 11 | Passing |
| Test cases | 17 / 17 | Passing |
| Pass rate | 100% | Healthy |
| Typical duration | ~1s | Healthy |

## Per-File Diagnosis

### cli-routing.test.ts

- Category: Core CLI
- Tests: 2
- Status: Passing
- Notes: Verifies top-level command groups and research subcommands.

### config.test.ts

- Category: Configuration
- Tests: 2
- Status: Passing
- Notes: Verifies threshold override and rule config resolution.

### engine.test.ts

- Category: Quality Engine
- Tests: 1
- Status: Passing
- Notes: Validates gate engine output against newsletter fixture.

### metrics.test.ts

- Category: Metrics
- Tests: 1
- Status: Passing
- Notes: Validates source count, diversity, recency, and coverage metrics.

### provider-selection.test.ts

- Category: Providers
- Tests: 4
- Status: Passing
- Notes: Verifies provider creation and expected env-var validation failures.

### quality-provenance.test.ts

- Category: Quality Rules
- Tests: 2
- Status: Passing
- Notes: Verifies unsupported claims, duplicates, and inference rules.

### pipeline-malformed-results.test.ts

- Category: Pipeline Resilience
- Tests: 1
- Status: Passing
- Notes: Confirms malformed URLs do not break pipeline execution.

### report-generation.test.ts

- Category: Reporting
- Tests: 1
- Status: Passing
- Notes: Confirms markdown report includes required sections.

### design-research.test.ts

- Category: Design Research
- Tests: 1
- Status: Passing
- Notes: Covers parsing, validation, optimization, and markdown generation.

### research-integration.test.ts

- Category: Research Integration
- Tests: 1
- Status: Passing
- Notes: End-to-end validation of output structure and quality gate metadata.

### run-storage.test.ts

- Category: Storage
- Tests: 1
- Status: Passing
- Notes: Roundtrip persistence and artifact integrity check.

## Fixture Health

### tests/fixtures/newsletter/

Expected input files:

- index.json
- sources.json
- pages.json
- summaries.json
- gate.json

### tests/fixtures/gates-edge/

Expected input files:

- index.json
- sources.json
- pages.json
- summaries.json
- gate.json

## Common Failure Patterns

### Missing fixtures

- Symptom: ENOENT errors.
- Affects: engine, metrics, quality-provenance.
- Resolution: Ensure fixture files are committed.

### Temp directory lock

- Symptom: EACCES during cleanup.
- Affects: pipeline-malformed-results, run-storage.
- Resolution: Ensure handles are released before remove.

### Node typing mismatch

- Symptom: Cannot find module fs/path or __dirname in editor.
- Affects: tests in TypeScript editor checks.
- Resolution: Keep Node types enabled and tests included in lint tsconfig.

## Recommended Commands

```bash
npm run lint
npm run build
npm test
```

```bash
npm run check
```

```bash
npm run test:verbose
```
