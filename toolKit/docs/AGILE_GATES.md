# Agile Quality Gates for VS Code Vibe Coder (AI Research Tool)

## Overview

The VS Code Vibe Coder AI tool follows an Agile development approach supported by quality gates to ensure reliability, correctness, and responsible AI behavior. Each sprint produces incremental improvements, but outputs are only accepted if they pass predefined quality gates. These gates prevent unreliable or misleading AI assistance from progressing into later development stages.

## Sprint-Level Quality Gates

### 1. Prompt Design & Intent Gate ✓

**Purpose:** Ensure the AI understands developer intent clearly.

**Requirements:**
- Prompts must be explicit, scoped, and reproducible
- Inputs should clearly describe:
  - Task goal
  - Programming language
  - Expected output format

**Pass Criteria:**
- Same prompt produces consistent output across multiple runs
- No ambiguous or off-task responses

**Fail Action:**
- Prompt is revised and re-tested before moving forward

**Implementation:** `agile.promptIntent`

---

### 2. Code Correctness Gate ✓

**Purpose:** Verify that generated code is syntactically and logically valid.

**Requirements:**
- Code must compile or run without errors in VS Code
- No placeholder logic presented as final code
- All braces, brackets, and parentheses balanced

**Pass Criteria:**
- Code executes successfully or passes basic linting
- Core functionality matches the prompt request
- No TODO, FIXME, or placeholder comments in production code

**Fail Action:**
- Output is rejected and refined in the next iteration

**Implementation:** `agile.codeCorrectness`

---

### 3. Readability & "Vibe Coder" Standard Gate ✓

**Purpose:** Maintain human-readable, beginner-friendly code quality.

**Requirements:**
- Clear variable names
- Simple control flow
- Minimal abstraction
- No unnecessary complexity

**Vibe Coder Standards:**
- Max nesting depth: 3 levels
- Max line length: 100 characters
- Min comment coverage: 15%
- Max complexity score: 6/10

**Pass Criteria:**
- Code is understandable by an average developer reading it for the first time
- Follows common VS Code formatting conventions

**Fail Action:**
- Code is simplified or rewritten

**Implementation:** `agile.vibeCoderStandard`

---

### 4. Hallucination & Safety Gate ✓

**Purpose:** Prevent fabricated APIs, libraries, or unsupported features.

**Requirements:**
- No invented functions, frameworks, or packages
- All referenced features must exist and be verifiable

**Pass Criteria:**
- Every API or method used exists in official documentation
- No speculative or misleading explanations
- All dependencies are verified and documented

**Fail Action:**
- Output is flagged and corrected before acceptance

**Implementation:** `agile.hallucinationSafety`

---

### 5. Reproducibility Gate ✓

**Purpose:** Ensure outputs can be recreated consistently.

**Requirements:**
- Same input → same or functionally equivalent output
- No dependency on hidden state or undocumented assumptions
- Minimum 3 consistency test runs

**Pass Criteria:**
- Output is reproducible across test runs
- Behavior remains stable across small prompt variations
- Deviation threshold < 10%

**Fail Action:**
- Prompt or logic is refined to improve stability

**Implementation:** `agile.reproducibility`

---

### 6. Documentation & Explainability Gate ✓

**Purpose:** Ensure the AI explains why code works, not just what it does.

**Requirements:**
- Brief explanation of logic
- Inline comments where needed
- Clear usage instructions

**Pass Criteria:**
- A developer can understand and modify the code without external clarification
- Documentation explains reasoning, not just description

**Fail Action:**
- Documentation is expanded or clarified

**Implementation:** `agile.documentation` (non-blocking)

---

### 7. VS Code Integration Gate ✓

**Purpose:** Confirm compatibility with real VS Code workflows.

**Requirements:**
- Code aligns with typical VS Code project structure
- No assumptions about environment that VS Code does not provide by default
- No hardcoded file paths

**Pass Criteria:**
- Code runs or integrates smoothly in VS Code without special setup
- Works with common extensions (linters, formatters)

**Fail Action:**
- Output is adjusted to match real-world VS Code usage

**Implementation:** `agile.vscodeIntegration`

---

## Sprint Acceptance Rule

**A sprint is only accepted if all applicable quality gates are passed.**

If any mandatory gate fails, the output returns to refinement in the next sprint cycle.

### Acceptance Criteria

| Overall Status | Condition |
|---------------|-----------|
| **ACCEPTED** | Acceptance score ≥ 85 AND no blocking failures |
| **CONDITIONAL** | Acceptance score ≥ 70 OR warnings present but no blockers |
| **REJECTED** | Acceptance score < 70 OR any blocking gate failed |

---

## Usage

### 1. Create Sprint Artifact

Prepare your sprint artifact with code and metadata:

```typescript
import { SprintArtifact } from "./quality/agileTypes";

const sprint: SprintArtifact = {
  sprintId: "sprint-001",
  sprintNumber: 1,
  phase: "code-generation",
  timestamp: new Date().toISOString(),
  prompt: {
    prompt: "Create a function to validate email addresses in TypeScript",
    language: "TypeScript",
    expectedOutputFormat: "function",
    taskGoal: "Email validation with regex",
    isExplicit: true,
    isScoped: true,
    isReproducible: true
  },
  codeArtifacts: [
    {
      code: `
        function validateEmail(email: string): boolean {
          // Regex pattern for basic email validation
          const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
          return emailRegex.test(email);
        }
      `,
      language: "TypeScript",
      fileName: "emailValidator.ts"
    }
  ],
  documentation: "This function validates email addresses using a regex pattern. It returns true for valid emails and false otherwise."
};
```

### 2. Run Sprint Acceptance

