/**
 * Research CLI
 * Command-line interface for the Web Research Agent
 */

import { WebResearchAgent } from "./agent";
import { ResearchFileManager } from "./fileManager";
import { ResearchQuery } from "./types";

export class ResearchCLI {
  private agent: WebResearchAgent;
  private fileManager: ResearchFileManager;

  constructor(apiKey: string, outputDir: string = "docs/research") {
    this.agent = new WebResearchAgent(apiKey, {
      allowHallucination: false,
      requireSources: true,
      minSourcesRequired: 2,
      outputDirectory: outputDir,
      verboseLogging: true
    });

    this.fileManager = new ResearchFileManager(outputDir);
  }

  /**
   * Perform research and save results
   */
  async performResearch(
    topic: string,
    context?: string,
    options?: {
      maxResults?: number;
      includeRecentOnly?: boolean;
      format?: "markdown" | "json" | "both";
    }
  ): Promise<void> {
    console.log(`\n🔍 Starting research on: "${topic}"\n`);

    const query: ResearchQuery = {
      topic,
      context,
      maxResults: options?.maxResults,
      includeRecentOnly: options?.includeRecentOnly
    };

    try {
      // Perform research
      const research = await this.agent.research(query);

      // Display summary
      console.log("📊 Research Summary:");
      console.log(`   - Sources found: ${research.metadata.totalSources}`);
      console.log(`   - Confidence: ${research.metadata.confidenceLevel}`);
      console.log(`   - Searches performed: ${research.metadata.searchesPerformed}`);

      if (research.metadata.limitations && research.metadata.limitations.length > 0) {
        console.log("\n⚠️  Limitations:");
        research.metadata.limitations.forEach(lim => {
          console.log(`   - ${lim}`);
        });
      }

      // Save research
      const format = options?.format || "both";
      const savedPaths = await this.fileManager.saveResearch(research, format);

      console.log("\n✅ Research complete! Saved to:");
      if (savedPaths.markdown) {
        console.log(`   📄 Markdown: ${savedPaths.markdown}`);
      }
      if (savedPaths.json) {
        console.log(`   📋 JSON: ${savedPaths.json}`);
      }

      console.log("");

    } catch (error) {
      console.error("\n❌ Research failed:");
      console.error(`   ${error instanceof Error ? error.message : String(error)}`);
      console.log("");
      throw error;
    }
  }

  /**
   * List all saved research
   */
  async listResearch(): Promise<void> {
    const files = await this.fileManager.listResearch();

    console.log("\n📚 Saved Research:");
    console.log(`\n   Markdown files (${files.markdown.length}):`);
    files.markdown.forEach(f => console.log(`   - ${f}`));

    console.log(`\n   JSON files (${files.json.length}):`);
    files.json.forEach(f => console.log(`   - ${f}`));

    console.log("");
  }

  /**
   * Search for research by query
   */
  async searchResearch(queryText: string): Promise<void> {
    console.log(`\n🔎 Searching for: "${queryText}"\n`);

    const results = await this.fileManager.searchResearch(queryText);

    if (results.length === 0) {
      console.log("   No results found.\n");
      return;
    }

    console.log(`   Found ${results.length} result(s):\n`);
    results.forEach(r => {
      console.log(`   📄 ${r.query}`);
      console.log(`      ID: ${r.id}`);
      console.log(`      Date: ${new Date(r.timestamp).toLocaleDateString()}`);
      console.log(`      Sources: ${r.metadata.totalSources}`);
      console.log(`      Confidence: ${r.metadata.confidenceLevel}`);
      console.log("");
    });
  }

  /**
   * Get the output directory path
   */
  getOutputDirectory(): string {
    return this.fileManager.getOutputDirectory();
  }
}

/**
 * Quick helper function to run research from the command line
 */
export async function runResearch(
  apiKey: string,
  topic: string,
  context?: string,
  outputDir?: string
): Promise<void> {
  const cli = new ResearchCLI(apiKey, outputDir);
  await cli.performResearch(topic, context);
}
