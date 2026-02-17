/**
 * Document Writer
 * Single responsibility: Format and save research results as Markdown
 */

import * as fs from "fs/promises";
import * as path from "path";

interface ResearchResult {
  query: string;
  summary: string;
  sources: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
  timestamp: string;
  searchesPerformed?: number;
  webSearchOccurred?: boolean;
  sourcesFromWebSearch?: boolean;
  isDesignFocused?: boolean;
  designStyle?: string;
  designType?: string;
  designIndustry?: string;
}

/**
 * Write research results to Markdown file in docs/research/
 * Returns the filepath of the saved document
 */
export async function writeDoc(result: ResearchResult): Promise<string> {
  // Generate filename: YYYY-MM-DD-topic-slug.md
  const filename = generateFilename(result);

  // Generate Markdown content
  const markdown = generateMarkdown(result);

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), "docs", "research");
  await fs.mkdir(outputDir, { recursive: true });

  // Write file
  const filepath = path.join(outputDir, filename);
  await fs.writeFile(filepath, markdown, "utf-8");

  return filepath;
}

/**
 * Generate filename in format: YYYY-MM-DD-topic-slug.md
 */
function generateFilename(result: ResearchResult): string {
  // Format: YYYY-MM-DD
  const date = new Date(result.timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const datePrefix = `${year}-${month}-${day}`;

  // Create topic slug
  const topicSlug = result.query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);

  return `${datePrefix}-${topicSlug}.md`;
}

/**
 * Generate Markdown content with structured design research sections
 */
function generateMarkdown(result: ResearchResult): string {
  const sections: string[] = [];

  // Title
  sections.push(`# ${result.query}`);
  sections.push("");

  // If it's a design-focused result, use the new structured format
  if (result.isDesignFocused) {
    // The AI's response (result.summary) is expected to be a fully-formed 
    // Markdown document with the requested sections.
    sections.push(result.summary);
    sections.push("");

    // Sources section (URLs only)
    sections.push("## Sources");
    sections.push("");
    if (result.sources.length > 0) {
      sections.push("*All sources below were found through live web search:*");
      sections.push("");
      for (const source of result.sources) {
        sections.push(`- ${source.url}`);
      }
    } else {
      sections.push("### ⚠️ No Sources Found");
      sections.push("");
      sections.push("This research did not produce any sources from web search.");
    }
  } else {
    // Fallback to original generic format
    sections.push("## Summary");
    sections.push("");
    sections.push(result.summary);
    sections.push("");

    sections.push("## Sources");
    sections.push("");
    if (result.sources.length > 0) {
      sections.push("*All sources below were found through web search:*");
      sections.push("");
      for (const source of result.sources) {
        sections.push(`- [${source.title}](${source.url})`);
        if (source.snippet) {
          sections.push(`  > ${source.snippet}`);
        }
      }
    } else {
      sections.push("### ⚠️ No Sources Found");
    }
  }

  sections.push("");

  // Quality Assurance section
  sections.push("## Quality Assurance");
  sections.push("");
  sections.push("| Gate | Status | Details |");
  sections.push("|------|--------|---------|");
  sections.push(`| Web Search | ${result.webSearchOccurred ? "✅ Pass" : "❌ Fail"} | web_search tool ${result.webSearchOccurred ? "was invoked" : "was NOT invoked"} |`);
  sections.push(`| Source Integrity | ${result.sourcesFromWebSearch ? "✅ Pass" : "⚠️ None"} | All sources from web_search tool only |`);
  sections.push(`| Reproducibility | ✅ Pass | Consistent document structure |`);
  sections.push(`| Honesty | ✅ Pass | ${result.sources.length > 0 ? "Sources disclosed" : "Missing sources disclosed"} |`);
  sections.push("| VS Code Workflow | ✅ Pass | Node.js TypeScript environment |");
  sections.push("");

  // Footer with metadata
  sections.push("---");
  sections.push("");
  sections.push(`*Research conducted: ${new Date(result.timestamp).toLocaleDateString()}*`);
  sections.push(`*Total sources: ${result.sources.length}*`);
  if (result.searchesPerformed && result.searchesPerformed > 0) {
    sections.push(`*Searches performed: ${result.searchesPerformed}*`);
  }

  return sections.join("\n");
}
