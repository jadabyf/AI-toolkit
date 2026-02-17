# Research Module

Clean, single-responsibility architecture for web research functionality.

## File Structure

```
src/
  researchCli.ts          - CLI entry point (validates args, calls runResearch)
  cli.ts                  - Main CLI for quality gates (existing)
  research/
    runResearch.ts        - Orchestrates research (calls OpenAI, parses results)
    writeDoc.ts           - Writes Markdown files to docs/research/
    
docs/
  research/               - Output directory for research documents
```

## Responsibilities

### `researchCli.ts`
- Parse command-line arguments
- Validate environment variables
- Call `runResearch()`
- Handle errors and display messages

### `research/runResearch.ts`
- Initialize OpenAI client
- Make API calls with proper prompts
- Parse response content
- Extract sources from markdown links
- Call `writeDoc()` to save results
- Display progress to user

### `research/writeDoc.ts`
- Generate Markdown content (Summary + Sources sections)
- Create filename in `YYYY-MM-DD-topic-slug.md` format
- Ensure output directory exists
- Write file to `docs/research/`
- Return filepath

## Usage

```bash
npm run research "Your research query here"
```

## Output Format

Files saved to `docs/research/YYYY-MM-DD-topic-slug.md`:

```markdown
# [Research Query]

## Summary
[Findings from web search]

## Sources
- [Source Title](URL)
  > Optional snippet

---
*Research conducted: MM/DD/YYYY*
*Total sources: N*
```

## Design Principles

1. **Single Responsibility**: Each file has one clear purpose
2. **Separation of Concerns**: CLI, logic, and I/O are separated
3. **No Duplication**: Shared types defined inline where needed
4. **Clear Data Flow**: CLI → runResearch → writeDoc → file system
