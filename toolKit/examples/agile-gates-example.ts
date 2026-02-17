/**
 * Complete Example: Agile Quality Gates for VS Code Vibe Coder
 * 
 * This example demonstrates how to use all 7 sprint-level quality gates
 * to validate AI-generated code following Agile practices.
 */

import {
  SprintArtifact,
  SprintValidationContext,
  ConsistencyTest,
  HallucinationCheck,
  ReadabilityMetrics
} from "../src/quality/agileTypes";
import {
  runSprintAcceptance,
  formatSprintReportMarkdown,
  formatSprintReportJSON
} from "../src/quality/sprintEngine";

// ============================================================================
// Example 1: PASSING Sprint
// ============================================================================

function examplePassingSprint() {
  console.log("=== Example 1: PASSING Sprint ===\n");

  const sprint: SprintArtifact = {
    sprintId: "sprint-001",
    sprintNumber: 1,
    phase: "integration",
    timestamp: "2026-02-17T10:00:00Z",
    
    // Well-defined prompt
    prompt: {
      prompt: "Create a TypeScript function to validate email addresses using a standard regex pattern",
      language: "TypeScript",
      expectedOutputFormat: "function with boolean return type",
      taskGoal: "Provide email validation functionality with clear error handling",
      isExplicit: true,
      isScoped: true,
      isReproducible: true
    },
    
    // Clean, well-written code
    codeArtifacts: [
      {
        code: `
/**
 * Validates an email address using a standard regex pattern.
 * 
 * @param email - The email address to validate
 * @returns true if the email is valid, false otherwise
 * 
 * Why this approach:
 * - Uses a simple, well-tested regex pattern
 * - Handles common email formats
 * - Fast performance for single validations
 */
export function validateEmail(email: string): boolean {
  // Basic email pattern: local@domain.extension
  // Note: This is a simplified pattern for common use cases
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  
  // Test the email against the pattern
  return emailRegex.test(email);
}

/**
 * Example usage:
 * 
 * const isValid = validateEmail('user@example.com');
 * console.log(isValid); // true
 * 
 * const isBad = validateEmail('invalid-email');
 * console.log(isBad); // false
 */
        `,
        language: "TypeScript",
        fileName: "emailValidator.ts",
        dependencies: []
      }
    ],
    
    documentation: `
This sprint delivers an email validation function using TypeScript.

**Why this approach:**
The function uses a standard regex pattern that matches most common email formats.
It's simple, fast, and doesn't require external dependencies.

**How to use:**
Import the function and pass any email string to validate it.
Returns true for valid emails, false otherwise.

**Example:**
validateEmail('user@example.com') // returns true
    `,
    
    targetVSCodeVersion: "1.80.0",
    requiredExtensions: ["prettier", "eslint"]
  };

  // Provide consistency test results
  const consistencyTests: ConsistencyTest[] = [
    {
      runNumber: 1,
      output: "function validates emails correctly",
      timestamp: "2026-02-17T10:01:00Z",
      isConsistent: true,
      deviationScore: 0.0
    },
    {
      runNumber: 2,
      output: "function validates emails correctly",
      timestamp: "2026-02-17T10:02:00Z",
      isConsistent: true,
      deviationScore: 0.0
    },
    {
      runNumber: 3,
      output: "function validates emails correctly",
      timestamp: "2026-02-17T10:03:00Z",
      isConsistent: true,
      deviationScore: 0.0
    }
  ];

  // Provide API verification results
  const hallucinationChecks: HallucinationCheck[] = [
    {
      apiOrMethod: "String.prototype.test",
      isVerified: false,
      confidence: "high",
      note: "test() is a RegExp method, not a String method - but this is correct usage"
    },
    {
      apiOrMethod: "RegExp.prototype.test",
      isVerified: true,
      source: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test",
      confidence: "high"
    }
  ];

  // Provide readability metrics
  const readabilityMetrics: ReadabilityMetrics = {
    averageLineLength: 42,
    maxNestingDepth: 1,
    variableNameQuality: "clear",
    commentCoverage: 35,
    complexityScore: 2
  };

  const context: SprintValidationContext = {
    sprint,
    consistencyTests,
    hallucinationChecks,
    readabilityMetrics,
    ruleParams: {}
  };

  const report = runSprintAcceptance(context);

  console.log(`Sprint ${report.sprintNumber}: ${report.overallStatus}`);
  console.log(`Acceptance Score: ${report.acceptanceScore}/100`);
  console.log(`Gates Passed: ${report.sprintSummary.passedGates}/${report.sprintSummary.totalGates}\n`);

  // Show individual gate results
  report.gateResults.forEach((result) => {
    const icon = result.status === "PASS" ? "✅" : result.status === "WARN" ? "⚠️" : "❌";
    console.log(`${icon} ${result.gateType}: ${result.status} (${result.score}/100)`);
  });

  console.log("\n");
  return report;
}

// ============================================================================
// Example 2: FAILING Sprint
// ============================================================================

