import {
  AgileGate,
  AgileGateEvidence,
  AgileGateResult,
  AgileGateStatus,
  SprintValidationContext,
  DEFAULT_VIBE_CODER_STANDARDS,
  DEFAULT_REPRODUCIBILITY_SETTINGS
} from "./agileTypes";

function result(
  gateType: AgileGateResult["gateType"],
  status: AgileGateStatus,
  score: number,
  explanation: string,
  evidence: AgileGateEvidence[],
  remediation: string[],
  blocksSprintAcceptance: boolean
): AgileGateResult {
  return {
    gateType,
    status,
    score,
    explanation,
    evidence,
    remediation,
    blocksSprintAcceptance
  };
}

/**
 * Gate 1: Prompt Design & Intent Gate
 */
export const promptIntentGate: AgileGate = {
  id: "agile.promptIntent",
  type: "promptIntent",
  name: "Prompt Design & Intent Gate",
  description: "Ensure the AI understands developer intent clearly",
  phase: "prompt-design",
  isMandatory: true,
  appliesTo: (context) => !!context.sprint.prompt,
  evaluate: (context) => {
    const prompt = context.sprint.prompt;
    if (!prompt) {
      return result(
        "promptIntent",
        "NOT_APPLICABLE",
        0,
        "No prompt metadata provided",
        [],
        [],
        false
      );
    }

    const issues: string[] = [];
    const evidence: AgileGateEvidence[] = [];
    let score = 100;

    // Check if prompt is explicit
    if (!prompt.isExplicit) {
      issues.push("Prompt is not explicit enough");
      evidence.push({
        type: "prompt",
        description: "Prompt lacks clear, explicit instructions",
        severity: "critical"
      });
      score -= 30;
    }

    // Check if prompt is scoped
    if (!prompt.isScoped) {
      issues.push("Prompt scope is unclear or too broad");
      evidence.push({
        type: "prompt",
        description: "Prompt does not have well-defined scope",
        severity: "major"
      });
      score -= 25;
    }

    // Check for required components
    if (!prompt.taskGoal) {
      issues.push("Task goal not specified");
      evidence.push({
        type: "prompt",
        description: "Missing task goal description",
        severity: "major"
      });
      score -= 20;
    }

    if (!prompt.language) {
      issues.push("Programming language not specified");
      evidence.push({
        type: "prompt",
        description: "Missing programming language declaration",
        severity: "minor"
      });
      score -= 10;
    }

    if (!prompt.expectedOutputFormat) {
      issues.push("Expected output format not specified");
      evidence.push({
        type: "prompt",
        description: "Missing expected output format",
        severity: "minor"
      });
      score -= 10;
    }

    // Check reproducibility
    if (!prompt.isReproducible) {
      issues.push("Prompt may not produce consistent results");
      evidence.push({
        type: "prompt",
        description: "Prompt lacks reproducibility guarantees",
        severity: "major"
      });
      score -= 25;
    }

    const status: AgileGateStatus = score >= 85 ? "PASS" : score >= 70 ? "WARN" : "FAIL";
    const blocksAcceptance = score < 70;

    const remediation = issues.length > 0 ? [
      "Revise prompt to be more explicit and specific",
      "Clearly state the task goal in the prompt",
      "Specify the programming language explicitly",
      "Define the expected output format",
      "Ensure prompt can produce consistent results",
      "Test prompt across multiple runs before proceeding"
    ] : [];

    return result(
      "promptIntent",
      status,
      Math.max(0, score),
      issues.length > 0
        ? `Prompt issues found: ${issues.join("; ")}`
        : "Prompt is clear, explicit, and reproducible",
      evidence,
      remediation,
      blocksAcceptance
    );
  }
};

/**
 * Gate 2: Code Correctness Gate
 */
