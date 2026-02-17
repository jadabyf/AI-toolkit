#!/usr/bin/env node

/**
 * Research CLI Entry Point
 * Handles command-line arguments and delegates to research functionality
 */

import * as dotenv from "dotenv";
import { runResearch } from "./research/runResearch";

// Load environment variables
dotenv.config();

async function main() {
  // Get query from command line arguments
  const query = process.argv.slice(2).join(" ");

  // Validate input
  if (!query || query.trim().length === 0) {
    console.error("❌ Error: Please provide a research query");
    console.log("\nUsage:");
    console.log('  npm run research "your research query here"');
    console.log('  npm run research -- "your research query here"');
    console.log("\nExample:");
    console.log('  npm run research "What are the latest developments in AI?"');
    process.exit(1);
  }

  // Validate API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: OPENAI_API_KEY not found in environment");
    console.log("\nPlease add your OpenAI API key to .env file:");
    console.log("OPENAI_API_KEY=sk-your-key-here");
    process.exit(1);
  }

  try {
    // Run research
    await runResearch(query, apiKey);
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