```typescript
import { runSprintAcceptance } from "./quality/sprintEngine";
import { SprintValidationContext } from "./quality/agileTypes";

const context: SprintValidationContext = {
  sprint: sprint,
  ruleParams: {}
};

const report = runSprintAcceptance(context);

console.log(`Sprint ${report.sprintNumber}: ${report.overallStatus}`);
console.log(`Acceptance Score: ${report.acceptanceScore}/100`);
```

### 3. Review Report

The report includes:
- Overall status (ACCEPTED/CONDITIONAL/REJECTED)
- Individual gate results with scores
- Blockers and warnings
- Remediation steps
- Next steps

### 4. Export Report

```typescript
import { 
  formatSprintReportMarkdown,
  formatSprintReportJSON 
} from "./quality/sprintEngine";

// Markdown format
const markdown = formatSprintReportMarkdown(report);
fs.writeFileSync("sprint-report.md", markdown);

// JSON format
const json = formatSprintReportJSON(report);
fs.writeFileSync("sprint-report.json", json);
```

---

## Configuration

Create an Agile gates config file to customize thresholds and standards:

```json
{
  "thresholds": {
    "acceptanceScore": 85,
    "warningScore": 70
  },
  "vibeCoderStandards": {
    "maxNestingDepth": 3,
    "maxLineLength": 100,
    "minCommentCoverage": 15,
    "maxComplexityScore": 6
  },
  "reproducibilitySettings": {
    "requiredConsistencyRuns": 3,
    "maxDeviationThreshold": 0.1
  },
  "vscodeSettings": {
    "requireLinting": true,
    "requireFormatting": true
  },
  "gates": {
    "agile.promptIntent": {
      "enabled": true,
      "mandatory": true
    },
    "agile.codeCorrectness": {
      "enabled": true,
      "mandatory": true
    },
    "agile.vibeCoderStandard": {
      "enabled": true,
      "mandatory": true
    },
    "agile.hallucinationSafety": {
      "enabled": true,
      "mandatory": true
    },
    "agile.reproducibility": {
      "enabled": true,
      "mandatory": true
    },
    "agile.documentation": {
      "enabled": true,
      "mandatory": false
    },
    "agile.vscodeIntegration": {
      "enabled": true,
      "mandatory": true
    }
  }
}
```

---

## Advanced Features

### Consistency Testing

Provide consistency test results to validate reproducibility:

```typescript
const context: SprintValidationContext = {
  sprint: sprint,
  consistencyTests: [
    {
      runNumber: 1,
      output: "result1",
      timestamp: "2026-02-17T10:00:00Z",
      isConsistent: true,
      deviationScore: 0.05
    },
    {
      runNumber: 2,
      output: "result1",
      timestamp: "2026-02-17T10:01:00Z",
      isConsistent: true,
      deviationScore: 0.03
    },
    {
      runNumber: 3,
      output: "result1",
      timestamp: "2026-02-17T10:02:00Z",
      isConsistent: true,
      deviationScore: 0.02
    }
  ],
  ruleParams: {}
};
```

### Hallucination Verification

Provide API verification results:

```typescript
const context: SprintValidationContext = {
  sprint: sprint,
  hallucinationChecks: [
    {
      apiOrMethod: "Array.prototype.map",
      isVerified: true,
      source: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map",
      confidence: "high"
    },
    {
      apiOrMethod: "String.prototype.test",
      isVerified: false,
      confidence: "low",
      note: "Method does not exist on String prototype"
    }
  ],
  ruleParams: {}
};
```

### Readability Metrics

Provide detailed readability metrics:

```typescript
const context: SprintValidationContext = {
  sprint: sprint,
  readabilityMetrics: {
    averageLineLength: 45,
    maxNestingDepth: 2,
    variableNameQuality: "clear",
    commentCoverage: 20,
    complexityScore: 4
  },
  ruleParams: {}
};
```

---

## Integration with CI/CD

You can integrate Agile quality gates into your CI/CD pipeline:

```yaml
# .github/workflows/sprint-quality.yml
name: Sprint Quality Gates

on:
  pull_request:
    branches: [ main ]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run Sprint Acceptance
        run: |
          npm run sprint:validate
          
      - name: Upload Sprint Report
        uses: actions/upload-artifact@v2
        with:
          name: sprint-report
          path: sprint-report.md
          
      - name: Comment PR with Results
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('sprint-report.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });
```

---

## Best Practices

1. **Run Gates Early**: Validate prompts before generating code
2. **Test Consistency**: Always run multiple test iterations
3. **Document Everything**: Explain why, not just what
4. **Verify APIs**: Check all external dependencies against official docs
5. **Keep It Simple**: Follow Vibe Coder standards for readability
6. **Iterate Quickly**: Address failures in the next sprint cycle
7. **Track Progress**: Monitor gate scores across sprints

---

## Troubleshooting

### Common Issues

**Issue:** Prompt Intent Gate fails with "not explicit enough"
- **Solution:** Add clear task goal, programming language, and expected output format to prompt metadata

**Issue:** Code Correctness Gate fails with placeholder logic
- **Solution:** Remove all TODO, FIXME, and placeholder comments before submission

**Issue:** Reproducibility Gate fails with inconsistent results
- **Solution:** Ensure prompt doesn't depend on randomness or external state; test multiple times

**Issue:** Hallucination Safety Gate fails with unverified APIs
- **Solution:** Verify all APIs against official documentation; provide verification sources

**Issue:** Vibe Coder Standard Gate fails with complexity score
- **Solution:** Simplify control flow, reduce nesting, break into smaller functions

---

## References

- [Vibe Coder Standards](../examples/agile-gates.json)
- [Sprint Validation Types](../src/quality/agileTypes.ts)
- [Quality Gate Engine](../src/quality/sprintEngine.ts)
