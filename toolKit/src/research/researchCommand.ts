#!/usr/bin/env node

/**
 * Web Research CLI Command
 * Simple command-line tool for performing web research
 * 
 * Usage:
 *   npm run research "your research query here"
 *   OR
 *   node dist/researchCommand.js "your research query here"
 */

import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import * as path from "path";
import { WebResearchAgent } from "./agent";
import { SimpleMarkdownGenerator } from "./simpleMarkdown";

// Load environment variables
dotenv.config();

async function main() {
  // Get query from command line arguments
  const query = process.argv.slice(2).join(" ");

  if (!query || query.trim().length === 0) {
    console.error("❌ Error: Please provide a research query");
    console.log("\nUsage:");
    console.log('  npm run research "your research query here"');
    console.log("\nExample:");
    console.log('  npm run research "What are the latest developments in AI?"');
    process.exit(1);
  }

  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: OPENAI_API_KEY not found in environment");
    console.log("\nPlease add your OpenAI API key to .env file:");
    console.log("OPENAI_API_KEY=sk-your-key-here");
    process.exit(1);
  }

  console.log(`\n🔍 Researching: "${query}"\n`);

  try {
    // Create research agent
    const agent = new WebResearchAgent(apiKey, {
      allowHallucination: false,
      requireSources: false, // Changed to false so we can handle zero sources gracefully
      minSourcesRequired: 1,
      outputDirectory: "docs/research",
      verboseLogging: true
    });

    // Perform research
    const research = await agent.research({
      topic: query,
      includeRecentOnly: true
    });

    // Generate Markdown
    const markdown = SimpleMarkdownGenerator.generate(research);
    const filename = SimpleMarkdownGenerator.generateFilename(research);

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), "docs", "research");
    await fs.mkdir(outputDir, { recursive: true });

    // Save file
    const filePath = path.join(outputDir, filename);
    await fs.writeFile(filePath, markdown, "utf-8");

    // Display results
    console.log("\n✅ Research complete!");
    console.log(`\n📊 Results:`);
    console.log(`   - Sources found: ${research.metadata.totalSources}`);
    console.log(`   - Web searches: ${research.metadata.searchesPerformed}`);
    
    if (research.metadata.totalSources === 0) {
      console.log("\n⚠️  Warning: No sources were returned from web search");
      console.log("   The document clearly states this limitation.");
    }

    console.log(`\n📄 Saved to: ${filePath}`);
    console.log("");

  } catch (error) {
    console.error("\n❌ Research failed:");
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    console.log("");
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
