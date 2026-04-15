# ai-web-research-toolkit

Production-style TypeScript toolkit for evidence-backed web research, provenance tracking, and dynamic quality gating.

## Why this exists

Most AI research outputs look polished but are hard to audit. This toolkit makes every run traceable:

- real search provider abstraction (mock, Tavily, Brave, SerpAPI)
- source extraction and normalized evidence objects
- claim-to-citation mapping
- dynamic quality gates by site type
- auditable run storage with reproducible artifacts

## Unified CLI

Single entrypoint:

```bash
toolkit <domain> <command>
```

Main command groups:

- `toolkit research run "<query>" --siteType <type>`
- `toolkit research gate <run-id-or-folder> --out <gate.json> [--format md|json]`
- `toolkit research report <run-id-or-path>`
- `toolkit design evaluate <input-folder>`
- `toolkit sprint evaluate <sprint-artifact.json>`

Examples:

```bash
toolkit research run "AI coding assistants in 2026" --siteType newsletter --searchProvider tavily --llmProvider openai
toolkit research gate 20260414T120000Z-ai-coding-assistants --out runs/gate.json --format md
toolkit research report 20260414T120000Z-ai-coding-assistants
toolkit design evaluate runs/20260414T120000Z-ai-coding-assistants
toolkit sprint evaluate examples/sprint-artifact.json
```

## Architecture

```text
Query
  -> SearchProvider.search()
  -> Raw search result capture
  -> URL fetch + extraction
  -> Source normalization
  -> LLMProvider.summarize()
  -> LLMProvider.extractClaims()
  -> Claim <-> citation mapping
  -> Dynamic quality gate engine
  -> Markdown/JSON report generation
  -> Run persistence in runs/<runId>/
```

Source structure:

```text
src/
  cli/
  core/
  providers/
    search/
    llm/
  research/
    pipeline/
    models/
    storage/
    reporting/
    validation/
  evaluation/
    quality/
    design/
    sprint/
  utils/
```

## Quality Gates

Quality gates evaluate sources + extracted content + summaries and return PASS/WARN/FAIL with evidence and remediation.

### Site types

- `newsletter`
- `ecommerce`
- `portfolio`
- `saasLanding`
- `blog`
- `edtech`
- `fintech`
- `general`

### What gets scored

Base rules include:

- minimum credible sources
- domain diversity
- freshness
- citation completeness
- quote quality
- red flag detection
- duplicate source detection
- unsupported claim detection
- excessive inference detection
- low-confidence claim ratio

Site-specific rules include newsletter, ecommerce, portfolio, saas landing, and blog checks.

### PASS / WARN / FAIL

- PASS: score >= `passScore`
- WARN: score >= `warnScore` and < `passScore`
- FAIL: score < `warnScore`

Default thresholds are site-type aware and configurable via `gates.json`.

## Choosing `siteType`

- `newsletter`: recency-heavy trend content and why-it-matters framing
- `ecommerce`: product truthfulness, reviews separation, and price recency risk
- `portfolio`: concise differentiation with credibility links
- `saasLanding`: claim scrutiny and marketing-language control
- `blog`: source depth requirement
- `edtech` / `fintech`: stricter scoring and compliance checklist hints
- `general`: balanced default profile

## Gate config overrides

Use `gates.schema.json` + Zod validation in runtime.

```bash
toolkit research gate --in runs/my-run --out runs/my-run/gate.json --format md --gateConfig gates.json
```

Example `gates.json`:

```json
{
  "defaults": {
    "thresholds": { "passScore": 80, "warnScore": 60 },
    "rules": {
      "base.minSources": { "enabled": true, "params": { "min": 4 } },
      "base.excessiveInference": { "enabled": true, "params": { "warnRatio": 0.25 } }
    }
  },
  "siteTypes": {
    "newsletter": {
      "thresholds": { "passScore": 85, "warnScore": 65 }
    }
  }
}
```

## Run outputs

Every run is persisted in `runs/<runId>/` with audit artifacts:

- `run.json` (full run object)
- `raw-search-results.json`
- `index.json`, `sources.json`, `pages.json`, `summaries.json`
- `gate.json`, `gate.md`
- `report.json`, `report.md`

## Provider configuration

Copy `.env.example` to `.env` and configure:

```bash
AI_PROVIDER=auto
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o-mini

SEARCH_PROVIDER=mock
LLM_PROVIDER=heuristic

TAVILY_API_KEY=your_tavily_key_here
SERPAPI_API_KEY=your_serpapi_key_here
BRAVE_SEARCH_API_KEY=your_brave_key_here
```

## Setup

```bash
npm install
npm run build
npm test
```

Use dev mode:

```bash
npm run dev -- research run "What changed in frontend performance budgets in 2026?" --siteType blog
```

## Testing

Vitest coverage includes:

- provider selection behavior
- malformed search result handling
- provenance-aware quality gates
- scoring threshold behavior
- run persistence
- report generation
- CLI routing

Run tests:

```bash
npm test
```

## Research Output Format

The gate engine reads the following files from the input folder:

- `index.json`: metadata and settings including `siteType` and `createdAt`.
- `sources.json`: array of sources with `url` and `fetchedAt` timestamps.
- `pages.json`: array of extracted pages with `extractedText` content.
- `summaries.json`: array of summaries with citation-linked bullets.

See `tests/fixtures/newsletter` for a complete example.

## AI Providers

This toolkit reads API keys from environment variables only. For local development, copy `.env.example` to `.env` and fill in values. Do not commit `.env`.

Supported environment variables:

- `AI_PROVIDER` = `openai`, `gemini`, or `auto`
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL` (optional)
- `OPENAI_MODEL` (default if unset)
- `GEMINI_API_KEY`

If `AI_PROVIDER=auto`, the toolkit prefers OpenAI when `OPENAI_API_KEY` is set, otherwise it uses Gemini when `GEMINI_API_KEY` is set, otherwise it falls back to non-LLM summarization. When no provider is configured, a warning is logged and the fallback summarizer is used.
