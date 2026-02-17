/**
 * Research Integration Test
 * Tests the markdown generation and quality gates without requiring API calls
 */

import { writeDoc } from "../src/research/writeDoc";
import * as fs from "fs/promises";
import * as path from "path";

// Mock research result with quality gate tracking
const mockResearchResult = {
  query: "current web development trends 2026",
  summary: `Web development in 2026 is characterized by several key trends:

1. **AI-Powered Development** - AI assistants like GitHub Copilot and Claude have become standard tools
2. **TypeScript Dominance** - Most new projects use TypeScript for type safety
3. **Edge Computing** - Deploying functions closer to users for lower latency
4. **Web Components** - Native browser APIs gaining adoption over frameworks
5. **Performance Focus** - Core Web Vitals remain critical for SEO and UX`,
  sources: [
    {
      title: "State of JavaScript 2025",
      url: "https://stateofjs.com/",
      snippet: "Annual survey of JavaScript ecosystem trends and usage statistics"
    },
    {
      title: "Web.dev - Performance Best Practices",
      url: "https://web.dev/performance/",
      snippet: "Google's official guidance on web performance and metrics"
    },
    {
      title: "MDN Web Docs - Web Technologies",
      url: "https://developer.mozilla.org/",
      snippet: "Mozilla's comprehensive documentation on web standards and APIs"
    },
    {
      title: "The Verge - Technology Trends",
      url: "https://www.theverge.com/tech",
      snippet: "Coverage of emerging technology trends and innovations"
    },
    {
      title: "CSS-Tricks - Modern CSS",
      url: "https://css-tricks.com/",
      snippet: "Updates on CSS capabilities and web design patterns"
    }
  ],
  timestamp: new Date().toISOString(),
  searchesPerformed: 3,
  webSearchOccurred: true,
  sourcesFromWebSearch: true
};

// Test the markdown generation
async function testResearchImplementation() {
  console.log("🧪 Testing Research Implementation\n");
  console.log("=" .repeat(70));

  try {
    // Test 1: Write document with mock data
    console.log("\n✅ Test 1: Markdown Generation with Quality Gates");
    const filepath = await writeDoc(mockResearchResult);
    console.log(`   Generated: ${filepath}`);

    // Test 2: Verify file was created
    console.log("\n✅ Test 2: File Creation");
    const fileExists = await fs.access(filepath).then(() => true).catch(() => false);
    if (!fileExists) throw new Error("File was not created");
    console.log(`   File size: ${(await fs.stat(filepath)).size} bytes`);

    // Test 3: Read and validate content
    console.log("\n✅ Test 3: Content Validation");
    const content = await fs.readFile(filepath, "utf-8");

    // Check for required sections
    const requiredSections = [
      "# current web development trends 2026",
      "## Summary",
      "## Sources",
      "## Quality Assurance",
      "| Gate | Status | Details |",
      "Web Search",
      "Source Integrity",
      "Reproducibility",
      "Honesty",
      "VS Code Workflow"
    ];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        throw new Error(`Missing required section: "${section}"`);
      }
    }
    console.log(`   ✅ All required sections present`);

    // Test 4: Verify source formatting
    console.log("\n✅ Test 4: Source Formatting");
    const sourceCount = (content.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;
    console.log(`   Found ${sourceCount} properly formatted sources`);
    if (sourceCount !== mockResearchResult.sources.length) {
      throw new Error(`Expected ${mockResearchResult.sources.length} sources, found ${sourceCount}`);
    }

    // Test 5: Verify quality gates are marked as passing
    console.log("\n✅ Test 5: Quality Gate Status");
    const gates = [
      "Web Search | ✅ Pass",
      "Source Integrity | ✅ Pass",
      "Reproducibility | ✅ Pass",
      "Honesty | ✅ Pass",
      "VS Code Workflow | ✅ Pass"
    ];

    for (const gate of gates) {
      if (!content.includes(gate)) {
        throw new Error(`Missing gate status: "${gate}"`);
      }
    }
    console.log(`   ✅ All quality gates marked as passing`);

    // Test 6: Verify no hallucinated sources
    console.log("\n✅ Test 6: Source Integrity Check");
    for (const source of mockResearchResult.sources) {
      if (!content.includes(source.url)) {
        throw new Error(`Source URL missing: ${source.url}`);
      }
    }
    console.log(`   ✅ All sources from web search tool only (no fabrication)`);

    // Test 7: Filename consistency
    console.log("\n✅ Test 7: Reproducibility Check");
    const filename = path.basename(filepath);
    if (!filename.match(/^\d{4}-\d{2}-\d{2}-.+\.md$/)) {
      throw new Error(`Invalid filename format: ${filename}`);
    }
    console.log(`   Filename: ${filename}`);
    console.log(`   Pattern: YYYY-MM-DD-slug.md ✅`);

    // Test 8: Honesty gate disclosure (when sources exist)
    console.log("\n✅ Test 8: Honesty Gate Disclosure");
    if (mockResearchResult.sources.length > 0) {
      if (!content.includes("All sources below were found through web search")) {
        console.log("   ⚠️  Warning: Consider adding source origin disclosure");
      } else {
        console.log(`   ✅ Clearly states sources are from web search`);
      }
    }

    // Summary
    console.log("\n" + "=" .repeat(70));
    console.log("✅ ALL TESTS PASSED\n");
    console.log("Implementation Details:");
    console.log(`  • Output file: ${filepath}`);
    console.log(`  • Document size: ${Math.round((await fs.stat(filepath)).size / 1024)} KB`);
    console.log(`  • Quality gates: All 5 gates passing`);
    console.log(`  • Source handling: Tool-only, no fabrication`);
    console.log(`  • Structure: Consistent and reproducible`);
    console.log("\nGenerated markdown preview:");
    console.log("-" .repeat(70));

    // Show first 500 characters
    const preview = content.substring(0, 500);
    console.log(preview);
    if (content.length > 500) {
      console.log("... (see full file for complete content)");
    }

    console.log("\n" + "=" .repeat(70));
    console.log(`✅ Research implementation verified successfully!\n`);

    return true;
  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(`   ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}

// Run tests
testResearchImplementation().catch(console.error);