export const codeCorrectnessGate: AgileGate = {
  id: "agile.codeCorrectness",
  type: "codeCorrectness",
  name: "Code Correctness Gate",
  description: "Verify that generated code is syntactically and logically valid",
  phase: "code-generation",
  isMandatory: true,
  appliesTo: (context) => context.sprint.codeArtifacts.length > 0,
  evaluate: (context) => {
    const artifacts = context.sprint.codeArtifacts;
    const issues: string[] = [];
    const evidence: AgileGateEvidence[] = [];
    let score = 100;

    // Check each code artifact
    artifacts.forEach((artifact, index) => {
      // Check for placeholder logic
      const placeholderPatterns = [
        /TODO/gi,
        /FIXME/gi,
        /placeholder/gi,
        /implement this/gi,
        /\.\.\./g,
        /your code here/gi
      ];

      placeholderPatterns.forEach((pattern) => {
        const matches = artifact.code.match(pattern);
        if (matches && matches.length > 0) {
          issues.push(`Artifact ${index + 1} contains placeholder logic: ${matches[0]}`);
          evidence.push({
            type: "code",
            description: `Placeholder found in artifact ${index + 1}`,
            data: { pattern: pattern.source, matches: matches.length },
            severity: "critical"
          });
          score -= 20;
        }
      });

      // Check for syntax errors (basic checks)
      // Unclosed braces
      const openBraces = (artifact.code.match(/{/g) || []).length;
      const closeBraces = (artifact.code.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push(`Artifact ${index + 1} has mismatched braces`);
        evidence.push({
          type: "code",
          description: `Syntax error: mismatched braces in artifact ${index + 1}`,
          data: { openBraces, closeBraces },
          severity: "critical"
        });
        score -= 30;
      }

      // Check for empty code
      if (artifact.code.trim().length === 0) {
        issues.push(`Artifact ${index + 1} is empty`);
        evidence.push({
          type: "code",
          description: `Empty code artifact ${index + 1}`,
          severity: "critical"
        });
        score -= 50;
      }

      // Check for minimum content
      if (artifact.code.trim().length < 20) {
        issues.push(`Artifact ${index + 1} is too short to be meaningful`);
        evidence.push({
          type: "code",
          description: `Minimal code in artifact ${index + 1}`,
          severity: "major"
        });
        score -= 20;
      }
    });

    const status: AgileGateStatus = score >= 85 ? "PASS" : score >= 70 ? "WARN" : "FAIL";
    const blocksAcceptance = score < 70;

    const remediation = issues.length > 0 ? [
      "Remove all placeholder logic (TODO, FIXME, etc.)",
      "Ensure code compiles or runs without syntax errors",
      "Complete all implementations before sprint acceptance",
      "Test code execution in VS Code environment",
      "Verify all braces, brackets, and parentheses are balanced"
    ] : [];

    return result(
      "codeCorrectness",
      status,
      Math.max(0, score),
      issues.length > 0
        ? `Code correctness issues: ${issues.join("; ")}`
        : "All code artifacts are syntactically valid and complete",
      evidence,
      remediation,
      blocksAcceptance
    );
  }
};

/**
 * Gate 3: Readability & "Vibe Coder" Standard Gate
 */
export const vibeCoderStandardGate: AgileGate = {
  id: "agile.vibeCoderStandard",
  type: "vibeCoderStandard",
  name: "Vibe Coder Standard Gate",
  description: "Maintain human-readable, beginner-friendly code quality",
  phase: "code-generation",
  isMandatory: true,
  appliesTo: (context) => context.sprint.codeArtifacts.length > 0,
  evaluate: (context) => {
    const artifacts = context.sprint.codeArtifacts;
    const metrics = context.readabilityMetrics;
    const standards = {
      ...DEFAULT_VIBE_CODER_STANDARDS,
      ...(context.ruleParams.vibeCoderStandards || {})
    };

    const issues: string[] = [];
    const evidence: AgileGateEvidence[] = [];
    let score = 100;

    if (metrics) {
      // Check nesting depth
      if (metrics.maxNestingDepth > standards.maxNestingDepth) {
        issues.push(
          `Nesting depth ${metrics.maxNestingDepth} exceeds limit ${standards.maxNestingDepth}`
        );
        evidence.push({
          type: "code",
          description: "Excessive nesting depth reduces readability",
          data: { actual: metrics.maxNestingDepth, limit: standards.maxNestingDepth },
          severity: "major"
        });
        score -= 20;
      }

      // Check line length
      if (metrics.averageLineLength > standards.maxLineLength) {
        issues.push(
          `Average line length ${Math.round(metrics.averageLineLength)} exceeds ${standards.maxLineLength}`
        );
        evidence.push({
          type: "code",
          description: "Long lines reduce readability",
          data: { actual: metrics.averageLineLength, limit: standards.maxLineLength },
          severity: "minor"
        });
        score -= 10;
      }

      // Check variable name quality
      if (metrics.variableNameQuality === "poor") {
        issues.push("Variable names are unclear or poorly chosen");
        evidence.push({
          type: "code",
          description: "Poor variable naming reduces code clarity",
          severity: "major"
        });
        score -= 25;
      } else if (metrics.variableNameQuality === "acceptable") {
        evidence.push({
          type: "code",
          description: "Variable names are acceptable but could be improved",
          severity: "minor"
        });
        score -= 5;
      }

      // Check comment coverage
      if (metrics.commentCoverage < standards.minCommentCoverage) {
        issues.push(
          `Comment coverage ${metrics.commentCoverage}% below minimum ${standards.minCommentCoverage}%`
        );
        evidence.push({
          type: "code",
          description: "Insufficient inline documentation",
          data: { actual: metrics.commentCoverage, minimum: standards.minCommentCoverage },
          severity: "minor"
        });
        score -= 15;
      }

      // Check complexity score
      if (metrics.complexityScore > standards.maxComplexityScore) {
        issues.push(
          `Complexity score ${metrics.complexityScore} exceeds limit ${standards.maxComplexityScore}`
        );
        evidence.push({
          type: "code",
          description: "Code is too complex for beginner-friendly standard",
          data: { actual: metrics.complexityScore, limit: standards.maxComplexityScore },
          severity: "major"
        });
        score -= 25;
      }
    } else {
      // No metrics provided, do basic checks
      artifacts.forEach((artifact, index) => {
        const lines = artifact.code.split("\n");
        const avgLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;

        if (avgLength > standards.maxLineLength * 1.5) {
          issues.push(`Artifact ${index + 1} likely has very long lines`);
          score -= 10;
        }

        // Check for single-letter variables (except i, j, k in loops)
        const singleLetterVars = artifact.code.match(/\b[a-hln-z]\b/g);
        if (singleLetterVars && singleLetterVars.length > 5) {
          issues.push(`Artifact ${index + 1} may have unclear variable names`);
          score -= 15;
        }
      });
    }

    const status: AgileGateStatus = score >= 85 ? "PASS" : score >= 70 ? "WARN" : "FAIL";
    const blocksAcceptance = score < 70;

    const remediation = issues.length > 0 ? [
      "Use clear, descriptive variable names",
      "Simplify control flow and reduce nesting depth",
      "Break complex functions into smaller, simpler ones",
      "Add inline comments for non-obvious logic",
      "Keep lines under 100 characters when possible",
      "Follow VS Code formatting conventions"
    ] : [];

    return result(
      "vibeCoderStandard",
      status,
      Math.max(0, score),
      issues.length > 0
        ? `Readability issues: ${issues.join("; ")}`
        : "Code meets Vibe Coder readability standards",
      evidence,
      remediation,
      blocksAcceptance
    );
  }
};

/**
 * Gate 4: Hallucination & Safety Gate
 */
export const hallucinationSafetyGate: AgileGate = {
  id: "agile.hallucinationSafety",
  type: "hallucinationSafety",
  name: "Hallucination & Safety Gate",
  description: "Prevent fabricated APIs, libraries, or unsupported features",
  phase: "validation",
  isMandatory: true,
  appliesTo: () => true,
  evaluate: (context) => {
    const checks = context.hallucinationChecks || [];
    const artifacts = context.sprint.codeArtifacts;

    const issues: string[] = [];
    const evidence: AgileGateEvidence[] = [];
    let score = 100;

    if (checks.length === 0) {
      // No explicit checks, do basic pattern matching
      artifacts.forEach((artifact, index) => {
        // Look for common hallucination patterns
        const suspiciousPatterns = [
          { pattern: /import .* from ['"]@magic\/.*['"]/, desc: "Suspicious magic library" },
          { pattern: /import .* from ['"]ai-helper.*['"]/, desc: "Potentially fabricated AI library" },
          { pattern: /\.superMethod\(\)/, desc: "Non-standard method name" },
          { pattern: /autoFix\(\)/, desc: "Potentially invented convenience method" }
        ];

        suspiciousPatterns.forEach(({ pattern, desc }) => {
          if (pattern.test(artifact.code)) {
            issues.push(`Artifact ${index + 1}: ${desc}`);
            evidence.push({
              type: "code",
              description: `Possible hallucination in artifact ${index + 1}: ${desc}`,
              severity: "critical"
            });
            score -= 30;
          }
        });
      });

      if (issues.length === 0) {
        evidence.push({
          type: "api-verification",
          description: "No obvious hallucination patterns detected (basic check only)",
          severity: "minor"
        });
        score -= 5; // Slight penalty for not having explicit verification
      }
    } else {
      // Use provided hallucination checks
      const unverified = checks.filter((check) => !check.isVerified);
      const lowConfidence = checks.filter((check) => check.confidence === "low");

      if (unverified.length > 0) {
        issues.push(`${unverified.length} unverified APIs or methods detected`);
        unverified.forEach((check) => {
          evidence.push({
            type: "api-verification",
            description: `Unverified: ${check.apiOrMethod}`,
            data: { api: check.apiOrMethod, note: check.note },
            severity: "critical"
          });
        });
        score -= unverified.length * 25;
      }

      if (lowConfidence.length > 0) {
        issues.push(`${lowConfidence.length} low-confidence API references`);
        lowConfidence.forEach((check) => {
          evidence.push({
            type: "api-verification",
            description: `Low confidence: ${check.apiOrMethod}`,
            data: { api: check.apiOrMethod, source: check.source },
            severity: "major"
          });
        });
        score -= lowConfidence.length * 10;
      }
    }

    const status: AgileGateStatus = score >= 85 ? "PASS" : score >= 70 ? "WARN" : "FAIL";
    const blocksAcceptance = score < 70;

    const remediation = issues.length > 0 ? [
      "Verify all APIs and methods against official documentation",
      "Remove any invented functions, frameworks, or packages",
      "Replace speculative code with verified alternatives",
      "Provide documentation sources for all external dependencies",
      "Test all API calls and library imports before acceptance"
    ] : [];

    return result(
      "hallucinationSafety",
      status,
      Math.max(0, score),
      issues.length > 0
        ? `Safety issues: ${issues.join("; ")}`
        : "All APIs and methods are verified and safe",
      evidence,
      remediation,
      blocksAcceptance
    );
  }
};

/**
 * Gate 5: Reproducibility Gate
 */
export const reproducibilityGate: AgileGate = {
  id: "agile.reproducibility",
  type: "reproducibility",
  name: "Reproducibility Gate",
  description: "Ensure outputs can be recreated consistently",
  phase: "validation",
  isMandatory: true,
  appliesTo: () => true,
  evaluate: (context) => {
    const tests = context.consistencyTests || [];
    const settings = {
      ...DEFAULT_REPRODUCIBILITY_SETTINGS,
      ...(context.ruleParams.reproducibilitySettings || {})
    };

    const issues: string[] = [];
    const evidence: AgileGateEvidence[] = [];
    let score = 100;

    if (tests.length === 0) {
      issues.push("No consistency tests performed");
      evidence.push({
        type: "test-result",
        description: "Reproducibility not verified through testing",
        severity: "critical"
      });
      score -= 40;
    } else {
      // Check if enough tests were run
      if (tests.length < settings.requiredConsistencyRuns) {
        issues.push(
          `Only ${tests.length} consistency runs (minimum ${settings.requiredConsistencyRuns})`
        );
        evidence.push({
          type: "test-result",
          description: "Insufficient consistency test runs",
          data: { actual: tests.length, required: settings.requiredConsistencyRuns },
          severity: "major"
        });
        score -= 20;
      }

      // Check consistency of results
      const inconsistentTests = tests.filter((test) => !test.isConsistent);
      if (inconsistentTests.length > 0) {
        const inconsistencyRate = inconsistentTests.length / tests.length;
        issues.push(`${inconsistentTests.length}/${tests.length} tests showed inconsistent results`);
        evidence.push({
          type: "test-result",
          description: "Inconsistent outputs detected",
          data: {
            inconsistentCount: inconsistentTests.length,
            totalTests: tests.length,
            rate: inconsistencyRate
          },
          severity: inconsistencyRate > 0.3 ? "critical" : "major"
        });
        score -= Math.min(40, inconsistencyRate * 100);
      }

      // Check deviation scores
      const highDeviationTests = tests.filter(
        (test) => test.deviationScore && test.deviationScore > settings.maxDeviationThreshold
      );
      if (highDeviationTests.length > 0) {
        issues.push(`${highDeviationTests.length} tests exceeded deviation threshold`);
        evidence.push({
          type: "test-result",
          description: "High deviation in outputs",
          data: {
            threshold: settings.maxDeviationThreshold,
            exceededCount: highDeviationTests.length
          },
          severity: "major"
        });
        score -= highDeviationTests.length * 10;
      }
    }

    const status: AgileGateStatus = score >= 85 ? "PASS" : score >= 70 ? "WARN" : "FAIL";
    const blocksAcceptance = score < 70;

    const remediation = issues.length > 0 ? [
      `Run at least ${settings.requiredConsistencyRuns} consistency tests`,
      "Ensure same input produces same or functionally equivalent output",
      "Remove dependencies on hidden state or undocumented assumptions",
      "Refine prompt or logic to improve output stability",
      "Test with small prompt variations to verify robustness"
    ] : [];

    return result(
      "reproducibility",
      status,
      Math.max(0, score),
      issues.length > 0
        ? `Reproducibility issues: ${issues.join("; ")}`
        : "Output is consistently reproducible across test runs",
      evidence,
      remediation,
      blocksAcceptance
    );
  }
};

/**
 * Gate 6: Documentation & Explainability Gate
 */
export const documentationGate: AgileGate = {
  id: "agile.documentation",
  type: "documentation",
  name: "Documentation & Explainability Gate",
  description: "Ensure the AI explains why code works, not just what it does",
  phase: "validation",
  isMandatory: false,
  appliesTo: () => true,
  evaluate: (context) => {
    const artifacts = context.sprint.codeArtifacts;
    const documentation = context.sprint.documentation;

    const issues: string[] = [];
    const evidence: AgileGateEvidence[] = [];
    let score = 100;

    // Check for overall documentation
    if (!documentation || documentation.trim().length === 0) {
      issues.push("No documentation provided");
      evidence.push({
        type: "documentation",
        description: "Missing overall documentation or explanation",
        severity: "major"
      });
      score -= 30;
    } else {
      // Check documentation quality
      const hasWhy = /why|because|reason|purpose/i.test(documentation);
      const hasUsage = /usage|how to|example|use/i.test(documentation);

      if (!hasWhy) {
        issues.push("Documentation doesn't explain why code works");
        evidence.push({
          type: "documentation",
          description: "Missing explanation of reasoning",
          severity: "major"
        });
        score -= 20;
      }

      if (!hasUsage) {
        issues.push("Documentation lacks usage instructions");
        evidence.push({
          type: "documentation",
          description: "Missing usage instructions or examples",
          severity: "minor"
        });
        score -= 10;
      }
    }

    // Check inline comments in code
    artifacts.forEach((artifact, index) => {
      const lines = artifact.code.split("\n");
      const commentLines = lines.filter(
        (line) => line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*")
      );
      const commentRatio = commentLines.length / lines.length;

      if (commentRatio < 0.05) {
        // Less than 5% comments
        issues.push(`Artifact ${index + 1} has minimal inline comments`);
        evidence.push({
          type: "code",
          description: `Low comment ratio in artifact ${index + 1}`,
          data: { commentRatio: Math.round(commentRatio * 100) },
          severity: "minor"
        });
        score -= 10;
      }

      // Check for explanatory comments (not just descriptive)
      const explanatoryKeywords = /why|because|note|important|explanation/i;
      const hasExplanatoryComments = commentLines.some((line) =>
        explanatoryKeywords.test(line)
      );

      if (!hasExplanatoryComments && commentLines.length > 0) {
        evidence.push({
          type: "code",
          description: `Artifact ${index + 1} has descriptive but not explanatory comments`,
          severity: "minor"
        });
        score -= 5;
      }
    });

    const status: AgileGateStatus = score >= 85 ? "PASS" : score >= 70 ? "WARN" : "FAIL";
    const blocksAcceptance = false; // Documentation gate doesn't block acceptance

    const remediation = issues.length > 0 ? [
      "Add brief explanation of the underlying logic and reasoning",
      "Include inline comments for complex or non-obvious code sections",
      "Provide clear usage instructions with examples",
      "Explain why the approach was chosen, not just what it does",
      "Ensure developers can understand and modify code without external help"
    ] : [];

    return result(
      "documentation",
      status,
      Math.max(0, score),
      issues.length > 0
        ? `Documentation issues: ${issues.join("; ")}`
        : "Documentation is comprehensive and explanatory",
      evidence,
      remediation,
      blocksAcceptance
    );
  }
};

/**
 * Gate 7: VS Code Integration Gate
 */
export const vscodeIntegrationGate: AgileGate = {
  id: "agile.vscodeIntegration",
  type: "vscodeIntegration",
  name: "VS Code Integration Gate",
  description: "Confirm compatibility with real VS Code workflows",
  phase: "integration",
  isMandatory: true,
  appliesTo: () => true,
  evaluate: (context) => {
    const sprint = context.sprint;
    const artifacts = sprint.codeArtifacts;

    const issues: string[] = [];
    const evidence: AgileGateEvidence[] = [];
    let score = 100;

    // Check for VS Code specific assumptions
    artifacts.forEach((artifact, index) => {
      // Look for hardcoded paths that won't work across systems
      const windowsPathPattern = /C:\\|D:\\/g;
      const hasHardcodedPaths = windowsPathPattern.test(artifact.code);

      if (hasHardcodedPaths) {
        issues.push(`Artifact ${index + 1} contains hardcoded file paths`);
        evidence.push({
          type: "code",
          description: `Hardcoded paths in artifact ${index + 1} reduce portability`,
          severity: "major"
        });
        score -= 20;
      }

      // Check for unsupported environment assumptions
      if (artifact.code.includes("process.env.CUSTOM_VAR") && !artifact.executionContext) {
        issues.push(`Artifact ${index + 1} assumes custom environment variables`);
        evidence.push({
          type: "code",
          description: "Code assumes environment not provided by default VS Code",
          severity: "minor"
        });
        score -= 10;
      }

      // Check for proper project structure alignment
      if (artifact.fileName) {
        const hasProperExtension = /\.(ts|js|json|md|py|java|cpp|cs)$/i.test(
          artifact.fileName
        );
        if (!hasProperExtension) {
          issues.push(`Artifact ${index + 1} has unusual file extension`);
          evidence.push({
            type: "code",
            description: `Unusual file extension: ${artifact.fileName}`,
            severity: "minor"
          });
          score -= 5;
        }
      }
    });

    // Check for required extensions
    if (sprint.requiredExtensions && sprint.requiredExtensions.length > 0) {
      const uncommonExtensions = sprint.requiredExtensions.filter(
        (ext) =>
          !["prettier", "eslint", "python", "jupyter", "debugger"].some((common) =>
            ext.toLowerCase().includes(common)
          )
      );

      if (uncommonExtensions.length > 0) {
        issues.push(`Requires ${uncommonExtensions.length} uncommon extensions`);
        evidence.push({
          type: "documentation",
          description: "Code requires non-standard VS Code extensions",
          data: { extensions: uncommonExtensions },
          severity: "minor"
        });
        score -= uncommonExtensions.length * 5;
      }
    }

    // Check dependencies
    artifacts.forEach((artifact, index) => {
      if (artifact.dependencies && artifact.dependencies.length > 0) {
        const exoticDeps = artifact.dependencies.filter(
          (dep) =>
            !["express", "react", "vue", "axios", "lodash", "moment"].includes(
              dep.toLowerCase()
            )
        );

        if (exoticDeps.length > 3) {
          issues.push(`Artifact ${index + 1} has many exotic dependencies`);
          evidence.push({
            type: "code",
            description: "Many uncommon dependencies may cause setup issues",
            data: { count: exoticDeps.length },
            severity: "minor"
          });
          score -= 10;
        }
      }
    });

    const status: AgileGateStatus = score >= 85 ? "PASS" : score >= 70 ? "WARN" : "FAIL";
    const blocksAcceptance = score < 70;

    const remediation = issues.length > 0 ? [
      "Use relative paths instead of hardcoded absolute paths",
      "Avoid assumptions about VS Code environment not provided by default",
      "Align code with typical VS Code project structures",
      "Minimize dependencies on uncommon or exotic extensions",
      "Test integration with common VS Code extensions (linters, formatters)",
      "Ensure code works without special setup or configuration"
    ] : [];

    return result(
      "vscodeIntegration",
      status,
      Math.max(0, score),
      issues.length > 0
        ? `VS Code integration issues: ${issues.join("; ")}`
        : "Code integrates smoothly with VS Code workflows",
      evidence,
      remediation,
      blocksAcceptance
    );
  }
};

/**
 * Get all Agile quality gates
 */
export function getAgileGates(): AgileGate[] {
  return [
    promptIntentGate,
    codeCorrectnessGate,
    vibeCoderStandardGate,
    hallucinationSafetyGate,
    reproducibilityGate,
    documentationGate,
    vscodeIntegrationGate
  ];
}