function exampleFailingSprint() {
  console.log("=== Example 2: FAILING Sprint ===\n");

  const sprint: SprintArtifact = {
    sprintId: "sprint-002",
    sprintNumber: 2,
    phase: "code-generation",
    timestamp: "2026-02-17T11:00:00Z",
    
    // Vague prompt - will fail Prompt Intent Gate
    prompt: {
      prompt: "Make a helper function",
      language: undefined,
      taskGoal: undefined,
      isExplicit: false,
      isScoped: false,
      isReproducible: false
    },
    
    // Poor quality code with multiple issues
    codeArtifacts: [
      {
        code: `
// TODO: implement this properly
function h(a,b,c) {
  if (a) {
    if (b) {
      if (c) {
        if (a > b) {
          if (b > c) {
            // FIXME: this logic is wrong
            return ...;
          }
        }
      }
    }
  }
  return null
}
        `,
        language: "JavaScript",
        fileName: "helper.js"
      }
    ],
    
    documentation: "A helper function"
  };

  const context: SprintValidationContext = {
    sprint,
    ruleParams: {}
  };

  const report = runSprintAcceptance(context);

  console.log(`Sprint ${report.sprintNumber}: ${report.overallStatus}`);
  console.log(`Acceptance Score: ${report.acceptanceScore}/100`);
  console.log(`Gates Failed: ${report.sprintSummary.failedGates}/${report.sprintSummary.totalGates}\n`);

  // Show blockers
  if (report.blockers.length > 0) {
    console.log("BLOCKING ISSUES:");
    report.blockers.forEach((blocker) => {
      console.log(`❌ ${blocker.gateType}: ${blocker.explanation}`);
    });
  }

  console.log("\n");
  return report;
}

// ============================================================================
// Example 3: CONDITIONAL Sprint (warnings but not blocking)
// ============================================================================

function exampleConditionalSprint() {
  console.log("=== Example 3: CONDITIONAL Sprint ===\n");

  const sprint: SprintArtifact = {
    sprintId: "sprint-003",
    sprintNumber: 3,
    phase: "validation",
    timestamp: "2026-02-17T12:00:00Z",
    
    prompt: {
      prompt: "Create a function to format dates in TypeScript",
      language: "TypeScript",
      taskGoal: "Date formatting utility",
      expectedOutputFormat: "function",
      isExplicit: true,
      isScoped: true,
      isReproducible: true
    },
    
    codeArtifacts: [
      {
        code: `
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return \`\${year}-\${month}-\${day}\`;
}
        `,
        language: "TypeScript",
        fileName: "dateFormatter.ts"
      }
    ],
    
    // Minimal documentation - will warn on Documentation Gate
    documentation: "Formats dates"
  };

  // Only 2 consistency tests instead of required 3
  const consistencyTests: ConsistencyTest[] = [
    {
      runNumber: 1,
      output: "2026-02-17",
      timestamp: "2026-02-17T12:01:00Z",
      isConsistent: true,
      deviationScore: 0.0
    },
    {
      runNumber: 2,
      output: "2026-02-17",
      timestamp: "2026-02-17T12:02:00Z",
      isConsistent: true,
      deviationScore: 0.0
    }
  ];

  const readabilityMetrics: ReadabilityMetrics = {
    averageLineLength: 55,
    maxNestingDepth: 1,
    variableNameQuality: "clear",
    commentCoverage: 0, // No comments - below 15% threshold
    complexityScore: 3
  };

  const context: SprintValidationContext = {
    sprint,
    consistencyTests,
    readabilityMetrics,
    ruleParams: {}
  };

  const report = runSprintAcceptance(context);

  console.log(`Sprint ${report.sprintNumber}: ${report.overallStatus}`);
  console.log(`Acceptance Score: ${report.acceptanceScore}/100`);
  console.log(`Warnings: ${report.sprintSummary.warnedGates}\n`);

  // Show warnings
  if (report.warnings.length > 0) {
    console.log("WARNINGS:");
    report.warnings.forEach((warning) => {
      console.log(`⚠️ ${warning.gateType}: ${warning.explanation}`);
    });
  }

  console.log("\n");
  return report;
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log("\n");
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║  Agile Quality Gates - Complete Examples                 ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");
  console.log("\n");

  // Run all examples
  const passingReport = examplePassingSprint();
  const failingReport = exampleFailingSprint();
  const conditionalReport = exampleConditionalSprint();

  // Generate reports
  console.log("=== Generating Reports ===\n");

  // Markdown report for passing sprint
  const markdown = formatSprintReportMarkdown(passingReport);
  console.log("✅ Generated Markdown report for Sprint 1");

  // JSON report for failing sprint
  const json = formatSprintReportJSON(failingReport);
  console.log("✅ Generated JSON report for Sprint 2");

  console.log("\n");
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║  Summary                                                  ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");
  console.log(`Sprint 1: ${passingReport.overallStatus} (${passingReport.acceptanceScore}/100)`);
  console.log(`Sprint 2: ${failingReport.overallStatus} (${failingReport.acceptanceScore}/100)`);
  console.log(`Sprint 3: ${conditionalReport.overallStatus} (${conditionalReport.acceptanceScore}/100)`);
  console.log("\n");
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

export {
  examplePassingSprint,
  exampleFailingSprint,
  exampleConditionalSprint
};
