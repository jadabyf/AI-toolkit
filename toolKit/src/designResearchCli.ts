#!/usr/bin/env node

/**
 * Design Research CLI
 * Specialized command for design-focused web research
 * 
 * Usage:
 *   npm run research:design "Swiss style portfolio for photographers"
 *   npm run research:design "Brutalism e-commerce for furniture"
 *   npm run research:design "Minimalist newsletter for AI tools"
 */

import * as dotenv from "dotenv";
import { runDesignResearch } from "./research/runDesignResearch";

dotenv.config();

async function main() {
  // Get query from command line arguments
  const query = process.argv.slice(2).join(" ");

  // Validate input
  if (!query || query.trim().length === 0) {
    console.error("❌ Error: Please provide a design query");
    console.log("\nUsage:");
    console.log('  npm run research:design "Website style type for industry"');
    console.log("\nExamples:");
    console.log('  npm run research:design "Swiss style portfolio for photographers"');
    console.log('  npm run research:design "Brutalism e-commerce for furniture"');
    console.log('  npm run research:design "Minimalist newsletter for AI tools"');
    console.log("\nDesign Styles:");
    console.log("  Swiss, Brutalism, Minimalism, Art Deco, Bauhaus, Flat Design, Glassmorphism, Neumorphism");
    console.log("\nWebsite Types:");
    console.log("  Portfolio, E-commerce, Newsletter, Landing page, SaaS, Dashboard, Blog");
    console.log("\nIndustries:");
    console.log("  Makeup, Furniture, Fashion, AI Tools, Real Estate, Healthcare, Education");
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
    // Run design research
    await runDesignResearch(query, apiKey);
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
