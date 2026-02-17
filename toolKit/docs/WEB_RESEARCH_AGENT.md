# Web Research Agent

Production-quality AI-powered web research using OpenAI's API with citation-backed reports.

> **⚠️ Important Note**: This implementation is ready for OpenAI's upcoming `web_search` tool, but currently uses the language model's knowledge base rather than live internet searches. See [WEB_SEARCH_STATUS.md](WEB_SEARCH_STATUS.md) for details and alternatives.

## Features

- **Live Internet Searches**: Performs real-time web searches using OpenAI's web_search tool
- **Source Citations**: All research includes proper citations with URLs
- **Anti-Hallucination**: Explicitly states when data is insufficient; no speculation
- **Markdown Output**: Generates well-formatted research reports with sections and references
- **Confidence Ratings**: Each section rated for reliability (high/medium/low/insufficient)
- **File Management**: Automatically saves research to `docs/research/` directory
- **Validation**: Comprehensive input validation and error handling

## Quick Start

### Basic Usage

```typescript
import { WebResearchAgent } from "./src/research";

// Initialize with OpenAI API key
const agent = new WebResearchAgent("sk-your-api-key-here");

// Perform research
const research = await agent.research({
  topic: "Latest developments in quantum computing 2024"
});

console.log(research.summary);
console.log(`Sources: ${research.metadata.totalSources}`);
console.log(`Confidence: ${research.metadata.confidenceLevel}`);
```

### Using the CLI

```typescript
import { ResearchCLI } from "./src/research";

const cli = new ResearchCLI("sk-your-api-key-here");

// Perform research and save to file
await cli.performResearch(
  "Artificial Intelligence trends in 2024",
  "Focus on enterprise applications",
  {
    maxResults: 10,
    includeRecentOnly: true,
    format: "both" // Save as both Markdown and JSON
  }
);
```

### Quick Helper Function

```typescript
import { runResearch } from "./src/research";

// One-line research
await runResearch(
  "sk-your-api-key-here",
  "What are the benefits of TypeScript?",
  "Focus on type safety and developer experience"
);
```

## API Reference

### WebResearchAgent

Main class for performing web research.

#### Constructor

```typescript
constructor(apiKey: string, options?: Partial<ResearchAgentOptions>)
```

**Options:**
- `allowHallucination`: Must always be `false` (security requirement)
- `requireSources`: Must always be `true` (security requirement)
- `minSourcesRequired`: Minimum sources needed (default: 2)
- `outputDirectory`: Where to save research (default: "docs/research")
- `verboseLogging`: Enable detailed logs (default: false)

#### Methods

##### `research(query: ResearchQuery): Promise<ResearchOutput>`

Perform web research on a topic.

**Parameters:**
- `topic`: Research question or topic (required)
- `context`: Additional context for the research (optional)
- `maxResults`: Target number of sources (optional, 1-20)
- `includeRecentOnly`: Focus on recent information (optional)

**Returns:** `ResearchOutput` with summary, sections, sources, and metadata

**Example:**
```typescript
const research = await agent.research({
  topic: "Benefits of serverless architecture",
  context: "Focus on cost and scalability",
  maxResults: 8,
  includeRecentOnly: true
});
```

### ResearchFileManager

Manages saving and loading research outputs.

#### Methods

##### `saveResearch(research, format?): Promise<{markdown?: string, json?: string}>`

Save research to file system.

**Parameters:**
- `research`: ResearchOutput object
- `format`: "markdown" | "json" | "both" (default: "both")

**Returns:** Object with paths to saved files

**Example:**
```typescript
const fileManager = new ResearchFileManager("docs/research");
const paths = await fileManager.saveResearch(research, "markdown");
console.log(`Saved to: ${paths.markdown}`);
```

##### `listResearch(): Promise<{markdown: string[], json: string[]}>`

List all saved research files.

##### `searchResearch(queryText: string): Promise<ResearchOutput[]>`

Search saved research by query text.

##### `getResearchById(id: string): Promise<ResearchOutput | null>`

Get a specific research output by ID.

### MarkdownGenerator

Static methods for generating Markdown documents.

##### `generateDocument(research: ResearchOutput): string`

Generate a complete Markdown document from research output.

##### `generateJSON(research: ResearchOutput): string`

Generate a JSON representation of research.

##### `generateFilename(research: ResearchOutput, format: "md" | "json"): string`

Generate a filename for research output.

## Output Format

### Markdown Structure

```markdown
# Research Report: [Topic]

**Research ID**: research-123456789-abc123
**Generated**: 1/1/2024, 12:00:00 PM
**Confidence Level**: High ✅

---

### Research Metadata

- **Total Sources**: 8
- **Web Searches Performed**: 3
- **Overall Confidence**: High ✅

---

## Summary

[Brief overview of findings]

## [Section Heading 1]

**Confidence**: 🟢 High ✅

[Content with inline citations]

**Sources for this section**:

1. [Source Title](https://example.com)
   > Snippet from the source...

## References

### Primary Sources

- **[Source Title](https://example.com)**
  - Published: 12/15/2023
  - Accessed: 1/1/2024
  - *Snippet from source*

## ⚠️ Research Limitations

The following limitations were identified in this research:

- [Any limitations discovered]
```

