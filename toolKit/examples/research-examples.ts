/**
 * Web Research Agent - Examples
 * Comprehensive usage examples for production scenarios
 */

import { 
  WebResearchAgent, 
  ResearchCLI, 
  ResearchFileManager,
  runResearch,
  ResearchValidationError,
  InsufficientDataError
} from "../src/research";

// ============================================================================
// Example 1: Basic Research
// ============================================================================

async function example1_BasicResearch() {
  console.log("\n=== Example 1: Basic Research ===\n");

  const agent = new WebResearchAgent(process.env.OPENAI_API_KEY!);

  const research = await agent.research({
    topic: "What are the main benefits of TypeScript over JavaScript?"
  });

  console.log("Summary:", research.summary);
  console.log("Sources found:", research.metadata.totalSources);
  console.log("Confidence:", research.metadata.confidenceLevel);
}

// ============================================================================
// Example 2: Research with Context
// ============================================================================

async function example2_ResearchWithContext() {
  console.log("\n=== Example 2: Research with Context ===\n");

  const agent = new WebResearchAgent(process.env.OPENAI_API_KEY!);

  const research = await agent.research({
    topic: "Kubernetes deployment strategies",
    context: "Focus on high-availability setups for enterprise applications",
    maxResults: 10,
    includeRecentOnly: true
  });

  // Display sections with confidence ratings
  for (const section of research.sections) {
    console.log(`\n${section.heading} (${section.confidence})`);
    console.log(`  Sources: ${section.sources.length}`);
  }
}

// ============================================================================
// Example 3: Using CLI for Quick Research
// ============================================================================

async function example3_UsingCLI() {
  console.log("\n=== Example 3: Using CLI ===\n");

  const cli = new ResearchCLI(process.env.OPENAI_API_KEY!);

  // Perform research and auto-save
  await cli.performResearch(
    "How do Large Language Models handle context windows?",
    "Focus on GPT-4 and Claude implementations",
    {
      format: "both",
      maxResults: 8
    }
  );

  // List all saved research
  await cli.listResearch();
}

// ============================================================================
// Example 4: File Management
// ============================================================================

async function example4_FileManagement() {
  console.log("\n=== Example 4: File Management ===\n");

  const agent = new WebResearchAgent(process.env.OPENAI_API_KEY!);
  const fileManager = new ResearchFileManager("docs/research");

  // Perform research
  const research = await agent.research({
    topic: "What is edge computing and its use cases?"
  });

  // Save in both formats
  const paths = await fileManager.saveResearch(research, "both");
  console.log("Saved Markdown:", paths.markdown);
  console.log("Saved JSON:", paths.json);

  // Load research back
  const loaded = await fileManager.loadResearch(paths.json!);
  console.log("Loaded research ID:", loaded.id);

  // Search for research
  const searchResults = await fileManager.searchResearch("edge computing");
  console.log("Found", searchResults.length, "matching research(es)");
}

// ============================================================================
// Example 5: Error Handling
// ============================================================================

async function example5_ErrorHandling() {
  console.log("\n=== Example 5: Error Handling ===\n");

  const agent = new WebResearchAgent(process.env.OPENAI_API_KEY!);

  // Example 5a: Invalid query
  try {
    await agent.research({ topic: "" }); // Empty topic
  } catch (error) {
    if (error instanceof ResearchValidationError) {
      console.log("Validation error caught:", error.message);
      console.log("Field:", error.field);
    }
  }

  // Example 5b: Insufficient data
  try {
    await agent.research({ 
      topic: "xyzabc123nonexistentquery999" 
    });
  } catch (error) {
    if (error instanceof InsufficientDataError) {
      console.log("Insufficient data:", error.message);
      console.log(`Sources: ${error.sourcesFound}/${error.sourcesRequired}`);
    }
  }
}

// ============================================================================
// Example 6: Custom Configuration
// ============================================================================

