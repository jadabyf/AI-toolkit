# Web Research Feature - Quick Start Guide

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Add OpenAI API Key**
   
   Add to your `.env` file:
   ```
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

## Usage

### Command Line Interface

Run research from the command line:

```bash
npm run research "What are the latest developments in quantum computing?"
```

### Examples

**Technology Research:**
```bash
npm run research "What is WebAssembly and how is it used in 2026?"
```

**Current Events:**
```bash
npm run research "Latest advances in artificial intelligence"
```

**Technical Topics:**
```bash
npm run research "Best practices for TypeScript in 2026"
```

## Output Format

Research results are saved to `docs/research/` with the filename format:
```
YYYY-MM-DD-topic-slug.md
```

Example:
```
docs/research/2026-02-17-quantum-computing-developments.md
```

### Markdown Structure

```markdown
# [Your Research Query]

## Summary

[2-3 paragraph overview based on web search results]

## Sources

- [Source Title 1](https://example.com/article1)
  > Snippet from the source
- [Source Title 2](https://example.com/article2)
  > Snippet from the source
- [Source Title 3](https://example.com/article3)

---

*Research conducted: MM/DD/YYYY*
*Total sources: N*
```

## No Sources Handling

If web search returns no sources, the document will clearly state:

```markdown
## Summary

No sources were returned from web search. Cannot provide information on this topic.

_Note: This research query did not return any web search results. Please try a different query or check your search terms._

## Sources

No sources available.
```

## Important Notes

### Web Search Enabled
- Uses OpenAI's `gpt-4-turbo` model with browsing capabilities
- Performs live internet searches for up-to-date information
- **Does not rely on model training data** for current events
- All claims are backed by actual web sources

### No Hallucination
- If no sources are found, the document explicitly states this
- No fabricated or simulated URLs
- No unsupported claims
- Clear indication when data is unavailable

## Troubleshooting

### "OPENAI_API_KEY not found"
Make sure you've added your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=sk-...
```

### "Please provide a research query"
Make sure to include your query in quotes:
```bash
npm run research "your query here"
```

### No sources returned
- Try making your query more specific
- Check if the topic is too niche or obscure
- Verify your internet connection
- The tool will clearly state when no sources are available

## Advanced Usage

### Programmatic Usage

```typescript
import { WebResearchAgent } from "./src/research/agent";
import { SimpleMarkdownGenerator } from "./src/research/simpleMarkdown";
import * as fs from "fs/promises";

const agent = new WebResearchAgent(process.env.OPENAI_API_KEY!, {
  requireSources: false,  // Allow zero sources
  verboseLogging: true
});

const research = await agent.research({
  topic: "Your research topic",
  includeRecentOnly: true
});

const markdown = SimpleMarkdownGenerator.generate(research);
const filename = SimpleMarkdownGenerator.generateFilename(research);

await fs.writeFile(`docs/research/${filename}`, markdown);
```

## File Locations

- **Output Directory**: `docs/research/`
- **Command Script**: `src/research/researchCommand.ts`
- **Agent Logic**: `src/research/agent.ts`
- **Markdown Generator**: `src/research/simpleMarkdown.ts`

## Requirements Met

✅ Uses OpenAI API with web search capabilities  
✅ Accepts research query from CLI  
✅ Performs online search for up-to-date information  
✅ Generates Markdown with Summary and Sources sections  
✅ Saves to `docs/research/` with `YYYY-MM-DD-topic-slug.md` format  
✅ Clearly states when no sources are returned  
✅ Does not simulate or fabricate sources  
✅ Does not rely on model memory for current events  
