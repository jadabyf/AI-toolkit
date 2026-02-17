# ai-web-research-toolkit

A TypeScript CLI toolkit for web research outputs and quality gating.

## Commands

### research run

Create a research output folder that can be gated later.

```
research run --siteType newsletter --out out --input data.json
```

If `--input` is omitted, the command creates empty `sources.json`, `pages.json`, and `summaries.json` with an `index.json` containing the selected `siteType`.

### research gate

Evaluate a research output folder using dynamic quality gates.

```
research gate --in out --out out/gate.json --format md
```

This creates `gate.json` and, when `--format md` is specified, also writes `gate.md` alongside it.

## Quality Gates

Quality Gates evaluate your research output (sources, extracted content, and summaries) and produce a PASS, WARN, or FAIL decision based on dynamic rules tied to `siteType`.

### Choosing a site type

Use `--siteType` to align rules with the site you are building:

- newsletter
- ecommerce
- portfolio
- saasLanding
- blog
- edtech
- fintech
- general

### Customizing with gates.json

You can override thresholds and rule parameters using a config file:

```
research gate --in out --out out/gate.json --format json --gateConfig gates.json
```

A minimal config example:

```
{
  "defaults": {
    "thresholds": { "passScore": 80, "warnScore": 60 },
    "rules": {
      "base.minSources": { "enabled": true, "params": { "min": 3 } }
    }
  },
  "siteTypes": {
    "newsletter": {
      "thresholds": { "passScore": 85, "warnScore": 65 }
    }
  }
}
```

### PASS / WARN / FAIL

- PASS: overall score is at or above `passScore`.
- WARN: overall score is at or above `warnScore` but below `passScore`.
- FAIL: overall score is below `warnScore`.

### Design Style Quality Gates

The toolkit includes comprehensive quality gates for website design styles. You can specify a design style to ensure your website maintains consistent typography, spacing, colors, and layout patterns.

**Supported Design Styles:**
- Swiss/International Style, Minimalism, Brutalism
- Material Design, Flat Design, Skeuomorphism
- Neumorphism, Glassmorphism, Bauhaus
- Memphis Design, Art Deco, Organic Design
- Grid-Based Design, Asymmetric Design

**To use design style gates:**

1. Add `designStyle` to your `index.json`:
   ```json
   {
     "siteType": "portfolio",
     "designStyle": "minimalism"
   }
   ```

2. Provide design metrics in your gates config:
   ```json
   {
     "rules": {
       "design.minimalism.typography": {
         "params": {
           "designStyle": "minimalism",
           "fontFamilies": ["Inter"],
           "fontSizes": [16, 18, 24, 32]
         }
       }
     }
   }
   ```

**Design gates check for:**
- Typography consistency (font families, sizes, line heights)
- Spacing consistency (base units, scale adherence)
- Color palette compliance (color count, contrast ratios)
- Layout structure (grid usage, whitespace ratios)
- Style-specific characteristics

See `docs/DESIGN_STYLES.md` for full documentation and `docs/DESIGN_STYLES_REFERENCE.md` for a quick reference guide.

### Agile Quality Gates for VS Code Vibe Coder

The toolkit includes comprehensive sprint-level quality gates for AI-generated code following Agile development practices. These gates ensure reliability, correctness, and responsible AI behavior across sprint cycles.

**7 Sprint-Level Quality Gates:**
1. **Prompt Design & Intent Gate** - Ensure AI understands developer intent clearly
2. **Code Correctness Gate** - Verify syntactically and logically valid code
3. **Vibe Coder Standard Gate** - Maintain beginner-friendly, readable code
4. **Hallucination & Safety Gate** - Prevent fabricated APIs or libraries
5. **Reproducibility Gate** - Ensure consistent outputs across runs
6. **Documentation & Explainability Gate** - Explain why code works
7. **VS Code Integration Gate** - Confirm VS Code workflow compatibility

**Sprint Acceptance Rule:**
A sprint is only accepted if all mandatory quality gates pass. Failed gates block progression to the next sprint cycle.