async function example6_CustomConfiguration() {
  console.log("\n=== Example 6: Custom Configuration ===\n");

  // Strict mode: require many sources
  const strictAgent = new WebResearchAgent(process.env.OPENAI_API_KEY!, {
    minSourcesRequired: 5,
    verboseLogging: true
  });

  const research = await strictAgent.research({
    topic: "React vs Vue vs Angular comparison 2024"
  });

  console.log("Research with strict requirements:");
  console.log(`  Sources: ${research.metadata.totalSources} (min: 5)`);
  console.log(`  Confidence: ${research.metadata.confidenceLevel}`);
}

// ============================================================================
// Example 7: Quick Helper Function
// ============================================================================

async function example7_QuickHelper() {
  console.log("\n=== Example 7: Quick Helper ===\n");

  // One-liner for quick research
  await runResearch(
    process.env.OPENAI_API_KEY!,
    "What are the security best practices for Node.js production deployments?",
    "Focus on production deployments"
  );

  console.log("Research completed and saved!");
}

// ============================================================================
// Example 8: Checking Confidence Levels
// ============================================================================

async function example8_ConfidenceLevels() {
  console.log("\n=== Example 8: Confidence Levels ===\n");

  const agent = new WebResearchAgent(process.env.OPENAI_API_KEY!);

  const research = await agent.research({
    topic: "Trends in artificial intelligence for 2024"
  });

  // Check overall confidence
  console.log("Overall confidence:", research.metadata.confidenceLevel);

  // Check section-by-section confidence
  const highConfidence = research.sections.filter(s => s.confidence === "high");
  const mediumConfidence = research.sections.filter(s => s.confidence === "medium");
  const lowConfidence = research.sections.filter(s => s.confidence === "low");
  const insufficient = research.sections.filter(s => s.confidence === "insufficient");

  console.log(`\nSections breakdown:`);
  console.log(`  High confidence: ${highConfidence.length}`);
  console.log(`  Medium confidence: ${mediumConfidence.length}`);
  console.log(`  Low confidence: ${lowConfidence.length}`);
  console.log(`  Insufficient: ${insufficient.length}`);

  // Warn if any insufficient sections
  if (insufficient.length > 0) {
    console.log("\n⚠️ Warning: Some sections have insufficient data:");
    insufficient.forEach(s => console.log(`  - ${s.heading}`));
  }
}

// ============================================================================
// Example 9: Source Analysis
// ============================================================================

async function example9_SourceAnalysis() {
  console.log("\n=== Example 9: Source Analysis ===\n");

  const agent = new WebResearchAgent(process.env.OPENAI_API_KEY!);

  const research = await agent.research({
    topic: "Serverless architecture pros and cons"
  });

  // Analyze sources by relevance
  const highRelevance = research.allSources.filter(s => s.relevance === "high");
  const mediumRelevance = research.allSources.filter(s => s.relevance === "medium");
  const lowRelevance = research.allSources.filter(s => s.relevance === "low");

  console.log("Source relevance breakdown:");
  console.log(`  High: ${highRelevance.length}`);
  console.log(`  Medium: ${mediumRelevance.length}`);
  console.log(`  Low: ${lowRelevance.length}`);

  // Display high-relevance sources
  console.log("\nHigh-relevance sources:");
  highRelevance.forEach(source => {
    console.log(`  - ${source.title}`);
    console.log(`    ${source.url}`);
  });
}

// ============================================================================
// Example 10: Production Workflow
// ============================================================================

