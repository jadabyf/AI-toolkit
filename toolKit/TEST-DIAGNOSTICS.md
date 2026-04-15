# Test Diagnostics and Analysis

## Executive Summary

- Total test files: 11
- Total test cases: 17
- Current status: all passing
- Typical completion time: about 1-2 seconds

## Test File Breakdown

### 1) cli-routing.test.ts

Purpose: Verify CLI command structure and routing.

Checks:

- Top-level command groups exist: research, design, sprint.
- Research command includes run, gate, and report subcommands.

Type: Unit test.

Dependencies:

- createToolkitCli()

### 2) config.test.ts

Purpose: Validate gate configuration schema and threshold resolution.

Checks:

- Site-type threshold overrides are applied.
- Rule config merges defaults and overrides correctly.

Type: Unit test.

Dependencies:

- resolveThresholds()
- resolveRuleConfig()

### 3) engine.test.ts

Purpose: Verify gate engine execution against fixtures.

Checks:

- Engine loads and evaluates newsletter fixture input.
- Overall status is PASS for the fixture.
- Expected rules are present in output.

Type: Integration test.

Fixtures used:

- tests/fixtures/newsletter/

Dependencies:

- runGateEngine()

### 4) metrics.test.ts

Purpose: Verify metric calculation from fixture data.

Checks:

- 3 sources loaded.
- 3 credible sources.
- 3 domains (diversity = 3).
- 3 recent sources (30 days).
- Citation coverage ratio = 1.0.
- 2 thin-content pages.

Type: Integration test.

Fixtures used:

- tests/fixtures/newsletter/

Dependencies:

- computeMetrics()

### 5) provider-selection.test.ts

Purpose: Verify provider factory behavior and environment validation.

Checks:

- Mock search provider is created.
- Missing TAVILY_API_KEY throws for Tavily provider.
- Heuristic LLM provider is created.
- Missing OPENAI_API_KEY throws for OpenAI provider.

Type: Unit test.

Dependencies:

- createSearchProvider()
- createLlmProvider()

### 6) quality-provenance.test.ts

Purpose: Verify provenance-aware quality gates for edge cases.

Checks:

- Unsupported claims rule triggers WARN or FAIL.
- Duplicate sources rule triggers WARN or FAIL.
- Excessive inference rule triggers WARN or FAIL.
- Overall score is within 0-100.
- Overall status is one of PASS/WARN/FAIL.

Type: Integration test.

Fixtures used:

- tests/fixtures/gates-edge/

Dependencies:

- runGateEngine()

### 7) pipeline-malformed-results.test.ts

Purpose: Verify pipeline resilience with malformed URLs.

Checks:

- Pipeline completes with malformed URL input.
- Run ID is produced.
- Raw results and gate output are present.
- Temporary output directory is cleaned up.

Type: Integration test.

Dependencies:

- runResearchPipeline()
- HeuristicLlmProvider

### 8) report-generation.test.ts

Purpose: Verify markdown report generation.

Checks:

- Report includes required major sections.
- Generated output format is consistent.

Type: Unit test.

Dependencies:

- createResearchMarkdownReport()

### 9) design-research.test.ts

Purpose: Verify design research flow.

Checks:

- Design query parsing.
- Query optimization.
- Prompt generation.
- Validation and detection behavior.
- Markdown generation output.

Type: Integration-style test.

### 10) research-integration.test.ts

Purpose: Verify end-to-end research flow.

Checks:

- Markdown output is generated.
- Output structure and sections are validated.
- Source formatting and gate status are validated.
- Reproducibility and disclosure checks pass.

Type: Integration-style test.

### 11) run-storage.test.ts

Purpose: Verify run persistence and load roundtrip.

Checks:

- Run artifacts are written.
- Run artifacts can be read back correctly.
- Temporary directory cleanup succeeds.

Type: Integration test.

Dependencies:

- ResearchRunStore

## Fixture Expectations

### tests/fixtures/newsletter/

Expected files:

- index.json
- sources.json
- pages.json
- summaries.json
- gate.json

### tests/fixtures/gates-edge/

Expected files:

- index.json
- sources.json
- pages.json
- summaries.json
- gate.json

## Common Failure Patterns

### Missing fixture files

Symptom:

- ENOENT: no such file or directory.

Affected tests:

- engine
- metrics
- quality-provenance

Resolution:

- Ensure fixture folders/files exist and are committed.

### Temporary directory lock

Symptom:

- EACCES: permission denied during cleanup.

Affected tests:

- pipeline-malformed-results
- run-storage

Resolution:

- Ensure files are closed before cleanup.

### Node typing issues in editor

Symptom:

- Cannot find module fs/path.
- Cannot find name __dirname.

Resolution:

- Keep Node types enabled in tsconfig.
- Include tests in project type-check config.

## Performance Targets

| Test File | Target | Typical |
| --- | --- | --- |
| cli-routing.test.ts | < 20ms | ~ 10ms |
| config.test.ts | < 20ms | ~ 6ms |
| engine.test.ts | < 30ms | ~ 15ms |
| metrics.test.ts | < 30ms | ~ 10ms |
| provider-selection.test.ts | < 30ms | ~ 11ms |
| quality-provenance.test.ts | < 30ms | ~ 21ms |
| pipeline-malformed-results.test.ts | < 300ms | ~ 257ms |
| report-generation.test.ts | < 30ms | ~ 9ms |
| design-research.test.ts | < 150ms | ~ 115ms |
| research-integration.test.ts | < 150ms | ~ 118ms |
| run-storage.test.ts | < 50ms | ~ 22ms |
| Total | < 1500ms | ~ 894ms |

## Monitoring Commands

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