**To use Agile gates:**

```typescript
import { runSprintAcceptance } from "./quality/sprintEngine";
import { SprintArtifact, SprintValidationContext } from "./quality/agileTypes";

const sprint: SprintArtifact = {
  sprintId: "sprint-001",
  sprintNumber: 1,
  phase: "code-generation",
  timestamp: new Date().toISOString(),
  prompt: {
    prompt: "Create email validator in TypeScript",
    language: "TypeScript",
    taskGoal: "Email validation",
    isExplicit: true,
    isScoped: true,
    isReproducible: true
  },
  codeArtifacts: [/* your code */]
};

const context: SprintValidationContext = { sprint, ruleParams: {} };
const report = runSprintAcceptance(context, "agile-gates.json");

console.log(`Sprint ${report.sprintNumber}: ${report.overallStatus}`);
```

See `docs/AGILE_GATES.md` for complete documentation and `examples/agile-gates.json` for configuration.

### Web Research Feature (NEW)

Perform live web research using OpenAI with automatic source citation.

**Quick Start:**

```bash
# Add your OpenAI API key to .env
OPENAI_API_KEY=sk-your-key-here

# Run research from command line
npm run research "What are the latest AI developments in 2026?"
```

**Output:**
- Saved to `docs/research/YYYY-MM-DD-topic-slug.md`
- Includes Summary section with findings
- Includes Sources section with URLs
- Clearly states if no sources were found

**Key Features:**
- ✅ Uses OpenAI's browsing-enabled models for live web search
- ✅ Accepts research queries from CLI
- ✅ Generates clean Markdown with citations
- ✅ No hallucination - explicitly states when no sources available
- ✅ Does not rely on model training data for current events

See `docs/WEB_RESEARCH_QUICK_START.md` for complete guide.

### Web Research Agent

The toolkit includes a production-quality Web Research Agent that uses OpenAI's API to generate comprehensive, citation-backed research reports.

> **⚠️ Important**: Currently uses AI knowledge base (prepared for future OpenAI `web_search` tool integration). See `docs/WEB_SEARCH_STATUS.md` for details.

**Key Features:**
- 📚 **Citation-Backed Research** - All claims include source URLs
- 🎯 **Structured Output** - Well-formatted reports with sections and references
- 🚫 **Anti-Hallucination** - Explicitly states when data is insufficient; no speculation
- 📄 **Markdown Output** - Well-formatted reports with sections and references
- ⚖️ **Confidence Ratings** - Each section rated (high/medium/low/insufficient)
- 💾 **Auto-Save** - Saves research to `docs/research/` in Markdown and JSON

**Quick Start:**

```typescript
import { WebResearchAgent } from "./src/research";

// Initialize with OpenAI API key
const agent = new WebResearchAgent(process.env.OPENAI_API_KEY!);

// Perform research
const research = await agent.research({
  topic: "Latest TypeScript features in 2024",
  context: "Focus on type safety improvements",
  maxResults: 10,
  includeRecentOnly: true
});

console.log(research.summary);
console.log(`Sources: ${research.metadata.totalSources}`);
console.log(`Confidence: ${research.metadata.confidenceLevel}`);
```

**CLI Usage:**

```typescript
import { runResearch } from "./src/research";

// One-line research with auto-save
await runResearch(
  process.env.OPENAI_API_KEY!,
  "What are the benefits of serverless architecture?",
  "Focus on cost reduction and scalability"
);
```

**Anti-Hallucination Protocol:**
- ✅ All statements backed by web search results
- ✅ Minimum source requirements (default: 2)
- ✅ Confidence ratings for every section
- ✅ Explicit "insufficient data" when sources unavailable
- ❌ No speculation or knowledge gap filling
- ❌ No claims without supporting sources

**Configuration:**

Add your OpenAI API key to `.env`:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

See `docs/WEB_RESEARCH_AGENT.md` for complete API documentation and `examples/research-examples.ts` for usage examples.

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
