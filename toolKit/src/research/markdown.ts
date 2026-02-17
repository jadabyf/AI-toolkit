/**
 * Markdown Generator for Research Output
 * Formats research results with proper citations and structure
 */

import { ResearchOutput, ResearchSection, ResearchSource } from "./types";

export class MarkdownGenerator {
  /**
   * Generate a complete Markdown document from research output
   */
  static generateDocument(research: ResearchOutput): string {
    const sections: string[] = [];

    // Header
    sections.push(this.generateHeader(research));
    sections.push("");

    // Metadata
    sections.push(this.generateMetadata(research));
    sections.push("");

    // Summary
    sections.push("## Summary");
    sections.push("");
    sections.push(research.summary);
    sections.push("");

    // Research sections
    for (const section of research.sections) {
      sections.push(this.generateSection(section));
      sections.push("");
    }

    // Sources/References
    sections.push(this.generateSourcesSection(research.allSources));
    sections.push("");

    // Limitations (if any)
    if (research.metadata.limitations && research.metadata.limitations.length > 0) {
      sections.push(this.generateLimitations(research.metadata.limitations));
      sections.push("");
    }

    return sections.join("\n");
  }

  private static generateHeader(research: ResearchOutput): string {
    const header: string[] = [];
    
    header.push(`# Research Report: ${research.query}`);
    header.push("");
    header.push(`**Research ID**: ${research.id}`);
    header.push(`**Generated**: ${new Date(research.timestamp).toLocaleString()}`);
    header.push(`**Confidence Level**: ${this.formatConfidence(research.metadata.confidenceLevel)}`);
    
    return header.join("\n");
  }

  private static generateMetadata(research: ResearchOutput): string {
    const meta: string[] = [];
    
    meta.push("---");
    meta.push("");
    meta.push("### Research Metadata");
    meta.push("");
    meta.push(`- **Total Sources**: ${research.metadata.totalSources}`);
    meta.push(`- **Web Searches Performed**: ${research.metadata.searchesPerformed}`);
    meta.push(`- **Overall Confidence**: ${this.formatConfidence(research.metadata.confidenceLevel)}`);
    meta.push("");
    meta.push("---");
    
    return meta.join("\n");
  }

  private static generateSection(section: ResearchSection): string {
    const parts: string[] = [];
    
    // Section heading
    parts.push(`## ${section.heading}`);
    parts.push("");
    
    // Confidence indicator
    const confidenceBadge = this.getConfidenceBadge(section.confidence);
    parts.push(`**Confidence**: ${confidenceBadge} ${this.formatConfidence(section.confidence)}`);
    parts.push("");
    
    // Content with inline citations
    const contentWithCitations = this.addInlineCitations(section.content, section.sources);
    parts.push(contentWithCitations);
    parts.push("");
    
    // Section sources
    if (section.sources.length > 0) {
      parts.push("**Sources for this section**:");
      parts.push("");
      for (let i = 0; i < section.sources.length; i++) {
        const source = section.sources[i];
        parts.push(`${i + 1}. [${source.title}](${source.url})`);
        if (source.snippet) {
          parts.push(`   > ${source.snippet.substring(0, 150)}${source.snippet.length > 150 ? "..." : ""}`);
        }
      }
      parts.push("");
    }
    
    return parts.join("\n");
  }

  private static addInlineCitations(content: string, sources: ResearchSource[]): string {
    // Add citation numbers where URLs appear in content
    let annotatedContent = content;
    
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      const citationNum = i + 1;
      
      // Replace URL mentions with citation markers
      const urlPattern = new RegExp(source.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      annotatedContent = annotatedContent.replace(urlPattern, `[${citationNum}]`);
    }
    
    return annotatedContent;
  }

  private static generateSourcesSection(sources: ResearchSource[]): string {
    if (sources.length === 0) {
      return "## References\n\n⚠️ **No sources available** - This research could not be completed due to insufficient web search results.";
    }

    const lines: string[] = [];
    
    lines.push("## References");
    lines.push("");
    lines.push(`*Total sources: ${sources.length}*`);
    lines.push("");
    
    // Group sources by relevance
    const highRelevance = sources.filter(s => s.relevance === "high");
    const mediumRelevance = sources.filter(s => s.relevance === "medium");
    const lowRelevance = sources.filter(s => s.relevance === "low");
    
    if (highRelevance.length > 0) {
      lines.push("### Primary Sources");
      lines.push("");
      for (const source of highRelevance) {
        lines.push(this.formatSourceEntry(source));
      }
      lines.push("");
    }
    
    if (mediumRelevance.length > 0) {
      lines.push("### Supporting Sources");
      lines.push("");
      for (const source of mediumRelevance) {
        lines.push(this.formatSourceEntry(source));
      }
      lines.push("");
    }
    
    if (lowRelevance.length > 0) {
      lines.push("### Additional References");
      lines.push("");
      for (const source of lowRelevance) {
        lines.push(this.formatSourceEntry(source));
      }
      lines.push("");
    }
    
    return lines.join("\n");
  }

  private static formatSourceEntry(source: ResearchSource): string {
    const parts: string[] = [];
    
    parts.push(`- **[${source.title}](${source.url})**`);
    
    if (source.publishedDate) {
      parts.push(`  - Published: ${new Date(source.publishedDate).toLocaleDateString()}`);
    }
    
    parts.push(`  - Accessed: ${new Date(source.accessedAt).toLocaleDateString()}`);
    
    if (source.snippet) {
      parts.push(`  - *${source.snippet}*`);
    }
    
    return parts.join("\n");
  }

  private static generateLimitations(limitations: string[]): string {
    const lines: string[] = [];
    
    lines.push("## ⚠️ Research Limitations");
    lines.push("");
    lines.push("The following limitations were identified in this research:");
    lines.push("");
    
    for (const limitation of limitations) {
      lines.push(`- ${limitation}`);
    }
    
    lines.push("");
    lines.push("*Please verify critical information through additional sources.*");
    
    return lines.join("\n");
  }

  private static formatConfidence(level: string): string {
    switch (level) {
      case "high":
        return "High ✅";
      case "medium":
        return "Medium ⚠️";
      case "low":
        return "Low ⚡";
      case "insufficient":
        return "Insufficient ❌";
      default:
        return level;
    }
  }

  private static getConfidenceBadge(level: string): string {
    switch (level) {
      case "high":
        return "🟢";
      case "medium":
        return "🟡";
      case "low":
        return "🟠";
      case "insufficient":
        return "🔴";
      default:
        return "⚪";
    }
  }

  /**
   * Generate a JSON representation of the research
   */
  static generateJSON(research: ResearchOutput): string {
    return JSON.stringify(research, null, 2);
  }

  /**
   * Generate a filename for the research output
   */
  static generateFilename(research: ResearchOutput, format: "md" | "json" = "md"): string {
    const sanitizedQuery = research.query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);
    
    const timestamp = new Date(research.timestamp)
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD
    
    return `${timestamp}-${sanitizedQuery}.${format}`;
  }
}