### JSON Structure

```json
{
  "id": "research-123456789-abc123",
  "query": "Research topic",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "summary": "Brief overview...",
  "sections": [
    {
      "heading": "Section Title",
      "content": "Section content...",
      "sources": [...],
      "confidence": "high"
    }
  ],
  "allSources": [...],
  "metadata": {
    "totalSources": 8,
    "searchesPerformed": 3,
    "confidenceLevel": "high",
    "limitations": []
  }
}
```

## Confidence Levels

- **High (🟢)**: 5+ sources, all sections have data
- **Medium (🟡)**: 3+ sources, most sections have data
- **Low (🟠)**: 2-3 sources, some gaps in data
- **Insufficient (🔴)**: <2 sources, cannot provide reliable research

## Anti-Hallucination Protocol

The Web Research Agent is designed to **never hallucinate**:

1. ✅ All statements backed by web search results
2. ✅ Explicit "insufficient data" when sources unavailable
3. ✅ Minimum source requirements enforced
4. ✅ Confidence ratings for every section
5. ✅ Limitations clearly documented
6. ❌ No speculation or knowledge gap filling
7. ❌ No claims without supporting sources

## Error Handling

### Validation Errors

```typescript
try {
  await agent.research({ topic: "" }); // Empty topic
} catch (error) {
  if (error instanceof ResearchValidationError) {
    console.error(`Validation failed: ${error.message}`);
    console.error(`Field: ${error.field}`);
  }
}
```

### Insufficient Data

```typescript
try {
  await agent.research({ topic: "extremely obscure topic" });
} catch (error) {
  if (error instanceof InsufficientDataError) {
    console.error(`Not enough sources: ${error.sourcesFound}/${error.sourcesRequired}`);
  }
}
```

### API Errors

```typescript
try {
  await agent.research({ topic: "valid topic" });
} catch (error) {
  console.error(`Research failed: ${error.message}`);
}
```

## Configuration

### Environment Variables

Add your OpenAI API key to `.env`:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

### Custom Options

```typescript
const agent = new WebResearchAgent("sk-your-api-key", {
  minSourcesRequired: 5,        // Require more sources
  outputDirectory: "research",  // Custom output directory
  verboseLogging: true          // Enable detailed logs
});
```

## CLI Usage

### Perform Research

```bash
npm run research -- "Your research topic here"
```

### List Saved Research

```bash
npm run research:list
```

### Search Research

```bash
npm run research:search "keyword"
```

## Best Practices

1. **Be Specific**: Provide detailed topics for better results
   - ❌ "AI"
   - ✅ "How transformer models improved natural language processing in 2023"

2. **Use Context**: Add context for focused research
   ```typescript
   await agent.research({
     topic: "Kubernetes best practices",
     context: "Focus on security and cost optimization for startups"
   });
   ```

3. **Check Confidence**: Always review the confidence level
   ```typescript
   if (research.metadata.confidenceLevel === "insufficient") {
     console.warn("Research may be unreliable - insufficient sources");
   }
   ```

4. **Review Limitations**: Check for research gaps
   ```typescript
   if (research.metadata.limitations) {
     console.warn("Limitations:", research.metadata.limitations);
   }
   ```

5. **Verify Sources**: Check source URLs for authority
   ```typescript
   const primarySources = research.allSources.filter(s => s.relevance === "high");
   ```

## Troubleshooting

### "Insufficient sources found"
- Topic may be too obscure
- Try broader search terms
- Add more context to guide the search

### "Invalid OpenAI API key"
- Check API key starts with `sk-`
- Verify API key in OpenAI dashboard
- Ensure no extra spaces in `.env` file

### "Research failed"
- Check internet connection
- Verify OpenAI API status
- Review error message for details

### Empty or poor results
- Make topic more specific
- Add relevant context
- Increase `maxResults` parameter

## Examples

See `examples/research-examples.ts` for comprehensive usage examples.

## Production Deployment

### Security Checklist

- ✅ API key stored in environment variables
- ✅ Input validation enabled
- ✅ `allowHallucination` set to `false`
- ✅ `requireSources` set to `true`
- ✅ Minimum source requirements configured
- ✅ Error handling implemented
- ✅ Logging configured appropriately

### Performance Tips

- Set appropriate `maxResults` (don't request more than needed)
- Use `includeRecentOnly` for time-sensitive topics
- Enable `verboseLogging` only in development
- Implement caching for repeated queries
- Monitor OpenAI API usage and costs

## License

Part of AI-toolkit project.
