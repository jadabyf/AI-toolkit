/**
 * Simple Markdown Generator for Web Research
 * Generates clean Markdown with Summary and Sources sections
 */

import { ResearchOutput } from "./types";

export class SimpleMarkdownGenerator {
  /**
   * Generate a simple Markdown document with Summary and Sources sections
   */
  static generate(research: ResearchOutput): string {
    const sections: string[] = [];

    // Title
    sections.push(`# ${research.query}`);
    sections.push("");

    // Summary section
    sections.push("## Summary");
    sections.push("");
    
    if (research.metadata.totalSources === 0) {
      sections.push("No sources were returned from web search. Cannot provide information on this topic.");
      sections.push("");
      sections.push("_Note: This research query did not return any web search results. Please try a different query or check your search terms._");
    } else {
      sections.push(research.summary);
    }
    
    sections.push("");

    // Sources section
    sections.push("## Sources");
    sections.push("");
    
    if (research.allSources.length === 0) {
      sections.push("No sources available.");
    } else {
      for (const source of research.allSources) {
        const title = source.title || source.url;
        sections.push(`- [${title}](${source.url})`);
        
        // Add snippet if available
        if (source.snippet && source.snippet.trim().length > 0) {
          sections.push(`  > ${source.snippet}`);
        }
      }
    }
    
    sections.push("");
    
    // Footer with metadata
    sections.push("---");
    sections.push("");
    sections.push(`*Research conducted: ${new Date(research.timestamp).toLocaleDateString()}*`);
    sections.push(`*Total sources: ${research.metadata.totalSources}*`);
    
    return sections.join("\n");
  }

  /**
   * Generate filename in format: YYYY-MM-DD-topic-slug.md
   */
  static generateFilename(research: ResearchOutput): string {
    // Format: YYYY-MM-DD
    const date = new Date(research.timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const datePrefix = `${year}-${month}-${day}`;

    // Create topic slug
    const topicSlug = research.query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    return `${datePrefix}-${topicSlug}.md`;
  }
}