async function example10_ProductionWorkflow() {
  console.log("\n=== Example 10: Production Workflow ===\n");

  const agent = new WebResearchAgent(process.env.OPENAI_API_KEY!, {
    minSourcesRequired: 3,
    verboseLogging: false // Disable logs in production
  });

  const fileManager = new ResearchFileManager("docs/research");

  try {
    // 1. Perform research
    console.log("1. Performing research...");
    const research = await agent.research({
      topic: "GraphQL vs REST API comparison",
      context: "Focus on performance, scalability, and developer experience",
      maxResults: 8,
      includeRecentOnly: true
    });

    // 2. Validate confidence
    console.log("2. Validating confidence...");
    if (research.metadata.confidenceLevel === "insufficient") {
      throw new Error("Research confidence too low for production use");
    }

    // 3. Check for limitations
    console.log("3. Checking limitations...");
    if (research.metadata.limitations && research.metadata.limitations.length > 0) {
      console.log("   Limitations found:", research.metadata.limitations);
    }

    // 4. Save research
    console.log("4. Saving research...");
    const paths = await fileManager.saveResearch(research, "both");
    console.log("   Saved to:", paths.markdown);

    // 5. Generate report
    console.log("5. Generating report...");
    console.log(`
    ✅ Research Complete
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Topic:      ${research.query}
    Sources:    ${research.metadata.totalSources}
    Confidence: ${research.metadata.confidenceLevel}
    Sections:   ${research.sections.length}
    Output:     ${paths.markdown}
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    return research;

  } catch (error) {
    console.error("❌ Research failed:", error);
    throw error;
  }
}

// ============================================================================
// Example 11: Batch Research
// ============================================================================

async function example11_BatchResearch() {
  console.log("\n=== Example 11: Batch Research ===\n");

  const agent = new WebResearchAgent(process.env.OPENAI_API_KEY!);
  const fileManager = new ResearchFileManager("docs/research");

  const topics = [
    "What is WebAssembly and its use cases?",
    "Microservices vs Monolithic architecture",
    "Progressive Web Apps advantages"
  ];

  console.log(`Researching ${topics.length} topics...\n`);

  const results = [];

  for (const topic of topics) {
    console.log(`Researching: ${topic}`);
    
    const research = await agent.research({ topic });
    await fileManager.saveResearch(research, "both");
    
    console.log(`  ✅ Complete (${research.metadata.totalSources} sources)\n`);
    
    results.push(research);
  }

  console.log(`\n✅ Batch research complete: ${results.length} topics`);
}

// ============================================================================
// Example 12: Incremental Research
// ============================================================================

async function example12_IncrementalResearch() {
  console.log("\n=== Example 12: Incremental Research ===\n");

  const agent = new WebResearchAgent(process.env.OPENAI_API_KEY!);

  // Initial broad research
  console.log("1. Initial broad research...");
  const initial = await agent.research({
    topic: "Artificial Intelligence in healthcare"
  });

  console.log(`   Sources: ${initial.metadata.totalSources}`);

  // Follow-up specific research based on findings
  console.log("\n2. Follow-up specific research...");
  const followUp = await agent.research({
    topic: "AI for medical imaging diagnosis",
    context: "Focus on deep learning models and accuracy rates"
  });

  console.log(`   Sources: ${followUp.metadata.totalSources}`);
}

// ============================================================================
// Run Examples
// ============================================================================

async function runExamples() {
  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY environment variable not set");
    console.log("Set it in .env file:");
    console.log("OPENAI_API_KEY=sk-your-api-key-here");
    process.exit(1);
  }

  console.log("🚀 Web Research Agent Examples\n");

  try {
    // Run individual examples (comment out as needed)
    await example1_BasicResearch();
    // await example2_ResearchWithContext();
    // await example3_UsingCLI();
    // await example4_FileManagement();
    // await example5_ErrorHandling();
    // await example6_CustomConfiguration();
    // await example7_QuickHelper();
    // await example8_ConfidenceLevels();
    // await example9_SourceAnalysis();
    // await example10_ProductionWorkflow();
    // await example11_BatchResearch();
    // await example12_IncrementalResearch();

    console.log("\n✅ Examples completed successfully!");

  } catch (error) {
    console.error("\n❌ Example failed:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runExamples();
}

// Export for use in other modules
export {
  example1_BasicResearch,
  example2_ResearchWithContext,
  example3_UsingCLI,
  example4_FileManagement,
  example5_ErrorHandling,
  example6_CustomConfiguration,
  example7_QuickHelper,
  example8_ConfidenceLevels,
  example9_SourceAnalysis,
  example10_ProductionWorkflow,
  example11_BatchResearch,
  example12_IncrementalResearch
};
